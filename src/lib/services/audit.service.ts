import { connectDB } from "../db/mongoose";
import { AuditLog } from "../models/AuditLog";

interface LogAuditParams {
  action: string;
  performedBy: string;
  performedByRole?: string;
  targetType: string;
  targetId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
}

export async function logAudit(params: LogAuditParams) {
  try {
    await connectDB();
    await AuditLog.create({
      action: params.action,
      performedBy: params.performedBy,
      performedByRole: params.performedByRole || "admin",
      targetType: params.targetType,
      targetId: params.targetId,
      details: params.details || {},
      ipAddress: params.ipAddress || "system",
    });
  } catch (error) {
    console.error("Failed to write audit log:", error);
    // Non-blocking for primary transaction flow
  }
}
