import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "qpet_fallback_default_secret_key_32bytes_long!";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
const COOKIE_NAME = "qpet_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. ADMIN ROUTES (/admin/*) - STRICTLY ADMIN ONLY
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

      // If user is a trainer, strictly redirect to trainer dashboard
      if (role === "trainer") {
        return NextResponse.redirect(new URL("/trainer/dashboard", request.url));
      }

      // If user is a student, redirect to student dashboard
      if (role === "student") {
        return NextResponse.redirect(new URL("/student/dashboard", request.url));
      }

      // Only admin can access /admin
      if (role !== "admin") {
        return NextResponse.redirect(new URL("/login?error=admin_required", request.url));
      }

      // Direct /admin or /admin/ to /admin/dashboard
      if (pathname === "/admin" || pathname === "/admin/") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login?error=invalid_session", request.url));
    }
  }

  // 2. TRAINER ROUTES (/trainer/*) - TRAINER & ADMIN
  if (pathname.startsWith("/trainer")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const role = payload.role as string;

      // If student, redirect to student dashboard
      if (role === "student") {
        return NextResponse.redirect(new URL("/student/dashboard", request.url));
      }

      // Only trainer and admin can access trainer portal
      if (role !== "trainer" && role !== "admin") {
        return NextResponse.redirect(new URL("/login?error=trainer_required", request.url));
      }

      // Direct /trainer or /trainer/ to /trainer/dashboard
      if (pathname === "/trainer" || pathname === "/trainer/") {
        return NextResponse.redirect(new URL("/trainer/dashboard", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login?error=invalid_session", request.url));
    }
  }

  // 3. STUDENT ROUTES (/student/*) - STUDENT ONLY
  if (pathname.startsWith("/student")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const role = payload.role as string;

      // If admin, redirect to admin dashboard
      if (role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }

      // If trainer, redirect to trainer dashboard
      if (role === "trainer") {
        return NextResponse.redirect(new URL("/trainer/dashboard", request.url));
      }

      if (role !== "student") {
        return NextResponse.redirect(new URL("/login?error=student_required", request.url));
      }

      // Direct /student or /student/ to /student/dashboard
      if (pathname === "/student" || pathname === "/student/") {
        return NextResponse.redirect(new URL("/student/dashboard", request.url));
      }
    } catch {
      return NextResponse.redirect(new URL("/login?error=invalid_session", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/trainer/:path*", "/student/:path*"],
};
