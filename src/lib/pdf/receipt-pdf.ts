import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface ReceiptPdfData {
  receiptNumber: string;
  receiptDate: Date | string;
  studentName: string;
  enrollmentNumber: string;
  courseName: string;
  totalCourseFee: number;
  previousPaidAmount: number;
  currentPaymentAmount: number;
  totalPaidAfterThis: number;
  outstandingBalanceAfterThis: number;
  paymentMethod: string;
  transactionReference?: string;
  issuedBy: string;
  remarks?: string;
}

export function generateReceiptPdf(data: ReceiptPdfData): Buffer {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Primary Header Banner
  doc.setFillColor(15, 23, 42); // Navy Slate
  doc.rect(0, 0, pageWidth, 32, "F");

  // Institution Title
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("QPET EDUCATION & IT INSTITUTE", 14, 15);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(203, 213, 225);
  doc.text("Quality Professional Education & Training | Official Fee Receipt", 14, 22);

  // Accent Line
  doc.setDrawColor(13, 148, 136); // Teal
  doc.setLineWidth(1.5);
  doc.line(0, 32, pageWidth, 32);

  // Receipt Number & Date Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, 38, pageWidth - 28, 22, 2, 2, "FD");

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("FEE RECEIPT", 18, 46);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  doc.text(`Receipt No: `, 18, 53);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(data.receiptNumber, 40, 53);

  const formattedDate = new Date(data.receiptDate).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Date:", pageWidth - 70, 53);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(formattedDate, pageWidth - 55, 53);

  // Student & Course Information Box
  autoTable(doc, {
    startY: 65,
    margin: { left: 14, right: 14 },
    theme: "plain",
    styles: {
      fontSize: 10,
      cellPadding: 3,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 40 },
      1: { fontStyle: "bold", textColor: [15, 23, 42], cellWidth: 55 },
      2: { fontStyle: "bold", textColor: [100, 116, 139], cellWidth: 40 },
      3: { fontStyle: "bold", textColor: [15, 23, 42], cellWidth: 47 },
    },
    body: [
      [
        "Student Name:",
        data.studentName,
        "Enrollment No:",
        data.enrollmentNumber,
      ],
      [
        "Course Name:",
        data.courseName,
        "Payment Mode:",
        data.paymentMethod,
      ],
      [
        "Txn / Ref No:",
        data.transactionReference || "N/A (Cash/Direct)",
        "Issued By:",
        data.issuedBy || "Accounts Admin",
      ],
    ],
  });

  // Financial Breakdown Table
  const lastY = (doc as any).lastAutoTable.finalY + 6;

  autoTable(doc, {
    startY: lastY,
    margin: { left: 14, right: 14 },
    theme: "grid",
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
    },
    styles: {
      fontSize: 10,
      cellPadding: 4,
    },
    head: [["Particulars", "Details", "Amount (INR)"]],
    body: [
      ["Total Agreed Course Fee", "Standard fee agreed at enrollment", `INR ${data.totalCourseFee.toLocaleString("en-IN")}`],
      ["Previous Amount Paid", "Cumulative payments recorded prior to this transaction", `INR ${data.previousPaidAmount.toLocaleString("en-IN")}`],
      ["Current Payment Received", `Received via ${data.paymentMethod}`, `INR ${data.currentPaymentAmount.toLocaleString("en-IN")}`],
      ["Total Paid to Date", "Cumulative total paid including this payment", `INR ${data.totalPaidAfterThis.toLocaleString("en-IN")}`],
      [
        "Outstanding Balance Remaining",
        data.outstandingBalanceAfterThis <= 0 ? "Course Fee Fully Paid" : "Balance pending",
        `INR ${data.outstandingBalanceAfterThis.toLocaleString("en-IN")}`,
      ],
    ],
  });

  const summaryY = (doc as any).lastAutoTable.finalY + 10;

  // Status Badge
  const isFullyPaid = data.outstandingBalanceAfterThis <= 0;
  doc.setFillColor(isFullyPaid ? 220 : 254, isFullyPaid ? 252 : 243, isFullyPaid ? 231 : 199); // Light Green or Orange
  doc.roundedRect(14, summaryY, 60, 10, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(isFullyPaid ? 22 : 180, isFullyPaid ? 101 : 83, isFullyPaid ? 52 : 9);
  doc.text(isFullyPaid ? "STATUS: FULLY PAID" : "STATUS: PARTIALLY PAID", 18, summaryY + 6.5);

  // Remarks
  if (data.remarks) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`Remarks: ${data.remarks}`, 14, summaryY + 18);
  }

  // Footer & Authorized Signatory Block
  const footerY = 240;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(pageWidth - 75, footerY, pageWidth - 14, footerY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text("Authorized Signatory", pageWidth - 60, footerY + 5);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("QPET Accounts & Verification Wing", pageWidth - 68, footerY + 10);

  // Terms & Conditions at bottom
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(
    "Note: This is a computer-generated fee receipt from QPET Learning Management System. Fees once paid are subject to institutional terms.",
    14,
    280
  );

  return Buffer.from(doc.output("arraybuffer"));
}
