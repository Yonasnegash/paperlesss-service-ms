import mongoose, { Schema } from "mongoose";
import bcrypt from 'bcryptjs'
import moment from "moment-timezone";
import type { IPaperlessUser } from "../config/types/paperless_user.js";

const PaperlessUserSchema = new Schema<IPaperlessUser>(
  {
    fullName: { type: String },
    phoneNumber: { type: String },
    branchCode: { type: String },
    role: { type: String },
    password: { type: String },
    isVerified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

PaperlessUserSchema.pre<IPaperlessUser>("save", async function (next) {
  const now = moment().tz("Africa/Addis_Ababa").format();
  if (!this.createdAt) this.set({ createdAt: now });
  this.set({ updatedAt: now });
  next();
});

PaperlessUserSchema.pre<IPaperlessUser>("findOneAndUpdate", function (next) {
  this.set({ updatedAt: moment().tz("Africa/Addis_Ababa").format() });
  next();
});

PaperlessUserSchema.pre("save", async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 8)
    }
    next()
})

PaperlessUserSchema.methods.isPasswordMatch = async function (
    password: string
): Promise<boolean> {
    return bcrypt.compare(password, this.password)
}

export const PaperlessUser = mongoose.model<IPaperlessUser>("PaperlessUser", PaperlessUserSchema);
