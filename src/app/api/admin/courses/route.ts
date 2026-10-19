import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";
import { Course } from "@/lib/models/Course";
import { Enrollment } from "@/lib/models/Enrollment";

export async function GET() {
  try {
    await connectDB();
    const courses = await Course.find().sort({ title: 1 }).lean();

    // Attach student enrollment count to each course
    const coursesWithCounts = await Promise.all(
      courses.map(async (course) => {
        const enrolledCount = await Enrollment.countDocuments({
          courseId: course._id,
          enrollmentStatus: { $ne: "cancelled" },
        });
        return {
          ...course,
          enrolledCount,
        };
      })
    );

    return NextResponse.json({ success: true, courses: coursesWithCounts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to fetch courses." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  try {
    await connectDB();
    const body = await req.json();
    const { code, title, description, durationMonths, defaultFee, isActive } = body;

    if (!code || !title || durationMonths === undefined || defaultFee === undefined) {
      return NextResponse.json(
        { error: "Course Code, Title, Duration, and Default Fee are required." },
        { status: 400 }
      );
    }

    const cleanCode = String(code).trim().toUpperCase();
    const existing = await Course.findOne({ code: cleanCode });
    if (existing) {
      return NextResponse.json({ error: "Course code already exists." }, { status: 409 });
    }

    const durationNum = Number(durationMonths);
    const feeNum = Number(defaultFee);

    if (durationNum <= 0 || feeNum < 0) {
      return NextResponse.json(
        { error: "Duration must be > 0 and Default Fee cannot be negative." },
        { status: 400 }
      );
    }

    const course = new Course({
      code: cleanCode,
      title: title.trim(),
      description: description?.trim() || "",
      durationMonths: durationNum,
      durationText: `${durationNum} ${durationNum === 1 ? "Month" : "Months"}`,
      defaultFee: feeNum,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    await course.save();

    return NextResponse.json({ success: true, course }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create course." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  try {
    await connectDB();
    const body = await req.json();
    const { id, title, description, durationMonths, defaultFee, isActive } = body;

    if (!id) {
      return NextResponse.json({ error: "Course ID is required." }, { status: 400 });
    }

    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    if (title) course.title = title.trim();
    if (description !== undefined) course.description = description.trim();
    if (durationMonths !== undefined) {
      const dur = Number(durationMonths);
      course.durationMonths = dur;
      course.durationText = `${dur} ${dur === 1 ? "Month" : "Months"}`;
    }
    if (defaultFee !== undefined) course.defaultFee = Number(defaultFee);
    if (isActive !== undefined) course.isActive = Boolean(isActive);

    await course.save();

    return NextResponse.json({ success: true, course });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update course." }, { status: 500 });
  }
}
