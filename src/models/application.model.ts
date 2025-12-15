import mongoose, { Schema } from "mongoose";
import moment from "moment-timezone";
import type { IApplication } from "../config/types/application";
import { QueueCounter } from "./QueueCounter.model";

const ApplicationSchema = new Schema<IApplication>(
  {
    fullName: { type: String },
    receiverFullName: { type: String },
    accountNumber: { type: Number },
    accountType: {
      type: String,
      enum: ["IFB", "Conventional"],
      required: true,
    },
    phoneNumber: { type: String },
    changedPhoneNumber: { type: String },
    additionalBankAccount: { type: Number },
    reason: { type: String },
    receiverAccountNumber: { type: String },
    channel: {
      type: String,
      enum: ["bank", "phone", "qr"],
      required: true,
    },
    signature: {
      type: [String],  
      default: [],
    },
    amount: { type: String },
    queueNumber: { type: Number },
    serviceCategoryReference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ServiceCategory",
      required: true,
    },
    serviceReference: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
    },
    bankOrUtilityReference: { type: String },
    utilityName: { type: String },
    receiverPhone: { type: String }, // for wallets
    additionalPhone: { type: String }, // for reason
    priority: {
      type: Number,
      enum: [0, 1],
      default: 0,
    },
    // instrumentNumber: { type: String },
    // approvalStatus: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "ApprovalStatus",
    // },
    branchId: { type: String, required: true },
    numberOfCheckPages: { type: Number },
    bankStatementFromDate: { type: Date },
    bankStatementToDate: { type: Date },
    lockedAt: { type: Date },
    lockedBy: { type: mongoose.Schema.Types.ObjectId },
    isLocked: { type: Boolean, default: false },
    date_of_birth: { type: Date },
    gender: { type: String },
    city: { type: String },
    nationality: { type: String },
    selectedAmounts: { type: [Number] },
    applicationId: { type: String },
    isClosed: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isUSSDUser: { type: Boolean },
    isSuperAppUser: { type: Boolean },
  },
  { timestamps: true }
);

ApplicationSchema.pre<IApplication>("save", async function (next) {
  const now = moment().tz("Africa/Addis_Ababa").format();
  if (!this.createdAt) this.set({ createdAt: now });
  this.set({ updatedAt: now });

  if (this.isNew && !this.queueNumber) {
    const today = moment().tz("Africa/Addis_Ababa").format("YYYY-MM-DD");

    const maxId = await this.model('Application').findOne().sort({ applicationId: -1 }).select('applicationId') as IApplication | null;  
    this.applicationId = maxId && maxId.applicationId ? (parseInt(maxId.applicationId) + 1).toString() : '1000000';  

    // Determine channel group
    const channelGroup = this.channel === "phone" ? "phone" : "bank/qr";

    // Increment queue counter
    const counter = await QueueCounter.findOneAndUpdate(
      { branchId: this.branchId, date: today, channelGroup },
      { $inc: { lastQueueNumber: 1 } },
      { upsert: true, new: true }
    );

    this.queueNumber = counter.lastQueueNumber;
  }

  next();
});

ApplicationSchema.pre<IApplication>("findOneAndUpdate", function (next) {
  this.set({ updatedAt: moment().tz("Africa/Addis_Ababa").format() });
  next();
});

export const Application = mongoose.model<IApplication>("Application", ApplicationSchema);
