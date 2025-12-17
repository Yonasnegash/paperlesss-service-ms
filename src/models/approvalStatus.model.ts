import mongoose, { Schema } from "mongoose";
import { IApprovalStatus } from "../config/types/approvalStatus";

const ApprovalStatusSchema = new Schema<IApprovalStatus>(
  {
    makerStatus: {
      type: String,
      enum: ["Pending","Picked", "Accepted", "Rejected", "Completed"],
      default: "Pending",
    },
    checkerStatus: {
      type: String,
      enum: ["Pending", "Rejected", "Approved"],
      default: "Pending",
    },
    makerReason: { type: String },
    checkerReason: { type: String },
    processedBy: { // maker
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      username: { type: String },
    },
    checkedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      username: { type: String },
    },
    auditedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      username: { type: String },
    },
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
    },
  },
  { timestamps: true }
);

export const ApprovalStatus = mongoose.model<IApprovalStatus>("ApprovalStatus", ApprovalStatusSchema);