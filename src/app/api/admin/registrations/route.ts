import { NextRequest, NextResponse } from "next/server";
import { requireAdminOrTrainer, requireAdmin } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";
import { StudentProfile } from "@/lib/models/StudentProfile";
import { User } from "@/lib/models/User";
import { Course } from "@/lib/models/Course";
import { Enrollment } from "@/lib/models/Enrollment";
import { Installment } from "@/lib/models/Installment";
import { CourseRequest } from "@/lib/models/CourseRequest";
import { generateEnrollmentNumber } from "@/lib/services/enrollment-number.service";
import { logAudit } from "@/lib/services/audit.service";
import { hashPassword } from "@/lib/auth/session";

export async function GET() {
  const { response } = await requireAdminOrTrainer("viewRegistrations");
  if (response) return response;

  try {
    await connectDB();
    const [pendingRegistrations, pendingCourseRequests] = await Promise.all([
      StudentProfile.find({ registrationStatus: "pending" })
        .populate("preferredCourseId")
        .sort({ createdAt: -1 })
        .lean(),
      CourseRequest.find({ status: "pending" })
        .populate("studentId")
        .populate("courseId")
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      registrations: pendingRegistrations,
      courseRequests: pendingCourseRequests,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch registrations." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const { session, response } = await requireAdminOrTrainer("editRegistrations");
  if (response) return response;

  try {
    await connectDB();
    const body = await req.json();
    const {
      type, // "student" | "course_request"
      requestId,
      studentId,
      action,
      rejectionReason,
      agreedFee,
      discountAmount,
      paymentType,
      installmentCount,
      password,
    } = body;

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Valid action ('approve' or 'reject') required." },
        { status: 400 }
      );
    }

    // =========================================================================
    // BRANCH A: COURSE REQUEST (Existing Student applying for an extra course)
    // =========================================================================
    if (type === "course_request" || requestId) {
      const courseReq = await CourseRequest.findById(requestId || studentId)
        .populate("studentId")
        .populate("courseId");

      if (!courseReq) {
        return NextResponse.json({ error: "Course request not found." }, { status: 404 });
      }

      if (courseReq.status !== "pending") {
        return NextResponse.json(
          { error: `Course request is already ${courseReq.status}.` },
          { status: 400 }
        );
      }

      const student = courseReq.studentId as any;
      const course = courseReq.courseId as any;

      if (action === "reject") {
        courseReq.status = "rejected";
        courseReq.rejectionReason = rejectionReason?.trim() || "Course request rejected by Administration.";
        await courseReq.save();

        await logAudit({
          action: "COURSE_REQUEST_REJECTED",
          performedBy: session.name || "Admin",
          targetType: "CourseRequest",
          targetId: courseReq._id.toString(),
          details: { studentName: student.fullName, courseName: course.title, reason: courseReq.rejectionReason },
        });

        return NextResponse.json({ success: true, message: "Course request rejected." });
      }

      // ACTION: APPROVE COURSE REQUEST
      const baseFee =
        agreedFee !== undefined && agreedFee !== ""
          ? Number(agreedFee)
          : course.defaultFee;
      const discount =
        discountAmount !== undefined && discountAmount !== ""
          ? Math.max(0, Number(discountAmount))
          : 0;
      const finalFee = Math.max(0, baseFee - discount);

      const enrollmentNumber = await generateEnrollmentNumber();
      const enrollmentDate = new Date();
      const expectedCompletion = new Date(enrollmentDate);
      const durationUnit = course.durationUnit || "months";
      const durationVal = course.durationValue || course.durationMonths || 1;
      if (durationUnit === "days") {
        expectedCompletion.setDate(expectedCompletion.getDate() + durationVal);
      } else {
        expectedCompletion.setMonth(expectedCompletion.getMonth() + durationVal);
      }

      const durationText =
        course.durationText ||
        (durationUnit === "days"
          ? `${durationVal} ${durationVal === 1 ? "Day" : "Days"}`
          : `${durationVal} ${durationVal === 1 ? "Month" : "Months"}`);

      const createdEnrollment = new Enrollment({
        enrollmentNumber,
        studentId: student._id,
        courseId: course._id,
        courseNameSnapshot: course.title,
        durationMonthsSnapshot: course.durationMonths || 1,
        durationSnapshot: durationText,
        durationUnitSnapshot: durationUnit,
        durationValueSnapshot: durationVal,
        agreedFeeSnapshot: baseFee,
        discountAmount: discount,
        finalFee: finalFee,
        enrollmentDate,
        expectedCompletionDate: expectedCompletion,
        enrollmentStatus: "active",
        paymentType: paymentType === "installment" ? "installment" : "full",
        totalFee: finalFee,
        paidAmount: 0,
        outstandingBalance: finalFee,
        paymentStatus: "unpaid",
        certificateStatus: "pending",
      });

      await createdEnrollment.save();

      // Create installments if configured
      if (paymentType === "installment" && installmentCount && Number(installmentCount) > 1) {
        const numInst = Number(installmentCount);
        const perInst = Math.round(finalFee / numInst);
        for (let i = 1; i <= numInst; i++) {
          const dueDate = new Date(enrollmentDate);
          dueDate.setMonth(dueDate.getMonth() + (i - 1));
          const amount = i === numInst ? finalFee - perInst * (numInst - 1) : perInst;

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

      courseReq.status = "approved";
      courseReq.enrollmentId = createdEnrollment._id;
      await courseReq.save();

      await logAudit({
        action: "COURSE_REQUEST_APPROVED",
        performedBy: session.name || "Admin",
        targetType: "CourseRequest",
        targetId: courseReq._id.toString(),
        details: {
          enrollmentNumber,
          studentName: student.fullName,
          courseName: course.title,
          baseFee,
          discount,
          finalFee,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Course admission approved! Student enrolled in ${course.title} (${enrollmentNumber}).`,
        enrollment: createdEnrollment,
        studentName: student.fullName,
        courseName: course.title,
      });
    }

    // =========================================================================
    // BRANCH B: NEW STUDENT REGISTRATION APPLICATION (StudentProfile)
    // =========================================================================
    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required." }, { status: 400 });
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

    // ACTION: APPROVE NEW STUDENT
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
        const baseFee =
          agreedFee !== undefined && agreedFee !== ""
            ? Number(agreedFee)
            : course.defaultFee;
        const discount =
          discountAmount !== undefined && discountAmount !== ""
            ? Math.max(0, Number(discountAmount))
            : 0;
        const finalFee = Math.max(0, baseFee - discount);
        const enrollmentNumber = await generateEnrollmentNumber();

        const enrollmentDate = new Date();
        const expectedCompletion = new Date(enrollmentDate);
        const durationUnit = course.durationUnit || "months";
        const durationVal = course.durationValue || course.durationMonths || 1;
        if (durationUnit === "days") {
          expectedCompletion.setDate(expectedCompletion.getDate() + durationVal);
        } else {
          expectedCompletion.setMonth(expectedCompletion.getMonth() + durationVal);
        }

        const durationText =
          course.durationText ||
          (durationUnit === "days"
            ? `${durationVal} ${durationVal === 1 ? "Day" : "Days"}`
            : `${durationVal} ${durationVal === 1 ? "Month" : "Months"}`);

        createdEnrollment = new Enrollment({
          enrollmentNumber,
          studentId: student._id,
          courseId: course._id,
          courseNameSnapshot: course.title,
          durationMonthsSnapshot: course.durationMonths || 1,
          durationSnapshot: durationText,
          durationUnitSnapshot: durationUnit,
          durationValueSnapshot: durationVal,
          agreedFeeSnapshot: baseFee,
          discountAmount: discount,
          finalFee: finalFee,
          enrollmentDate,
          expectedCompletionDate: expectedCompletion,
          enrollmentStatus: "active",
          paymentType: paymentType === "installment" ? "installment" : "full",
          totalFee: finalFee,
          paidAmount: 0,
          outstandingBalance: finalFee,
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
          const perInst = Math.round(finalFee / numInst);
          for (let i = 1; i <= numInst; i++) {
            const dueDate = new Date(enrollmentDate);
            dueDate.setMonth(dueDate.getMonth() + (i - 1));
            const amount = i === numInst ? finalFee - perInst * (numInst - 1) : perInst;

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
            baseFee,
            discount,
            finalFee,
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

// STRICT REQUIREMENT: Only Administrators can delete registration applications.
export async function DELETE(req: NextRequest) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  try {
    await connectDB();
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id) {
      return NextResponse.json({ error: "ID is required." }, { status: 400 });
    }

    if (type === "course_request") {
      await CourseRequest.findByIdAndDelete(id);
      return NextResponse.json({ success: true, message: "Course request purged successfully." });
    }

    await StudentProfile.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Registration purged successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete record." }, { status: 500 });
  }
}
