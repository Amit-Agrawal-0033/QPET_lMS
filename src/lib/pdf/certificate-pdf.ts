import { jsPDF } from "jspdf";
import QRCode from "qrcode";

export interface CertificatePdfData {
  certificateNumber: string;
  studentName: string;
  enrollmentNumber: string;
  courseName: string;
  courseDuration: string;
  issueDate: Date | string;
  grade?: string;
  verificationUrl: string;
}

export async function generateCertificatePdf(data: CertificatePdfData): Promise<Buffer> {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const width = doc.internal.pageSize.getWidth(); // 297mm
  const height = doc.internal.pageSize.getHeight(); // 210mm

  // Outer Decorative Borders
  doc.setDrawColor(15, 23, 42); // Navy
  doc.setLineWidth(3);
  doc.rect(8, 8, width - 16, height - 16);

  doc.setDrawColor(217, 119, 6); // Amber / Gold
  doc.setLineWidth(1);
  doc.rect(11, 11, width - 22, height - 22);

  // Corner Accents
  doc.setFillColor(217, 119, 6);
  doc.triangle(11, 11, 22, 11, 11, 22, "F");
  doc.triangle(width - 11, 11, width - 22, 11, width - 11, 22, "F");
  doc.triangle(11, height - 11, 22, height - 11, 11, height - 22, "F");
  doc.triangle(width - 11, height - 11, width - 22, height - 11, width - 11, height - 22, "F");

  // Institution Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(15, 23, 42);
  doc.text("QPET EDUCATION & IT INSTITUTE", width / 2, 28, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("CENTRE FOR QUALITY PROFESSIONAL EDUCATION & SKILL DEVELOPMENT", width / 2, 34, {
    align: "center",
  });

  // Certificate Heading
  doc.setFont("times", "bolditalic");
  doc.setFontSize(28);
  doc.setTextColor(180, 83, 9); // Gold/Bronze
  doc.text("Certificate of Completion", width / 2, 50, { align: "center" });

  // Divider Line
  doc.setDrawColor(217, 119, 6);
  doc.setLineWidth(0.8);
  doc.line(width / 2 - 40, 54, width / 2 + 40, 54);

  // Presentation text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text("This is to certify that", width / 2, 65, { align: "center" });

  // Student Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(15, 23, 42);
  doc.text(data.studentName.toUpperCase(), width / 2, 77, { align: "center" });

  // Enrollment Reference
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Enrollment Number: ${data.enrollmentNumber}`, width / 2, 85, { align: "center" });

  // Course completion text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `has successfully completed the prescribed course of study and practical evaluation in`,
    width / 2,
    97,
    { align: "center" }
  );

  // Course Name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(13, 148, 136); // Teal
  doc.text(data.courseName, width / 2, 110, { align: "center" });

  // Duration & Performance
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  const gradeText = data.grade ? ` with Grade: ${data.grade}` : "";
  doc.text(
    `Duration of Course: ${data.courseDuration}${gradeText}`,
    width / 2,
    120,
    { align: "center" }
  );

  const formattedDate = new Date(data.issueDate).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Awarded on this day: ${formattedDate}`, width / 2, 128, { align: "center" });

  // Generate QR Code for public verification
  try {
    const qrDataUrl = await QRCode.toDataURL(data.verificationUrl, {
      margin: 1,
      width: 100,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });
    // Render QR Code in bottom center-left
    doc.addImage(qrDataUrl, "PNG", width / 2 - 13, 136, 26, 26);
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Scan to Verify Certificate", width / 2, 166, { align: "center" });
  } catch (err) {
    console.error("QR Code generation error:", err);
  }

  // Bottom Metadata: Left (Certificate Number & Date)
  const leftX = 24;
  const bottomY = 175;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Certificate No:`, leftX, bottomY);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(data.certificateNumber, leftX + 26, bottomY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Issue Date:`, leftX, bottomY + 6);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(formattedDate, leftX + 26, bottomY + 6);

  // Bottom Metadata: Right (Authorized Signatures)
  const rightX = width - 75;

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(rightX, bottomY + 3, rightX + 50, bottomY + 3);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text("Director / Controller", rightX + 25, bottomY + 8, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("QPET Certification Board", rightX + 25, bottomY + 12, { align: "center" });

  // Security Verification notice at footer
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Official document issued by QPET LMS. Verify online at: ${data.verificationUrl}`,
    width / 2,
    198,
    { align: "center" }
  );

  return Buffer.from(doc.output("arraybuffer"));
}
