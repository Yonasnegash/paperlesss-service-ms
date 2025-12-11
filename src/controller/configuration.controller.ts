import { NextFunction, Request, Response } from "express"
import { validateOverlaps } from "../middleware/validate_config_payload_overlap"
import { ConfigurationFilter, ConfigurationOptions, IConfiguration } from "../config/types/configuration"
import { ResponseHandler } from "../utils/response-handler"
import { configurationRepositoryDal } from "../utils/DALimportModules"
import mongoose from "mongoose"

const buildFilter = (params: Record<string, any>): ConfigurationFilter => {
    let filter: ConfigurationFilter = {}

    if (params.search) {
        filter = {
            $or: [
                { flagType: { $regex: params.search, $options: 'i' } },
            ]
        }
    }

    return filter
}

const getConfigurations = async (req: Request, res: Response) => {
    try {
        const query: ConfigurationFilter = buildFilter(req.query)

        const options: ConfigurationOptions = {
            select: '-__v'
        }

        const configurations = await configurationRepositoryDal.find(
            query,
            options.select
        )

        return ResponseHandler.sendSuccess(res, 'Success', configurations)
    } catch (error) {
        return ResponseHandler.serverError(res, (error as Error)?.message || 'Internal server error')
    }
}

const updateConfiguration = async (req: Request, res: Response) => {
    try {
        const configurations: IConfiguration[] = req.body?.configurations

        if (!Array.isArray(configurations) || configurations.length === 0) {
            return ResponseHandler.badRequest(res, "Configurations array is required.")
        }

        await validateOverlaps(configurations)
        
        await configurationRepositoryDal.updateConfigurationBulk(configurations)
        return ResponseHandler.sendSuccess(res, "Success", null)
    } catch (error) {
        return ResponseHandler.serverError(res, (error as Error)?.message || "Internal server error")
    }
}

const changeConfigurationStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params
        const configObjectId = new mongoose.Types.ObjectId(id)

        const configuration = await configurationRepositoryDal.findOne({ _id: configObjectId })

        if (!configuration) {
            ResponseHandler.notFound(res, "No configuration found")
        }

        const newStatus = !configuration?.isActive

        await configurationRepositoryDal.updateOne(
            { _id: configObjectId },
            { isActive: newStatus }
        )

        return ResponseHandler.sendSuccess(res, "Configuration status changed", null)
    } catch (error) {
        return ResponseHandler.serverError(res, (error as Error)?.message || "Internal server error")
    }
}

export const configurationController = {
    getConfigurations,
    updateConfiguration,
    changeConfigurationStatus
}