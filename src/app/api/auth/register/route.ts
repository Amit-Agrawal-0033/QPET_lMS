import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/User";
import { StudentProfile } from "@/lib/models/StudentProfile";
import { Course } from "@/lib/models/Course";
import { logAudit } from "@/lib/services/audit.service";

export async function POST(req: NextRequest) {
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
      preferredCourseId,
    } = body;

    // Validation
    if (!fullName || !fullName.trim()) {
      return NextResponse.json({ error: "Full Name is required." }, { status: 400 });
    }
    if (!fatherOrGuardianName || !fatherOrGuardianName.trim()) {
      return NextResponse.json(
        { error: "Father or Guardian's Name is required." },
        { status: 400 }
      );
    }
    if (!mobileNumber || !mobileNumber.trim()) {
      return NextResponse.json({ error: "Mobile Number is required." }, { status: 400 });
    }
    if (!address || !address.trim()) {
      return NextResponse.json({ error: "Address is required." }, { status: 400 });
    }
    if (!preferredCourseId) {
      return NextResponse.json({ error: "Please select a course." }, { status: 400 });
    }

    const cleanMobile = mobileNumber.trim();
    const cleanEmail = email && email.trim() ? email.trim().toLowerCase() : undefined;

    // Check course existence
    const course = await Course.findById(preferredCourseId);
    if (!course) {
      return NextResponse.json({ error: "Selected course does not exist." }, { status: 400 });
    }

    // Check if an approved/active student already exists with this mobile
    const existingStudent = await StudentProfile.findOne({
      mobileNumber: cleanMobile,
      registrationStatus: { $in: ["approved", "pending"] },
    });
    if (existingStudent) {
      return NextResponse.json(
        {
          error:
            existingStudent.registrationStatus === "pending"
              ? "An application with this mobile number is already pending review with administration."
              : "A registered student with this mobile number already exists. Please contact admin if you need credentials.",
        },
        { status: 409 }
      );
    }

    // Check duplicate email if provided
    if (cleanEmail) {
      const existingUserEmail = await StudentProfile.findOne({
        email: cleanEmail,
        registrationStatus: { $in: ["approved", "pending"] },
      });
      if (existingUserEmail) {
        return NextResponse.json(
          { error: "A student record with this email address already exists." },
          { status: 409 }
        );
      }
    }

    // Create student profile with 'pending' status (No password created yet)
    const studentProfile = new StudentProfile({
      fullName: fullName.trim(),
      fatherOrGuardianName: fatherOrGuardianName.trim(),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender: gender || undefined,
      mobileNumber: cleanMobile,
      email: cleanEmail,
      address: address.trim(),
      qualification: qualification ? qualification.trim() : undefined,
      preferredCourseId: course._id,
      registrationStatus: "pending",
      registrationDate: new Date(),
    });

    await studentProfile.save();

    await logAudit({
      action: "STUDENT_SELF_REGISTERED",
      performedBy: fullName.trim(),
      performedByRole: "student",
      targetType: "StudentProfile",
      targetId: studentProfile._id.toString(),
      details: {
        mobileNumber: cleanMobile,
        courseTitle: course.title,
        status: "pending_approval",
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Admission registration submitted successfully! Your application is pending review. Administration will approve your application and provide your official login credentials.",
      studentId: studentProfile._id.toString(),
      status: "pending",
    });
  } catch (error: any) {
    console.error("Student registration error:", error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: "A student record with this mobile number or email already exists." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: error.message || "Failed to process student registration." },
      { status: 500 }
    );
  }
}
