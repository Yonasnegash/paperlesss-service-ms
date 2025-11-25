import {
  type QueryOptions,
  type UpdateQuery,
  type FilterQuery,
  type Document,
  type Types,
  type ProjectionType,
} from "mongoose";

export interface IBank {
  _id?: Types.ObjectId;
  bankName: string;
  bankLogo: string;
  bankCode: string;
  bankBCI?: string;

  ipsEnabled?: boolean;
  ipsBank?: boolean

  enabled?: boolean;
  isDeleted?: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

export type Bank = IBank & Document;

export interface BankFilter extends FilterQuery<Bank> {}
export interface BankProjection extends ProjectionType<Bank> {}
export interface BankOptions extends QueryOptions<Bank> {}
export interface BankUpdate extends UpdateQuery<Bank> {}
