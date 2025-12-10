import { NextFunction, Request, Response } from "express"
import { CredeintialFilter, CredeintialOptions } from "../config/types/credeintial"
import { HttpStatusCode, ResponseHandler } from "../utils/response-handler"
import { credentialRepositoryDal } from "../utils/DALimportModules"
import { decryptText } from "../utils/encryption"

const buildFilter = (params: Record<string, any>): CredeintialFilter => {
    let filter: CredeintialFilter = {}

    if (params.search) {
        filter = {
            $or: [
                { branchName: { $regex: params.search, $options: 'i' } },
            ]
        }
    }

    return filter
}

const getCredentials = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { cursor, limit } = req.query
        const query: CredeintialFilter = buildFilter(req.query)

        const options: CredeintialOptions = {
            limit: Number(limit) || 10,
            sort: { _id: 1 },
            cursor: cursor as string || undefined,
            select: '-__v',
        }

        const { nextCursor, results, totalDocs, totalPages } = await credentialRepositoryDal.cursorBasedPaginate(query, {
            cursor: options.cursor,
            limit: options.limit,
            select: options.select,
        })

        const pagination = {
            nextCursor: nextCursor!,
            limit: Number(limit),
            totalDocs,
            totalPages
        }

        return ResponseHandler.sendSuccess(res, 'Success', results, pagination)
    } catch (error) {
        return ResponseHandler.serverError(res, (error as Error)?.message || "Interanl server error")
    }
}

const generateCredential = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const _payload = req.body
        const existingBranch = await credentialRepositoryDal.findOne({ branchCode: _payload.branchCode })

        if (existingBranch) {
            return ResponseHandler.badRequest(res, `Credentials already generated for branch '${_payload.branchCode}'`)
        }

        await credentialRepositoryDal.create(_payload)

        return ResponseHandler.sendSuccess(res, 'Credential Generated', null, null, HttpStatusCode.CREATED )
    } catch (error) {
        next(error)
    }
}

const viewCredential = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const credential = await credentialRepositoryDal.findOne({ _id: id })
        
        if (!credential) {
            return ResponseHandler.badRequest(res, "Credential not found")
        }

        const plainPassword = await decryptText(credential.plainPasswordEncrypted)

        return ResponseHandler.sendSuccess(res, 'Success', {
            username: credential.username,
            password: plainPassword
        }, null)
    } catch (error) {
        next(error)
    }
}

export const credentialController = {
    getCredentials,
    generateCredential,
    viewCredential
}