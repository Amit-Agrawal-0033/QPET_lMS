import mongoose, { Schema, Document, Model } from "mongoose";

export interface IEnrollmentCounter extends Document {
  year: number;
  lastSequence: number;
  updatedAt: Date;
}

const EnrollmentCounterSchema = new Schema<IEnrollmentCounter>(
  {
    year: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    lastSequence: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

export const EnrollmentCounter: Model<IEnrollmentCounter> =
  mongoose.models.EnrollmentCounter ||
  mongoose.model<IEnrollmentCounter>("EnrollmentCounter", EnrollmentCounterSchema);
