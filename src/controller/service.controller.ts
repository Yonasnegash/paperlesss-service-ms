import { NextFunction, Request, Response } from "express"
import { serviceDal } from "../dal/service.dal"

const getServices = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const services = await serviceDal.fetchServices()
        return res.status(200).json({ message: 'Success', data: services, status: 200 })
    } catch (error) {
        next(error)
    }
}

const getSubServices = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const subServices = await serviceDal.fetchSubServices()
        return res.status(200).json({ message: 'Success', data: subServices, status: 200 })
    } catch (error) {
        next(error)
    }
}

export const serviceController = {
    getServices,
    getSubServices
}