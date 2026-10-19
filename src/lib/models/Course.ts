import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICourse extends Document {
  code: string;
  title: string;
  description: string;
  durationMonths: number;
  durationText?: string;
  defaultFee: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    durationMonths: {
      type: Number,
      required: true,
      min: 1,
    },
    durationText: {
      type: String,
    },
    defaultFee: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  { timestamps: true }
);

export const Course: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);
