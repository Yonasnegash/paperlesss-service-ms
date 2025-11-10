import mongoose from "mongoose"
import { ICategory } from "../config/types/service_category"
import { ServiceCategory } from "../models/service_category.model"
import { ApiError } from "../utils/ApiError"
import { IService } from "../config/types/service"
import { Service } from "../models/service.model"

const fetchCategoryServices = async () => {
    const services = await ServiceCategory.aggregate([
        {
            $lookup: {
                from: 'paperlesssubservices',
                localField: '_id',
                foreignField: 'service_id',
                as: 'paperlesssubservices'
            }
        },
        {
            $sort: { number: 1 }
        }
    ])

    return services.map(service => ({
        ...service,
        paperlesssubservices: service.paperlesssubservices.map((sub: any) => ({
            ...sub,
            url: sub.url ? `${_CONFIG.CPS_PUBLIC_ASSET_DOMAIN}/v1.0/paperless${sub.url}` : null
        }))
    }))
}

const createCategoryServices = async (data: ICategory) => {
    const existingName = await ServiceCategory.findOne({ name: data.name})
    const existingNumber = await ServiceCategory.findOne({ number: data.number })

    if (existingName && existingNumber && existingName.name === data.name && existingNumber.number === data.number) {
        throw new ApiError(400, `Service category with name '${data.name}' and number '${data.number}' already exists.`)
    }

    if (existingName && data.number !== existingName.number) {
        throw new ApiError(400, `Service category with name '${data.name}' already exists.`)
    }

    if (existingNumber && data.name !== existingNumber.name) {
        throw new ApiError(400, `Service category with number '${data.number}' already exists.`)
    }

    return await ServiceCategory.create(data)
}

const updateCategoryService = async (id: string | mongoose.Types.ObjectId, data: ICategory) => {
    const category = await ServiceCategory.findById(id)
    if (!category) {
        throw new ApiError(404, `Service category with id '${id}' not found.`)
    }

    if (data.name) {
        const existingName = await ServiceCategory.findOne({ name: data.name })
        if (existingName && existingName._id.toString() !== id) {
            throw new ApiError(400, `Service category with '${data.name}' already exists.`)
        }
    }   

    if (data.number) {
        const existingNumber = await ServiceCategory.findOne({ number: data.number })
        if (existingNumber && existingNumber._id.toString() !== id) {
            throw new ApiError(400, `Service category with number '${data.number}' already exists.`)
        }
    }

    const updatedCategory = await ServiceCategory.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
    })

    if (!updatedCategory) {
        throw new ApiError(400, "Failed to update service category.")
    }

    return updatedCategory
}

const toggleCategoryServiceStatus = async (id: string | mongoose.Types.ObjectId) => {
    const category = await ServiceCategory.findById(id)
    if (!category) {
        throw new ApiError(404, 'No Service category found')
    }

    const status = category.isActive === true ? false : true
    return await ServiceCategory.findOneAndUpdate({_id: id}, { isActive: status }, { new: true })
}

const fetchServices = async () => {
    return await Service.find().populate('serviceCategory')
}

const createService = async (data: IService) => {
    const category = await ServiceCategory.findById((data.serviceCategory) as mongoose.Types.ObjectId)
    if (!category) {
        throw new ApiError(404, "Service category not found")
    }

    const isBillPayment = category.name === 'Bill Payment'

    if (isBillPayment) {
        if (!data.url) {
            throw new ApiError(400, "Bill Payment service must include a 'url'")
        }
    } else {
        if (data.url) {
            throw new ApiError(400, "Only Bill Payment services can include a 'url'")
        }
        if (data.number == null) {
            throw new ApiError(400, "Non-Bill Payment services must include a 'number'")
        }
    }
    
    return await Service.create(data)
}

const updateService = async (id: mongoose.Types.ObjectId | string, data: IService) => {

}

const changeServiceStatus = async (id: mongoose.Types.ObjectId | string) => {
    const service = await Service.findById(id)
    if (!service) {
        throw new ApiError(404, "Service not found")
    }

    const status = service.isActive === true ? false : true
    return await Service.findOneAndUpdate({_id: id}, { isActive: status }, { new: true })
}

export const serviceDal = {
    fetchCategoryServices,
    createCategoryServices,
    updateCategoryService,
    toggleCategoryServiceStatus,
    fetchServices,
    createService,
    updateService,
    changeServiceStatus
}