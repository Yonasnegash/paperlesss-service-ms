import { type PaginateModel } from "mongoose";
import moment from "moment-timezone";
import type { ICategory } from "../config/types/service_category";
import modules from './imports/index'

const Schema = modules.mongoose.Schema

const ServiceCategorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true },
    number: { type: Number, required: true, unique: true },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

ServiceCategorySchema.plugin(modules.paginator)

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

const ServiceCategory = modules.mongoose.model<ICategory>(
  "ServiceCategory",
  ServiceCategorySchema
);

export default ServiceCategory
