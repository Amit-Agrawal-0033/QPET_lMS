import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "qpet_fallback_default_secret_key_32bytes_long!";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
const COOKIE_NAME = "qpet_session";

// Map admin dashboard paths to required trainer permissions
const PATH_PERMISSION_MAP: Record<string, string> = {
  "/admin/students": "viewStudents",
  "/admin/registrations": "viewRegistrations",
  "/admin/courses": "viewCourses",
  "/admin/enrollments": "viewEnrollments",
  "/admin/fees": "viewFees",
  "/admin/receipts": "viewReceipts",
  "/admin/certificates": "viewCertificates",
  "/admin/reports": "viewReports",
  "/admin/audit-logs": "viewAuditReports",
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin & staff routes
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const role = payload.role as string;
      const permissions = (payload.permissions as Record<string, boolean>) || {};

      // Only admin and trainer can enter /admin
      if (role !== "admin" && role !== "trainer") {
        return NextResponse.redirect(new URL("/login?error=staff_required", request.url));
      }

      // If user is a trainer, enforce module-level permissions
      if (role === "trainer") {
        // Trainer management is strictly Admin-only
        if (pathname.startsWith("/admin/trainers")) {
          return NextResponse.redirect(new URL("/admin/dashboard?error=admin_only", request.url));
        }

        // Check path permission map
        for (const [routePrefix, requiredPerm] of Object.entries(PATH_PERMISSION_MAP)) {
          if (pathname.startsWith(routePrefix)) {
            if (!permissions[requiredPerm]) {
              return NextResponse.redirect(
                new URL("/admin/dashboard?error=permission_denied", request.url)
              );
            }
          }
        }
      }
    } catch {
      return NextResponse.redirect(new URL("/login?error=invalid_session", request.url));
    }
  }

  // Protect student routes
  if (pathname.startsWith("/student")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      if (payload.role !== "student") {
        return NextResponse.redirect(new URL("/login?error=student_required", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login?error=invalid_session", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*"],
};
