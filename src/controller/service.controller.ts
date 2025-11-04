import { NextFunction, Request, Response } from "express"
import { serviceDal } from "../dal/service.dal"

const getCategoryServices = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const services = await serviceDal.fetchCategoryServices()
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
    try {
        const subServices = await serviceDal.fetchServices()
        return res.status(200).json({ message: 'Success', data: subServices, status: 200 })
    } catch (error) {
        next(error)
    }
}

export const serviceController = {
    getCategoryServices,
    getServices,
    createCategoryServices,
    updateCategoryService,
    toggleCategoryServiceStatus
}