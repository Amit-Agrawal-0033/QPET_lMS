import { NextRequest, NextResponse } from "next/server";
import { requireAdminOrTrainer } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";
import { Payment } from "@/lib/models/Payment";
import { Enrollment } from "@/lib/models/Enrollment";
import { Installment } from "@/lib/models/Installment";
import { recordPayment } from "@/lib/services/payment.service";

export async function GET(req: NextRequest) {
  const { response } = await requireAdminOrTrainer("viewFees");
  if (response) return response;

  try {
    await connectDB();
    const searchParams = req.nextUrl.searchParams;
    const enrollmentId = searchParams.get("enrollmentId");
    const studentId = searchParams.get("studentId");

    const filter: any = {};
    if (enrollmentId) filter.enrollmentId = enrollmentId;
    if (studentId) filter.studentId = studentId;

    const payments = await Payment.find(filter)
      .populate("enrollmentId", "enrollmentNumber courseNameSnapshot totalFee paidAmount outstandingBalance paymentStatus")
      .populate("studentId", "fullName mobileNumber")
      .populate("receiptId", "receiptNumber")
      .sort({ paymentDate: -1 })
      .lean();

    return NextResponse.json({ success: true, payments });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch payments." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireAdminOrTrainer("editFees");
  if (response) return response;

  try {
    const body = await req.json();
    const { enrollmentId, amount, paymentMethod, transactionReference, remarks } = body;

    if (!enrollmentId || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: "Enrollment ID, amount, and payment method are required." },
        { status: 400 }
      );
    }

    if (!["cash", "upi", "bank_transfer"].includes(paymentMethod)) {
      return NextResponse.json(
        { error: "Payment method must be 'cash', 'upi', or 'bank_transfer'." },
        { status: 400 }
      );
    }

    const result = await recordPayment({
      enrollmentId,
      amount: Number(amount),
      paymentMethod,
      transactionReference,
      remarks,
      adminUserId: session.userId,
      adminUserName: session.name || "Administrator",
    });

    return NextResponse.json({
      success: true,
      message: `Payment of ₹${amount} recorded successfully. Receipt generated: ${result.receipt.receiptNumber}`,
      payment: result.payment,
      receipt: result.receipt,
      enrollment: result.enrollment,
    });
  } catch (error: any) {
    console.error("Fee payment recording error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to record payment." },
      { status: 400 }
    );
  }
}
