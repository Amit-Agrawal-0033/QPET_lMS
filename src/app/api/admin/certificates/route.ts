import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";
import { Certificate } from "@/lib/models/Certificate";
import { Enrollment } from "@/lib/models/Enrollment";
import { issueCertificate, revokeCertificate } from "@/lib/services/certificate.service";

export async function GET(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    await connectDB();
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("query")?.trim() || "";

    const filter: any = {};
    if (query) {
      filter.$or = [
        { certificateNumber: { $regex: query, $options: "i" } },
        { enrollmentNumber: { $regex: query, $options: "i" } },
        { studentName: { $regex: query, $options: "i" } },
        { courseName: { $regex: query, $options: "i" } },
      ];
    }

    const certificates = await Certificate.find(filter)
      .sort({ issueDate: -1 })
      .lean();

    // Also fetch eligible enrollments (fully paid and certificate not yet issued)
    const eligibleEnrollments = await Enrollment.find({
      outstandingBalance: { $lte: 0 },
      certificateStatus: { $in: ["eligible", "pending"] },
      enrollmentStatus: { $ne: "cancelled" },
    })
      .populate("studentId", "fullName mobileNumber email")
      .sort({ updatedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      certificates,
      eligibleEnrollments,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch certificates." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  try {
    const body = await req.json();
    const { enrollmentId, customCertificateNumber, issueDate, grade } = body;

    if (!enrollmentId) {
      return NextResponse.json({ error: "Enrollment ID is required." }, { status: 400 });
    }

    const cert = await issueCertificate({
      enrollmentId,
      customCertificateNumber,
      issueDate: issueDate ? new Date(issueDate) : undefined,
      grade,
      adminUserId: session.userId,
      adminUserName: session.name || "Administrator",
    });

    return NextResponse.json({
      success: true,
      message: `Certificate ${cert.certificateNumber} issued successfully.`,
      certificate: cert,
    });
  } catch (error: any) {
    console.error("Certificate issue error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to issue certificate." },
      { status: 400 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  try {
    const body = await req.json();
    const { certificateId, reason } = body;

    if (!certificateId || !reason) {
      return NextResponse.json(
        { error: "Certificate ID and revocation reason are required." },
        { status: 400 }
      );
    }

    const cert = await revokeCertificate(
      certificateId,
      reason,
      session.name || "Administrator"
    );

    return NextResponse.json({
      success: true,
      message: `Certificate ${cert.certificateNumber} has been revoked.`,
      certificate: cert,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to revoke certificate." },
      { status: 400 }
    );
  }
}
