import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";
import { AuditLog } from "@/lib/models/AuditLog";

// STRICT REQUIREMENT: Audit Logs are accessible ONLY by Administrator accounts.
// Trainers are completely forbidden from viewing or querying system audit logs.
export async function GET(req: NextRequest) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  try {
    await connectDB();
    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get("action");
    const role = searchParams.get("role");
    const moduleName = searchParams.get("module") || searchParams.get("targetType");
    const trainer = searchParams.get("trainer");
    const search = searchParams.get("search");
    const fromDate = searchParams.get("fromDate");
    const toDate = searchParams.get("toDate");
    const limit = Math.min(Number(searchParams.get("limit")) || 200, 2000);

    const filter: any = {};
    if (action && action !== "all") filter.action = action;
    if (role && role !== "all") filter.performedByRole = role;
    if (moduleName && moduleName !== "all") filter.targetType = moduleName;

    if (trainer && trainer.trim()) {
      filter.performedBy = { $regex: trainer.trim(), $options: "i" };
    }

    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      filter.$or = [
        { action: regex },
        { performedBy: regex },
        { targetType: regex },
        { targetId: regex },
      ];
    }

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({
      success: true,
      logs,
      totalCount: logs.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch audit logs." },
      { status: 500 }
    );
  }
}

// Audit logs are append-only and immutable. Deletion is forbidden even via API.
export async function DELETE() {
  return NextResponse.json(
    { error: "Forbidden: Security audit trails are immutable and cannot be deleted." },
    { status: 405 }
  );
}
