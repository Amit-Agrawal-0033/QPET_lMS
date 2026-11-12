import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession, clearSessionCookie, SessionPayload } from "./session";
import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/models/User";

/**
 * Validates request Origin/Referer to protect against Cross-Site Request Forgery (CSRF).
 */
export function validateCSRF(req: NextRequest): { valid: boolean; response?: NextResponse } {
  const method = req.method.toUpperCase();
  // Safe idempotent methods
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return { valid: true };
  }

  const origin = req.headers.get("origin");
  const host = req.headers.get("host");

  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host && !originHost.includes("localhost") && !originHost.includes("127.0.0.1")) {
        return {
          valid: false,
          response: NextResponse.json(
            { error: "Forbidden: CSRF verification failed. Untrusted request origin." },
            { status: 403 }
          ),
        };
      }
    } catch {
      return {
        valid: false,
        response: NextResponse.json(
          { error: "Forbidden: Malformed Origin header." },
          { status: 403 }
        ),
      };
    }
  }

  return { valid: true };
}

/**
 * Base authentication guard: Validates session JWT AND database active status.
 * If user has been deactivated or deleted by Admin, access is revoked immediately.
 */
export async function requireAuth(req?: NextRequest): Promise<
  { session: SessionPayload; response?: undefined } | { session?: undefined; response: NextResponse }
> {
  if (req) {
    const csrf = validateCSRF(req);
    if (!csrf.valid && csrf.response) {
      return { response: csrf.response };
    }
  }

  const session = await getCurrentSession();
  if (!session) {
    return {
      response: NextResponse.json({ error: "Unauthorized: Please log in." }, { status: 401 }),
    };
  }

  try {
    await connectDB();
    const user = await User.findById(session.userId).select("status role").lean();
    if (!user) {
      await clearSessionCookie();
      return {
        response: NextResponse.json({ error: "Unauthorized: Account no longer exists." }, { status: 401 }),
      };
    }

    if (user.status === "inactive" || (user.status as string) === "suspended") {
      await clearSessionCookie();
      return {
        response: NextResponse.json(
          { error: "Forbidden: Your account has been deactivated. Please contact administration." },
          { status: 403 }
        ),
      };
    }

    // Keep session payload role in sync with actual database role
    if (user.role && user.role !== session.role) {
      session.role = user.role;
    }
  } catch (err) {
    // If transient DB check fails, rely on verified JWT
  }

  return { session };
}

/**
 * Enforces Administrator-only access.
 */
export async function requireAdmin(req?: NextRequest): Promise<
  { session: SessionPayload; response?: undefined } | { session?: undefined; response: NextResponse }
> {
  const { session, response } = await requireAuth(req);
  if (response) return { response };

  if (session.role !== "admin") {
    return {
      response: NextResponse.json(
        { error: "Forbidden: Administrator access required." },
        { status: 403 }
      ),
    };
  }
  return { session };
}

/**
 * Enforces Trainer-only access.
 */
export async function requireTrainer(req?: NextRequest): Promise<
  { session: SessionPayload; response?: undefined } | { session?: undefined; response: NextResponse }
> {
  const { session, response } = await requireAuth(req);
  if (response) return { response };

  if (session.role !== "trainer") {
    return {
      response: NextResponse.json(
        { error: "Forbidden: Trainer access required." },
        { status: 403 }
      ),
    };
  }
  return { session };
}

/**
 * Enforces Admin or authorized Trainer access based on module permission.
 * STRICT ENFORCEMENT: Trainers are completely prohibited from performing DELETE or viewing audit trails.
 */
export async function requireAdminOrTrainer(
  permissionKey?: string,
  req?: NextRequest
): Promise<
  { session: SessionPayload; response?: undefined } | { session?: undefined; response: NextResponse }
> {
  const { session, response } = await requireAuth(req);
  if (response) return { response };

  if (session.role === "admin") {
    return { session };
  }

  if (session.role === "trainer") {
    // Block any DELETE request from Trainers unconditionally
    if (req && req.method.toUpperCase() === "DELETE") {
      return {
        response: NextResponse.json(
          {
            error:
              "Forbidden: Trainer accounts are strictly prohibited from deleting records. Administrator privileges required.",
          },
          { status: 403 }
        ),
      };
    }

    // Block any delete-related permission request for trainers
    if (
      permissionKey &&
      (permissionKey.toLowerCase().startsWith("delete") ||
        permissionKey.toLowerCase().includes("delete"))
    ) {
      return {
        response: NextResponse.json(
          {
            error:
              "Forbidden: Trainer accounts are strictly prohibited from deleting records. Administrator privileges required.",
          },
          { status: 403 }
        ),
      };
    }

    // Block audit log access for trainers
    if (permissionKey && permissionKey.toLowerCase().includes("audit")) {
      return {
        response: NextResponse.json(
          {
            error:
              "Forbidden: Security Audit Logs are strictly restricted to Administrators.",
          },
          { status: 403 }
        ),
      };
    }

    // Real-time database verification ensures immediate enforcement upon permission revocation
    const { verifyTrainerPermissionRealtime } = await import("./authorization");
    const check = await verifyTrainerPermissionRealtime(session.userId, permissionKey);

    if (!check.authorized) {
      return {
        response: NextResponse.json(
          { error: check.error || `Forbidden: Missing required permission (${permissionKey}).` },
          { status: 403 }
        ),
      };
    }

    // Attach fresh permissions to session
    session.permissions = check.permissions || session.permissions;
    return { session };
  }

  return {
    response: NextResponse.json(
      { error: "Forbidden: Administrative or Trainer clearance required." },
      { status: 403 }
    ),
  };
}

/**
 * Enforces Student-only access.
 */
export async function requireStudent(req?: NextRequest): Promise<
  { session: SessionPayload; response?: undefined } | { session?: undefined; response: NextResponse }
> {
  const { session, response } = await requireAuth(req);
  if (response) return { response };

  if (session.role !== "student") {
    return {
      response: NextResponse.json(
        { error: "Forbidden: Student access required." },
        { status: 403 }
      ),
    };
  }
  return { session };
}
