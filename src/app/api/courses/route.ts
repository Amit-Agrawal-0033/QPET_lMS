import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db/mongoose";
import { Course } from "@/lib/models/Course";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await connectDB();
    const courses = await Course.find({ isActive: true })
      .select("_id code title description durationValue durationUnit durationMonths durationText defaultFee isActive")
      .sort({ durationMonths: 1 })
      .lean();

    return NextResponse.json(
      { success: true, count: courses.length, courses },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch courses." },
      { status: 500 }
    );
  }
}
