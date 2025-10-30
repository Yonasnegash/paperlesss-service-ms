import { PaperlessService } from "../models/service.model"
import { PaperlessSubService } from "../models/sub_service.model"

const fetchServices = async () => {
    const services = await PaperlessService.aggregate([
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

const fetchSubServices = async () => {
    return await PaperlessSubService.find().populate('service_id')
}

export const serviceDal = {
    fetchServices,
    fetchSubServices
}