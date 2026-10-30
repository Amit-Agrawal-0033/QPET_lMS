import { NextResponse } from "next/server";
import { getCurrentSession, SessionPayload } from "./session";

export async function requireAuth(): Promise<
  { session: SessionPayload; response?: undefined } | { session?: undefined; response: NextResponse }
> {
  const session = await getCurrentSession();
  if (!session) {
    return {
      response: NextResponse.json({ error: "Unauthorized: Please log in." }, { status: 401 }),
    };
  }
  return { session };
}

export async function requireAdmin(): Promise<
  { session: SessionPayload; response?: undefined } | { session?: undefined; response: NextResponse }
> {
  const { session, response } = await requireAuth();
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

export async function requireTrainer(): Promise<
  { session: SessionPayload; response?: undefined } | { session?: undefined; response: NextResponse }
> {
  const { session, response } = await requireAuth();
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

export async function requireAdminOrTrainer(permissionKey?: string): Promise<
  { session: SessionPayload; response?: undefined } | { session?: undefined; response: NextResponse }
> {
  const { session, response } = await requireAuth();
  if (response) return { response };

  if (session.role === "admin") {
    return { session };
  }

  if (session.role === "trainer") {
    // If request attempts a delete action, immediately deny for trainers!
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

    // If request attempts audit log access, immediately deny for trainers!
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

export async function requireStudent(): Promise<
  { session: SessionPayload; response?: undefined } | { session?: undefined; response: NextResponse }
> {
  const { session, response } = await requireAuth();
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
