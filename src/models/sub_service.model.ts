import mongoose, { Schema } from "mongoose";
import moment from "moment-timezone";
import type { ISubService } from "../config/types/sub_service";

const SubServiceSchema = new Schema<ISubService>(
  {
    service_id: { type: Schema.Types.ObjectId, ref: 'PaperlessService'},
    title: { type: String, required: true },
    number: { type: Number, required: true },
    url: { type: String },
  },
  { timestamps: true }
);


SubServiceSchema.pre<ISubService>(
  "save",
  function (next) {
    const now = moment().tz("Africa/Addis_Ababa").format();
    this.set({ createdAt: now, updatedAt: now });
    next();
  }
);

SubServiceSchema.pre<ISubService>(
  "findOneAndUpdate",
  function (next) {
    this.set({ updatedAt: moment().tz("Africa/Addis_Ababa").format() });
    next();
  }
);

export const PaperlessSubService = mongoose.model<ISubService>(
  "PaperlessSubService",
  SubServiceSchema
);
