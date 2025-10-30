import { Document } from "mongodb";
import mongoose from "mongoose";

export interface ISubService extends Document {
    service_id: mongoose.Types.ObjectId
    title: string
    number: number
    url: string
}