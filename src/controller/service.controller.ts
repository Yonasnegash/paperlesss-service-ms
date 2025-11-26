import { NextFunction, Request, Response } from "express"
import { serviceDal } from "../dal/service.dal"

const getCategoryServices = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { search } = req.query
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const services = await serviceDal.fetchCategoryServices(page, limit, search as string)
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
        const { search } = req.query
        const page = parseInt(req.query.page as string) || 1
        const limit = parseInt(req.query.limit as string) || 10
        const services = await serviceDal.fetchServices(page, limit, search as string)
        return res.status(200).json({ message: 'Success', data: services, status: 200 })
    } catch (error) {
        next(error)
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