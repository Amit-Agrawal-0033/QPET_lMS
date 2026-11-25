import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import fs from "fs";
import path from "path";

export interface ReceiptPdfData {
  receiptNumber: string;
  receiptDate: Date | string;
  studentName: string;
  enrollmentNumber: string;
  courseName: string;
  courseDuration?: string;
  totalCourseFee: number;
  discountAmount?: number;
  finalCourseFee?: number;
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

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm

  // 1. Embed Unicode font for Rupee (₹) symbol support
  const regularFontPath = path.join(process.cwd(), "src/lib/fonts/Arial.ttf");
  const boldFontPath = path.join(process.cwd(), "src/lib/fonts/Arial-Bold.ttf");
  let fontLoaded = false;
  try {
    if (fs.existsSync(regularFontPath) && fs.existsSync(boldFontPath)) {
      doc.addFileToVFS("Arial.ttf", fs.readFileSync(regularFontPath).toString("base64"));
      doc.addFont("Arial.ttf", "Arial", "normal");
      doc.addFileToVFS("Arial-Bold.ttf", fs.readFileSync(boldFontPath).toString("base64"));
      doc.addFont("Arial-Bold.ttf", "Arial", "bold");
      fontLoaded = true;
    }
  } catch {
    fontLoaded = false;
  }

  const primaryFont = fontLoaded ? "Arial" : "helvetica";
  const currencySymbol = fontLoaded ? "₹" : "Rs.";

  // 2. QPET Brand Logo
  const logoPath =
    path.join(process.cwd(), "public/images/qpet-logo-pdf.png");
  const fallbackLogoPath =
    path.join(process.cwd(), "public/images/QPET PNG.png");

  const targetLogo = fs.existsSync(logoPath)
    ? logoPath
    : fs.existsSync(fallbackLogoPath)
    ? fallbackLogoPath
    : null;

  if (targetLogo) {
    try {
      const logoBase64 = fs.readFileSync(targetLogo).toString("base64");
      doc.addImage(logoBase64, "PNG", 14, 10, 20, 20);
    } catch {
      // If logo cannot be embedded, proceed without crashing
    }
  }

  // 3. Institution Header Typography
  doc.setFont(primaryFont, "bold");
  doc.setFontSize(17);
  doc.setTextColor(30, 41, 59); // Deep Navy (#1E293B)
  doc.text("QPET Education and IT Institute", 38, 18);

  doc.setFont(primaryFont, "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // Slate Grey (#64748B)
  doc.text("Quality Professional Education and Training", 38, 23.5);

  // 4. Accent Mustard-Gold Horizontal Divider Line
  doc.setDrawColor(217, 119, 6); // #D97706
  doc.setLineWidth(1.2);
  doc.line(14, 34, pageWidth - 14, 34);

  // 5. Document Title
  doc.setFont(primaryFont, "bold");
  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59);
  doc.text("FEE RECEIPT", 14, 45);

  doc.setFont(primaryFont, "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Official Fee Receipt", pageWidth - 14, 45, { align: "right" });

  // 6. Metadata Grid Box (4 Rows x 2 Columns)
  doc.setDrawColor(226, 232, 240); // #E2E8F0
  doc.setLineWidth(0.3);
  doc.roundedRect(14, 52, 182, 44, 2, 2, "D");

  // Horizontal divider lines inside box
  doc.line(14, 63, pageWidth - 14, 63);
  doc.line(14, 74, pageWidth - 14, 74);
  doc.line(14, 85, pageWidth - 14, 85);

  // Vertical divider in the middle
  const midX = 14 + 182 / 2; // 105mm
  doc.line(midX, 52, midX, 96);

