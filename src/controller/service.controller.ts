import { NextFunction, Request, Response } from "express"
import mongoose, { PopulateOptions } from "mongoose"
import { serviceDal } from "../dal/service.dal"
import { ServiceFilter, ServiceOptions } from "../config/types/service"
import { configurationRepositoryDal, serviceCategoryRepositoryDal, serviceRepositoryDal } from "../utils/DALimportModules"
import { HttpStatusCode, Pagination, ResponseHandler } from "../utils/response-handler"

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

        return ResponseHandler.sendSuccess(res, 'Success', results, pagination)
    } catch(error) {
        return ResponseHandler.serverError(
            res,
            (error as Error)?.message || 'Internal server error',
        )
    }
}

const createService = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const _payload = req.body
        const objectId = new mongoose.Types.ObjectId(_payload.serviceCategory)
        const category = await serviceCategoryRepositoryDal.findOne({_id: objectId })

        if (!category) {
            return ResponseHandler.notFound(res, "Service category not found")
        }

        const existingName = await serviceRepositoryDal.findOne({ name: _payload.name })
        if (existingName) {
            return ResponseHandler.badRequest(res, `Service with name '${_payload.name}' already exists.`)
        }

        const isBillPayment = category.name === 'Bill Payment'

        if (isBillPayment) {
            if (!_payload.url) {
                return ResponseHandler.badRequest(res, "Bill Payment service must include a 'url'")
            }
            // Implement the bill payment url here
        } else {
            if (_payload.url) {
                return ResponseHandler.badRequest(res, "Only Payment services can include a 'url'")
            }
            if (_payload.number == null) {
                return ResponseHandler.badRequest(res, "Non-Bill Payment services must include a 'number'")
            }

            const existingNumber = await serviceRepositoryDal.findOne({ number: _payload.number, serviceCategory: objectId })
            if (existingNumber) {
                return ResponseHandler.badRequest(res, `Service with number '${_payload.number}' already exists in this category.`)
            }
        }
        await serviceRepositoryDal.create(_payload)

        return ResponseHandler.sendSuccess(
            res,
            "Service Created",
            null,
            null,
            HttpStatusCode.CREATED
        )
    } catch (error) {
        next(error)
    }
}

const updateService = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: serviceId } = req.params;
        const objectId = new mongoose.Types.ObjectId(serviceId);

        const payload: any = { ...req.body };

        if (payload.serviceCategory) {
            payload.serviceCategory = new mongoose.Types.ObjectId(payload.serviceCategory);
        }

        const existingService = await serviceRepositoryDal.findOne({ _id: objectId });
        if (!existingService) return ResponseHandler.notFound(res, "Service not found");

        if (payload.name) {
            const categoryToUse = payload.serviceCategory ?? existingService.serviceCategory;

            const nameExists = await serviceRepositoryDal.findOne({
                name: payload.name,
                serviceCategory: categoryToUse,
                _id: { $ne: objectId }
            });

            if (nameExists)
                return ResponseHandler.badRequest(res, `Service with name ${payload.name} already exists.`);
        }

        if (payload.number) {
            const categoryToUse = payload.serviceCategory ?? existingService.serviceCategory;

            const numberExists = await serviceRepositoryDal.findOne({
                number: payload.number,
                serviceCategory: categoryToUse,
                _id: { $ne: objectId }
            });

            if (numberExists)
                return ResponseHandler.badRequest(
                    res,
                    `Service with number ${payload.number} already exists in this category.`
                );
        }

        const updatedService = await serviceRepositoryDal.updateOne(
            { _id: objectId },
            payload,
            { new: true, runValidators: true }
        );

        if (!updatedService) {
            return ResponseHandler.notFound(res, 'Service not found');
        }

        return ResponseHandler.sendSuccess(res, 'Success', updatedService);
    } catch (error) {
        console.error(error);
        return ResponseHandler.serverError(res);
    }
};

const changeServiceStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id: serviceId } = req.params
        const objectId = new mongoose.Types.ObjectId(serviceId)

        const service = await serviceRepositoryDal.findOne({ _id: objectId })

        if (!service) {
            return ResponseHandler.notFound(res, "Service not found")
        }
        
        const newStatus = !service.isActive

        await serviceRepositoryDal.updateOne(
            { _id: objectId },
            { isActive: newStatus }
        )
        
        return ResponseHandler.sendSuccess(res, "Service status changed successfully", null);
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