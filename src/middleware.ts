import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "qpet_fallback_default_secret_key_32bytes_long!";
const SECRET_KEY = new TextEncoder().encode(JWT_SECRET);
const COOKIE_NAME = "qpet_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get(COOKIE_NAME)?.value;
    if (!token) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      if (payload.role !== "admin") {
        return NextResponse.redirect(new URL("/login?error=admin_required", request.url));
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
