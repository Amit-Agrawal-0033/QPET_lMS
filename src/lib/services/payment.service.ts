import { connectDB } from "../db/mongoose";
import { Enrollment } from "../models/Enrollment";
import { Payment } from "../models/Payment";
import { FeeReceipt } from "../models/FeeReceipt";
import { Installment } from "../models/Installment";
import { StudentProfile } from "../models/StudentProfile";
import { generateReceiptNumber } from "./enrollment-number.service";
import { logAudit } from "./audit.service";
import mongoose from "mongoose";

export interface RecordPaymentInput {
  enrollmentId: string;
  amount: number;
  paymentMethod: "cash" | "upi" | "bank_transfer";
  transactionReference?: string;
  remarks?: string;
  adminUserId: string;
  adminUserName: string;
}

export async function recordPayment(input: RecordPaymentInput) {
  await connectDB();

  const { enrollmentId, amount, paymentMethod, transactionReference, remarks, adminUserId, adminUserName } = input;

  if (!amount || amount <= 0) {
    throw new Error("Payment amount must be greater than zero.");
  }

  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment) {
    throw new Error("Enrollment record not found.");
  }

  if (amount > enrollment.outstandingBalance) {
    throw new Error(
      `Payment amount (₹${amount}) cannot exceed the outstanding balance of ₹${enrollment.outstandingBalance}.`
    );
  }

  const student = await StudentProfile.findById(enrollment.studentId);
  if (!student) {
    throw new Error("Student profile record not found.");
  }

  const previousPaidAmount = enrollment.paidAmount;
  const currentPaymentAmount = amount;
  const totalPaidAfterThis = previousPaidAmount + currentPaymentAmount;
  const outstandingBalanceAfterThis = enrollment.outstandingBalance - currentPaymentAmount;
  const newPaymentStatus = outstandingBalanceAfterThis <= 0 ? "paid" : "partially_paid";

  // 1. Generate unique sequential Receipt Number
  const receiptNumber = await generateReceiptNumber();

  // 2. Create Payment record
  const payment = new Payment({
    enrollmentId: enrollment._id,
    studentId: student._id,
    amount: currentPaymentAmount,
    paymentDate: new Date(),
    paymentMethod,
    transactionReference: transactionReference?.trim() || undefined,
    remarks: remarks?.trim() || undefined,
    recordedByAdminId: new mongoose.Types.ObjectId(adminUserId),
    recordedByAdminName: adminUserName,
  });

  // 3. Create FeeReceipt record
  const feeReceipt = new FeeReceipt({
    receiptNumber,
    paymentId: payment._id,
    enrollmentId: enrollment._id,
    studentId: student._id,
    studentName: student.fullName,
    enrollmentNumber: enrollment.enrollmentNumber,
    courseName: enrollment.courseNameSnapshot,
    totalCourseFee: enrollment.totalFee,
    previousPaidAmount,
    currentPaymentAmount,
    totalPaidAfterThis,
    outstandingBalanceAfterThis,
    paymentMethod: paymentMethod.toUpperCase(),
    transactionReference: transactionReference?.trim() || undefined,
    receiptDate: new Date(),
    issuedBy: adminUserName,
    remarks: remarks?.trim() || undefined,
  });

  await feeReceipt.save();

  payment.receiptId = feeReceipt._id as mongoose.Types.ObjectId;
  payment.receiptNumber = receiptNumber;
  await payment.save();

  // 4. Update Enrollment record
  enrollment.paidAmount = totalPaidAfterThis;
  enrollment.outstandingBalance = outstandingBalanceAfterThis;
  enrollment.paymentStatus = newPaymentStatus;

  // If fully paid, enrollment may become eligible for certificate if completed or admin authorizes
  if (outstandingBalanceAfterThis <= 0 && enrollment.certificateStatus === "pending") {
    enrollment.certificateStatus = "eligible";
  }

  await enrollment.save();

  // 5. Update Installments allocation if any pending/overdue installments exist
  const installments = await Installment.find({
    enrollmentId: enrollment._id,
    status: { $in: ["pending", "partially_paid", "overdue"] },
  }).sort({ installmentNumber: 1 });

  let remainingPayment = currentPaymentAmount;
  for (const inst of installments) {
    if (remainingPayment <= 0) break;
    const unpaidOnInst = inst.amount - (inst.paidAmount || 0);
    if (unpaidOnInst <= 0) continue;

    if (remainingPayment >= unpaidOnInst) {
      inst.paidAmount = inst.amount;
      inst.status = "paid";
      inst.paidDate = new Date();
      remainingPayment -= unpaidOnInst;
    } else {
      inst.paidAmount = (inst.paidAmount || 0) + remainingPayment;
      inst.status = "partially_paid";
      remainingPayment = 0;
    }
    await inst.save();
  }

  // 6. Record Audit Log
  await logAudit({
    action: "PAYMENT_RECORDED",
    performedBy: adminUserName,
    targetType: "Payment",
    targetId: payment._id.toString(),
    details: {
      receiptNumber,
      amount: currentPaymentAmount,
      enrollmentNumber: enrollment.enrollmentNumber,
      studentName: student.fullName,
      outstandingBalance: outstandingBalanceAfterThis,
      paymentMethod,
    },
  });

  return {
    payment,
    receipt: feeReceipt,
    enrollment,
  };
}
