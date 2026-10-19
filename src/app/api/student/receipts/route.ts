import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";
import { FeeReceipt } from "@/lib/models/FeeReceipt";

export async function GET() {
  const { session, response } = await requireStudent();
  if (response) return response;

  try {
    await connectDB();
    const receipts = await FeeReceipt.find({ studentId: session.studentProfileId })
      .sort({ receiptDate: -1 })
      .lean();

    return NextResponse.json({ success: true, receipts });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch student receipts." },
      { status: 500 }
    );
  }
}
