import mongoose, { Document } from "mongoose"

export interface IApplication extends Document{
    fullName: string;
    receiverFullName: string;
    accountNumber: number;
    accountType: string;
    phoneNumber: string;
    changedPhoneNumber?: string;
    additionalBankAccount?: number;
    reason?: string;
    receiverAccountNumber?: string;
    signature: string[];
    amount: string;
    queueNumber?: number;
    serviceCategoryReference: mongoose.Schema.Types.ObjectId;
    serviceReference: mongoose.Schema.Types.ObjectId;
    bankOrUtilityReference: string;
    utilityName: string;
    receiverPhone?: string; // for wallets
    priority?: 0 | 1;
    channel: string;
    branchId: string;
    numberOfCheckPages?: number;
    bankStatementFromDate?: Date;
    bankStatementToDate?: Date;
    lockedAt: Date,
    lockedBy: mongoose.Schema.Types.ObjectId
    isLocked: boolean;
    isDeleted: boolean;
    isClosed: boolean;
    isUSSDUser: boolean;
    isSuperAppUser: boolean;
    // approvalStatus: Types.ObjectId;
    // maker: string;
    // checker?: string;

    // makerStatus: "Pending" | "Accepted" | "Rejected" | "Completed", "Submitted to Checker";
    // checkerStatus: "Pending" | "Rejected" | "Approved";
    // makerReason?: string;
    // checkerReason?: string;
    // processedBy: { userId: mongoose.Schema.Types.ObjectId, username: string }
    // checkedBy: { userId: mongoose.Schema.Types.ObjectId, username: string }
    additionalPhone: string;
    nationality: string;
    gender: string;
    city: string;
    date_of_birth: Date;
    selectedAmounts: [Number];
    applicationId: string;
    createdAt: Date
    updatedAt: Date
}

export interface IApprovalStatus extends Document {
  makerStatus: "Pending" | "Accepted" | "Rejected" | "Completed" | "Submitted to Checker";
  checkerStatus: "Pending" | "Rejected" | "Approved";
  makerReason?: string;
  checkerReason?: string;
  processedBy?: {
    userId?: Types.ObjectId;
    username?: string;
  };
  checkedBy?: {
    userId?: Types.ObjectId;
    username?: string;
  };
  auditedBy?: {
    userId?: Types.ObjectId;
    username?: string;
  };
  applicationId: Types.ObjectId;
}