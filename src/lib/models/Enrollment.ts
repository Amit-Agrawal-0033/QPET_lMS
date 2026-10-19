import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEnrollment extends Document {
  enrollmentNumber: string;
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  courseNameSnapshot: string;
  durationMonthsSnapshot: number;
  agreedFeeSnapshot: number;
  enrollmentDate: Date;
  expectedCompletionDate?: Date;
  enrollmentStatus: "active" | "completed" | "cancelled" | "dropped";
  paymentType: "full" | "installment";
  totalFee: number;
  paidAmount: number;
  outstandingBalance: number;
  paymentStatus: "unpaid" | "partially_paid" | "paid";
  certificateStatus: "pending" | "eligible" | "issued" | "not_eligible" | "revoked";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EnrollmentSchema = new Schema<IEnrollment>(
  {
    enrollmentNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "StudentProfile",
      required: true,
      index: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    courseNameSnapshot: {
      type: String,
      required: true,
      trim: true,
    },
    durationMonthsSnapshot: {
      type: Number,
      required: true,
    },
    agreedFeeSnapshot: {
      type: Number,
      required: true,
      min: 0,
    },
    enrollmentDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expectedCompletionDate: {
      type: Date,
    },
    enrollmentStatus: {
      type: String,
      enum: ["active", "completed", "cancelled", "dropped"],
      default: "active",
      index: true,
    },
    paymentType: {
      type: String,
      enum: ["full", "installment"],
      default: "full",
    },
    totalFee: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    outstandingBalance: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "partially_paid", "paid"],
      default: "unpaid",
      index: true,
    },
    certificateStatus: {
      type: String,
      enum: ["pending", "eligible", "issued", "not_eligible", "revoked"],
      default: "pending",
      index: true,
    },
    notes: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Enrollment: Model<IEnrollment> =
  mongoose.models.Enrollment ||
  mongoose.model<IEnrollment>("Enrollment", EnrollmentSchema);
