import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/User";
import { StudentProfile } from "@/lib/models/StudentProfile";
import { verifyPassword, setSessionCookie } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { identifier, password, role } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Please enter your username/mobile/email and password." },
        { status: 400 }
      );
    }

    const cleanIdentifier = String(identifier).trim();

    // Query user by identifier, email, or mobile number
    const user = await User.findOne({
      $or: [
        { identifier: cleanIdentifier },
        { email: cleanIdentifier.toLowerCase() },
        { mobileNumber: cleanIdentifier },
      ],
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials. Please verify your details." },
        { status: 401 }
      );
    }

    // Role check if explicitly provided
    if (role && user.role !== role) {
      return NextResponse.json(
        { error: `Account exists, but is not authorized for the ${role} portal.` },
        { status: 403 }
      );
    }

    // Verify status
    if (user.status === "inactive") {
      return NextResponse.json(
        { error: "Your account is currently deactivated. Please contact QPET administration." },
        { status: 403 }
      );
    }

    if (user.status === "pending") {
      return NextResponse.json(
        {
          error:
            "Your registration request is pending admin approval. You will be able to access the student portal once approved.",
          isPending: true,
        },
        { status: 403 }
      );
    }

    // Verify password (supporting trimmed and raw passwords to prevent whitespace issues)
    const cleanPassword = String(password).trim();
    let isMatch = await verifyPassword(cleanPassword, user.passwordHash);
    if (!isMatch && password !== cleanPassword) {
      isMatch = await verifyPassword(password, user.passwordHash);
    }
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials. Incorrect password." },
        { status: 401 }
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Fetch student name if student
    let studentName = "";
    if (user.studentProfileId) {
      const student = await StudentProfile.findById(user.studentProfileId);
      if (student) {
        studentName = student.fullName;
      }
    } else if (user.role === "admin") {
      studentName = "QPET Administrator";
    }

    // Set HTTP-only session cookie
    await setSessionCookie({
      userId: user._id.toString(),
      identifier: user.identifier,
      role: user.role,
      studentProfileId: user.studentProfileId?.toString(),
      name: studentName,
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        identifier: user.identifier,
        role: user.role,
        name: studentName,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
