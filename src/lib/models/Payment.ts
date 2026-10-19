import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPayment extends Document {
  enrollmentId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  receiptId?: mongoose.Types.ObjectId;
  receiptNumber?: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: "cash" | "upi" | "bank_transfer";
  transactionReference?: string;
  remarks?: string;
  recordedByAdminId: mongoose.Types.ObjectId;
  recordedByAdminName: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
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
    receiptId: {
      type: Schema.Types.ObjectId,
      ref: "FeeReceipt",
      index: true,
    },
    receiptNumber: {
      type: String,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0.01,
    },
    paymentDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "upi", "bank_transfer"],
      required: true,
    },
    transactionReference: {
      type: String,
      trim: true,
    },
    remarks: {
      type: String,
      trim: true,
    },
    recordedByAdminId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recordedByAdminName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);
