import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStudentProfile extends Document {
  fullName: string;
  fatherOrGuardianName: string;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other";
  mobileNumber: string;
  email?: string;
  address: string;
  qualification?: string;
  photoUrl?: string;
  documentUrl?: string;
  registrationDate: Date;
  registrationStatus: "pending" | "approved" | "rejected" | "dropped" | "inactive";
  rejectionReason?: string;
  dropReason?: string;
  droppedAt?: Date;
  preferredCourseId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    fatherOrGuardianName: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    mobileNumber: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      index: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    qualification: {
      type: String,
      trim: true,
    },
    photoUrl: {
      type: String,
    },
    documentUrl: {
      type: String,
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    registrationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "dropped", "inactive"],
      default: "pending",
      index: true,
    },
    rejectionReason: {
      type: String,
    },
    dropReason: {
      type: String,
    },
    droppedAt: {
      type: Date,
    },
    preferredCourseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
  },
  { timestamps: true }
);

export const StudentProfile: Model<IStudentProfile> =
  mongoose.models.StudentProfile ||
  mongoose.model<IStudentProfile>("StudentProfile", StudentProfileSchema);
