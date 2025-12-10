import { type PaginateModel} from "mongoose";
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import moment from "moment-timezone";
import type { ICredential } from "../config/types/credeintial";
import { encryptText } from "../utils/encryption";
import modules from './imports/index'

const Schema = modules.mongoose.Schema

const CredentialSchema = new Schema<ICredential>(
  {
    branchCode: { type: String, required: true, unique: true },
    branchName: { type: String, required: true, unique: true },
    district: { type: String, required: true },
    username: { type: String, unique: true },
    password: { type: String },
    plainPasswordEncrypted: { type: String }
  },
  { timestamps: true }
);

CredentialSchema.plugin(modules.paginator)

CredentialSchema.pre<ICredential>(
  "save",
  function (next) {
    const now = moment().tz("Africa/Addis_Ababa").format();
    this.set({ createdAt: now, updatedAt: now });
    next();
  }
);

CredentialSchema.pre<ICredential>(
  "findOneAndUpdate",
  function (next) {
    this.set({ updatedAt: moment().tz("Africa/Addis_Ababa").format() });
    next();
  }
);

// Generate credentials and handle encryption
CredentialSchema.pre<ICredential>("save", async function (next) {
  if (!this.username) {
    const sanitizedBranch = this.branchName.replace(/\s+/g, "").toLowerCase()
    this.username = `${this.branchCode}_${sanitizedBranch}`
  }

  if (!this.password || !this.plainPasswordEncrypted) {
    const plainPassword = crypto.randomBytes(4).toString("hex")

    this.plainPasswordEncrypted = await encryptText(plainPassword)

    this.password = await bcrypt.hash(plainPassword, 8)

    this.set("_plainPassword", plainPassword)
  }

  next()
})

CredentialSchema.methods.isPasswordMatch = async function (
    password: string
): Promise<boolean> {
    return bcrypt.compare(password, this.password)
}

const Credential = modules.mongoose.model<ICredential>(
  "Credential",
  CredentialSchema
);

export default Credential