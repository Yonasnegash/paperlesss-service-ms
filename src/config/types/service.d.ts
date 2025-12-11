import { 
    type Document,
    type UpdateQuery,
    type FilterQuery,
    type Types,
    type ProjectionType,
    type QueryOptions,
 } from "mongoose";


interface IService extends Document {
    name: string
    serviceCategory: mongoose.Types.ObjectId,
    expectedResponseTime: number
    description: string
    checkerRequiredAmount: number
    isActive: boolean
    number: number
    url: string
}

export interface IServiceWithFlags extends IService {
    cricitalFlagTime: string
    warningFlagTime: string
    normalFlagTime: string
}

export type IService = IService & Document

export interface ServiceFilter extends FilterQuery<IService> { }
export interface ServiceProject extends ProjectionType<IService> { }
export interface ServiceOptions extends QueryOptions<IService> { }
export interface ServiceUpdate extends UpdateQuery<IService> { }