import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";
import { StudentProfile } from "@/lib/models/StudentProfile";
import { Enrollment } from "@/lib/models/Enrollment";
import { FeeReceipt } from "@/lib/models/FeeReceipt";
import { Certificate } from "@/lib/models/Certificate";
import { Installment } from "@/lib/models/Installment";

export async function GET() {
  const { session, response } = await requireStudent();
  if (response) return response;

  try {
    await connectDB();
    const profile = await StudentProfile.findById(session.studentProfileId).lean();
    if (!profile) {
      return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
    }

    const enrollments = await Enrollment.find({ studentId: profile._id })
      .populate("courseId", "title code")
      .sort({ createdAt: -1 })
      .lean();

    const receipts = await FeeReceipt.find({ studentId: profile._id })
      .sort({ receiptDate: -1 })
      .limit(5)
      .lean();

    const certificates = await Certificate.find({ studentId: profile._id })
      .sort({ issueDate: -1 })
      .lean();

    const installments = await Installment.find({ studentId: profile._id })
      .sort({ dueDate: 1 })
      .lean();

    const totalFees = enrollments.reduce((acc, curr) => acc + curr.totalFee, 0);
    const paidFees = enrollments.reduce((acc, curr) => acc + curr.paidAmount, 0);
    const balance = enrollments.reduce((acc, curr) => acc + curr.outstandingBalance, 0);

    return NextResponse.json({
      success: true,
      profile,
      summary: {
        totalCourses: enrollments.length,
        totalFees,
        paidFees,
        outstandingBalance: balance,
        certificatesIssued: certificates.filter((c) => c.status === "issued").length,
      },
      enrollments,
      receipts,
      certificates,
      installments,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to load student dashboard data." },
      { status: 500 }
    );
  }
}
