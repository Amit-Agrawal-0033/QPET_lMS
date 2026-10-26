import { NextRequest, NextResponse } from "next/server";
import { requireAdminOrTrainer } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";
import { FeeReceipt } from "@/lib/models/FeeReceipt";

export async function GET(req: NextRequest) {
  const { response } = await requireAdminOrTrainer("viewReceipts");
  if (response) return response;

  try {
    await connectDB();
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("query")?.trim() || "";

    const filter: any = {};
    if (query) {
      filter.$or = [
        { receiptNumber: { $regex: query, $options: "i" } },
        { enrollmentNumber: { $regex: query, $options: "i" } },
        { studentName: { $regex: query, $options: "i" } },
        { courseName: { $regex: query, $options: "i" } },
      ];
    }

    const receipts = await FeeReceipt.find(filter)
      .sort({ receiptDate: -1 })
      .lean();

    return NextResponse.json({ success: true, receipts });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch receipts." },
      { status: 500 }
    );
  }
}
