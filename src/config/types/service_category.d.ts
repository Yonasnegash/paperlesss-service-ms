import { 
        type Document,
        type UpdateQuery,
        type FilterQuery,
        type Types,
        type ProjectionType,
        type QueryOptions
    } from "mongoose";

interface ICategory extends Document {
    name: string
    number: number,
    isActive: boolean
}

export type ICategory = ICategory & Document

export interface ServiceCategoryFilter extends FilterQuery<ICategory> { }
export interface ServiceCategoryProject extends ProjectionType<ICategory> { }
export interface ServiceCategoryOptions extends QueryOptions<ICategory> { }
export interface ServiceCategoryUpdate extends UpdateQuery<ICategory> { }