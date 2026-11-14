import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RegisterForm, { CourseOption } from "./RegisterForm";
import { connectDB } from "@/lib/db/mongoose";
import { Course } from "@/lib/models/Course";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getAvailableCourses(): Promise<CourseOption[]> {
  try {
    await connectDB();
    const courses = await Course.find({ isActive: true })
      .select("_id code title durationMonths durationText defaultFee")
      .sort({ durationMonths: 1 })
      .lean();

    return courses.map((c: any) => ({
      _id: c._id.toString(),
      code: c.code,
      title: c.title,
      durationMonths: c.durationMonths || 1,
      durationText: c.durationText || `${c.durationMonths || 1} Months`,
      defaultFee: c.defaultFee || 0,
    }));
  } catch (err) {
    console.error("Failed to load courses on register page SSR:", err);
    return [];
  }
}

export default async function RegisterPage() {
  const initialCourses = await getAvailableCourses();

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F8FF] text-[#173B70] relative overflow-x-hidden selection:bg-[#3978E8] selection:text-white">
      {/* Subtle Academic Ambient Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-[radial-gradient(ellipse_at_top,_rgba(57,120,232,0.08)_0%,_transparent_70%)]" />
        <div className="absolute top-[25%] left-[-5%] w-[500px] h-[500px] bg-[radial-gradient(circle,_rgba(22,168,154,0.06)_0%,_transparent_65%)] blur-3xl" />
        <div className="absolute bottom-[10%] right-[-5%] w-[550px] h-[550px] bg-[radial-gradient(circle,_rgba(118,84,214,0.05)_0%,_transparent_65%)] blur-3xl" />
      </div>

      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative z-10">
        <Suspense fallback={<div className="text-[#173B70] font-bold text-sm">Loading registration form...</div>}>
          <RegisterForm initialCourses={initialCourses} />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
