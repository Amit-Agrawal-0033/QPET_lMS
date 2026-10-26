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
        { error: "Forbidden: Admin access required." },
        { status: 403 }
      ),
    };
  }
  return { session };
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
