import { NextResponse } from "next/server";
import { requireAdminOrTrainer } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";
import { StudentProfile } from "@/lib/models/StudentProfile";
import { Enrollment } from "@/lib/models/Enrollment";
import { Course } from "@/lib/models/Course";
import { Certificate } from "@/lib/models/Certificate";

export async function GET() {
  const { session, response } = await requireAdminOrTrainer();
  if (response) return response;

  try {
    await connectDB();

    const isAdm = session.role === "admin";
    const perms = session.permissions || {};

    const [
      totalStudents,
      activeEnrollments,
      totalCourses,
      certificatesIssued,
      recentEnrollments,
    ] = await Promise.all([
      isAdm || perms.viewStudents
        ? StudentProfile.countDocuments({ registrationStatus: "approved" })
        : Promise.resolve(0),
      isAdm || perms.viewEnrollments
        ? Enrollment.countDocuments({ enrollmentStatus: "active" })
        : Promise.resolve(0),
      isAdm || perms.viewCourses
        ? Course.countDocuments({ isActive: true })
        : Promise.resolve(0),
      isAdm || perms.viewCertificates
        ? Certificate.countDocuments({ status: "issued" })
        : Promise.resolve(0),
      isAdm || perms.viewEnrollments || perms.viewStudents
        ? Enrollment.find({ enrollmentStatus: "active" })
            .populate("studentId", "fullName mobileNumber email")
            .populate("courseId", "title code durationMonths")
            .sort({ createdAt: -1 })
            .limit(6)
            .lean()
        : Promise.resolve([]),
    ]);

    return NextResponse.json({
      success: true,
      trainer: {
        name: session.name || "QPET Faculty",
        identifier: session.identifier,
        role: session.role,
        permissions: session.permissions || {},
      },
      stats: {
        totalStudents,
        activeEnrollments,
        totalCourses,
        certificatesIssued,
      },
      recentEnrollments: recentEnrollments.map((en: any) => ({
        _id: en._id?.toString(),
        enrollmentNumber: en.enrollmentNumber || "N/A",
        studentName: en.studentId?.fullName || "Student",
        studentPhone: en.studentId?.mobileNumber || "N/A",
        studentEmail: en.studentId?.email || "N/A",
        courseTitle: en.courseId?.title || "Course",
        courseCode: en.courseId?.code || "N/A",
        duration: en.courseId?.durationMonths ? `${en.courseId.durationMonths} Months` : "N/A",
        enrolledAt: en.enrolledAt || en.createdAt,
      })),
    });
  } catch (error: any) {
    console.error("Trainer dashboard fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load faculty dashboard." },
      { status: 500 }
    );
  }
}
