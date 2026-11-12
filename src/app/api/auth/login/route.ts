import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/User";
import { StudentProfile } from "@/lib/models/StudentProfile";
import { verifyPassword, setSessionCookie } from "@/lib/auth/session";
import { logAudit } from "@/lib/services/audit.service";

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
    const cleanLower = cleanIdentifier.toLowerCase();
    const domainAppended = cleanIdentifier.includes("@")
      ? cleanLower
      : `${cleanLower}@qpet.in`;

    const isAdminAlias =
      cleanLower === "admin" ||
      cleanLower === "admin077" ||
      cleanLower === "admin@qpet.in" ||
      cleanLower === "admin077@qpet.in";

    // Query user by identifier, email, or mobile number (including admin aliases)
    const user = await User.findOne({
      $or: [
        { identifier: cleanIdentifier },
        { identifier: cleanLower },
        { identifier: domainAppended },
        { email: cleanLower },
        { email: domainAppended },
        { mobileNumber: cleanIdentifier },
        ...(isAdminAlias
          ? [
              { role: "admin" },
              { identifier: "admin077@qpet.in" },
              { email: "admin077@qpet.in" },
            ]
          : []),
      ],
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials. Please verify your details." },
        { status: 401 }
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

    // Enforce strict portal-to-role matching
    if (role && ["admin", "trainer", "student"].includes(role)) {
      if (user.role !== role) {
        const portalLabels: Record<string, string> = {
          admin: "Admin Portal",
          trainer: "Trainer Portal",
          student: "Student Portal",
        };
        const selectedPortal = portalLabels[role] || `${role} portal`;
        const correctPortal = portalLabels[user.role] || `${user.role} portal`;

        return NextResponse.json(
          {
            error: `Access Denied: This is the ${selectedPortal}. Your account has '${user.role.toUpperCase()}' role. Please switch to the ${correctPortal} to sign in.`,
          },
          { status: 403 }
        );
      }
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Determine display name
    let displayName = "";
    if (user.role === "student") {
      if (user.studentProfileId) {
        const student = await StudentProfile.findById(user.studentProfileId);
        if (student) {
          displayName = student.fullName;
        }
      }
    } else if (user.role === "admin") {
      displayName = user.name || "QPET Administrator";
    } else if (user.role === "trainer") {
      displayName = user.name || "QPET Trainer";
    }

    // Set HTTP-only session cookie with role and permissions
    await setSessionCookie({
      userId: user._id.toString(),
      identifier: user.identifier,
      role: user.role,
      studentProfileId: user.studentProfileId?.toString(),
      name: displayName,
      permissions: user.permissions || {},
    });

    // Record login audit log for admin and trainer activities
    if (user.role === "admin" || user.role === "trainer") {
      const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "localhost";
      await logAudit({
        action: "USER_LOGGED_IN",
        performedBy: displayName ? `${displayName} (${user.identifier})` : user.identifier,
        performedByRole: user.role,
        targetType: "AUTH",
        targetId: user._id.toString(),
        details: {
          identifier: user.identifier,
          role: user.role,
        },
        ipAddress: clientIp,
      });
    }

    const redirectUrl =
      user.role === "admin"
        ? "/admin/dashboard"
        : user.role === "trainer"
        ? "/trainer/dashboard"
        : "/student/dashboard";

    return NextResponse.json({
      success: true,
      redirectUrl,
      user: {
        id: user._id.toString(),
        identifier: user.identifier,
        role: user.role,
        name: displayName,
        permissions: user.permissions || {},
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
