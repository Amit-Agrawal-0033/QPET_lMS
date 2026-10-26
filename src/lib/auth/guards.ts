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
    if (permissionKey && !session.permissions?.[permissionKey]) {
      return {
        response: NextResponse.json(
          { error: `Forbidden: You do not have permission (${permissionKey}) to perform this action or view this section.` },
          { status: 403 }
        ),
      };
    }
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
