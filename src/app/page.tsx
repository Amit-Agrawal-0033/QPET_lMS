import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShieldCheck,
  FileText,
  CreditCard,
  Award,
  ArrowRight,
  BookOpen,
  Search,
  Sparkles,
  ChevronRight,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";
import { connectDB } from "@/lib/db/mongoose";
import { Course } from "@/lib/models/Course";

async function getFeaturedCourses() {
  try {
    await connectDB();
    const courses = await Course.find({ isActive: true }).sort({ durationMonths: 1 }).lean();
    return courses;
  } catch (err) {
    console.error("Failed to load courses on landing:", err);
    return [];
  }
}

export default async function HomePage() {
  const courses = await getFeaturedCourses();

  return (
    <div className="min-h-screen flex flex-col bg-[#CBB3E6] text-[#1E0B36] relative overflow-x-hidden selection:bg-[#E34234] selection:text-white">
      {/* Dynamic 3D Floating Animation Styles */}
      <style>{`
        @keyframes floatSlow1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-22px) rotate(4deg); }
        }
        @keyframes floatSlow2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(24px) rotate(-6deg); }
        }
        @keyframes floatSlow3 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-16px) translateX(12px); }
        }
        .anim-float-1 { animation: floatSlow1 7s ease-in-out infinite; }
        .anim-float-2 { animation: floatSlow2 9s ease-in-out infinite; }
        .anim-float-3 { animation: floatSlow3 8s ease-in-out infinite; }
      `}</style>

      {/* Global Volumetric Background Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[700px] bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.7)_0%,_transparent_70%)]" />
        <div className="absolute top-[15%] right-[-5%] w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(212,255,63,0.35)_0%,_transparent_65%)] blur-2xl" />
        <div className="absolute top-[35%] left-[-10%] w-[700px] h-[700px] bg-[radial-gradient(circle,_rgba(59,7,100,0.28)_0%,_transparent_65%)] blur-2xl" />
        <div className="absolute bottom-[20%] right-[10%] w-[550px] h-[550px] bg-[radial-gradient(circle,_rgba(227,66,52,0.25)_0%,_transparent_65%)] blur-2xl" />
      </div>

      {/* ========================================================================= */}
      {/* 3D FLOATING ABSTRACT ELEMENTS (Volumetric Spheres, Curves & Fluid Blobs) */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* 1. Large 3D Bright Chartreuse Green Sphere (#D4FF3F) - Top Right */}
        <div className="absolute top-20 right-[4%] md:right-[10%] anim-float-1 hidden sm:block">
          <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full shadow-[0_35px_65px_-12px_rgba(85,115,5,0.55)]">
            <div
              className="w-full h-full rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 34% 28%, #FFFFFF 0%, #F1FFA8 18%, #D4FF3F 45%, #8EB605 76%, #455C02 100%)",
                boxShadow:
                  "inset -14px -16px 28px rgba(0,0,0,0.38), inset 8px 10px 18px rgba(255,255,255,0.9)",
              }}
            />
            {/* Specular 3D Glint */}
            <div className="absolute top-5 left-8 w-12 h-6 rounded-full bg-white/75 blur-[2px] rotate-[-28deg]" />
          </div>
        </div>

        {/* 2. 3D Abstract Fluid Shape in Deep Purple - Top Left */}
        <div className="absolute top-32 left-[-4%] md:left-[3%] anim-float-2 hidden md:block">
          <svg
            viewBox="0 0 200 200"
            className="w-48 h-48 md:w-64 md:h-64 filter drop-shadow-[0_35px_50px_rgba(46,16,101,0.45)]"
          >
            <defs>
              <radialGradient id="deepPurpleFluid" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#E9D5FF" />
                <stop offset="22%" stopColor="#A855F7" />
                <stop offset="55%" stopColor="#581C87" />
                <stop offset="85%" stopColor="#3B0764" />
                <stop offset="100%" stopColor="#1C0530" />
              </radialGradient>
            </defs>
            <path
              d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.3,88.7,-0.7C87.4,14.8,82.3,29.6,73.8,42.4C65.3,55.2,53.4,66,39.8,73.1C26.1,80.2,10.7,83.5,-4.4,81.1C-19.5,78.6,-34.3,70.3,-46.8,61.4C-59.3,52.4,-69.6,42.8,-76.9,30.8C-84.2,18.8,-88.7,4.4,-86.6,-9.3C-84.5,-23,-75.8,-36,-65.3,-46.6C-54.8,-57.2,-42.6,-65.4,-29.6,-73.1C-16.5,-80.7,-2.6,-87.7,11,-84.9C24.7,-82.1,30.6,-83.6,44.7,-76.4Z"
              transform="translate(100 100)"
              fill="url(#deepPurpleFluid)"
            />
          </svg>
        </div>

        {/* 3. 3D Tomato Red Curved Ribbon (#E34234) - Right Flank */}
        <div className="absolute top-[52%] right-[-2%] md:right-[5%] anim-float-3 hidden lg:block">
          <svg
            viewBox="0 0 240 180"
            className="w-56 h-44 md:w-72 md:h-56 filter drop-shadow-[0_28px_45px_rgba(227,66,52,0.42)]"
          >
            <defs>
              <linearGradient id="tomatoRedCurve" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFA49C" />
                <stop offset="25%" stopColor="#FF6B5E" />
                <stop offset="55%" stopColor="#E34234" />
                <stop offset="85%" stopColor="#A8190E" />
                <stop offset="100%" stopColor="#5E0802" />
              </linearGradient>
            </defs>
            <path
              d="M25,145 C65,25 185,15 225,140 C190,165 135,55 75,135 Z"
              fill="url(#tomatoRedCurve)"
            />
          </svg>
        </div>

        {/* 4. Medium 3D Bright Chartreuse Sphere (#D4FF3F) - Mid-Left */}
        <div className="absolute top-[68%] left-[2%] md:left-[6%] anim-float-1 hidden md:block">
          <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full shadow-[0_25px_50px_-10px_rgba(85,115,5,0.48)]">
            <div
              className="w-full h-full rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 34% 28%, #FFFFFF 0%, #F1FFA8 18%, #D4FF3F 45%, #8EB605 76%, #455C02 100%)",
                boxShadow:
                  "inset -10px -12px 22px rgba(0,0,0,0.38), inset 6px 8px 14px rgba(255,255,255,0.9)",
              }}
            />
            <div className="absolute top-3 left-5 w-8 h-4 rounded-full bg-white/70 blur-[1px] rotate-[-28deg]" />
          </div>
        </div>

        {/* 5. 3D Tomato Red Sphere (#E34234) - Bottom Left */}
        <div className="absolute bottom-28 left-[12%] anim-float-2 hidden lg:block">
          <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full shadow-[0_25px_45px_-8px_rgba(227,66,52,0.5)]">
            <div
              className="w-full h-full rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 35% 28%, #FFFFFF 0%, #FFA8A0 18%, #E34234 50%, #9F160C 80%, #540601 100%)",
                boxShadow:
                  "inset -10px -12px 22px rgba(0,0,0,0.4), inset 6px 8px 14px rgba(255,255,255,0.85)",
              }}
            />
            <div className="absolute top-2.5 left-4 w-7 h-3.5 rounded-full bg-white/70 blur-[1px] rotate-[-28deg]" />
          </div>
        </div>

        {/* 6. Mini Floating Accent Sphere - Hero Center Right */}
        <div className="absolute top-[28%] left-[62%] anim-float-3 hidden sm:block">
          <div className="relative w-12 h-12 rounded-full shadow-[0_15px_30px_rgba(85,115,5,0.45)]">
            <div
              className="w-full h-full rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 34% 28%, #FFFFFF 0%, #D4FF3F 50%, #455C02 100%)",
              }}
            />
          </div>
        </div>
      </div>

      <Navbar />

      {/* ========================================================================= */}
      {/* HERO SECTION: Volumetric 3D Stage with Bold Typography & Glass Buttons   */}
      {/* ========================================================================= */}
      <section className="relative z-10 pt-16 pb-20 sm:pt-24 sm:pb-28 lg:pt-32 lg:pb-36 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          {/* 3D Glass Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-xl border border-white/80 text-[#3B0764] text-xs font-black uppercase tracking-widest shadow-[0_8px_20px_-4px_rgba(59,7,100,0.18)] mb-8 hover:scale-105 transition-transform cursor-default">
            <Sparkles className="w-4 h-4 text-[#E34234] animate-spin" style={{ animationDuration: "6s" }} />
            <span>Next-Gen Computer Education &amp; LMS</span>
            <span className="w-2 h-2 rounded-full bg-[#D4FF3F] border border-[#8EB605] shadow-[0_0_8px_#D4FF3F]" />
          </div>

          {/* Bold Clean Typography */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#1E0B36] leading-[1.1] max-w-5xl mx-auto drop-shadow-xs">
            Quality Professional Education &amp; Training{" "}
            <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-[#3B0764] via-[#581C87] to-[#E34234]">
              LMS Portal
            </span>
          </h1>

          {/* Descriptive Subtext */}
          <p className="mt-6 text-base sm:text-xl text-[#392154] font-medium max-w-3xl mx-auto leading-relaxed drop-shadow-xs">
            Comprehensive institutional management for student registrations, sequential enrollment tracking, installment fee receipts, and official certificate verification.
          </p>

          {/* ===================================================================== */}
          {/* THREE MODERN 3D GLASSMORPHIIC BUTTONS WITH DEPTH                      */}
          {/* ===================================================================== */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5 sm:gap-6 max-w-4xl mx-auto">
            {/* Button 1: Student Self-Registration (White 3D Glass with Chartreuse Accent) */}
            <Link
              href="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-extrabold text-[#1E0B36] bg-white/90 hover:bg-white backdrop-blur-2xl border-2 border-white/90 shadow-[0_16px_36px_-6px_rgba(59,7,100,0.25),inset_0_2px_4px_rgba(255,255,255,1),inset_0_-4px_0_rgba(0,0,0,0.12)] hover:-translate-y-1.5 hover:shadow-[0_24px_45px_-6px_rgba(59,7,100,0.35),inset_0_2px_6px_rgba(255,255,255,1)] active:translate-y-1 active:shadow-[0_8px_18px_-4px_rgba(59,7,100,0.2)] transition-all flex items-center justify-center gap-3 group"
            >
              <span>Student Self-Registration</span>
              <div className="w-7 h-7 rounded-full bg-[#D4FF3F] text-[#1E0B36] flex items-center justify-center shadow-sm group-hover:translate-x-1 transition-transform border border-[#8EB605]">
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </div>
            </Link>

            {/* Button 2: Portal Login (Deep Purple 3D Glass with Glint) */}
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-extrabold text-white bg-gradient-to-b from-[#4C1D95] to-[#3B0764] hover:from-[#581C87] hover:to-[#4C1D95] backdrop-blur-2xl border-2 border-purple-300/40 shadow-[0_16px_36px_-6px_rgba(59,7,100,0.45),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-4px_0_rgba(0,0,0,0.35)] hover:-translate-y-1.5 hover:shadow-[0_24px_45px_-6px_rgba(59,7,100,0.6)] active:translate-y-1 active:shadow-[0_8px_18px_-4px_rgba(59,7,100,0.3)] transition-all flex items-center justify-center gap-2.5 group"
            >
              <span>Portal Login</span>
              <ChevronRight className="w-4 h-4 text-purple-200 group-hover:translate-x-1 transition-transform stroke-[2.5]" />
            </Link>

            {/* Button 3: Verify Certificate (Translucent 3D Glass with Tomato Red Accent) */}
            <Link
              href="/verify-certificate"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl text-sm font-extrabold text-[#1E0B36] bg-white/60 hover:bg-white/80 backdrop-blur-2xl border-2 border-white/80 shadow-[0_16px_36px_-6px_rgba(227,66,52,0.2),inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-4px_0_rgba(227,66,52,0.18)] hover:-translate-y-1.5 hover:shadow-[0_24px_45px_-6px_rgba(227,66,52,0.3)] active:translate-y-1 active:shadow-[0_8px_18px_-4px_rgba(227,66,52,0.15)] transition-all flex items-center justify-center gap-2.5 group"
            >
              <ShieldCheck className="w-5 h-5 text-[#E34234] stroke-[2.5]" />
              <span>Verify Certificate</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3D FLOATING GLASSMORPHIIC FEATURE CARDS WITH REALISTIC SHADOWS            */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Card 1: Sequential Numbering (Chartreuse 3D Accent) */}
            <div className="relative p-7 rounded-3xl bg-white/65 hover:bg-white/85 backdrop-blur-2xl border-2 border-white/80 shadow-[0_24px_50px_-12px_rgba(59,7,100,0.18),inset_0_2px_4px_rgba(255,255,255,1)] hover:-translate-y-2 hover:shadow-[0_32px_65px_-10px_rgba(59,7,100,0.28)] transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#F1FFA8] to-[#D4FF3F] border border-white shadow-[0_12px_24px_rgba(142,182,5,0.45)] flex items-center justify-center text-[#1E0B36] mb-5 group-hover:scale-110 transition-transform">
                <FileText className="w-7 h-7 stroke-[2.2]" />
              </div>
              <h3 className="font-extrabold text-[#1E0B36] text-lg mb-2">
                Sequential Numbering
              </h3>
              <p className="text-xs text-[#402C5E] font-medium leading-relaxed">
                Unique QPET-YYYY-NNNNN counter generated atomically per calendar year with zero collision risk.
              </p>
              <div className="mt-4 pt-4 border-t border-purple-200/50 flex items-center text-[11px] font-bold text-[#3B0764]">
                <span>Atomic Counter Service</span>
              </div>
            </div>

            {/* Card 2: Fees & Installments (Tomato Red 3D Accent) */}
            <div className="relative p-7 rounded-3xl bg-white/65 hover:bg-white/85 backdrop-blur-2xl border-2 border-white/80 shadow-[0_24px_50px_-12px_rgba(59,7,100,0.18),inset_0_2px_4px_rgba(255,255,255,1)] hover:-translate-y-2 hover:shadow-[0_32px_65px_-10px_rgba(59,7,100,0.28)] transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFA8A0] to-[#E34234] border border-white shadow-[0_12px_24px_rgba(227,66,52,0.45)] flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform">
                <CreditCard className="w-7 h-7 stroke-[2.2]" />
              </div>
              <h3 className="font-extrabold text-[#1E0B36] text-lg mb-2">
                Fees &amp; Installments
              </h3>
              <p className="text-xs text-[#402C5E] font-medium leading-relaxed">
                Full or installment schedules with instant vector PDF receipts and real-time live balance audits.
              </p>
              <div className="mt-4 pt-4 border-t border-purple-200/50 flex items-center text-[11px] font-bold text-[#E34234]">
                <span>Automated Ledger Engine</span>
              </div>
            </div>

            {/* Card 3: Issued Certificates (Deep Purple 3D Accent) */}
            <div className="relative p-7 rounded-3xl bg-white/65 hover:bg-white/85 backdrop-blur-2xl border-2 border-white/80 shadow-[0_24px_50px_-12px_rgba(59,7,100,0.18),inset_0_2px_4px_rgba(255,255,255,1)] hover:-translate-y-2 hover:shadow-[0_32px_65px_-10px_rgba(59,7,100,0.28)] transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#A855F7] to-[#3B0764] border border-white shadow-[0_12px_24px_rgba(59,7,100,0.45)] flex items-center justify-center text-white mb-5 group-hover:scale-110 transition-transform">
                <Award className="w-7 h-7 stroke-[2.2]" />
              </div>
              <h3 className="font-extrabold text-[#1E0B36] text-lg mb-2">
                Issued Certificates
              </h3>
              <p className="text-xs text-[#402C5E] font-medium leading-relaxed">
                Admin-authorized completion certificates with scannable tamper-proof QR verification hashes.
              </p>
              <div className="mt-4 pt-4 border-t border-purple-200/50 flex items-center text-[11px] font-bold text-[#3B0764]">
                <span>Vector PDF &amp; QR Codes</span>
              </div>
            </div>

            {/* Card 4: Public Verification (Crystal Clear Glass with Seal) */}
            <div className="relative p-7 rounded-3xl bg-white/65 hover:bg-white/85 backdrop-blur-2xl border-2 border-white/80 shadow-[0_24px_50px_-12px_rgba(59,7,100,0.18),inset_0_2px_4px_rgba(255,255,255,1)] hover:-translate-y-2 hover:shadow-[0_32px_65px_-10px_rgba(59,7,100,0.28)] transition-all duration-300 group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFFFFF] to-[#E2E8F0] border border-white shadow-[0_12px_24px_rgba(30,11,54,0.18)] flex items-center justify-center text-[#1E0B36] mb-5 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-7 h-7 text-[#E34234] stroke-[2.2]" />
              </div>
              <h3 className="font-extrabold text-[#1E0B36] text-lg mb-2">
                Public Verification
              </h3>
              <p className="text-xs text-[#402C5E] font-medium leading-relaxed">
                Instant public lookup protecting student privacy while preventing forged credential misuse.
              </p>
              <div className="mt-4 pt-4 border-t border-purple-200/50 flex items-center text-[11px] font-bold text-[#1E0B36]">
                <span>Instant QR Scanner Page</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* COURSES CATALOG: Pastel Glass Cards with 3D Depth                         */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-white/80 text-[#3B0764] text-xs font-bold uppercase tracking-wider mb-3 shadow-xs">
                <BookOpen className="w-4 h-4 text-[#E34234]" />
                Industry-Recognized Curriculum
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#1E0B36] tracking-tight">
                Computer Courses Offered
              </h2>
              <p className="text-[#392154] text-sm sm:text-base font-medium mt-1">
                Practical, job-oriented computer training programs with structured syllabus and official certifications.
              </p>
            </div>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-extrabold text-white bg-[#3B0764] hover:bg-[#4C1D95] shadow-lg shadow-[#3B0764]/25 hover:-translate-y-0.5 transition-all group"
            >
              <span>Enroll in a Course</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {courses.length > 0 ? (
              courses.map((course: any) => (
                <div
                  key={course._id.toString()}
                  className="rounded-3xl bg-white/70 hover:bg-white/90 backdrop-blur-2xl border-2 border-white/90 p-7 flex flex-col justify-between shadow-[0_20px_45px_-10px_rgba(59,7,100,0.14),inset_0_2px_4px_rgba(255,255,255,1)] hover:-translate-y-2 hover:shadow-[0_28px_60px_-10px_rgba(59,7,100,0.22)] transition-all duration-300 group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-[#3B0764]/10 text-[#3B0764] font-extrabold border border-[#3B0764]/20">
                        {course.code}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-[#D4FF3F]/40 text-[#1E0B36] border border-[#8EB605]/40 text-xs font-black">
                        {course.durationText || `${course.durationMonths} Months`}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-[#1E0B36] group-hover:text-[#581C87] transition-colors leading-snug">
                      {course.title}
                    </h3>

                    <p className="text-xs text-[#402C5E] leading-relaxed line-clamp-3 font-medium">
                      {course.description || "Comprehensive hands-on computer training, practical lab work, and professional certification."}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-purple-200/50 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#58337A] uppercase font-bold tracking-wider block">
                        Course Tuition Fee
                      </span>
                      <span className="text-xl font-black text-[#1E0B36]">
                        ₹{course.defaultFee.toLocaleString("en-IN")}
                      </span>
                    </div>
                    
                    <Link
                      href={`/register?course=${course._id.toString()}`}
                      className="px-4 py-2 rounded-xl text-xs font-black text-[#1E0B36] bg-[#D4FF3F] hover:bg-[#c2f026] border border-[#8EB605] shadow-sm hover:scale-105 active:scale-95 transition-all"
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-16 text-[#402C5E] text-sm bg-white/40 rounded-3xl backdrop-blur-md">
                Loading QPET courses catalog...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3D CERTIFICATE VERIFICATION BANNER                                        */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-white/80 via-white/70 to-white/90 backdrop-blur-2xl border-2 border-white p-8 sm:p-12 text-center shadow-[0_28px_60px_-15px_rgba(59,7,100,0.25),inset_0_2px_4px_rgba(255,255,255,1)] relative overflow-hidden">
          {/* Subtle Ambient Accent Sphere */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#D4FF3F]/30 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[#E34234]/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#FFA8A0] to-[#E34234] text-white shadow-lg shadow-[#E34234]/35 mx-auto">
              <ShieldCheck className="w-8 h-8 stroke-[2.2]" />
            </div>

            <h2 className="text-2xl sm:text-4xl font-black text-[#1E0B36] tracking-tight">
              Need to Verify a Student's Certificate?
            </h2>

            <p className="text-sm sm:text-base text-[#402C5E] font-medium leading-relaxed">
              Employers, recruiters, and educational institutions can verify the authenticity of certificates issued by QPET instantly using our tamper-proof QR code lookup.
            </p>

            <div className="pt-4">
              <Link
                href="/verify-certificate"
                className="inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-sm font-black text-white bg-[#3B0764] hover:bg-[#4C1D95] border border-purple-300/30 shadow-[0_16px_32px_-6px_rgba(59,7,100,0.45)] hover:-translate-y-1 transition-all"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
                <span>Open Public Verification Page</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
