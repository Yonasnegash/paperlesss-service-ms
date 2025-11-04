import { IConfiguration } from "../config/types/configuration"
import { Configuration } from "../models/configuration.model"

const fetchConfigurations = async () => {
    return await Configuration.find()
}

const createConfiguration = async (data: IConfiguration) => {
    return await Configuration.create(data)
}

const updateConfiguration = async () => {}

const changeConfigurationStatus = async () => {}

export const configurationDal = {
    fetchConfigurations,
    createConfiguration,
    updateConfiguration,
    changeConfigurationStatus
}