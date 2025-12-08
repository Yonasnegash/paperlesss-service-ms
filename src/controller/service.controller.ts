import { NextFunction, Request, Response } from "express"
import { PopulateOptions } from "mongoose"
import { serviceDal } from "../dal/service.dal"
import { ServiceFilter, ServiceOptions } from "../config/types/service"
import { configurationRepositoryDal, serviceRepositoryDal } from "../utils/DALimportModules"
import { Pagination, ResponseHandler } from "../utils/response-handler"

const buildFilter = (params: Record<string, any>): ServiceFilter => {
    let filter: ServiceFilter = {}

    if (params.search) {
        filter = {
            $or: [
                { name: { $regex: params.search, $options: 'i' } },
            ]
        }
    }

    return filter
}
const getCategoryServices = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { search, source } = req.query
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const services = await serviceDal.fetchCategoryServices(page, limit, search as string, source as string)
        return res.status(200).json({ message: 'Success', data: services, status: 200 })
    } catch (error) {
        next(error)
    }
}

const createCategoryServices = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await serviceDal.createCategoryServices(req.body)
        return res.status(201).json({ message: 'Success', status: 201 })
    } catch (error) {
        next(error)
    }
}

const updateCategoryService = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await serviceDal.updateCategoryService(req.params.id, req.body)
        return res.status(200).json({ message: 'Success', status: 200 })
    } catch (error) {
        next(error)
    }
}

const toggleCategoryServiceStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await serviceDal.toggleCategoryServiceStatus(req.params.id)
        return res.status(200).json({ message: 'Success', status: 200 })
    } catch (error) {
        next(error)
    }
}

const getServices = async (req: Request, res: Response, next: NextFunction) => {
    const { page, limit, cursor } = req.query

    try {
        const query: ServiceFilter = buildFilter(req.query)

        const options: ServiceOptions = {
            page: Number(page) || 1,
            limit: Number(limit) || 10,
            sort: { _id: 1 },
            cursor: cursor as string || undefined,
            select: '-__v',
            populate: [
                { 
                    path: 'serviceCategory',
                    select: 'name'
                }
            ]
        }

        const { nextCursor, results, totalDocs, totalPages } = await serviceRepositoryDal.cursorBasedPaginateWithFlags(query, {
            cursor: options.cursor,
            limit: options.limit,
            select: options.select,
            populate: options.populate as PopulateOptions[],
            configModel: configurationRepositoryDal.model
        })

        const pagination: Pagination = {
            nextCursor: nextCursor!,
            limit: Number(limit),
            totalDocs,
            totalPages
        }

        return ResponseHandler.sendSuccess(res, results, pagination)
    } catch(error) {
        return ResponseHandler.serverError(
            res,
            (error as Error)?.message || 'Internal server error',
        )
    }
}

const createService = async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log('req.body')
        await serviceDal.createService(req.body)
        return res.status(201).json({ message: 'Success', status: 201 })
    } catch (error) {
        next(error)
    }
}

const updateService = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await serviceDal.updateService(req.params.id, req.body)
        return res.status(200).json({ message: 'Success', status: 200 })
    } catch (error) {
        next(error)
    }
}

const changeServiceStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await serviceDal.changeServiceStatus(req.params.id)
        return res.status(200).json({ message: 'Success', status: 200 })
    } catch (error) {
        next(error)
    }
}

export const serviceController = {
    getCategoryServices,
    createCategoryServices,
    updateCategoryService,
    toggleCategoryServiceStatus,
    getServices,
    createService,
    updateService,
    changeServiceStatus
}