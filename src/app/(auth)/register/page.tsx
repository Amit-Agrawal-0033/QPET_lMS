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

export const dynamic = "force-dynamic";

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
        let res = await fetch("/api/courses");
        if (!res.ok) {
          res = await fetch("/api/admin/courses");
        }
        if (res.ok) {
          const data = await res.json();
          if (data.courses && Array.isArray(data.courses) && data.courses.length > 0) {
            const activeCourses = data.courses.filter((c: any) => c.isActive !== false);
            setCourses(activeCourses);
            if (preselectedCourse && activeCourses.some((c: any) => c._id === preselectedCourse)) {
              setFormData((prev) => ({ ...prev, preferredCourseId: preselectedCourse }));
            } else if (activeCourses.length > 0 && !formData.preferredCourseId) {
              setFormData((prev) => ({ ...prev, preferredCourseId: activeCourses[0]._id }));
            }
            setLoadingCourses(false);
            return;
          }
        }
      } catch (err) {
        console.error("Failed to load courses from API:", err);
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
      <div className="w-full max-w-xl bg-white/95 backdrop-blur-xl border-2 border-[#3978E8]/20 rounded-3xl p-8 sm:p-12 shadow-[0_20px_50px_-10px_rgba(23,59,112,0.14)] text-center space-y-6 relative overflow-hidden">
        {/* Subtle Ambient Corner Accent */}
        <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#16A89A]/15 blur-2xl pointer-events-none" />

        <div className="w-16 h-16 rounded-2xl bg-[#16A89A] text-white shadow-md shadow-[#16A89A]/30 flex items-center justify-center mx-auto mb-2">
          <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-[#173B70] tracking-tight">
            Application Submitted!
          </h2>
          <p className="text-xs sm:text-sm text-[#173B70]/75 font-normal leading-relaxed max-w-md mx-auto">
            {successData.message}
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#F5F8FF] border border-[#3978E8]/20 text-left text-xs space-y-3 text-[#173B70] shadow-xs">
          <div className="flex justify-between items-center">
            <span className="font-bold text-[#173B70]/70">Student Full Name:</span>
            <span className="font-black text-[#173B70] uppercase">{formData.fullName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-[#173B70]/70">Registered Contact:</span>
            <span className="font-mono font-bold text-[#173B70]">{formData.mobileNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-[#173B70]/70">Application Status:</span>
            <span className="px-3 py-1 rounded-full bg-[#16A89A]/15 text-[#16A89A] text-[11px] font-bold border border-[#16A89A]/30">
              Pending Admin Approval
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-50/80 border border-[#3978E8]/20 text-xs text-[#173B70] text-left flex items-start gap-3">
          <Info className="w-4 h-4 text-[#3978E8] shrink-0 mt-0.5" />
          <p className="leading-relaxed font-normal">
            QPET Administrative desk aapki application review karegi, course enrollment sequence number allot karegi, aur aapka portal login password assign karegi.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/login"
            className="w-full py-3.5 px-8 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#173B70] via-[#3978E8] to-[#7654D6] hover:opacity-95 shadow-md shadow-[#3978E8]/25 hover:-translate-y-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
    <div className="w-full max-w-2xl bg-white/95 backdrop-blur-xl border-2 border-[#3978E8]/20 rounded-3xl p-7 sm:p-10 shadow-[0_20px_50px_-10px_rgba(23,59,112,0.12)] relative overflow-hidden">
      {/* Subtle Ambient Corner Accents */}
      <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-[#3978E8]/10 blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-[#16A89A]/10 blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="mb-7 relative z-10">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white p-1 border border-[#3978E8]/20 shadow-xs flex items-center justify-center overflow-hidden">
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
              <span className="font-extrabold text-base tracking-tight text-[#173B70]">QPET</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#16A89A]/15 text-[#16A89A] font-bold border border-[#16A89A]/30">
                ADMISSIONS
              </span>
            </div>
            <p className="text-[10px] text-[#173B70]/70 font-semibold">Qplus Education &amp; Training</p>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-[#173B70] tracking-tight">
          Student Self-Registration Form
        </h2>
        <p className="text-xs sm:text-sm text-[#173B70]/75 font-normal mt-1 leading-relaxed">
          Apni basic details aur course select karke admission request submit karein. Login credentials QPET administration dwara approve hone par generate kiye jayenge.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950 flex items-start gap-3 relative z-10 shadow-xs">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block mb-0.5 text-rose-800">Registration Error</span>
            <span className="font-normal">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
        {/* ===================================================================== */}
        {/* 1. COURSE SELECTION                                                   */}
        {/* ===================================================================== */}
        <div className="p-5 rounded-2xl bg-[#F5F8FF] border border-[#3978E8]/20 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-[#173B70] uppercase tracking-wider">
              1. Select Course of Study *
            </label>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#3978E8]/10 text-[#3978E8]">
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
              className="w-full px-4 py-3 bg-white border border-[#3978E8]/25 rounded-xl text-sm text-[#173B70] font-bold focus:outline-none focus:border-[#3978E8] focus:ring-3 focus:ring-[#3978E8]/15 transition-all cursor-pointer shadow-xs"
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
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs pt-2 border-t border-[#3978E8]/15">
              <span className="text-[#173B70]/70 font-medium">
                Duration: <strong className="text-[#173B70] font-bold">{selectedCourseObj.durationText || `${selectedCourseObj.durationMonths} Months`}</strong>
              </span>
              <span className="text-[#173B70]/70 font-medium">
                Official Tuition Fee: <strong className="text-[#3978E8] font-black text-sm">₹{selectedCourseObj.defaultFee.toLocaleString("en-IN")}</strong>
              </span>
            </div>
          )}
        </div>

        {/* ===================================================================== */}
        {/* 2. PERSONAL DETAILS                                                   */}
        {/* ===================================================================== */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#3978E8]/15 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#173B70]">
              2. Student Bio &amp; Contact Details
            </h3>
            <span className="text-[10px] text-[#173B70]/60 font-medium">* Required fields</span>
          </div>

          {/* Full Name & Guardian */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#173B70] mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#173B70]/50">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Student legal name"
                  required
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[#F5F8FF] border border-[#3978E8]/20 rounded-xl text-sm text-[#173B70] font-medium placeholder-[#173B70]/40 focus:outline-none focus:bg-white focus:border-[#3978E8] focus:ring-3 focus:ring-[#3978E8]/15 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#173B70] mb-1.5">
                Father's / Guardian's Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#173B70]/50">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  name="fatherOrGuardianName"
                  value={formData.fatherOrGuardianName}
                  onChange={handleChange}
                  placeholder="Father or guardian name"
                  required
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[#F5F8FF] border border-[#3978E8]/20 rounded-xl text-sm text-[#173B70] font-medium placeholder-[#173B70]/40 focus:outline-none focus:bg-white focus:border-[#3978E8] focus:ring-3 focus:ring-[#3978E8]/15 transition-all"
                />
              </div>
            </div>
          </div>

          {/* DOB & Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#173B70] mb-1.5">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 sm:py-3 bg-[#F5F8FF] border border-[#3978E8]/20 rounded-xl text-sm text-[#173B70] font-medium focus:outline-none focus:bg-white focus:border-[#3978E8] focus:ring-3 focus:ring-[#3978E8]/15 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#173B70] mb-1.5">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 sm:py-3 bg-[#F5F8FF] border border-[#3978E8]/20 rounded-xl text-sm text-[#173B70] font-bold focus:outline-none focus:bg-white focus:border-[#3978E8] focus:ring-3 focus:ring-[#3978E8]/15 transition-all cursor-pointer"
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
              <label className="block text-xs font-bold text-[#173B70] mb-1.5">
                Mobile Number * (Primary contact &amp; login ID)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#173B70]/50">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="e.g. 9876543210"
                  required
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[#F5F8FF] border border-[#3978E8]/20 rounded-xl text-sm text-[#173B70] font-medium placeholder-[#173B70]/40 focus:outline-none focus:bg-white focus:border-[#3978E8] focus:ring-3 focus:ring-[#3978E8]/15 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#173B70] mb-1.5">
                Email Address (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#173B70]/50">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="student@example.com"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[#F5F8FF] border border-[#3978E8]/20 rounded-xl text-sm text-[#173B70] font-medium placeholder-[#173B70]/40 focus:outline-none focus:bg-white focus:border-[#3978E8] focus:ring-3 focus:ring-[#3978E8]/15 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Complete Residential Address */}
          <div>
            <label className="block text-xs font-bold text-[#173B70] mb-1.5">
              Complete Residential Address *
            </label>
            <div className="relative">
              <div className="absolute top-3.5 left-3.5 pointer-events-none text-[#173B70]/50">
                <MapPin className="w-4 h-4" />
              </div>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                placeholder="Village / Street, Area, District, State, PIN"
                required
                className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-[#F5F8FF] border border-[#3978E8]/20 rounded-xl text-sm text-[#173B70] font-medium placeholder-[#173B70]/40 focus:outline-none focus:bg-white focus:border-[#3978E8] focus:ring-3 focus:ring-[#3978E8]/15 transition-all resize-none"
              />
            </div>
          </div>

          {/* Qualification */}
          <div>
            <label className="block text-xs font-bold text-[#173B70] mb-1.5">
              Educational Qualification (Optional)
            </label>
            <input
              type="text"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              placeholder="e.g. 10th Pass, 12th Pass, Graduate, ITI"
              className="w-full px-3.5 py-2.5 sm:py-3 bg-[#F5F8FF] border border-[#3978E8]/20 rounded-xl text-sm text-[#173B70] font-medium placeholder-[#173B70]/40 focus:outline-none focus:bg-white focus:border-[#3978E8] focus:ring-3 focus:ring-[#3978E8]/15 transition-all"
            />
          </div>
        </div>

        {/* Security / Credentials notice */}
        <div className="p-4 rounded-xl bg-blue-50/80 border border-[#3978E8]/20 flex items-start gap-3 text-xs text-[#173B70]">
          <ShieldCheck className="w-4 h-4 text-[#16A89A] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#173B70]">Login Credentials Security Notice:</span>
            <p className="mt-0.5 leading-relaxed font-normal text-[#173B70]/80">
              Aapka application review hone ke baad QPET administration dwara password assign kiya jayega. Approval ke baad aap registered mobile number se login kar sakenge.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 px-6 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#173B70] via-[#3978E8] to-[#7654D6] hover:opacity-95 shadow-md shadow-[#3978E8]/25 hover:-translate-y-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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

        <p className="text-center text-xs text-[#173B70]/70 font-medium pt-1">
          Already approved?{" "}
          <Link
            href="/login"
            className="text-[#3978E8] hover:text-[#173B70] font-bold underline ml-1"
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
          <RegisterForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
