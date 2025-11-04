import mongoose, { Schema } from "mongoose";
import moment from "moment-timezone";
import type { IConfiguration } from "../config/types/configuration";

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

export const Configuration = mongoose.model<IConfiguration>(
  "Configuration",
  ConfigurationSchema
);
