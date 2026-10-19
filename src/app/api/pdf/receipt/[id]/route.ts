import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/mongoose";
import { FeeReceipt } from "@/lib/models/FeeReceipt";
import { generateReceiptPdf } from "@/lib/pdf/receipt-pdf";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();
    const receipt = await FeeReceipt.findById(params.id);
    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found." }, { status: 404 });
    }

    // Authorization check: Admin can access any receipt; Student can only access their own
    if (session.role === "student" && receipt.studentId.toString() !== session.studentProfileId) {
      return NextResponse.json({ error: "Forbidden: Cannot access this receipt." }, { status: 403 });
    }

    const pdfBuffer = generateReceiptPdf({
      receiptNumber: receipt.receiptNumber,
      receiptDate: receipt.receiptDate,
      studentName: receipt.studentName,
      enrollmentNumber: receipt.enrollmentNumber,
      courseName: receipt.courseName,
      totalCourseFee: receipt.totalCourseFee,
      previousPaidAmount: receipt.previousPaidAmount,
      currentPaymentAmount: receipt.currentPaymentAmount,
      totalPaidAfterThis: receipt.totalPaidAfterThis,
      outstandingBalanceAfterThis: receipt.outstandingBalanceAfterThis,
      paymentMethod: receipt.paymentMethod,
      transactionReference: receipt.transactionReference,
      issuedBy: receipt.issuedBy,
      remarks: receipt.remarks,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="QPET-Receipt-${receipt.receiptNumber}.pdf"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("Receipt PDF download error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate receipt PDF." },
      { status: 500 }
    );
  }
}
