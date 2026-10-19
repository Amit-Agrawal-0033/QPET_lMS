import mongoose, { Schema, Document, Model } from "mongoose";

export interface IFeeReceipt extends Document {
  receiptNumber: string;
  paymentId: mongoose.Types.ObjectId;
  enrollmentId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  enrollmentNumber: string;
  courseName: string;
  totalCourseFee: number;
  previousPaidAmount: number;
  currentPaymentAmount: number;
  totalPaidAfterThis: number;
  outstandingBalanceAfterThis: number;
  paymentMethod: string;
  transactionReference?: string;
  receiptDate: Date;
  issuedBy: string;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeeReceiptSchema = new Schema<IFeeReceipt>(
  {
    receiptNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    paymentId: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
      index: true,
    },
    enrollmentId: {
      type: Schema.Types.ObjectId,
      ref: "Enrollment",
      required: true,
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
    totalCourseFee: {
      type: Number,
      required: true,
      min: 0,
    },
    previousPaidAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    currentPaymentAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPaidAfterThis: {
      type: Number,
      required: true,
      min: 0,
    },
    outstandingBalanceAfterThis: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    transactionReference: {
      type: String,
    },
    receiptDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    issuedBy: {
      type: String,
      required: true,
    },
    remarks: {
      type: String,
    },
  },
  { timestamps: true }
);

export const FeeReceipt: Model<IFeeReceipt> =
  mongoose.models.FeeReceipt ||
  mongoose.model<IFeeReceipt>("FeeReceipt", FeeReceiptSchema);
