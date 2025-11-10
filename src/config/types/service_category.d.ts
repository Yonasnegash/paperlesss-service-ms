import { Document } from "mongodb";

export interface ICategory extends Document {
    name: string
    number: number,
    isActive: boolean
}