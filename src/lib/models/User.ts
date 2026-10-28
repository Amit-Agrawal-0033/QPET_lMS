import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUserPermissions {
  viewStudents?: boolean;
  editStudents?: boolean;
  viewRegistrations?: boolean;
  editRegistrations?: boolean;
  viewCourses?: boolean;
  editCourses?: boolean;
  viewEnrollments?: boolean;
  editEnrollments?: boolean;
  viewFees?: boolean;
  editFees?: boolean;
  viewReceipts?: boolean;
  viewCertificates?: boolean;
  editCertificates?: boolean;
  generateCertificates?: boolean;
  viewReports?: boolean;
  viewAuditReports?: boolean;
  [key: string]: boolean | undefined;
}

export interface IUser extends Document {
  identifier: string; // email or mobile number
  name?: string;
  email?: string;
  mobileNumber?: string;
  passwordHash: string;
  role: "admin" | "trainer" | "student";
  status?: "active" | "inactive" | "pending";
  permissions?: IUserPermissions;
  permissionsUpdatedAt?: Date;
  permissionsUpdatedBy?: string;
  permissionPreset?: string;
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
    name: {
      type: String,
      trim: true,
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
      enum: ["admin", "trainer", "student"],
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
    permissions: {
      type: Schema.Types.Mixed,
      default: {},
    },
    permissionsUpdatedAt: {
      type: Date,
    },
    permissionsUpdatedBy: {
      type: String,
      trim: true,
    },
    permissionPreset: {
      type: String,
      trim: true,
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
