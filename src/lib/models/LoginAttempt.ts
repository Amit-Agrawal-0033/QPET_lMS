import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILoginAttempt extends Document {
  key: string; // e.g. "ip:192.168.1.1" or "ident:user@example.com"
  ip: string;
  identifier?: string;
  failedAttempts: number;
  lockedUntil?: Date;
  lastAttempt: Date;
  createdAt: Date;
}

const LoginAttemptSchema = new Schema<ILoginAttempt>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    ip: {
      type: String,
      required: true,
      index: true,
    },
    identifier: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    failedAttempts: {
      type: Number,
      default: 1,
    },
    lockedUntil: {
      type: Date,
    },
    lastAttempt: {
      type: Date,
      default: Date.now,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 900, // MongoDB TTL index: Document automatically removed after 15 minutes
    },
  },
  { timestamps: false }
);

export const LoginAttempt: Model<ILoginAttempt> =
  mongoose.models.LoginAttempt ||
  mongoose.model<ILoginAttempt>("LoginAttempt", LoginAttemptSchema);
