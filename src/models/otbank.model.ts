import mongoose, { PaginateModel } from "mongoose";
import paginator from "mongoose-paginate-v2";
import { Bank } from "../config/types/bank";

const Schema = mongoose.Schema;

const OtbankSchema = new Schema(
  {
    bankName: { type: String },
    bankLogo: { type: String },
    bankCode: { type: String },
    bankBCI: { type: String },
    ipsEnabled: { type: Boolean, default: false },
    ipsBank: { type: Boolean, default: true },
    enabled: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);
// add mongoose-troop middleware to support pagination
OtbankSchema.plugin(paginator);

const OtbankModel = mongoose.model<Bank, PaginateModel<Bank>>(
  "Otbank",
  OtbankSchema
);

export default OtbankModel;
