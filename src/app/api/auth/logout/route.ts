import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession, clearSessionCookie } from "@/lib/auth/session";
import { logAudit } from "@/lib/services/audit.service";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    if (session) {
      const clientIp =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "127.0.0.1";

      await logAudit({
        action: "USER_LOGGED_OUT",
        performedBy: session.name || session.identifier,
        performedByRole: session.role,
        targetType: "AUTH",
        targetId: session.userId,
        details: {
          identifier: session.identifier,
          role: session.role,
        },
        ipAddress: clientIp,
      });
    }

    await clearSessionCookie();
    return NextResponse.json({ success: true, message: "Logged out successfully" });
  } catch {
    await clearSessionCookie();
    return NextResponse.json({ success: true, message: "Logged out successfully" });
  }
}
