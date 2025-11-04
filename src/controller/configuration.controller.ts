import { NextFunction, Request, Response } from "express"
import { configurationDal } from "../dal/configuration.dal"

const getConfigurations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const configurations = await configurationDal.fetchConfigurations()
        return res.status(200).json({ message: 'Success', data: configurations, status: 200 })
    } catch (error) {
        next(error)
    }
}

const createConfiguration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await configurationDal.createConfiguration(req.body)
        return res.status(201).json({ message: 'Success', status: 201})
    } catch (error) {
        next(error)
    }
}

const updateConfiguration = async (req: Request, res: Response, next: NextFunction) => {
    
}

const changeConfigurationStatus = async (req: Request, res: Response, next: NextFunction) => {}

export const configurationController = {
    getConfigurations,
    createConfiguration,
    updateConfiguration,
    changeConfigurationStatus
}