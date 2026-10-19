import mongoose, { Schema, Document, Model } from "mongoose";

export interface IInstallment extends Document {
  enrollmentId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  installmentNumber: number;
  amount: number;
  paidAmount: number;
  dueDate: Date;
  status: "pending" | "partially_paid" | "paid" | "overdue";
  paidDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InstallmentSchema = new Schema<IInstallment>(
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
    installmentNumber: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    paidAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "partially_paid", "paid", "overdue"],
      default: "pending",
      index: true,
    },
    paidDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const Installment: Model<IInstallment> =
  mongoose.models.Installment ||
  mongoose.model<IInstallment>("Installment", InstallmentSchema);
