import { Document } from "mongodb";

export interface IConfiguration extends Document {
    flagType: string
    range: {
        start: number
        end: number
    }
    isActive: boolean
}