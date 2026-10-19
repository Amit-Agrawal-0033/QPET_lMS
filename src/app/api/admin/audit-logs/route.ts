import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";
import { AuditLog } from "@/lib/models/AuditLog";

export async function GET(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    await connectDB();
    const searchParams = req.nextUrl.searchParams;
    const action = searchParams.get("action");
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);

    const filter: any = {};
    if (action) filter.action = action;

    const logs = await AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, logs });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch audit logs." },
      { status: 500 }
    );
  }
}
