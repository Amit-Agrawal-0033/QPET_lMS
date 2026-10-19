import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";
import { connectDB } from "@/lib/db/mongoose";
import { StudentProfile } from "@/lib/models/StudentProfile";
import { User } from "@/lib/models/User";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  await connectDB();
  let profile = null;

  if (session.studentProfileId) {
    profile = await StudentProfile.findById(session.studentProfileId).populate("preferredCourseId");
  }

  const user = await User.findById(session.userId).select("-passwordHash");

  return NextResponse.json({
    authenticated: true,
    user: {
      id: session.userId,
      identifier: session.identifier,
      role: session.role,
      name: session.name,
      status: user?.status,
    },
    studentProfile: profile,
  });
}
