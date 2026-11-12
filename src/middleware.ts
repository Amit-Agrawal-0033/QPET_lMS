import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "qpet_fallback_default_secret_key_32bytes_long!";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
const COOKIE_NAME = "qpet_session";

function addSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  response.headers.set("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith("/api/");

  // =========================================================================
  // 1. ADMIN ROUTES (/admin/* & /api/admin/*) - STRICTLY ADMIN ONLY
  // =========================================================================
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      if (isApi) {
        return addSecurityHeaders(
          NextResponse.json({ error: "Unauthorized: Please log in." }, { status: 401 })
        );
      }
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return addSecurityHeaders(NextResponse.redirect(loginUrl));
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const role = payload.role as string;

      if (isApi) {
        if (role !== "admin") {
          return addSecurityHeaders(
            NextResponse.json({ error: "Forbidden: Administrator access required." }, { status: 403 })
          );
        }
        return addSecurityHeaders(NextResponse.next());
      }

      // Browser dashboard navigation:
      if (role === "trainer") {
        return addSecurityHeaders(NextResponse.redirect(new URL("/trainer/dashboard", request.url)));
      }

      if (role === "student") {
        return addSecurityHeaders(NextResponse.redirect(new URL("/student/dashboard", request.url)));
      }

      if (role !== "admin") {
        return addSecurityHeaders(NextResponse.redirect(new URL("/login?error=admin_required", request.url)));
      }

      if (pathname === "/admin" || pathname === "/admin/") {
        return addSecurityHeaders(NextResponse.redirect(new URL("/admin/dashboard", request.url)));
      }
    } catch {
      if (isApi) {
        return addSecurityHeaders(
          NextResponse.json({ error: "Unauthorized: Invalid or expired session." }, { status: 401 })
        );
      }
      return addSecurityHeaders(NextResponse.redirect(new URL("/login?error=invalid_session", request.url)));
    }
  }

  // =========================================================================
  // 2. TRAINER ROUTES (/trainer/* & /api/trainer/*) - TRAINER & ADMIN ONLY
  // =========================================================================
  if (pathname.startsWith("/trainer") || pathname.startsWith("/api/trainer")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      if (isApi) {
        return addSecurityHeaders(
          NextResponse.json({ error: "Unauthorized: Please log in." }, { status: 401 })
        );
      }
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return addSecurityHeaders(NextResponse.redirect(loginUrl));
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const role = payload.role as string;

      if (isApi) {
        if (role !== "trainer" && role !== "admin") {
          return addSecurityHeaders(
            NextResponse.json({ error: "Forbidden: Trainer or Admin access required." }, { status: 403 })
          );
        }
        return addSecurityHeaders(NextResponse.next());
      }

      // Browser dashboard navigation:
      if (role === "student") {
        return addSecurityHeaders(NextResponse.redirect(new URL("/student/dashboard", request.url)));
      }

      if (role !== "trainer" && role !== "admin") {
        return addSecurityHeaders(NextResponse.redirect(new URL("/login?error=trainer_required", request.url)));
      }

      if (pathname === "/trainer" || pathname === "/trainer/") {
        return addSecurityHeaders(NextResponse.redirect(new URL("/trainer/dashboard", request.url)));
      }
    } catch {
      if (isApi) {
        return addSecurityHeaders(
          NextResponse.json({ error: "Unauthorized: Invalid or expired session." }, { status: 401 })
        );
      }
      return addSecurityHeaders(NextResponse.redirect(new URL("/login?error=invalid_session", request.url)));
    }
  }

  // =========================================================================
  // 3. STUDENT ROUTES (/student/* & /api/student/*) - STUDENT ONLY
  // =========================================================================
  if (pathname.startsWith("/student") || pathname.startsWith("/api/student")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      if (isApi) {
        return addSecurityHeaders(
          NextResponse.json({ error: "Unauthorized: Please log in." }, { status: 401 })
        );
      }
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return addSecurityHeaders(NextResponse.redirect(loginUrl));
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const role = payload.role as string;

      if (isApi) {
        if (role !== "student") {
          return addSecurityHeaders(
            NextResponse.json({ error: "Forbidden: Student access required." }, { status: 403 })
          );
        }
        return addSecurityHeaders(NextResponse.next());
      }

      // Browser dashboard navigation:
      if (role === "admin") {
        return addSecurityHeaders(NextResponse.redirect(new URL("/admin/dashboard", request.url)));
      }

      if (role === "trainer") {
        return addSecurityHeaders(NextResponse.redirect(new URL("/trainer/dashboard", request.url)));
      }

      if (role !== "student") {
        return addSecurityHeaders(NextResponse.redirect(new URL("/login?error=student_required", request.url)));
      }

      if (pathname === "/student" || pathname === "/student/") {
        return addSecurityHeaders(NextResponse.redirect(new URL("/student/dashboard", request.url)));
      }
    } catch {
      if (isApi) {
        return addSecurityHeaders(
          NextResponse.json({ error: "Unauthorized: Invalid or expired session." }, { status: 401 })
        );
      }
      return addSecurityHeaders(NextResponse.redirect(new URL("/login?error=invalid_session", request.url)));
    }
  }

  return addSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/trainer/:path*",
    "/api/trainer/:path*",
    "/student/:path*",
    "/api/student/:path*",
  ],
};
