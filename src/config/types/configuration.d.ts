import {
        type Document,
        type UpdateQuery,
        type FilterQuery,
        type Types,
        type ProjectionType,
        type QueryOptions,
    } from "mongoose";

interface IConfiguration extends Document {
    flagType: string
    range: {
        start: number
        end: number
    }
    isActive: boolean
}

export type IConfiguration = IConfiguration & Document

export interface ConfigurationFilter extends FilterQuery<IConfiguration> { }
export interface ConfigurationProject extends ProjectionType<IConfiguration> { }
export interface ConfigurationOptions extends QueryOptions<IConfiguration> { }
export interface ServiceUpdate extends UpdateQuery<IConfiguration> { }