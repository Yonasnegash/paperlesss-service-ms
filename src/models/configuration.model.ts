import { type PaginateModel } from "mongoose";
import moment from "moment-timezone";
import type { IConfiguration } from "../config/types/configuration";
import modules from './imports/index'

const Schema = modules.mongoose.Schema

const ConfigurationSchema = new Schema<IConfiguration>(
  {
    flagType: { type: String, enum: ["CRITICAL", "WARNING", "NORMAL"], required: true, unique: true },
    range: {
      start: { type: Number },
      end: { type: Number }
    },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

ConfigurationSchema.plugin(modules.paginator)

ConfigurationSchema.pre<IConfiguration>(
  "save",
  function (next) {
    const now = moment().tz("Africa/Addis_Ababa").format();
    this.set({ createdAt: now, updatedAt: now });
    next();
  }
);

ConfigurationSchema.pre<IConfiguration>(
  "findOneAndUpdate",
  function (next) {
    this.set({ updatedAt: moment().tz("Africa/Addis_Ababa").format() });
    next();
  }
);

const Configuration = modules.mongoose.model<IConfiguration>(
  "Configuration",
  ConfigurationSchema
);

export default Configuration