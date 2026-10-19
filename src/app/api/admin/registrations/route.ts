import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";
import { StudentProfile } from "@/lib/models/StudentProfile";
import { User } from "@/lib/models/User";
import { Course } from "@/lib/models/Course";
import { Enrollment } from "@/lib/models/Enrollment";
import { Installment } from "@/lib/models/Installment";
import { generateEnrollmentNumber } from "@/lib/services/enrollment-number.service";
import { logAudit } from "@/lib/services/audit.service";
import { hashPassword } from "@/lib/auth/session";

export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    await connectDB();
    const pendingList = await StudentProfile.find({ registrationStatus: "pending" })
      .populate("preferredCourseId")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, registrations: pendingList });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch registrations." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  try {
    await connectDB();
    const body = await req.json();
    const {
      studentId,
      action,
      rejectionReason,
      agreedFee,
      paymentType,
      installmentCount,
      password,
    } = body;

    if (!studentId || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Student ID and valid action ('approve' or 'reject') required." },
        { status: 400 }
      );
    }

    const student = await StudentProfile.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    if (student.registrationStatus !== "pending") {
      return NextResponse.json(
        { error: `Registration is already ${student.registrationStatus}.` },
        { status: 400 }
      );
    }

    if (action === "reject") {
      student.registrationStatus = "rejected";
      student.rejectionReason = rejectionReason?.trim() || "Registration rejected by Admin.";
      await student.save();

      // Deactivate student user if exists
      if (student.userId) {
        await User.findByIdAndUpdate(student.userId, { status: "inactive" });
      }

      await logAudit({
        action: "STUDENT_REJECTED",
        performedBy: session.name || "Admin",
        targetType: "StudentProfile",
        targetId: student._id.toString(),
        details: { reason: student.rejectionReason },
      });

      return NextResponse.json({ success: true, message: "Registration rejected." });
    }

    // ACTION: APPROVE
    // 1. Set or generate login credentials
    const studentPassword =
      password && password.trim().length >= 6
        ? password.trim()
        : "QPET@" + student.mobileNumber.slice(-4);
    const passwordHash = await hashPassword(studentPassword);

    let user = null;
    if (student.userId) {
      user = await User.findById(student.userId);
    }

    if (!user) {
      // Find or create User by mobile
      user = await User.findOne({ identifier: student.mobileNumber });
      if (!user) {
        user = new User({
          identifier: student.mobileNumber,
          mobileNumber: student.mobileNumber,
          email: student.email || undefined,
          passwordHash,
          role: "student",
          status: "active",
          studentProfileId: student._id,
        });
      } else {
        user.passwordHash = passwordHash;
        user.status = "active";
        user.studentProfileId = student._id;
      }
    } else {
      user.passwordHash = passwordHash;
      user.status = "active";
    }
    await user.save();

    student.userId = user._id;
    student.registrationStatus = "approved";
    await student.save();

    let createdEnrollment = null;

    // Create course enrollment if preferred course is selected
    if (student.preferredCourseId) {
      const course = await Course.findById(student.preferredCourseId);
      if (course) {
        const fee =
          agreedFee !== undefined && agreedFee !== ""
            ? Number(agreedFee)
            : course.defaultFee;
        const enrollmentNumber = await generateEnrollmentNumber();

        const enrollmentDate = new Date();
        const expectedCompletion = new Date(enrollmentDate);
        expectedCompletion.setMonth(expectedCompletion.getMonth() + course.durationMonths);

        createdEnrollment = new Enrollment({
          enrollmentNumber,
          studentId: student._id,
          courseId: course._id,
          courseNameSnapshot: course.title,
          durationMonthsSnapshot: course.durationMonths,
          agreedFeeSnapshot: fee,
          enrollmentDate,
          expectedCompletionDate: expectedCompletion,
          enrollmentStatus: "active",
          paymentType: paymentType === "installment" ? "installment" : "full",
          totalFee: fee,
          paidAmount: 0,
          outstandingBalance: fee,
          paymentStatus: "unpaid",
          certificateStatus: "pending",
        });

        await createdEnrollment.save();

        // Create installments if configured
        if (
          paymentType === "installment" &&
          installmentCount &&
          Number(installmentCount) > 1
        ) {
          const numInst = Number(installmentCount);
          const perInst = Math.round(fee / numInst);
          for (let i = 1; i <= numInst; i++) {
            const dueDate = new Date(enrollmentDate);
            dueDate.setMonth(dueDate.getMonth() + (i - 1));
            const amount = i === numInst ? fee - perInst * (numInst - 1) : perInst;

            await Installment.create({
              enrollmentId: createdEnrollment._id,
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
          targetId: createdEnrollment._id.toString(),
          details: {
            enrollmentNumber,
            studentName: student.fullName,
            courseName: course.title,
            fee,
          },
        });
      }
    }

    await logAudit({
      action: "STUDENT_APPROVED",
      performedBy: session.name || "Admin",
      targetType: "StudentProfile",
      targetId: student._id.toString(),
      details: {
        studentName: student.fullName,
        mobileNumber: student.mobileNumber,
        credentialsCreated: true,
        enrollmentNumber: createdEnrollment?.enrollmentNumber,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Student registration approved and course enrollment created.",
      enrollment: createdEnrollment,
      credentials: {
        username: student.mobileNumber,
        password: studentPassword,
      },
    });
  } catch (error: any) {
    console.error("Registration action error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process registration action." },
      { status: 500 }
    );
  }
}
