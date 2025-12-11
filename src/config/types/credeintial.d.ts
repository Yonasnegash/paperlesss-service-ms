import { 
   type Document,
   type UpdateQuery,
   type FilterQuery,
   type Types,
   type ProjectionType,
   type QueryOptions
} from "mongoose";

interface ICredential extends Document {
    branchCode: string
    branchName: string,
    district: string,
    username: string,
    password: string
    plainPasswordEncrypted: string
    isPasswordMatch(password: string): Promise<boolean>
}

export type ICredential = ICredential & Document

export interface CredeintialFilter extends FilterQuery<ICredential> { }
export interface CredeintialProject extends ProjectionType<ICredential> { }
export interface CredeintialOptions extends QueryOptions<ICredential> { }
export interface CredeintialUpdate extends UpdateQuery<ICredential> { }