import mongoose from "mongoose"
import { IConfiguration } from "../config/types/configuration"
import { Configuration } from "../models/configuration.model"
import { ApiError } from "../utils/ApiError"

const fetchConfigurations = async () => {
    return await Configuration.find()
}

const updateConfiguration = async (configurations: IConfiguration) => {
    if (!Array.isArray(configurations) || configurations.length === 0) {
            return
        }

        const updateResults = []

        for (const config of configurations) {
            const { _id, range } = config

            if (!_id) {
                console.warn("Skipping config without _id")
                continue
            }

            const existingConfig = await Configuration.findById(_id)
            if (!existingConfig) {
                console.warn(`Configuration with id ${_id} not found, skipping.`)
                continue
            }

            if (range?.start !== undefined) existingConfig.range.start = range.start
            if (range?.end !== undefined) existingConfig.range.end = range.end

            await existingConfig.save()
            updateResults.push(existingConfig)
        }

        return updateResults
}

const changeConfigurationStatus = async (id: mongoose.Types.ObjectId | string) => {
    const config = await Configuration.findById(id)
    if (!config) {
        throw new ApiError(400, 'No configuration found')
    }

    const status = config.isActive === true ? false : true
    return await Configuration.findOneAndUpdate({ _id: id }, { isActive: status }, { new: true })
}

export const configurationDal = {
    fetchConfigurations,
    updateConfiguration,
    changeConfigurationStatus
}