import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  identifier: string; // email or mobile number
  email?: string;
  mobileNumber?: string;
  passwordHash: string;
  role: "admin" | "student";
  status: "active" | "inactive" | "pending";
  studentProfileId?: mongoose.Types.ObjectId;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    identifier: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      index: true,
    },
    mobileNumber: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "student"],
      default: "student",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "active",
      index: true,
    },
    studentProfileId: {
      type: Schema.Types.ObjectId,
      ref: "StudentProfile",
      index: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
