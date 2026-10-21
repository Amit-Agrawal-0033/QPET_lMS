"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  GraduationCap,
  User,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Info,
  Sparkles,
} from "lucide-react";

interface CourseOption {
  _id: string;
  code: string;
  title: string;
  durationMonths: number;
  durationText?: string;
  defaultFee: number;
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedCourse = searchParams.get("course");

  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{ message: string; studentId: string } | null>(
    null
  );

  const [formData, setFormData] = useState({
    fullName: "",
    fatherOrGuardianName: "",
    dateOfBirth: "",
    gender: "male",
    mobileNumber: "",
    email: "",
    address: "",
    qualification: "",
    preferredCourseId: preselectedCourse || "",
  });

  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await fetch("/api/admin/courses");
        const data = await res.json();
        if (data.courses) {
          const activeCourses = data.courses.filter((c: any) => c.isActive);
          setCourses(activeCourses);
          if (preselectedCourse && activeCourses.some((c: any) => c._id === preselectedCourse)) {
            setFormData((prev) => ({ ...prev, preferredCourseId: preselectedCourse }));
          } else if (activeCourses.length > 0 && !formData.preferredCourseId) {
            setFormData((prev) => ({ ...prev, preferredCourseId: activeCourses[0]._id }));
          }
        }
      } catch (err) {
        console.error("Failed to load courses:", err);
      } finally {
        setLoadingCourses(false);
      }
    }
    fetchCourses();
  }, [preselectedCourse]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.preferredCourseId) {
      setError("Please select a course to register for.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit registration.");
        setSubmitting(false);
        return;
      }

      setSuccessData({
        message: data.message,
        studentId: data.studentId,
      });
      setSubmitting(false);
    } catch (err: any) {
      setError("An unexpected network error occurred. Please try again.");
      setSubmitting(false);
    }
  };

  if (successData) {
    return (
      <div className="w-full max-w-xl bg-white/85 backdrop-blur-2xl border-2 border-white/95 rounded-[2.5rem] p-8 sm:p-12 shadow-[0_24px_60px_-12px_rgba(59,7,100,0.25),inset_0_2px_4px_rgba(255,255,255,1)] text-center space-y-6 relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#D4FF3F]/30 blur-2xl pointer-events-none" />
        
        <div className="w-20 h-20 rounded-3xl bg-[#D4FF3F] text-[#1E0B36] border border-[#8EB605] shadow-[0_12px_28px_rgba(142,182,5,0.45)] flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-3xl font-black text-[#1E0B36] tracking-tight">
            Application Submitted!
          </h2>
          <p className="text-sm text-[#402C5E] font-medium leading-relaxed max-w-md mx-auto">
            {successData.message}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white/90 border border-purple-200/80 text-left text-xs space-y-3 text-[#402C5E] shadow-sm">
          <div className="flex justify-between items-center">
            <span className="font-bold text-[#58337A]">Student Full Name:</span>
            <span className="font-black text-[#1E0B36] uppercase">{formData.fullName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-[#58337A]">Registered Contact:</span>
            <span className="font-mono font-bold text-[#1E0B36]">{formData.mobileNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-[#58337A]">Application Status:</span>
            <span className="px-3 py-1 rounded-full bg-[#D4FF3F] text-[#1E0B36] text-[11px] font-black border border-[#8EB605]">
              Pending Admin Approval
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-purple-100/70 border border-purple-200 text-xs text-[#3B0764] text-left flex items-start gap-3">
          <Info className="w-5 h-5 text-[#E34234] shrink-0 mt-0.5" />
          <p className="leading-relaxed font-medium">
            QPET Administrative desk aapki application review karegi, course enrollment sequence number allot karegi, aur aapka portal login password assign karegi.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/login"
            className="w-full py-4 px-8 rounded-2xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#3B0764] via-[#581C87] to-[#E34234] hover:from-[#4C1D95] hover:to-[#C22B1E] shadow-[0_16px_32px_-6px_rgba(59,7,100,0.4),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-4px_0_rgba(0,0,0,0.3)] hover:-translate-y-1 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Go to Portal Login</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </Link>
        </div>
      </div>
    );
  }

  const selectedCourseObj = courses.find((c) => c._id === formData.preferredCourseId);

  return (
    <div className="w-full max-w-2xl bg-white/85 backdrop-blur-2xl border-2 border-white/95 rounded-[2.5rem] p-7 sm:p-12 shadow-[0_24px_60px_-12px_rgba(59,7,100,0.22),inset_0_2px_4px_rgba(255,255,255,1)] relative overflow-hidden">
      {/* Ambient Glow Accents */}
      <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-[#D4FF3F]/35 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-[#E34234]/20 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="mb-8 relative z-10">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-10 h-10 rounded-xl bg-white p-1 border border-purple-200/80 shadow-xs flex items-center justify-center overflow-hidden">
            <Image
              src="/images/QPET PNG.png"
              alt="QPET Logo"
              width={38}
              height={38}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-[#1E0B36]">QPET</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4FF3F] text-[#1E0B36] font-black border border-[#8EB605]">
                ADMISSIONS
              </span>
            </div>
            <p className="text-[10px] text-[#58337A] font-semibold">Qplus Education &amp; Training</p>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-[#1E0B36] tracking-tight">
          Student Self-Registration Form
        </h2>
        <p className="text-xs sm:text-sm text-[#402C5E] font-medium mt-1.5">
          Apni basic details aur course select karke admission request submit karein. Login credentials QPET administration dwara approve hone par generate kiye jayenge.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-xs text-[#5E0802] flex items-start gap-3 relative z-10 shadow-sm">
          <AlertCircle className="w-5 h-5 text-[#E34234] shrink-0 mt-0.5" />
          <div>
            <span className="font-black block mb-0.5 text-[#A8190E]">Registration Error</span>
            <span className="font-medium">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        {/* ===================================================================== */}
        {/* 1. COURSE SELECTION                                                   */}
        {/* ===================================================================== */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-white/95 to-purple-50/70 border-2 border-purple-200/80 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-black text-[#3B0764] uppercase tracking-wider">
              1. Select Course of Study *
            </label>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-[#3B0764]">
              Computer Curriculum
            </span>
          </div>

          <div className="relative">
            <select
              name="preferredCourseId"
              value={formData.preferredCourseId}
              onChange={handleChange}
              disabled={loadingCourses}
              required
              className="w-full px-4 py-3 bg-white border-2 border-purple-200 rounded-xl text-sm text-[#1E0B36] font-bold focus:outline-none focus:border-[#3B0764] focus:ring-4 focus:ring-purple-500/15 transition-all cursor-pointer shadow-xs"
            >
              {loadingCourses ? (
                <option>Loading computer courses...</option>
              ) : (
                courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title} ({course.code}) — {course.durationText || `${course.durationMonths} Months`} (₹{course.defaultFee.toLocaleString("en-IN")})
                  </option>
                ))
              )}
            </select>
          </div>

          {selectedCourseObj && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-purple-200/50">
              <span className="text-[#58337A] font-semibold">
                Duration: <strong className="text-[#1E0B36] font-extrabold">{selectedCourseObj.durationText || `${selectedCourseObj.durationMonths} Months`}</strong>
              </span>
              <span className="text-[#58337A] font-semibold">
                Official Tuition Fee: <strong className="text-[#3B0764] font-black text-sm">₹{selectedCourseObj.defaultFee.toLocaleString("en-IN")}</strong>
              </span>
            </div>
          )}
        </div>

        {/* ===================================================================== */}
        {/* 2. PERSONAL DETAILS                                                   */}
        {/* ===================================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-purple-200/60 pb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#3B0764]">
              2. Student Bio &amp; Contact Details
            </h3>
            <span className="text-[10px] text-[#58337A] font-medium">* Required fields</span>
          </div>

          {/* Full Name & Guardian */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E0B36] mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#58337A]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Student legal name"
                  required
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50/90 border border-purple-200 rounded-xl text-sm text-[#1E0B36] font-medium placeholder-[#58337A]/50 focus:outline-none focus:bg-white focus:border-[#3B0764] focus:ring-3 focus:ring-purple-500/15 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E0B36] mb-1.5">
                Father's / Guardian's Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#58337A]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="fatherOrGuardianName"
                  value={formData.fatherOrGuardianName}
                  onChange={handleChange}
                  placeholder="Father or guardian name"
                  required
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50/90 border border-purple-200 rounded-xl text-sm text-[#1E0B36] font-medium placeholder-[#58337A]/50 focus:outline-none focus:bg-white focus:border-[#3B0764] focus:ring-3 focus:ring-purple-500/15 transition-all"
                />
              </div>
            </div>
          </div>

          {/* DOB & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E0B36] mb-1.5">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 sm:py-3 bg-slate-50/90 border border-purple-200 rounded-xl text-sm text-[#1E0B36] font-medium focus:outline-none focus:bg-white focus:border-[#3B0764] focus:ring-3 focus:ring-purple-500/15 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E0B36] mb-1.5">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 sm:py-3 bg-slate-50/90 border border-purple-200 rounded-xl text-sm text-[#1E0B36] font-bold focus:outline-none focus:bg-white focus:border-[#3B0764] focus:ring-3 focus:ring-purple-500/15 transition-all cursor-pointer"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Mobile & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#1E0B36] mb-1.5">
                Mobile Number * (Primary contact &amp; login ID)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#58337A]">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  required
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50/90 border border-purple-200 rounded-xl text-sm text-[#1E0B36] font-medium placeholder-[#58337A]/50 focus:outline-none focus:bg-white focus:border-[#3B0764] focus:ring-3 focus:ring-purple-500/15 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1E0B36] mb-1.5">
                Email Address (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#58337A]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@example.com"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50/90 border border-purple-200 rounded-xl text-sm text-[#1E0B36] font-medium placeholder-[#58337A]/50 focus:outline-none focus:bg-white focus:border-[#3B0764] focus:ring-3 focus:ring-purple-500/15 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Complete Residential Address */}
          <div>
            <label className="block text-xs font-bold text-[#1E0B36] mb-1.5">
              Complete Residential Address *
            </label>
            <div className="relative">
              <div className="absolute top-3.5 left-3.5 pointer-events-none text-[#58337A]">
                <MapPin className="w-4 h-4" />
              </div>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                placeholder="Village / Street, Area, District, State, PIN"
                required
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50/90 border border-purple-200 rounded-xl text-sm text-[#1E0B36] font-medium placeholder-[#58337A]/50 focus:outline-none focus:bg-white focus:border-[#3B0764] focus:ring-3 focus:ring-purple-500/15 transition-all resize-none"
              />
            </div>
          </div>

          {/* Qualification */}
          <div>
            <label className="block text-xs font-bold text-[#1E0B36] mb-1.5">
              Educational Qualification (Optional)
            </label>
            <input
              type="text"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              placeholder="e.g. 10th Pass, 12th Pass, Graduate, ITI"
              className="w-full px-3.5 py-2.5 sm:py-3 bg-slate-50/90 border border-purple-200 rounded-xl text-sm text-[#1E0B36] font-medium placeholder-[#58337A]/50 focus:outline-none focus:bg-white focus:border-[#3B0764] focus:ring-3 focus:ring-purple-500/15 transition-all"
            />
          </div>
        </div>

        {/* Security / Credentials notice */}
        <div className="p-4 rounded-2xl bg-purple-100/70 border border-purple-200 flex items-start gap-3 text-xs text-[#3B0764]">
          <ShieldCheck className="w-5 h-5 text-[#E34234] shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold text-[#1E0B36]">Login Credentials Security Notice:</span>
            <p className="mt-0.5 leading-relaxed font-medium">
              Aapka application review hone ke baad QPET administration dwara password assign kiya jayega. Approval ke baad aap registered mobile number se login kar sakenge.
            </p>
          </div>
        </div>

        {/* 3D Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 px-6 rounded-2xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#3B0764] via-[#581C87] to-[#E34234] hover:from-[#4C1D95] hover:to-[#C22B1E] shadow-[0_16px_32px_-6px_rgba(59,7,100,0.4),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-4px_0_rgba(0,0,0,0.3)] hover:-translate-y-1 active:translate-y-1 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {submitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Submit Admission Application</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-[#402C5E] font-medium pt-1">
          Already approved?{" "}
          <Link
            href="/login"
            className="text-[#3B0764] hover:text-[#581C87] font-black underline ml-1"
          >
            Sign In to Portal
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#CBB3E6] text-[#1E0B36] relative overflow-x-hidden selection:bg-[#E34234] selection:text-white">
      {/* Dynamic Keyframes */}
      <style>{`
        @keyframes floatSlow1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(4deg); }
        }
        @keyframes floatSlow2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(22px) rotate(-5deg); }
        }
        .anim-float-1 { animation: floatSlow1 7s ease-in-out infinite; }
        .anim-float-2 { animation: floatSlow2 9s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .anim-float-1, .anim-float-2 { animation: none !important; }
        }
      `}</style>

      {/* Volumetric Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[650px] bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.7)_0%,_transparent_70%)]" />
        <div className="absolute top-[25%] left-[-5%] w-[550px] h-[550px] bg-[radial-gradient(circle,_rgba(212,255,63,0.3)_0%,_transparent_65%)] blur-2xl" />
        <div className="absolute bottom-[15%] right-[-5%] w-[550px] h-[550px] bg-[radial-gradient(circle,_rgba(59,7,100,0.22)_0%,_transparent_65%)] blur-2xl" />
      </div>

      {/* Floating 3D Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* 3D Bright Chartreuse Sphere (#D4FF3F) - Top Left */}
        <div className="absolute top-28 left-[6%] anim-float-1 hidden md:block">
          <div className="relative w-36 h-36 rounded-full shadow-[0_30px_60px_-10px_rgba(85,115,5,0.5)]">
            <div
              className="w-full h-full rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 34% 28%, #FFFFFF 0%, #F1FFA8 18%, #D4FF3F 45%, #8EB605 76%, #455C02 100%)",
                boxShadow:
                  "inset -12px -14px 24px rgba(0,0,0,0.38), inset 7px 9px 16px rgba(255,255,255,0.9)",
              }}
            />
            <div className="absolute top-4 left-6 w-9 h-5 rounded-full bg-white/75 blur-[1.5px] rotate-[-28deg]" />
          </div>
        </div>

        {/* 3D Deep Purple Fluid Blob - Right */}
        <div className="absolute top-[35%] right-[5%] anim-float-2 hidden md:block">
          <svg
            viewBox="0 0 200 200"
            className="w-56 h-56 filter drop-shadow-[0_30px_45px_rgba(46,16,101,0.4)]"
          >
            <defs>
              <radialGradient id="regPurple" cx="35%" cy="30%" r="70%">
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
              fill="url(#regPurple)"
            />
          </svg>
        </div>

        {/* 3D Tomato Red Sphere - Bottom Left */}
        <div className="absolute bottom-28 left-[8%] anim-float-1 hidden lg:block">
          <div className="relative w-28 h-28 rounded-full shadow-[0_24px_45px_rgba(227,66,52,0.45)]">
            <div
              className="w-full h-full rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 35% 28%, #FFFFFF 0%, #FFA8A0 18%, #E34234 50%, #9F160C 80%, #540601 100%)",
                boxShadow:
                  "inset -10px -12px 20px rgba(0,0,0,0.4), inset 6px 8px 14px rgba(255,255,255,0.85)",
              }}
            />
            <div className="absolute top-3 left-4 w-8 h-4 rounded-full bg-white/70 blur-[1px] rotate-[-28deg]" />
          </div>
        </div>
      </div>

      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative z-10">
        <Suspense fallback={<div className="text-[#3B0764] font-bold text-sm">Loading registration form...</div>}>
          <RegisterForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
