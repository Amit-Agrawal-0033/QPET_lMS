import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICreditGrade {
  grade?: string;
  percentage?: number;
}

export interface ICertificate extends Document {
  certificateNumber: string;
  enrollmentId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  enrollmentNumber: string;
  courseName: string;
  courseDuration: string;
  issueDate: Date;
  status: "issued" | "revoked";
  revocationReason?: string;
  revokedAt?: Date;
  issuedByAdminId: mongoose.Types.ObjectId;
  issuedByAdminName: string;
  verificationToken: string;
  grade?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    certificateNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    enrollmentId: {
      type: Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true,
      unique: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
      index: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    enrollmentNumber: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    courseName: {
      type: String,
      required: true,
      trim: true,
    },
    courseDuration: {
      type: String,
      required: true,
    },
    issueDate: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    status: {
      type: String,
      enum: ["issued", "revoked"],
      default: "issued",
      index: true,
    },
    revocationReason: {
      type: String,
    },
    revokedAt: {
      type: Date,
    },
    issuedByAdminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    issuedByAdminName: {
      type: String,
      required: true,
    },
    verificationToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    grade: {
      type: String,
      default: "A",
    },
  },
  { timestamps: true }
);

export const Certificate: Model<ICertificate> =
  mongoose.models.Certificate ||
  mongoose.model<ICertificate>("Certificate", CertificateSchema);
