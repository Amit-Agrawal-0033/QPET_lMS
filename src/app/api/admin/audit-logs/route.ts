import { NextRequest, NextResponse } from "next/server";
import { requireAdminOrTrainer } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";
import { AuditLog } from "@/lib/models/AuditLog";

export async function GET(req: NextRequest) {
  // Allow Admin OR Trainer who explicitly has the 'viewAuditReports' permission
  const { session, response } = await requireAdminOrTrainer("viewAuditReports");
  if (response) return response;

  try {
    await connectDB();
    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get("action");
    const role = searchParams.get("role");
    const search = searchParams.get("search");
    const limit = Math.min(Number(searchParams.get("limit")) || 100, 1000);

    const filter: any = {};
    if (action) filter.action = action;
    if (role && role !== "all") filter.performedByRole = role;

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

