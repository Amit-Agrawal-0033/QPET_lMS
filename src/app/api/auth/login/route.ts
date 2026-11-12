import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/User";
import { StudentProfile } from "@/lib/models/StudentProfile";
import { verifyPassword, setSessionCookie } from "@/lib/auth/session";
import { logAudit } from "@/lib/services/audit.service";
import {
  checkLoginRateLimit,
  recordLoginFailure,
  recordLoginSuccess,
} from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { identifier, password, role } = body;

    // Strict NoSQL Injection & Type Validation
    if (
      typeof identifier !== "string" ||
      typeof password !== "string" ||
      !identifier.trim() ||
      !password
    ) {
      return NextResponse.json(
        { error: "Please enter your username/mobile/email and password." },
        { status: 400 }
      );
    }

    const clientIp =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    const cleanIdentifier = identifier.trim();
    const cleanLower = cleanIdentifier.toLowerCase();
    const domainAppended = cleanIdentifier.includes("@")
      ? cleanLower
      : `${cleanLower}@qpet.in`;

    // 1. Rate Limiting Check (Multi-instance MongoDB-backed brute-force protection)
    const rateLimit = await checkLoginRateLimit(clientIp, cleanIdentifier);
    if (!rateLimit.allowed) {
      await logAudit({
        action: "RATE_LIMIT_TRIGGERED",
        performedBy: cleanIdentifier,
        performedByRole: "unknown",
        targetType: "AUTH",
        details: {
          ip: clientIp,
          identifier: cleanIdentifier,
          remainingSeconds: rateLimit.remainingSeconds,
        },
        ipAddress: clientIp,
      });

      return NextResponse.json(
        { error: rateLimit.error },
        { status: 429 }
      );
    }

    const isAdminAlias =
      cleanLower === "admin" ||
      cleanLower === "admin077" ||
      cleanLower === "admin@qpet.in" ||
      cleanLower === "admin077@qpet.in";

    // 2. Query user with parameterized conditions preventing operator injection
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
      await recordLoginFailure(clientIp, cleanIdentifier);
      await logAudit({
        action: "LOGIN_FAILED",
        performedBy: cleanIdentifier,
        performedByRole: "unknown",
        targetType: "AUTH",
        details: { reason: "user_not_found" },
        ipAddress: clientIp,
      });

      return NextResponse.json(
        { error: "Invalid credentials. Please verify your details." },
        { status: 401 }
      );
    }

    // 3. Verify status
    if (user.status === "inactive" || (user.status as string) === "suspended") {
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

    // 4. Verify password with secure bcrypt comparison
    const cleanPassword = password.trim();
    let isMatch = await verifyPassword(cleanPassword, user.passwordHash);
    if (!isMatch && password !== cleanPassword) {
      isMatch = await verifyPassword(password, user.passwordHash);
    }

    if (!isMatch) {
      await recordLoginFailure(clientIp, cleanIdentifier);
      await logAudit({
        action: "LOGIN_FAILED",
        performedBy: user.identifier,
        performedByRole: user.role,
        targetType: "AUTH",
        targetId: user._id.toString(),
        details: { reason: "incorrect_password" },
        ipAddress: clientIp,
      });

      return NextResponse.json(
        { error: "Invalid credentials. Incorrect password." },
        { status: 401 }
      );
    }

    // 5. Enforce strict server-side portal-to-role matching
    if (role && typeof role === "string" && ["admin", "trainer", "student"].includes(role.toLowerCase())) {
      const selectedRole = role.toLowerCase();
      const actualRole = (user.role || "").toLowerCase();

      if (actualRole !== selectedRole) {
        let errorMsg = `Access Denied: Your account does not have permission to access this portal.`;

        if (selectedRole === "admin" && actualRole === "trainer") {
          errorMsg = "Access Denied: This is the Admin Portal. Your account has TRAINER role. Please switch to Trainer Portal.";
        } else if (selectedRole === "trainer" && actualRole === "admin") {
          errorMsg = "Access Denied: This is the Trainer Portal. Your account has ADMIN role. Please switch to Admin Portal.";
        } else if (actualRole === "student" && selectedRole !== "student") {
          errorMsg = "Access Denied: Your account does not have permission to access this portal.";
        } else if (selectedRole === "student" && actualRole !== "student") {
          errorMsg = `Access Denied: This is the Student Portal. Your account has ${actualRole.toUpperCase()} role. Please switch to the appropriate portal.`;
        }

        await logAudit({
          action: "ROLE_MISMATCH_BLOCKED",
          performedBy: user.identifier,
          performedByRole: user.role,
          targetType: "AUTH",
          targetId: user._id.toString(),
          details: {
            attemptedPortal: selectedRole,
            actualRole: user.role,
            reason: "cross_role_login_blocked",
          },
          ipAddress: clientIp,
        });

        return NextResponse.json({ error: errorMsg }, { status: 403 });
      }
    }

    // Login Succeeded: Clear failed attempt records
    await recordLoginSuccess(clientIp, cleanIdentifier);

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

    // Set secure HTTP-only session cookie
    await setSessionCookie({
      userId: user._id.toString(),
      identifier: user.identifier,
      role: user.role,
      studentProfileId: user.studentProfileId?.toString(),
      name: displayName,
      permissions: user.permissions || {},
    });

    // Record login audit log
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
