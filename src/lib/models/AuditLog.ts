import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuditLog extends Document {
  action: string;
  performedBy: string;
  performedByRole: string;
  targetType: string;
  targetId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      required: true,
      index: true,
    },
    performedBy: {
      type: String,
      required: true,
    },
    performedByRole: {
      type: String,
      default: "admin",
    },
    targetType: {
      type: String,
      required: true,
    },
    targetId: {
      type: String,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog ||
  mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
