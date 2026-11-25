import { NextRequest, NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";
import { CourseRequest } from "@/lib/models/CourseRequest";
import { Enrollment } from "@/lib/models/Enrollment";
import { Course } from "@/lib/models/Course";
import { StudentProfile } from "@/lib/models/StudentProfile";
import { logAudit } from "@/lib/services/audit.service";

export async function GET() {
  const { session, response } = await requireStudent();
  if (response) return response;

  try {
    await connectDB();
    const requests = await CourseRequest.find({ studentId: session.studentProfileId })
      .populate("courseId", "title code defaultFee durationMonths durationText")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, requests });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch course requests." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireStudent();
  if (response) return response;

  try {
    await connectDB();
    const body = await req.json();
    const { courseId, notes } = body;

    if (!courseId) {
      return NextResponse.json({ error: "Please select a course to request." }, { status: 400 });
    }

    const course = await Course.findById(courseId);
    if (!course || course.isActive === false) {
      return NextResponse.json({ error: "Selected course is not available." }, { status: 404 });
    }

    const student = await StudentProfile.findById(session.studentProfileId);
    if (!student) {
      return NextResponse.json({ error: "Student profile not found." }, { status: 404 });
    }

    // Check if already actively enrolled in this course
    const existingActiveEnrollment = await Enrollment.findOne({
      studentId: student._id,
      courseId: course._id,
      enrollmentStatus: "active",
    });

    if (existingActiveEnrollment) {
      return NextResponse.json(
        {
          error: `You are already actively enrolled in ${course.title} (Enrollment No: ${existingActiveEnrollment.enrollmentNumber}).`,
        },
        { status: 409 }
      );
    }

    // Check if already a pending request for this course
    const existingPending = await CourseRequest.findOne({
      studentId: student._id,
      courseId: course._id,
      status: "pending",
    });

    if (existingPending) {
      return NextResponse.json(
        {
          error: `You already have a pending admission request for ${course.title}. Please wait for administration review.`,
        },
        { status: 409 }
      );
    }

    const newRequest = await CourseRequest.create({
      studentId: student._id,
      courseId: course._id,
      requestDate: new Date(),
      status: "pending",
      notes: notes?.trim() || undefined,
    });

    await logAudit({
      action: "COURSE_REQUEST_SUBMITTED",
      performedBy: student.fullName,
      performedByRole: "student",
      targetType: "CourseRequest",
      targetId: newRequest._id.toString(),
      details: {
        studentName: student.fullName,
        mobileNumber: student.mobileNumber,
        courseName: course.title,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Your admission request for ${course.title} has been submitted! Administration will review your request, determine the fee & installment structure, and confirm enrollment.`,
      request: newRequest,
    });
  } catch (error: any) {
    console.error("Student course request error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to submit course request." },
      { status: 500 }
    );
  }
}
