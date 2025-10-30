import mongoose, { Document } from "mongoose"

export interface IPaperlessUser extends Document{
  fullName: string;
  phoneNumber: string;
  branchCode: string
  role: string
  password: string
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
  isPasswordMatch(password: string): Promise<boolean>
}