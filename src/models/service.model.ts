import { type PaginateModel } from "mongoose";
import moment from "moment-timezone";
import { IService } from "../config/types/service";
import modules from './imports/index'

const Schema = modules.mongoose.Schema;

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

ServiceSchema.plugin(modules.paginator)

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

const Service = modules.mongoose.model<IService, PaginateModel<IService>>(
  "Service",
  ServiceSchema
);

export default Service
