import { NextRequest, NextResponse } from "next/server";
import { requireAdminOrTrainer } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";
import { Installment } from "@/lib/models/Installment";

export async function GET(req: NextRequest) {
  const { response } = await requireAdminOrTrainer("viewFees");
  if (response) return response;

  try {
    await connectDB();
    const searchParams = req.nextUrl.searchParams;
    const enrollmentId = searchParams.get("enrollmentId");
    const status = searchParams.get("status");

    const filter: any = {};
    if (enrollmentId) filter.enrollmentId = enrollmentId;
    if (status) filter.status = status;

    const installments = await Installment.find(filter)
      .populate("enrollmentId", "enrollmentNumber courseNameSnapshot")
      .populate("studentId", "fullName mobileNumber")
      .sort({ dueDate: 1 })
      .lean();

    return NextResponse.json({ success: true, installments });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch installments." },
      { status: 500 }
    );
  }
}
