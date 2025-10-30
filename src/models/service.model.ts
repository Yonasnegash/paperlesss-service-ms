import mongoose, { Schema } from "mongoose";
import moment from "moment-timezone";
import type { IService } from "../config/types/service";

const ServiceSchema = new Schema<IService>(
  {
    title: { type: String, required: true, unique: true },
    number: { type: Number, required: true, unique: true },
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

export const PaperlessService = mongoose.model<IService>(
  "PaperlessService",
  ServiceSchema
);
