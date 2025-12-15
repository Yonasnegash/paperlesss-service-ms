import bcrypt from "bcryptjs";
import modules from "./imports/index";
import { type PaginateModel } from "mongoose";
import { type User } from "../config/types/user";
import { getSuperAppConnection } from "../mongoDB/mongoDB";

const Schema = modules.mongoose.Schema;

const UserSchema = new Schema<User>({
  userCode: { type: String },
  fullName: { type: String },
  motherName: { type: String },
  nationality: { type: String },
  branchName: { type: String },
  checkeruser: { type: String },
  makeruser: { type: String },
  districtName: { type: String },
  branchCode: { type: String },
  dailyTransactionLimit: { type: Object },
  singleTransactionLimit: { type: Object },
  dailyTransactionLimitView: { type: Object },
  customSingleTransacttionLimit: { type: Object },
  customDailyTransactionLimit: { type: Object },
  // accessList: { type: Object },
  districtCode: { type: String },
  idNumber: { type: String },
  residentialStatus: { type: String },
  woreda: { type: String },
  birthDate: { type: Date },
  issuedDate: { type: Date },
  issuedBy: { type: String },
  phoneNumber: { type: String },
  gender: { type: String, enum: ['male', 'female'] },

  martialStatus: {
    type: String,
    enum: ['single', 'married', 'divorced', 'widow'],
  },
  employmentStatus: {
    type: String,
  },
  occupation: { type: String },
  employersName: { type: String },
  monthlyIncome: { type: String },
  postalAddress: { type: String },
  streetName: { type: String },

  country: { type: String },
  region: { type: String },
  houseNo: { type: String },
  city: { type: String },
  zone: { type: String },
  kebele: { type: String },
  subCity: { type: String },
  andOrCustomerNumber: [{ type: String }],
  documentFront: { type: String },
  documentBack: { type: String },
  photo: { type: String },
  signature: { type: String },
  avatar: { type: String },
  email: { type: String },
  userName: { type: String },
  userBio: { type: String },
  andOrStatus: { type: Boolean },
  documentImage: { type: String },
  userImage: { type: String },
  pushToken: { type: String },
  isGifted: { type: Boolean },

  organizationID: { type: String },
  organizationName: { type: String },
  realm: { type: String },
  merchantRole: { type: String, enum: ['owner', 'agent'] },
  poolSource: { type: String, enum: ['portal', 'app', 'agent'] },
  permissionGroup: [{ type: Schema.Types.ObjectId, ref: 'PermissionGroups' }],
  permissions: [{ type: Schema.Types.ObjectId, ref: 'Permissions' }],
  isChecker: { type: Boolean },
  isMaker: { type: Boolean },
  isAccountBlocked: { type: Boolean, default: false },
  cronBlockAction: { type: Boolean, default: false },
  createdForUssd: { type: Boolean, default: false },

  mainAccount: { type: String },
  USSDMainAccount: { type: String },
  lastMainAccount: { type: String },

  linkedAccounts: [
    {
      accountNumber: { type: String },
      linkedStatus: { type: Boolean },
      accountHolderName: { type: String },
      lastLinkedStatus: { type: Boolean },
      linkedDate: { type: Date },
      accountType: { type: String },
      isAccountActive: { type: Boolean },
      andOrStatus: { type: Boolean },
      AccountBranchCode: { type: String },
      ussdLinkedStatus: { type: Boolean, default: false },
      linkedBranch: { type: String },
      makerAndChecker: {
        Linkers: {
          maker: { type: String },
          checker: { type: String },
        },
        Unlinkers: {
          maker: { type: String },
          checker: { type: String },
        },
      },
    },
  ],
  accountLinked: { type: Boolean, default: false },
  lastAccountLinked: { type: Boolean },
  accountBranchType: { type: String, enum: ['CB', 'IFB'] },
  accountType: { type: String, enum: ['NEW', 'LINKED'] },
  accountStatus: { type: String, enum: ['ACTIVE', 'INACTIVE'] },
  KYCRejectReasonField: { type: Array },
  KYCStatus: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED'],
    // default: "PENDING",
  },

  KYCRejectReason: { type: String },
  KYCLevel: { type: Number },
  generatedRefCode: { type: String },
  usedRefCode: { type: String },
  isIBEnabled: { type: Boolean, default: false },
  isUSSDEnabled: { type: Boolean, default: false },
  isUSSDSubscribed: { type: Boolean, default: false },

  KYCApproved: { type: Boolean, default: false }, // branch extra layer ?
  brachApproved: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },

  isSelfRegistered: { type: Boolean },
  blockedOnCPS: { type: Boolean },
  registerdBy: { type: Object }, // if not self registerd
  KYCActionBy: [{ type: Object }],
  BranchActionBy: [{ type: Object }],

  chatGroups: [{ type: Schema.Types.ObjectId, ref: 'Groups' }],
  loginAttemptCount: { type: Number, default: 0 },
  dateJoined: { type: Date },
  lastModified: { type: Date },
  lastLoginAttempt: { type: Date },
  lastOnlineDate: { type: Date },
  lastLogin: { type: Date },

  LDAPStatus: {
    type: String,
    enum: ['AUTHORIZED', 'DENIED', 'PENDING', 'INITIATED'],
    default: 'INITIATED',
  },

  // LDAPActions: [{ type: Schema.Types.ObjectId, ref: "LDAPActions" }],
  LdapRejectReason: { type: String },
  LdapRejectedFields: [String],
  loginPIN: { type: String },
  resetPin: { type: String },
  isForgotPin: { type: Boolean, default: false },
  deviceUUID: { type: String },
  customerNumber: { type: String },
  initialLinkedDate: { type: Date },
  isActivated: { type: Boolean, default: false },
  detached: { type: Boolean },
  agentReferralCode: { type: String },
  primaryAuthentication: {
    type: String,
    enum: ['phoneNumber', 'email', 'emailAndPhone'],
    default: 'phoneNumber',
  },
  loanScore: { type: Number, default: 0 },
  deviceStatus: { type: String, enum: ['LINKED', 'UNLINKED'] },
  sessionExpiresOn: { type: Date },
  accountAuthorizationCode: { type: String },
  unlockAccountRequested: { type: Boolean, default: false },
  enabled: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  passwordChangedAt: Date,
  OTPStatus: { type: String, enum: ['verified', 'denied'] },
  OTPLastTriedAt: { type: Date },
  onetimeLogin: { type: Boolean, default: false },
  OPTLastVerifiedAt: { type: Date },
  OTPVerifyCount: { type: Number },
  PINHistory: [{ type: String }],
  detachedPhoneNumbers: [{ type: String }],
  Level: { type: String },
});

// Pagination plugin
UserSchema.plugin(modules.paginator);

// Bind to SUPERAPP DATABASE connection

let UserModel: PaginateModel<User>;

export default async function getUserModel() {
  const conn = await getSuperAppConnection();

  if (!conn.models.User) {
    UserModel = conn.model<User, PaginateModel<User>>("User", UserSchema);
  } else {
    UserModel = conn.models.User as PaginateModel<User>;
  }

  return UserModel;
}
