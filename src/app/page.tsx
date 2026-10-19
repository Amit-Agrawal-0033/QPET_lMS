import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  GraduationCap,
  ShieldCheck,
  FileText,
  CreditCard,
  Award,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Users,
  Search,
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
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-semibold tracking-wide uppercase">
              <GraduationCap className="w-4 h-4 text-teal-400" />
              Empowering Students with Computer Education
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
              Quality Professional Education & Training{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
                LMS Portal
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Comprehensive institutional management for student registrations, sequential enrollment tracking, installment fee receipts, and official certificate verification.
            </p>

            {/* Quick Action CTAs */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white bg-teal-600 hover:bg-teal-500 shadow-lg shadow-teal-600/30 transition-all hover:scale-[1.02]"
              >
                <span>Student Self-Registration</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
              >
                <span>Portal Login</span>
              </Link>
              <Link
                href="/verify-certificate"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-teal-300 bg-teal-950/60 hover:bg-teal-900/80 border border-teal-800/60 transition-all"
              >
                <ShieldCheck className="w-4 h-4 text-teal-400" />
                <span>Verify Certificate</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights / Features Banner */}
      <section className="py-12 bg-slate-950 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Sequential Numbering</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Unique QPET-YYYY-NNNNN counter generated atomically per calendar year.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Fees & Installments</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Full or installment schedules with instant PDF receipts and live balance audits.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Issued Certificates</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Admin-authorized completion certificates with tamper-proof QR verification.
                </p>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Public Verification</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Instant public verification protecting student privacy and preventing forgery.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Catalog Section */}
      <section className="py-20 bg-slate-900 flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-teal-400 mb-2">
                <BookOpen className="w-4 h-4" /> Professional Curriculum
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Computer Courses Offered
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Practical, job-oriented computer courses with structured syllabus and certification.
              </p>
            </div>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 text-sm font-semibold text-teal-400 hover:text-teal-300 group"
            >
              <span>Enroll in a Course</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length > 0 ? (
              courses.map((course: any) => (
                <div
                  key={course._id.toString()}
                  className="rounded-2xl bg-slate-800/60 border border-slate-700/80 p-6 flex flex-col justify-between hover:border-slate-600 transition-all hover:bg-slate-800/80 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-semibold">
                        {course.code}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 font-medium">
                        {course.durationText || `${course.durationMonths} Months`}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                      {course.title}
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      {course.description || "Comprehensive hands-on training and practice."}
                    </p>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-700/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Course Fee</span>
                      <span className="text-base font-extrabold text-white">
                        ₹{course.defaultFee.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <Link
                      href={`/register?course=${course._id.toString()}`}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-700 hover:bg-teal-600 transition-colors"
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-slate-500 text-sm">
                Loading courses...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Certificate Verification Banner */}
      <section className="py-14 bg-gradient-to-r from-teal-950/60 via-slate-900 to-slate-950 border-t border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20 mx-auto">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Need to Verify a Student's Certificate?
          </h2>
          <p className="text-sm text-slate-300 max-w-xl mx-auto">
            Employers, organizations, and academic institutions can verify the authenticity of certificates issued by QPET in real-time.
          </p>
          <div className="pt-3">
            <Link
              href="/verify-certificate"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 shadow-md shadow-teal-400/20 transition-all font-medium"
            >
              <Search className="w-4 h-4 text-slate-950" />
              <span>Open Public Verification Page</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
