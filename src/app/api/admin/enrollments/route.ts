import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";
import { Enrollment } from "@/lib/models/Enrollment";
import { StudentProfile } from "@/lib/models/StudentProfile";
import { Course } from "@/lib/models/Course";
import { Installment } from "@/lib/models/Installment";
import { generateEnrollmentNumber } from "@/lib/services/enrollment-number.service";
import { logAudit } from "@/lib/services/audit.service";

export async function GET(req: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    await connectDB();
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("query")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";
    const courseId = searchParams.get("courseId")?.trim() || "";
    const paymentStatus = searchParams.get("paymentStatus")?.trim() || "";

    const filter: any = {};
    if (status) filter.enrollmentStatus = status;
    if (courseId) filter.courseId = courseId;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    let enrollmentsQuery = Enrollment.find(filter)
      .populate("studentId", "fullName mobileNumber email fatherOrGuardianName")
      .populate("courseId", "title code")
      .sort({ createdAt: -1 });

    const enrollments = await enrollmentsQuery.lean();

    // In-memory text filter if student name or enrollment number searched
    let filtered = enrollments;
    if (query) {
      const q = query.toLowerCase();
      filtered = enrollments.filter((e: any) => {
        const numMatch = e.enrollmentNumber?.toLowerCase().includes(q);
        const nameMatch = e.studentId?.fullName?.toLowerCase().includes(q);
        const mobileMatch = e.studentId?.mobileNumber?.includes(q);
        const courseMatch = e.courseNameSnapshot?.toLowerCase().includes(q);
        return numMatch || nameMatch || mobileMatch || courseMatch;
      });
    }

    return NextResponse.json({ success: true, enrollments: filtered });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch enrollments." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  try {
    await connectDB();
    const body = await req.json();
    const {
      studentId,
      courseId,
      customFee,
      paymentType,
      installmentCount,
      allowDuplicate,
    } = body;

    if (!studentId || !courseId) {
      return NextResponse.json(
        { error: "Student and Course selection are required." },
        { status: 400 }
      );
    }

    const student = await StudentProfile.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    // Check duplicate active enrollment for same student and course
    if (!allowDuplicate) {
      const existingActive = await Enrollment.findOne({
        studentId: student._id,
        courseId: course._id,
        enrollmentStatus: "active",
      });
      if (existingActive) {
        return NextResponse.json(
          {
            error: `Student already has an active enrollment (${existingActive.enrollmentNumber}) for ${course.title}. Set allowDuplicate to proceed.`,
            duplicateDetected: true,
          },
          { status: 409 }
        );
      }
    }

    const agreedFee = customFee !== undefined && customFee !== "" ? Number(customFee) : course.defaultFee;
    const enrollmentNumber = await generateEnrollmentNumber();

    const enrollmentDate = new Date();
    const expectedCompletion = new Date(enrollmentDate);
    expectedCompletion.setMonth(expectedCompletion.getMonth() + course.durationMonths);

    const enrollment = new Enrollment({
      enrollmentNumber,
      studentId: student._id,
      courseId: course._id,
      courseNameSnapshot: course.title,
      durationMonthsSnapshot: course.durationMonths,
      agreedFeeSnapshot: agreedFee,
      enrollmentDate,
      expectedCompletionDate: expectedCompletion,
      enrollmentStatus: "active",
      paymentType: paymentType === "installment" ? "installment" : "full",
      totalFee: agreedFee,
      paidAmount: 0,
      outstandingBalance: agreedFee,
      paymentStatus: "unpaid",
      certificateStatus: "pending",
    });

    await enrollment.save();

    // Create installment schedule if installment plan
    if (paymentType === "installment" && installmentCount && Number(installmentCount) > 1) {
      const numInst = Number(installmentCount);
      const perInst = Math.round(agreedFee / numInst);
      for (let i = 1; i <= numInst; i++) {
        const dueDate = new Date(enrollmentDate);
        dueDate.setMonth(dueDate.getMonth() + (i - 1));
        const amount = i === numInst ? agreedFee - perInst * (numInst - 1) : perInst;

        await Installment.create({
          enrollmentId: enrollment._id,
          studentId: student._id,
          installmentNumber: i,
          amount,
          paidAmount: 0,
          dueDate,
          status: "pending",
        });
      }
    }

    await logAudit({
      action: "ENROLLMENT_CREATED",
      performedBy: session.name || "Admin",
      targetType: "Enrollment",
      targetId: enrollment._id.toString(),
      details: {
        enrollmentNumber,
        studentName: student.fullName,
        courseName: course.title,
        fee: agreedFee,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Enrollment ${enrollmentNumber} created successfully.`,
        enrollment,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create enrollment error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create enrollment." },
      { status: 500 }
    );
  }
}
