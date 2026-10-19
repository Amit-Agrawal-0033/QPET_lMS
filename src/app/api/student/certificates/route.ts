import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";
import { Certificate } from "@/lib/models/Certificate";
import { Enrollment } from "@/lib/models/Enrollment";

export async function GET() {
  const { session, response } = await requireStudent();
  if (response) return response;

  try {
    await connectDB();
    const studentId = session.studentProfileId;

    const [certificates, enrollments] = await Promise.all([
      Certificate.find({ studentId }).sort({ issueDate: -1 }).lean(),
      Enrollment.find({ studentId }).lean(),
    ]);

    return NextResponse.json({
      success: true,
      certificates,
      enrollments,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch student certificates." },
      { status: 500 }
    );
  }
}
