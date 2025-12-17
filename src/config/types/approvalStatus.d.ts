import { 
    type Document,
    type UpdateQuery,
    type FilterQuery,
    type Types,
    type ProjectionType,
    type QueryOptions,
 } from "mongoose";
 
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

export interface ApprovalStatusFilter extends FilterQuery<IApprovalStatus> { }
export interface ApprovalStatusProject extends ProjectionType<IApprovalStatus> { }
export interface ApprovalStatusOptions extends QueryOptions<IApprovalStatus> { }
export interface ApprovalStatusUpdate extends UpdateQuery<IApprovalStatus> { }