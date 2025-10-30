import { Document } from "mongodb";

export interface IService extends Document {
    title: string
    number: number
}