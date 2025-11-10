import mongoose, { Schema } from "mongoose";
import moment from "moment-timezone";
import type { IService } from "../config/types/service";

const ServiceSchema = new Schema<IService>(
  {
    name: { type: String, required: true, unique: true },
    serviceCategory: { type: Schema.Types.ObjectId, ref: 'ServiceCategory', required: true },
    expectedResponseTime: { type: Number, required: true },
    checkerRequiredAmount: { type: Number },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    number: { type: Number },
    url: { type: String }
  },
  { timestamps: true }
);


ServiceSchema.pre<IService>(
  "save",
  function (next) {
    const now = moment().tz("Africa/Addis_Ababa").format();
    this.set({ createdAt: now, updatedAt: now });
    next();
  }
);

ServiceSchema.pre<IService>(
  "findOneAndUpdate",
  function (next) {
    this.set({ updatedAt: moment().tz("Africa/Addis_Ababa").format() });
    next();
  }
);

export const Service = mongoose.model<IService>(
  "Service",
  ServiceSchema
);
