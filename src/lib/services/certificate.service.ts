import { connectDB } from "../db/mongoose";
import { Certificate, ICertificate } from "../models/Certificate";
import { Enrollment } from "../models/Enrollment";
import { StudentProfile } from "../models/StudentProfile";
import { generateCertificateNumber } from "./enrollment-number.service";
import { logAudit } from "./audit.service";
import crypto from "crypto";
import mongoose from "mongoose";

export interface IssueCertificateInput {
  enrollmentId: string;
  customCertificateNumber?: string;
  issueDate?: Date;
  grade?: string;
  adminUserId: string;
  adminUserName: string;
}

export async function issueCertificate(input: IssueCertificateInput): Promise<ICertificate> {
  await connectDB();

  const { enrollmentId, customCertificateNumber, issueDate, grade, adminUserId, adminUserName } = input;

  const enrollment = await Enrollment.findById(enrollmentId);
  if (!enrollment) {
    throw new Error("Enrollment not found.");
  }

  // Check if certificate is already issued
  const existingCert = await Certificate.findOne({ enrollmentId: enrollment._id });
  if (existingCert && existingCert.status === "issued") {
    throw new Error(`A certificate (${existingCert.certificateNumber}) is already issued for this enrollment.`);
  }

  const student = await StudentProfile.findById(enrollment.studentId);
  if (!student) {
    throw new Error("Student profile not found.");
  }

  // Determine certificate number
  const certNumber = customCertificateNumber?.trim() || (await generateCertificateNumber());

  // Generate secure verification token
  const verificationToken = crypto.randomBytes(16).toString("hex");

  const certificate = new Certificate({
    certificateNumber: certNumber,
    enrollmentId: enrollment._id,
    studentId: student._id,
    studentName: student.fullName,
    enrollmentNumber: enrollment.enrollmentNumber,
    courseName: enrollment.courseNameSnapshot,
    courseDuration: `${enrollment.durationMonthsSnapshot} ${
      enrollment.durationMonthsSnapshot === 1 ? "Month" : "Months"
    }`,
    issueDate: issueDate || new Date(),
    status: "issued",
    grade: grade?.trim() || "A",
    issuedByAdminId: new mongoose.Types.ObjectId(adminUserId),
    issuedByAdminName: adminUserName,
    verificationToken,
  });

  await certificate.save();

  // Update enrollment status
  enrollment.certificateStatus = "issued";
  await enrollment.save();

  // Audit log
  await logAudit({
    action: "CERTIFICATE_ISSUED",
    performedBy: adminUserName,
    targetType: "Certificate",
    targetId: certificate._id.toString(),
    details: {
      certificateNumber: certNumber,
      enrollmentNumber: enrollment.enrollmentNumber,
      studentName: student.fullName,
      courseName: enrollment.courseNameSnapshot,
    },
  });

  return certificate;
}

export async function revokeCertificate(
  certificateId: string,
  reason: string,
  adminUserName: string
): Promise<ICertificate> {
  await connectDB();

  const cert = await Certificate.findById(certificateId);
  if (!cert) {
    throw new Error("Certificate not found.");
  }

  cert.status = "revoked";
  cert.revocationReason = reason.trim() || "Revoked by Administrator";
  cert.revokedAt = new Date();
  await cert.save();

  await Enrollment.findByIdAndUpdate(cert.enrollmentId, {
    certificateStatus: "revoked",
  });

  await logAudit({
    action: "CERTIFICATE_REVOKED",
    performedBy: adminUserName,
    targetType: "Certificate",
    targetId: cert._id.toString(),
    details: {
      certificateNumber: cert.certificateNumber,
      reason: cert.revocationReason,
    },
  });

  return cert;
}

export async function verifyCertificateRecord(identifier: string) {
  await connectDB();

  if (!identifier || typeof identifier !== "string") {
    return { status: "invalid" as const };
  }

  const query = identifier.trim();
  const cert = await Certificate.findOne({
    $or: [
      { certificateNumber: { $regex: new RegExp(`^${query}$`, "i") } },
      { verificationToken: query },
    ],
  });

  if (!cert) {
    return { status: "invalid" as const };
  }

  if (cert.status === "revoked") {
    return {
      status: "revoked" as const,
      certificateNumber: cert.certificateNumber,
      studentName: cert.studentName,
      courseName: cert.courseName,
      issueDate: cert.issueDate,
      revocationReason: cert.revocationReason || "Revoked by administration",
      revokedAt: cert.revokedAt,
    };
  }

  // Valid certificate - strictly sanitize returned data (no mobile, email, address, or DOB)
  return {
    status: "valid" as const,
    certificateNumber: cert.certificateNumber,
    studentName: cert.studentName,
    enrollmentNumber: cert.enrollmentNumber,
    courseName: cert.courseName,
    courseDuration: cert.courseDuration,
    issueDate: cert.issueDate,
    grade: cert.grade,
  };
}
