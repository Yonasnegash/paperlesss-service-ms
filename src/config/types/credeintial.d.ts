import { Document } from "mongodb";

export interface ICredential extends Document {
    branchCode: string
    branchName: string,
    district: string,
    username: string,
    password: string
    plainPasswordEncrypted: string
    isPasswordMatch(password: string): Promise<boolean>
}