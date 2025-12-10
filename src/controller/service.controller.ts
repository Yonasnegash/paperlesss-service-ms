import { NextFunction, Request, Response } from "express"
import mongoose, { PopulateOptions } from "mongoose"
import { ServiceFilter, ServiceOptions } from "../config/types/service"
import { configurationRepositoryDal, serviceCategoryRepositoryDal, serviceRepositoryDal } from "../utils/DALimportModules"
import { HttpStatusCode, Pagination, ResponseHandler } from "../utils/response-handler"
import { ServiceCategoryFilter, ServiceCategoryOptions } from "../config/types/service_category"

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
    const { cursor, limit, source } = req.query
    try {
        let nestedResults: any = []
        const query: ServiceCategoryFilter = buildFilter(req.query)

        const options: ServiceCategoryOptions = {
            limit: Number(limit) || 10,
            sort: { _id: 1 },
            cursor: cursor as string || undefined,
            select: '-__v',
        }
        
        if (source && source === 'portal') {
            const { nextCursor, results, totalDocs, totalPages } = await serviceCategoryRepositoryDal.cursorBasedPaginate(query, {
                cursor: options.cursor,
                limit: options.limit,
                select: options.select,
                populate: [
                    {
                        path: 'services',
                        model: 'Service',
                        select: '_id name number url'
                    }
                ]
            })

            nestedResults = results.map((category: any) => ({
            ...category,
            services: category.services?.map((sub: any) => ({
                _id: sub._id,
                name: sub.name,
                number: sub.number,
                url: sub.url
                ? `${global._CONFIG.CPS_PUBLIC_ASSET_DOMAIN}/v1.0/paperless${sub.url}`
                : null,
                })) || []
            }))

            const pagination = {
                nextCursor: nextCursor!,
                limit: Number(limit),
                totalDocs,
                totalPages
            }

            return ResponseHandler.sendSuccess(res, 'Success', nestedResults, pagination )
        }

        const categories = await serviceCategoryRepositoryDal.find(
            query,
            options.select,
            undefined,
            [
                {
                    path: 'services',
                    model: 'Service',
                    select: '_id name number url'
                }
            ],
            true
        )
        
        
        nestedResults = categories.map((category: any) => ({
            ...category,
            services: category.services?.map((sub: any) => ({
                _id: sub._id,
                name: sub.name,
                number: sub.number,
                url: sub.url
                ? `${global._CONFIG.CPS_PUBLIC_ASSET_DOMAIN}/v1.0/paperless${sub.url}`
                : null,
            })) || []
        }))

        return ResponseHandler.sendSuccess(res, 'Success', nestedResults)
    } catch (error) {
        return ResponseHandler.serverError(res, (error as Error)?.message || 'Internal server error',)
    }
}

const createCategoryServices = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const _payload = req.body
        const existingName = await serviceCategoryRepositoryDal.findOne({ name: _payload.name })
        const existingNumber = await serviceCategoryRepositoryDal.findOne({ number: _payload.number })

        if (existingName && existingNumber && existingName.name === _payload.name) {
            return ResponseHandler.badRequest(res, `Service category with name '${_payload.name}' and number '${_payload.number}' already exists.`)
        }

        if (existingName && _payload.number !== existingName.number) {
                return ResponseHandler.badRequest(res, `Service category with name '${_payload.name}' already exists.`)
        }
    
        if (existingNumber && _payload.name !== existingNumber.name) {
            return ResponseHandler.badRequest(res, `Service category with number '${_payload.number}' already exists.`)
        }

        await serviceCategoryRepositoryDal.create(_payload)

        return ResponseHandler.sendSuccess(res, 'Service Category Created', null, null, HttpStatusCode.CREATED)
    } catch (error) {
        return ResponseHandler.serverError(res, (error as Error)?.message || 'Internal server error')
    }
}

const updateCategoryService = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const _payload = req.body
        const categoryObjectId = new mongoose.Types.ObjectId(id)

        const category = await serviceCategoryRepositoryDal.findOne({_id: categoryObjectId })

        if (!category) {
            return ResponseHandler.notFound(res, `Service category with id '${id}' not found.`)
        }

         if (_payload.name) {
            const existingName = await serviceCategoryRepositoryDal.findOne({ name: _payload.name })
            if (existingName && (existingName._id as any).toString() !== categoryObjectId.toString()) {
                return ResponseHandler.badRequest(res, `Service category with '${_payload.name}' already exists.`)
            }
        }   
    
        if (_payload.number) {
            const existingNumber = await serviceCategoryRepositoryDal.findOne({ number: _payload.number })
            if (existingNumber && (existingNumber._id as any).toString() !== categoryObjectId.toString()) {
                return ResponseHandler.badRequest(res, `Service category with number '${_payload.number}' already exists.`)
            }
        }

        const updatedServiceCategory = await serviceCategoryRepositoryDal.updateOne(
            { _id: categoryObjectId },
            _payload,
            { new: true, runValidators: true }
        )

        if (!updatedServiceCategory) {
            return ResponseHandler.notFound(res, "Service Category not found")
        }

        return ResponseHandler.sendSuccess(res, 'Success', updatedServiceCategory)
    } catch (error) {
        return ResponseHandler.serverError(res, (error as Error)?.message || 'Internal server error')
    }
}

const toggleCategoryServiceStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const categoryObjectId = new mongoose.Types.ObjectId(id)

        const category = await serviceCategoryRepositoryDal.findOne({ _id: categoryObjectId })

        if (!category) {
            return ResponseHandler.notFound(res, "Service Category not found.")
        }

        const newStatus = !category?.isActive

        await serviceCategoryRepositoryDal.updateOne(
            { _id: categoryObjectId },
            { isActive: newStatus }
        )

        return ResponseHandler.sendSuccess(res, "Service Category status changed.", null)
    } catch (error) {
        return ResponseHandler.serverError(res, (error as Error)?.message || 'Internal server error')
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