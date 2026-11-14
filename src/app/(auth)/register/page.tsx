import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RegisterForm, { CourseOption } from "./RegisterForm";
import { connectDB } from "@/lib/db/mongoose";
import { Course } from "@/lib/models/Course";
import {
  ShieldCheck,
  CheckCircle2,
  Phone,
  Mail,
  GraduationCap,
  Sparkles,
  Award,
  BookOpen,
} from "lucide-react";

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

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: Academic Overview & Institutional Benefits (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6 text-left pt-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#16A89A]/10 text-[#16A89A] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Admissions 2026-2027</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-[#173B70] tracking-tight leading-tight">
              Begin Your Professional IT Journey at{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173B70] via-[#3978E8] to-[#7654D6]">
                QPET Institute
              </span>
            </h1>

            <p className="text-sm text-[#173B70]/80 leading-relaxed font-normal">
              Join thousands of certified alumni. Submit your direct self-registration application to receive course enrollment, practical lab allocation, and official student portal access.
            </p>

            {/* Academic Highlights List */}
            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/80 border border-[#3978E8]/15 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#16A89A]/15 text-[#16A89A] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#173B70]">ISO 9001:2015 Certified Curriculum</h4>
                  <p className="text-[11px] text-[#173B70]/70 mt-0.5 leading-relaxed">
                    Nationally recognized industry-standard syllabi and practical software modules.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/80 border border-[#3978E8]/15 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#3978E8]/15 text-[#3978E8] flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#173B70]">Tamper-Proof QR Certification</h4>
                  <p className="text-[11px] text-[#173B70]/70 mt-0.5 leading-relaxed">
                    Cryptographically verifiable certificates accepted by top employers and institutions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-white/80 border border-[#3978E8]/15 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[#7654D6]/15 text-[#7654D6] flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#173B70]">Flexible Installment Plans</h4>
                  <p className="text-[11px] text-[#173B70]/70 mt-0.5 leading-relaxed">
                    Affordable fee structures with instant vector PDF receipts and automated reminders.
                  </p>
                </div>
              </div>
            </div>

            {/* Admissions Help Desk Support */}
            <div className="p-4 rounded-2xl bg-[#173B70] text-white space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-200">
                Admissions Help Desk
              </span>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <a href="tel:18002021511" className="flex items-center gap-1.5 hover:text-[#16A89A] transition-colors">
                  <Phone className="w-3.5 h-3.5 text-[#16A89A]" />
                  <span className="font-mono font-bold">18002021511</span>
                </a>
                <a href="mailto:info@qpet.in" className="flex items-center gap-1.5 hover:text-[#16A89A] transition-colors">
                  <Mail className="w-3.5 h-3.5 text-[#16A89A]" />
                  <span>info@qpet.in</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Registration Form Card (7 cols on lg) */}
          <div className="lg:col-span-7 flex justify-center">
            <Suspense fallback={<div className="text-[#173B70] font-bold text-sm">Loading registration form...</div>}>
              <RegisterForm initialCourses={initialCourses} />
            </Suspense>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
