import { NextFunction, Request, Response } from "express"
import { configurationDal } from "../dal/configuration.dal"
import { validateOverlaps } from "../middleware/validate_config_payload_overlap"

const getConfigurations = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const configurations = await configurationDal.fetchConfigurations()
        return res.status(200).json({ message: 'Success', data: configurations, status: 200 })
    } catch (error) {
        next(error)
    }
}

const updateConfiguration = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { configurations } = req.body

        await validateOverlaps(configurations)
        
        await configurationDal.updateConfiguration(configurations)
        return res.status(200).json({ message: 'Success', status: 200 })
    } catch (error) {
        next(error)
    }
}

const changeConfigurationStatus = async (req: Request, res: Response, next: NextFunction) => {}

export const configurationController = {
    getConfigurations,
    updateConfiguration,
    changeConfigurationStatus
}