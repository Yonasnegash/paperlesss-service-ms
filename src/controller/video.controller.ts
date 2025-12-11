import { Express, Request, Response } from "express"
import { IVideo, VideoFilter, VideoOptions } from "../config/types/video"
import { HttpStatusCode, ResponseHandler } from "../utils/response-handler"
import { videoRepositoryDal } from "../utils/DALimportModules"
import mongoose from "mongoose"
import { deleteFileFromMinio, storeFileToMinio } from "../utils/multerMinio"

const buildFilter = (params: Record<string, any>): VideoFilter => {
    let filter: VideoFilter = {}

    if (params.search) {
        filter = {
            $or: [
                { title: { $regex: params.search, $options: 'i' } },
            ]
        }
    }

    return filter
}

const getVideos = async (req: Request, res: Response) => {
    try {
        const { cursor, limit } = req.query
        const query: VideoFilter = buildFilter(req.query)

        const options: VideoOptions = {
            limit: Number(limit) || 10,
            sort: { _id: 1 },
            cursor: cursor as string || undefined,
            select: '-__v',
        }

        const { nextCursor, results, totalDocs, totalPages } = await videoRepositoryDal.cursorBasedPaginate(query, {
            cursor: options.cursor,
            limit: options.limit,
            select: options.select
        })

        const pagination = {
            nextCursor: nextCursor!,
            limit: Number(limit),
            totalDocs,
            totalPages
        }
        
        return ResponseHandler.sendSuccess(res, 'Success', results, pagination)
    } catch (error) {
        return ResponseHandler.serverError(res, (error as Error)?.message || "Internal server error")
    }
}

const getVideo = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const videoObjectId = new mongoose.Types.ObjectId(id)

        const video = await videoRepositoryDal.findOne({ _id: videoObjectId })

        if (!video) {
            return ResponseHandler.notFound(res, "Video not found")
        }

        return ResponseHandler.sendSuccess(res, "Success", video)
    } catch (error) {
        return ResponseHandler.serverError(res, (error as Error)?.message || "Internal server error")
    }
}

const createVideo = async (req: Request, res: Response) => {
    const _payload = req.body
    console.log('payload', _payload)
    try {
        const files = req.files as {
            [fieldnames: string]: Express.Multer.File[]
        }

        const thumbnailFile = files?.thumbnail?.[0]
        const videoFile = files?.video?.[0]

        if (!thumbnailFile) {
            return ResponseHandler.validationError(res, "Thumbnail is required");
        }

        if (!videoFile) {
        return ResponseHandler.validationError(res, "Video file is required");
        }

        const thumbnailObjectName = `thumbnails/${Date.now()}-${thumbnailFile.originalname}`
        const thumbnailUrl = await storeFileToMinio(
            thumbnailObjectName,
            thumbnailFile.buffer,
            thumbnailFile.mimetype,
            global._CONFIG.MINIO_BUCKET_NAME
        )

        const videoObjectName = `videos/${Date.now()}-${videoFile.originalname}`
        const videoUrl = await storeFileToMinio(
            videoObjectName,
            videoFile.buffer,
            videoFile.mimetype,
            global._CONFIG.MINIO_BUCKET_NAME
        )

        const videoData = {
            title: _payload.title,
            subText: _payload?.subText || '',
            type: _payload.type,
            thumbnailUrl: thumbnailUrl || '',
            videoUrl: videoUrl || ''
        }

        await videoRepositoryDal.create(videoData)

        return ResponseHandler.sendSuccess(res, 'Success', null, null, HttpStatusCode.CREATED)
    } catch (error) {
        return ResponseHandler.serverError(res, (error as Error)?.message || "Internal server error")
    }
}

const updateVideo = async (req: Request, res: Response) => {
    const { id } = req.params
    const payload = req.body
    const videoObjectId = new mongoose.Types.ObjectId(id)

    try {
        const video = await videoRepositoryDal.findOne({ _id: videoObjectId })

        if (!video) {
            return ResponseHandler.notFound(res, "Video not found")
        }

        const files = req.files as {
            [fieldname: string]: Express.Multer.File[]
        }

        const bucket = global._CONFIG.MINIO_BUCKET_NAME

        const extractObjectName = (url: string) => {
            if (!url) return null
            
            try {
                const parts = url.split(bucket + "/")
                return parts[1] ?? null
            } catch (error) {
                return null
            }
        }

        let updatedThumbnail = video.thumbnailUrl
        let updatedVideoUrl = video.videoUrl

        const thumbnailFile = files?.thumbnail?.[0]
        if (thumbnailFile) {
            const newObjectName = `thumbnails/${Date.now()}-${thumbnailFile.originalname}`

            updatedThumbnail = await storeFileToMinio(
                newObjectName,
                thumbnailFile.buffer,
                thumbnailFile.mimetype,
                bucket
            )

            const oldObject = extractObjectName(video.thumbnailUrl)
            if (oldObject) {
                deleteFileFromMinio(oldObject, bucket).catch((e) => console.error("Failed to delete old thumnail:", e))
            }
        }

        const videoFile = files?.video?.[0]
        if (videoFile) {
            const newObjectName = `videos/${Date.now()}-${videoFile.originalname}`

            updatedVideoUrl = await storeFileToMinio(
                newObjectName,
                videoFile.buffer,
                videoFile.mimetype,
                bucket
            )

            const oldObject = extractObjectName(video.videoUrl)
            if (oldObject) {
                deleteFileFromMinio(oldObject, bucket).catch((e) => console.error("Failed to delete old video:", e))
            }
        }

        const updateData = {
            title: payload.title ?? video.title,
            subText: payload.subText ?? video.subText,
            type: payload.type ?? video.type,
            thumbnailUrl: updatedThumbnail,
            videoUrl: updatedVideoUrl
        }

        await videoRepositoryDal.updateOne(
            { _id: videoObjectId },
            updateData,
            { new: true }
        )

        return ResponseHandler.sendSuccess(res, "Video updated successfully", null)
    } catch (error) {
        return ResponseHandler.serverError(res, (error as Error)?.message || "Internal server error")
    }
}

const changeVideoStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const videoObjectId = new mongoose.Types.ObjectId(id)

        const video = await videoRepositoryDal.findOne({ _id: videoObjectId })

        if (!video) {
            return ResponseHandler.notFound(res, "Video not found")
        }

        const newStatus = !video.isActive

        await videoRepositoryDal.updateOne(
            { _id: videoObjectId },
            { isActive: newStatus }
        )

        return ResponseHandler.sendSuccess(res, 'Video status changed', null)
    } catch (error) {
        return ResponseHandler.serverError(res, (error as Error).message || "Internal server error")
    }
}

export const videoController = {
    getVideos,
    getVideo,
    createVideo,
    updateVideo,
    changeVideoStatus
}