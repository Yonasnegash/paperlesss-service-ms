import { Document } from "mongodb";
import mongoose from "mongoose";

export interface IService extends Document {
    name: string
    serviceCategory: mongoose.Types.ObjectId,
    expectedResponseTime: number
    description: string
    checkerRequiredAmount: number
    isActive: boolean
}