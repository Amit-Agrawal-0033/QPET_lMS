import { NextRequest, NextResponse } from "next/server";
import { requireAdminOrTrainer, requireAdmin } from "@/lib/auth/guards";
import { connectDB } from "@/lib/db/mongoose";
import { Course } from "@/lib/models/Course";
import { Enrollment } from "@/lib/models/Enrollment";
import { logAudit } from "@/lib/services/audit.service";

export async function GET() {
  const { response } = await requireAdminOrTrainer("viewCourses");
  if (response) return response;

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
  const { session, response } = await requireAdminOrTrainer();
  if (response) return response;

  if (session.role === "trainer") {
    const canCreate = session.permissions?.createCourses || session.permissions?.editCourses;
    if (!canCreate) {
      return NextResponse.json(
        { error: "Forbidden: You do not have permission (createCourses) to add new courses." },
        { status: 403 }
      );
    }
  }

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

    await logAudit({
      action: "COURSE_CREATED",
      performedBy: session.name || session.identifier,
      performedByRole: session.role,
      targetType: "Course",
      targetId: course._id.toString(),
      details: { code: course.code, title: course.title, fee: course.defaultFee },
    });

    return NextResponse.json({ success: true, course }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create course." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const { session, response } = await requireAdminOrTrainer("editCourses");
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

    await logAudit({
      action: "COURSE_UPDATED",
      performedBy: session.name || session.identifier,
      performedByRole: session.role,
      targetType: "Course",
      targetId: course._id.toString(),
      details: { code: course.code, title: course.title },
    });

    return NextResponse.json({ success: true, course });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update course." }, { status: 500 });
  }
}

// STRICT REQUIREMENT: Only Administrators can delete courses. Trainers are strictly prohibited.
export async function DELETE(req: NextRequest) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  try {
    await connectDB();
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Course ID is required." }, { status: 400 });
    }

    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: "Course not found." }, { status: 404 });
    }

    await Course.findByIdAndDelete(id);

    await logAudit({
      action: "COURSE_DELETED",
      performedBy: session.name || session.identifier,
      performedByRole: "admin",
      targetType: "Course",
      targetId: id,
      details: { code: course.code, title: course.title },
    });

    return NextResponse.json({ success: true, message: "Course deleted successfully." });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete course." }, { status: 500 });
  }
}
