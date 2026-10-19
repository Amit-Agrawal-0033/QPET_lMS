"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Application Submitted!</h2>
          <p className="text-sm text-slate-300 leading-relaxed max-w-md mx-auto">
            {successData.message}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-left text-xs space-y-2 text-slate-400">
          <div className="flex justify-between">
            <span className="font-semibold text-slate-300">Student Name:</span>
            <span>{formData.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-300">Registered Mobile:</span>
            <span>{formData.mobileNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-slate-300">Application Status:</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-semibold border border-amber-500/20">
              Pending Admin Approval
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-teal-950/30 border border-teal-800/40 text-xs text-teal-300 text-left flex items-start gap-3">
          <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Admin team aapki application verify karegi, course enrollment number allot karegi, aur aapke portal login credentials (password) issue karegi.
          </p>
        </div>

        <div className="pt-2">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-500 transition-all shadow-lg shadow-teal-600/20"
          >
            <span>Go to Portal Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const selectedCourseObj = courses.find((c) => c._id === formData.preferredCourseId);

  return (
    <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-sm">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 text-teal-300 text-xs font-semibold mb-3 border border-teal-500/20">
          <GraduationCap className="w-4 h-4" /> Student Admission
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Student Self-Registration Form
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Apni basic details aur course select karke admission request submit karein. Login credentials QPET administration dwara approve hone par generate kiye jayenge.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block mb-0.5">Registration Error</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Selection */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
          <label className="block text-xs font-semibold text-teal-300 uppercase tracking-wider">
            1. Select Course of Study *
          </label>
          <div className="relative">
            <select
              name="preferredCourseId"
              value={formData.preferredCourseId}
              onChange={handleChange}
              disabled={loadingCourses}
              required
              className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {loadingCourses ? (
                <option>Loading courses...</option>
              ) : (
                courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title} ({course.code}) — {course.durationText || `${course.durationMonths} Mos`} (₹{course.defaultFee})
                  </option>
                ))
              )}
            </select>
          </div>
          {selectedCourseObj && (
            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Duration: <strong className="text-slate-200">{selectedCourseObj.durationText || `${selectedCourseObj.durationMonths} Months`}</strong></span>
              <span>Course Fee: <strong className="text-teal-300 font-bold">₹{selectedCourseObj.defaultFee.toLocaleString("en-IN")}</strong></span>
            </div>
          )}
        </div>

        {/* Personal Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            2. Personal Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Student full name"
                required
                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Father's / Guardian's Name *
              </label>
              <input
                type="text"
                name="fatherOrGuardianName"
                value={formData.fatherOrGuardianName}
                onChange={handleChange}
                placeholder="Father or Guardian name"
                required
                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Mobile Number * (Primary contact & login ID)
              </label>
              <input
                type="tel"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                required
                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="student@example.com"
                className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Complete Residential Address *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              placeholder="House/Street, Area, District, State, PIN"
              required
              className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Educational Qualification (Optional)
            </label>
            <input
              type="text"
              name="qualification"
              value={formData.qualification}
              onChange={handleChange}
              placeholder="e.g. 10th Pass, 12th Pass, Graduate, ITI"
              className="w-full px-3.5 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Security / Credentials notice */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
          <ShieldCheck className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-slate-200">Login Credentials Notice:</span>
            <p className="mt-0.5 leading-relaxed">
              Aapka application review hone ke baad QPET administration dwara password assign kiya jayega. Approval ke baad aap registered mobile number se login kar sakenge.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3.5 px-6 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-600/30"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Submit Admission Application</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <p className="text-center text-xs text-slate-400 pt-2">
          Already approved?{" "}
          <Link href="/login" className="text-teal-400 hover:text-teal-300 font-semibold underline ml-1">
            Sign In to Portal
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <Suspense fallback={<div className="text-slate-400 text-sm">Loading registration form...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
