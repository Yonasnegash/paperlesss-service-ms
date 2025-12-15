import mongoose, {
  QueryOptions,
  UpdateQuery,
  FilterQuery,
  Document,
  Types,
  ProjectionType,
} from "mongoose";

import { PermissionGroup } from "./permission_group";

interface MakerChecker {
  maker: string;
  checker: string;
}

interface LinkedAccount {
  accountNumber: string;
  linkedStatus: boolean;
  accountHolderName: string;
  lastLinkedStatus: boolean;
  linkedDate: Date;
  accountType?: string;
  isAccountActive?: boolean;
  andOrStatus?: boolean;
  AccountBranchCode?: string;
  ussdLinkedStatus?: boolean;
  linkedBranch?: string;
  makerAndChecker?: {
    Linkers: MakerChecker;
    Unlinkers: MakerChecker;
  };
}

export interface IUser {
  _id: Types.ObjectId;

  userCode?: string;
  fullName: string;
  motherName?: string;
  nationality?: string;
  branchName?: string;
  checkeruser?: string;
  makeruser?: string;
  districtName?: string;
  branchCode?: string;

  dailyTransactionLimit?: object;
  singleTransactionLimit?: object;
  dailyTransactionLimitView?: object;
  customSingleTransacttionLimit?: object;
  customDailyTransactionLimit?: object;

  districtCode?: string;
  idNumber?: string;
  residentialStatus?: string;
  woreda?: string;

  birthDate?: Date;
  issuedDate?: Date;
  issuedBy?: string;

  phoneNumber: string;

  gender: "male" | "female";

  martialStatus?: "single" | "married" | "divorced" | "widow";
  employmentStatus?: string;
  occupation?: string;
  employersName?: string;
  monthlyIncome?: string;

  postalAddress?: string;
  streetName?: string;
  houseNo?: string;

  country?: string;
  region?: string;
  city?: string;
  zone?: string;
  kebele?: string;
  subCity?: string;

  andOrCustomerNumber?: string[];

  documentFront?: string;
  documentBack?: string;
  photo?: string;
  signature?: string;
  avatar?: string;

  email?: string;
  userName?: string;
  userBio?: string;

  andOrStatus?: boolean;

  documentImage?: string;
  userImage?: string;

  pushToken?: string;
  isGifted?: boolean;

  organizationID?: string;
  organizationName?: string;

  realm: string;

  merchantRole?: "owner" | "agent";
  poolSource?: "portal" | "app" | "agent";

  permissionGroup?: PermissionGroup[];
  permissions?: Types.ObjectId[];

  isChecker?: boolean;
  isMaker?: boolean;

  isAccountBlocked?: boolean;
  cronBlockAction?: boolean;

  createdForUssd?: boolean;

  mainAccount?: string;
  USSDMainAccount?: string;
  lastMainAccount?: string;

  linkedAccounts?: LinkedAccount[];
  accountLinked?: boolean;
  lastAccountLinked?: boolean;

  accountBranchType?: "CB" | "IFB";
  accountType?: "NEW" | "LINKED";
  accountStatus?: "ACTIVE" | "INACTIVE";

  KYCRejectReasonField?: any[];
  KYCStatus?: "PENDING" | "APPROVED" | "REJECTED";
  KYCRejectReason?: string;
  KYCLevel?: number;

  generatedRefCode?: string;
  usedRefCode?: string;

  isIBEnabled?: boolean;
  isUSSDEnabled?: boolean;
  isUSSDSubscribed?: boolean;

  KYCApproved?: boolean;
  brachApproved?: boolean; // typo but kept for compatibility
  isVerified?: boolean;

  isSelfRegistered?: boolean;
  blockedOnCPS?: boolean;

  registerdBy?: object;
  KYCActionBy?: object[];
  BranchActionBy?: object[];

  chatGroups?: Types.ObjectId[];

  loginAttemptCount?: number;
  dateJoined?: Date;
  lastModified?: Date;
  lastLoginAttempt?: Date;
  lastOnlineDate?: Date;
  lastLogin?: Date;

  LDAPStatus?: "AUTHORIZED" | "DENIED" | "PENDING" | "INITIATED";
  LdapRejectReason?: string;
  LdapRejectedFields?: string[];

  loginPIN?: string;
  resetPin?: string;
  isForgotPin?: boolean;

  deviceUUID?: string;
  customerNumber?: string;
  initialLinkedDate?: Date;
  isActivated?: boolean;
  detached?: boolean;

  agentReferralCode?: string;

  primaryAuthentication?: "phoneNumber" | "email" | "emailAndPhone";

  loanScore?: number;

  deviceStatus?: "LINKED" | "UNLINKED";

  sessionExpiresOn?: Date;

  accountAuthorizationCode?: string;
  unlockAccountRequested?: boolean;
  enabled?: boolean;
  isDeleted?: boolean;

  passwordChangedAt?: Date;

  OTPStatus?: "verified" | "denied";
  OTPLastTriedAt?: Date;
  OPTLastVerifiedAt?: Date;
  OTPVerifyCount?: number;
  onetimeLogin?: boolean;
  PINHistory?: string[];

  detachedPhoneNumbers?: string[];

  Level?: string;

  isPasswordMatch(password: string): Promise<boolean>;
}

export type User = IUser & Document;

export interface UserFilter extends FilterQuery<User> {}
export interface UserProjection extends ProjectionType<User> {}
export interface UserOptions extends QueryOptions<User> {}
export interface UserUpdate extends UpdateQuery<User> {}