  // Date Formatting (e.g. "23 November 2026")
  const dateObj = new Date(data.receiptDate);
  const day = dateObj.getDate();
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const formattedDate = `${day} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;

  // Payment mode formatting
  const rawMethod = (data.paymentMethod || "CASH").toLowerCase();
  const paymentMode =
    rawMethod === "upi"
      ? "UPI"
      : rawMethod === "bank_transfer"
      ? "Bank Transfer"
      : "Cash";

  const drawMetadataCell = (label: string, value: string, x: number, y: number) => {
    doc.setFont(primaryFont, "bold");
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(label, x, y);

    doc.setFont(primaryFont, "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(value, x, y + 4.5);
  };

  // Row 1
  drawMetadataCell("RECEIPT NUMBER", data.receiptNumber, 18, 56.5);
  drawMetadataCell("DATE", formattedDate, midX + 4, 56.5);

  // Row 2
  drawMetadataCell("STUDENT NAME", data.studentName.toUpperCase(), 18, 67.5);
  drawMetadataCell("ENROLLMENT NUMBER", data.enrollmentNumber, midX + 4, 67.5);

  // Row 3
  drawMetadataCell("COURSE NAME", data.courseName, 18, 78.5);
  drawMetadataCell("PAYMENT MODE", paymentMode, midX + 4, 78.5);

  // Row 4
  drawMetadataCell(
    "TRANSACTION REFERENCE NUMBER",
    data.transactionReference || paymentMode || "Cash",
    18,
    89.5
  );
  drawMetadataCell("ISSUED BY", data.issuedBy || "Accounts Desk", midX + 4, 89.5);

  // 7. Particulars Table (3 Columns)
  const totalAgreed = Number(data.totalCourseFee) || 0;
  const discount = Number(data.discountAmount) || 0;
  const finalFee =
    data.finalCourseFee !== undefined
      ? Number(data.finalCourseFee)
      : Math.max(0, totalAgreed - discount);
  const prevPaid = Number(data.previousPaidAmount) || 0;
  const currentPaid = Number(data.currentPaymentAmount) || 0;
  const totalPaid = Number(data.totalPaidAfterThis) || prevPaid + currentPaid;
  const balance =
    Number(data.outstandingBalanceAfterThis) >= 0
      ? Number(data.outstandingBalanceAfterThis)
      : Math.max(0, finalFee - totalPaid);
  const duration = data.courseDuration || "—";

  autoTable(doc, {
    startY: 104,
    margin: { left: 14, right: 14 },
    theme: "plain",
    head: [["PARTICULARS", "DURATION", `AMOUNT (${currencySymbol})`]],
    headStyles: {
      fillColor: [30, 41, 59], // Dark Navy #1E293B
      textColor: [255, 255, 255],
      font: primaryFont,
      fontStyle: "bold",
      fontSize: 8.5,
      cellPadding: { top: 3.5, bottom: 3.5, left: 4, right: 4 },
    },
    columnStyles: {
      0: { cellWidth: 95, halign: "left" },
      1: { cellWidth: 42, halign: "center" },
      2: { cellWidth: 45, halign: "right" },
    },
    styles: {
      font: primaryFont,
      fontSize: 8.5,
      cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
      textColor: [30, 41, 59],
      lineWidth: { bottom: 0.2 },
      lineColor: [241, 245, 249],
    },
    body: [
      [
        "Total Agreed Course Fee",
        duration,
        `${currencySymbol} ${totalAgreed.toLocaleString("en-IN")}`,
      ],
      [
        "Discount Amount",
        "—",
        `- ${currencySymbol} ${discount.toLocaleString("en-IN")}`,
      ],
      [
        "Final Course Fee (after Discount)",
        "—",
        `${currencySymbol} ${finalFee.toLocaleString("en-IN")}`,
      ],
      [
        "Previous Amount Paid",
        "—",
        `${currencySymbol} ${prevPaid.toLocaleString("en-IN")}`,
      ],
      [
        `Current Payment Received (${paymentMode})`,
        "—",
        `${currencySymbol} ${currentPaid.toLocaleString("en-IN")}`,
      ],
      [
        "Total Paid to Date",
        "—",
        `${currencySymbol} ${totalPaid.toLocaleString("en-IN")}`,
      ],
    ],
  });

  const summaryY = (doc as any).lastAutoTable.finalY + 10;

  // 8. Status Badge & Outstanding Balance
  doc.setFont(primaryFont, "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("STATUS", 14, summaryY + 4.5);

  const isFullyPaid = balance <= 0;

  if (isFullyPaid) {
    doc.setFillColor(220, 252, 231); // Green pill (#DCFCE7)
    doc.setDrawColor(134, 239, 172); // #86EFAC
    doc.setLineWidth(0.4);
    doc.roundedRect(29, summaryY, 28, 6.5, 3, 3, "FD");

    doc.setFont(primaryFont, "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(22, 101, 52); // #166534
    doc.text("FULLY PAID", 43, summaryY + 4.3, { align: "center" });
  } else {
    doc.setFillColor(254, 243, 199); // Amber pill (#FEF3C7)
    doc.setDrawColor(252, 211, 77); // #FCD34D
    doc.setLineWidth(0.4);
    doc.roundedRect(29, summaryY, 32, 6.5, 3, 3, "FD");

    doc.setFont(primaryFont, "bold");
    doc.setFontSize(7.5);
    doc.setTextColor(146, 64, 14); // #92400E
    doc.text("PARTIALLY PAID", 45, summaryY + 4.3, { align: "center" });
  }

  // Outstanding Balance
  const statusEndOffset = isFullyPaid ? 65 : 69;
  doc.setFont(primaryFont, "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text("Outstanding Balance", statusEndOffset, summaryY + 4.5);

  doc.setFont(primaryFont, "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(
    `${currencySymbol} ${balance.toLocaleString("en-IN")}`,
    statusEndOffset + 30,
    summaryY + 4.5
  );

  // 9. Remarks & Signature Block
  const remarksText = data.remarks?.trim()
    ? `Remarks: ${data.remarks.trim()}`
    : "Remarks: Fee payment recorded";

  doc.setFont(primaryFont, "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(remarksText, pageWidth - 14, summaryY - 2, { align: "right" });

  const sigLineY = summaryY + 6;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(pageWidth - 70, sigLineY, pageWidth - 14, sigLineY);

  doc.setFont(primaryFont, "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text("Authorized Signatory", pageWidth - 42, sigLineY + 4.5, {
    align: "center",
  });

  doc.setFont(primaryFont, "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(
    "QPET Accounts and Verification Wing",
    pageWidth - 42,
    sigLineY + 8.5,
    { align: "center" }
  );

  // 10. Full-Width Bottom Bar
  doc.setFillColor(30, 41, 59); // #1E293B
  doc.rect(0, 283, pageWidth, 14, "F");

  doc.setFont(primaryFont, "normal");
  doc.setFontSize(7);
  doc.setTextColor(248, 250, 252);
  doc.text(
    "This is a computer-generated fee receipt from the QPET Learning Management System. Fees once paid are subject to institutional terms.",
    pageWidth / 2,
    290.5,
    { align: "center" }
  );

  return Buffer.from(doc.output("arraybuffer"));
}
