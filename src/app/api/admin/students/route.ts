import { NextRequest, NextResponse } from "next/server";
import { requireAdminOrTrainer } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";
import { StudentProfile } from "@/lib/models/StudentProfile";
import { User } from "@/lib/models/User";
import { Course } from "@/lib/models/Course";
import { Enrollment } from "@/lib/models/Enrollment";
import { Installment } from "@/lib/models/Installment";
import { generateEnrollmentNumber } from "@/lib/services/enrollment-number.service";
import { logAudit } from "@/lib/services/audit.service";
import { hashPassword } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const { response } = await requireAdminOrTrainer("viewStudents");
  if (response) return response;

  try {
    await connectDB();
    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("query")?.trim() || "";
    const status = searchParams.get("status")?.trim() || "";

    const filter: any = {};
    if (status) {
      if (status === "dropped_or_inactive") {
        filter.registrationStatus = { $in: ["dropped", "inactive"] };
      } else {
        filter.registrationStatus = status;
      }
    }

    if (query) {
      filter.$or = [
        { fullName: { $regex: query, $options: "i" } },
        { mobileNumber: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
        { fatherOrGuardianName: { $regex: query, $options: "i" } },
      ];
    }

    const students = await StudentProfile.find(filter)
      .populate("preferredCourseId", "title code defaultFee durationMonths")
      .sort({ createdAt: -1 })
      .lean();

    // Attach active enrollment details to each student
    const studentsWithEnrollments = await Promise.all(
      students.map(async (st) => {
        const enrollments = await Enrollment.find({ studentId: st._id }).lean();
        const user = st.userId ? await User.findById(st.userId).select("identifier status lastLogin").lean() : null;
        return {
          ...st,
          enrollments,
          userAccount: user,
        };
      })
    );

    return NextResponse.json({ success: true, students: studentsWithEnrollments });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch students." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireAdminOrTrainer("editStudents");
  if (response) return response;

  try {
    await connectDB();
    const body = await req.json();
    const {
      fullName,
      fatherOrGuardianName,
      dateOfBirth,
      gender,
      mobileNumber,
      email,
      address,
      qualification,
      courseId,
      customFee,
      paymentType,
      installmentCount,
      password,
    } = body;

    if (!fullName || !fatherOrGuardianName || !mobileNumber || !address) {
      return NextResponse.json(
        { error: "Full Name, Father/Guardian Name, Mobile, and Address are required." },
        { status: 400 }
      );
    }

    const cleanMobile = mobileNumber.trim();
    const cleanEmail = email && email.trim() ? email.trim().toLowerCase() : undefined;

    const existingUser = await User.findOne({
      $or: [{ identifier: cleanMobile }, { mobileNumber: cleanMobile }],
    });
    if (existingUser) {
      return NextResponse.json(
        { error: "A user account with this mobile number already exists." },
        { status: 409 }
      );
    }

    // Password explicitly set by Admin or defaults to format QPET@<last4>
    let userPass = "";
    if (password && password.trim()) {
      if (password.trim().length < 6) {
        return NextResponse.json(
          { error: "Student login password must be at least 6 characters long." },
          { status: 400 }
        );
      }
      userPass = password.trim();
    } else {
      userPass = "QPET@" + cleanMobile.slice(-4);
    }
    const passwordHash = await hashPassword(userPass);

    // Create student profile with 'approved' status (admin-created is directly approved)
    const studentProfile = new StudentProfile({
      fullName: fullName.trim(),
      fatherOrGuardianName: fatherOrGuardianName.trim(),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender: gender || undefined,
      mobileNumber: cleanMobile,
      email: cleanEmail,
      address: address.trim(),
      qualification: qualification ? qualification.trim() : undefined,
      registrationStatus: "approved",
      registrationDate: new Date(),
    });

    await studentProfile.save();

    // Create user account with active status
    const user = new User({
      identifier: cleanMobile,
      mobileNumber: cleanMobile,
      email: cleanEmail,
      passwordHash,
      role: "student",
      status: "active",
      studentProfileId: studentProfile._id,
    });
    await user.save();

    studentProfile.userId = user._id;
    await studentProfile.save();

    let createdEnrollment = null;

    // If courseId provided, create enrollment immediately
    if (courseId) {
      const course = await Course.findById(courseId);
      if (course) {
        const agreedFee =
          customFee !== undefined && customFee !== ""
            ? Number(customFee)
            : course.defaultFee;
        const enrollmentNumber = await generateEnrollmentNumber();

        const enrollmentDate = new Date();
        const expectedCompletion = new Date(enrollmentDate);
        expectedCompletion.setMonth(expectedCompletion.getMonth() + course.durationMonths);

        createdEnrollment = new Enrollment({
          enrollmentNumber,
          studentId: studentProfile._id,
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

        await createdEnrollment.save();

        // Create installments if installment type
        if (
          paymentType === "installment" &&
          installmentCount &&
          Number(installmentCount) > 1
        ) {
          const numInst = Number(installmentCount);
          const perInst = Math.round(agreedFee / numInst);
          for (let i = 1; i <= numInst; i++) {
            const dueDate = new Date(enrollmentDate);
            dueDate.setMonth(dueDate.getMonth() + (i - 1));
            const amount = i === numInst ? agreedFee - perInst * (numInst - 1) : perInst;

            await Installment.create({
              enrollmentId: createdEnrollment._id,
              studentId: studentProfile._id,
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
            studentName: studentProfile.fullName,
            courseName: course.title,
            fee: agreedFee,
          },
        });
      }
    }

    await logAudit({
      action: "STUDENT_CREATED_BY_ADMIN",
      performedBy: session.name || "Admin",
      targetType: "StudentProfile",
      targetId: studentProfile._id.toString(),
      details: {
        fullName: studentProfile.fullName,
        mobileNumber: studentProfile.mobileNumber,
        credentialsCreated: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Student registered successfully and credentials created.",
        student: studentProfile,
        enrollment: createdEnrollment,
        credentials: {
          username: cleanMobile,
          password: userPass,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Admin student registration error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register student." },
      { status: 500 }
    );
  }
}

// PUT: Edit Student Registration Details
export async function PUT(req: NextRequest) {
  const { session, response } = await requireAdminOrTrainer("editStudents");
  if (response) return response;

  try {
    await connectDB();
    const body = await req.json();
    const {
      studentId,
      fullName,
      fatherOrGuardianName,
      dateOfBirth,
      gender,
      mobileNumber,
      email,
      address,
      qualification,
    } = body;

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required." }, { status: 400 });
    }

    const student = await StudentProfile.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    const cleanMobile = mobileNumber ? mobileNumber.trim() : student.mobileNumber;
    const cleanEmail = email && email.trim() ? email.trim().toLowerCase() : undefined;

    // Check duplicate mobile if mobile was changed
    if (cleanMobile !== student.mobileNumber) {
      const existing = await StudentProfile.findOne({
        mobileNumber: cleanMobile,
        _id: { $ne: student._id },
      });
      if (existing) {
        return NextResponse.json(
          { error: "Another student already exists with this mobile number." },
          { status: 409 }
        );
      }
    }

    const oldValues = {
      fullName: student.fullName,
      fatherOrGuardianName: student.fatherOrGuardianName,
      mobileNumber: student.mobileNumber,
      email: student.email,
      address: student.address,
      qualification: student.qualification,
      gender: student.gender,
      dateOfBirth: student.dateOfBirth,
    };

    if (fullName) student.fullName = fullName.trim();
    if (fatherOrGuardianName) student.fatherOrGuardianName = fatherOrGuardianName.trim();
    if (cleanMobile) student.mobileNumber = cleanMobile;
    student.email = cleanEmail;
    if (address) student.address = address.trim();
    if (qualification !== undefined) student.qualification = qualification.trim();
    if (gender) student.gender = gender;
    if (dateOfBirth) student.dateOfBirth = new Date(dateOfBirth);

    await student.save();

    // If mobile changed, update User identifier & mobileNumber
    if (student.userId && cleanMobile !== oldValues.mobileNumber) {
      await User.findByIdAndUpdate(student.userId, {
        identifier: cleanMobile,
        mobileNumber: cleanMobile,
        email: cleanEmail,
      });
    }

    await logAudit({
      action: "STUDENT_PROFILE_UPDATED",
      performedBy: session.name || "Admin",
      targetType: "StudentProfile",
      targetId: student._id.toString(),
      details: {
        studentName: student.fullName,
        oldValues,
        newValues: {
          fullName: student.fullName,
          fatherOrGuardianName: student.fatherOrGuardianName,
          mobileNumber: student.mobileNumber,
          email: student.email,
          address: student.address,
          qualification: student.qualification,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: "Student details updated successfully.",
      student,
    });
  } catch (error: any) {
    console.error("Student edit error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update student details." },
      { status: 500 }
    );
  }
}

// PATCH: Password Reset, Mark as Dropped / Inactive, or Reactivate
export async function PATCH(req: NextRequest) {
  const { session, response } = await requireAdminOrTrainer("editStudents");
  if (response) return response;

  try {
    await connectDB();
    const body = await req.json();
    const { studentId, action, newPassword, dropReason } = body;

    if (!studentId || !action) {
      return NextResponse.json(
        { error: "Student ID and action are required." },
        { status: 400 }
      );
    }

    const student = await StudentProfile.findById(studentId);
    if (!student) {
      return NextResponse.json({ error: "Student not found." }, { status: 404 });
    }

    // 1. ACTION: RESET PASSWORD
    if (action === "reset_password") {
      if (!newPassword || newPassword.trim().length < 6) {
        return NextResponse.json(
          { error: "New password must be at least 6 characters long." },
          { status: 400 }
        );
      }

      const cleanPass = newPassword.trim();
      const passwordHash = await hashPassword(cleanPass);

      let user = null;
      if (student.userId) {
        user = await User.findById(student.userId);
      }
      if (!user) {
        user = await User.findOne({ identifier: student.mobileNumber });
      }

      if (!user) {
        // Create user account if not previously created
        user = new User({
          identifier: student.mobileNumber,
          mobileNumber: student.mobileNumber,
          email: student.email,
          passwordHash,
          role: "student",
          status: "active",
          studentProfileId: student._id,
        });
        await user.save();
        student.userId = user._id;
        await student.save();
      } else {
        user.passwordHash = passwordHash;
        user.status = "active";
        await user.save();
      }

      await logAudit({
        action: "PASSWORD_RESET_BY_ADMIN",
        performedBy: session.name || "Admin",
        targetType: "User",
        targetId: user._id.toString(),
        details: {
          studentName: student.fullName,
          mobileNumber: student.mobileNumber,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Password reset successfully for ${student.fullName}.`,
        username: student.mobileNumber,
        newPassword: cleanPass,
      });
    }

    // 2. ACTION: DROP / INACTIVATE STUDENT (Mid-course dropout)
    if (action === "drop" || action === "inactivate") {
      const reason = dropReason?.trim() || "Student dropped course mid-way";

      student.registrationStatus = "dropped";
      student.dropReason = reason;
      student.droppedAt = new Date();
      await student.save();

      // Deactivate user account
      if (student.userId) {
        await User.findByIdAndUpdate(student.userId, { status: "inactive" });
      }

      // Mark active enrollments as dropped
      await Enrollment.updateMany(
        { studentId: student._id, enrollmentStatus: "active" },
        { enrollmentStatus: "dropped" }
      );

      await logAudit({
        action: "STUDENT_MARKED_DROPPED",
        performedBy: session.name || "Admin",
        targetType: "StudentProfile",
        targetId: student._id.toString(),
        details: {
          studentName: student.fullName,
          mobileNumber: student.mobileNumber,
          dropReason: reason,
          droppedAt: student.droppedAt,
        },
      });

      return NextResponse.json({
        success: true,
        message: `${student.fullName} has been marked as Dropped / Inactive.`,
        student,
      });
    }

    // 3. ACTION: REACTIVATE STUDENT
    if (action === "reactivate") {
      student.registrationStatus = "approved";
      student.dropReason = undefined;
      student.droppedAt = undefined;
      await student.save();

      if (student.userId) {
        await User.findByIdAndUpdate(student.userId, { status: "active" });
      }

      // Reactivate dropped enrollments back to active
      await Enrollment.updateMany(
        { studentId: student._id, enrollmentStatus: "dropped" },
        { enrollmentStatus: "active" }
      );

      await logAudit({
        action: "STUDENT_REACTIVATED",
        performedBy: session.name || "Admin",
        targetType: "StudentProfile",
        targetId: student._id.toString(),
        details: {
          studentName: student.fullName,
          mobileNumber: student.mobileNumber,
        },
      });

      return NextResponse.json({
        success: true,
        message: `${student.fullName} has been reactivated successfully.`,
        student,
      });
    }

    return NextResponse.json({ error: "Invalid action specified." }, { status: 400 });
  } catch (error: any) {
    console.error("Student patch error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process student action." },
      { status: 500 }
    );
  }
}
