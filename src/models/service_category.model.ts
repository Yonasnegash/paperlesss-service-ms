import mongoose, { Schema } from "mongoose";
import moment from "moment-timezone";
import type { ICategory } from "../config/types/service_category";

const ServiceCategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    number: { type: Number, required: true, unique: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);


ServiceCategorySchema.pre<ICategory>(
  "save",
  function (next) {
    const now = moment().tz("Africa/Addis_Ababa").format();
    this.set({ createdAt: now, updatedAt: now });
    next();
  }
);

ServiceCategorySchema.pre<ICategory>(
  "findOneAndUpdate",
  function (next) {
    this.set({ updatedAt: moment().tz("Africa/Addis_Ababa").format() });
    next();
  }
);

export const ServiceCategory = mongoose.model<ICategory>(
  "ServiceCategory",
  ServiceCategorySchema
);
