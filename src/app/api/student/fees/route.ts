import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";
import { Enrollment } from "@/lib/models/Enrollment";
import { Payment } from "@/lib/models/Payment";
import { Installment } from "@/lib/models/Installment";

export async function GET() {
  const { session, response } = await requireStudent();
  if (response) return response;

  try {
    await connectDB();
    const studentId = session.studentProfileId;

    const [enrollments, payments, installments] = await Promise.all([
      Enrollment.find({ studentId }).lean(),
      Payment.find({ studentId }).sort({ paymentDate: -1 }).lean(),
      Installment.find({ studentId })
        .populate("enrollmentId", "enrollmentNumber courseNameSnapshot")
        .sort({ dueDate: 1 })
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      enrollments,
      payments,
      installments,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch student fees details." },
      { status: 500 }
    );
  }
}
