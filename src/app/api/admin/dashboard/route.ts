import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";
import { StudentProfile } from "@/lib/models/StudentProfile";
import { Enrollment } from "@/lib/models/Enrollment";
import { Payment } from "@/lib/models/Payment";
import { Installment } from "@/lib/models/Installment";
import { Certificate } from "@/lib/models/Certificate";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    await connectDB();

    const [
      totalStudents,
      pendingRegistrations,
      activeEnrollments,
      feeTotals,
      totalPaymentsResult,
      installmentsDue,
      certificatesIssued,
      recentRegistrations,
      recentPayments,
      recentEnrollments,
    ] = await Promise.all([
      StudentProfile.countDocuments({ registrationStatus: "approved" }),
      StudentProfile.countDocuments({ registrationStatus: "pending" }),
      Enrollment.countDocuments({ enrollmentStatus: "active" }),
      Enrollment.aggregate([
        { $match: { enrollmentStatus: { $ne: "cancelled" } } },
        {
          $group: {
            _id: null,
            totalPayable: { $sum: "$totalFee" },
            totalPaid: { $sum: "$paidAmount" },
            totalOutstanding: { $sum: "$outstandingBalance" },
          },
        },
      ]),
      Payment.aggregate([
        {
          $group: {
            _id: null,
            totalCollected: { $sum: "$amount" },
          },
        },
      ]),
      Installment.countDocuments({
        status: { $in: ["pending", "partially_paid", "overdue"] },
      }),
      Certificate.countDocuments({ status: "issued" }),
      StudentProfile.find({ registrationStatus: "pending" })
        .populate("preferredCourseId", "title")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Payment.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Enrollment.find()
        .populate("studentId", "fullName mobileNumber")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const payable = feeTotals[0]?.totalPayable || 0;
    const collected = totalPaymentsResult[0]?.totalCollected || feeTotals[0]?.totalPaid || 0;
    const outstanding = Math.max(0, payable - collected);

    return NextResponse.json({
      success: true,
      stats: {
        totalStudents,
        pendingRegistrations,
        activeEnrollments,
        totalFeesPayable: payable,
        totalFeesCollected: collected,
        outstandingFees: outstanding,
        installmentsDue,
        certificatesIssued,
      },
      recentRegistrations,
      recentPayments,
      recentEnrollments,
    });
  } catch (error: any) {
    console.error("Dashboard error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load dashboard data." },
      { status: 500 }
    );
  }
}
