import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/mongoose";
import { Certificate } from "@/lib/models/Certificate";
import { generateCertificatePdf } from "@/lib/pdf/certificate-pdf";

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
    const cert = await Certificate.findById(params.id);
    if (!cert) {
      return NextResponse.json({ error: "Certificate not found." }, { status: 404 });
    }

    // Role check: Student can only view their own certificate
    if (session.role === "student" && cert.studentId.toString() !== session.studentProfileId) {
      return NextResponse.json({ error: "Forbidden: Cannot access this certificate." }, { status: 403 });
    }

    // Role check: Trainer must have viewCertificates or generateCertificates permission
    if (session.role === "trainer") {
      const canAccess =
        session.permissions?.viewCertificates ||
        session.permissions?.generateCertificates ||
        session.permissions?.editCertificates;
      if (!canAccess) {
        return NextResponse.json(
          { error: "Forbidden: You do not have permission to view or download certificates." },
          { status: 403 }
        );
      }
    }

    // Check revocation
    if (cert.status === "revoked") {
      return NextResponse.json(
        { error: `This certificate was revoked on ${new Date(cert.revokedAt || cert.updatedAt).toLocaleDateString("en-IN")}. Reason: ${cert.revocationReason}` },
        { status: 400 }
      );
    }

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || "http";
    const verificationUrl = `${protocol}://${host}/verify-certificate?cert=${encodeURIComponent(
      cert.certificateNumber
    )}`;

    const pdfBuffer = await generateCertificatePdf({
      certificateNumber: cert.certificateNumber,
      studentName: cert.studentName,
      enrollmentNumber: cert.enrollmentNumber,
      courseName: cert.courseName,
      courseDuration: cert.courseDuration,
      issueDate: cert.issueDate,
      grade: cert.grade,
      verificationUrl,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="QPET-Certificate-${cert.certificateNumber}.pdf"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error: any) {
    console.error("Certificate PDF download error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate certificate PDF." },
      { status: 500 }
    );
  }
}
