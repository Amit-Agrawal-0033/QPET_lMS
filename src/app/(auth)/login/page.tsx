"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Lock,
  User,
  Shield,
  GraduationCap,
  AlertCircle,
  Clock,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<"student" | "admin">("student");
  const [staffRole, setStaffRole] = useState<"admin" | "trainer">("admin");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent, activeRole: "student" | "admin" | "trainer") => {
    e.preventDefault();
    setError(null);
    setIsPending(false);

    if (!identifier.trim() || !password) {
      setError("Please fill in both fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password: password.trim(), role: activeRole }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.isPending) {
          setIsPending(true);
        }
        setError(data.error || "Login failed. Please check credentials.");
        setLoading(false);
        return;
      }

      // Success redirect strictly by role
      if (data.user.role === "admin") {
        router.push("/admin/dashboard");
      } else if (data.user.role === "trainer") {
        router.push("/trainer/dashboard");
      } else {
        router.push("/student/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setError("An unexpected network error occurred. Please try again.");
      setLoading(false);
    }
  };

  const handleRoleSwitch = (newRole: "student" | "admin") => {
    setRole(newRole);
    setError(null);
    setIsPending(false);
  };

  return (
    <div className="w-full max-w-4xl min-h-[620px] bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] overflow-hidden border border-slate-100 relative flex flex-col md:block">
      {/* Mobile Switcher & Gradient Header (Visible on < md) */}
      <div className="md:hidden bg-gradient-to-br from-[#400d3d] via-[#631349] to-[#831843] text-white p-6 pb-7 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),transparent)] pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-white p-1.5 shadow-md mb-3 flex items-center justify-center">
            <Image
              src="/images/QPET PNG.png"
              alt="QPET Logo"
              width={42}
              height={42}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">Welcome, Friend!</h2>
          <p className="text-xs text-purple-100/80 mt-1 max-w-xs">
            {role === "student"
              ? "Access your student courses, fees, and verified certificates."
              : staffRole === "admin"
              ? "Institutional administration & governance portal."
              : "Faculty access for assigned batches & curriculum."}
          </p>

          <div className="grid grid-cols-3 p-1 bg-white/10 backdrop-blur-md rounded-2xl mt-5 w-full max-w-xs border border-white/20">
            <button
              type="button"
              onClick={() => handleRoleSwitch("student")}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                role === "student"
                  ? "bg-white text-[#631349] shadow-md"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("admin");
                setStaffRole("trainer");
                setError(null);
                setIsPending(false);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                role === "admin" && staffRole === "trainer"
                  ? "bg-white text-[#631349] shadow-md"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Trainer
            </button>
            <button
              type="button"
              onClick={() => {
                setRole("admin");
                setStaffRole("admin");
                setError(null);
                setIsPending(false);
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                role === "admin" && staffRole === "admin"
                  ? "bg-white text-[#631349] shadow-md"
                  : "text-white/80 hover:text-white"
              }`}
            >
              Admin
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* LEFT FORM PANEL: Student Sign In (Visible on left when role === 'student') */}
      {/* ========================================================================= */}
      <div
        className={`w-full md:w-1/2 md:absolute md:top-0 md:left-0 md:h-full p-8 sm:p-12 flex flex-col justify-center transition-all duration-700 ease-in-out bg-white ${
          role === "student"
            ? "opacity-100 z-10 md:translate-x-0"
            : "hidden md:flex md:opacity-0 md:pointer-events-none md:-translate-x-12"
        }`}
      >
        <div className="w-full max-w-sm mx-auto">
          {/* Brand Badge */}
          <div className="hidden md:flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-white p-1 border border-slate-200/80 shadow-xs flex items-center justify-center overflow-hidden">
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
                <span className="font-extrabold text-base tracking-tight text-slate-900">QPET</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-600 font-bold border border-orange-200">
                  LMS
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Qplus Education & Training</p>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Student Sign In
            </h2>
            <p className="text-xs text-slate-500 mt-1.5">
              Enter your registered mobile number or email and password.
            </p>
          </div>

          {/* Error Message */}
          {error && role === "student" && (
            <div
              className={`mb-5 p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                isPending
                  ? "bg-amber-50 border-amber-200 text-amber-900"
                  : "bg-rose-50 border-rose-200 text-rose-900"
              }`}
            >
              {isPending ? (
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <div>
                <span className="font-bold block mb-0.5">
                  {isPending ? "Admission Under Review" : "Login Failed"}
                </span>
                <p className="leading-relaxed text-[11px]">{error}</p>
              </div>
            </div>
          )}

          {/* Student Form */}
          <form onSubmit={(e) => handleSubmit(e, "student")} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mobile Number or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e.g. 9876543210 or name@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 sm:py-3.5 px-6 rounded-full text-xs font-bold tracking-wider uppercase text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In as Student</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Student Footer Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{" "}
              <Link
                href="/register"
                className="text-orange-600 hover:text-orange-700 font-bold underline ml-1"
              >
                Register as Student
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* RIGHT FORM PANEL: Admin Sign In (Visible on right when role === 'admin')  */}
      {/* ========================================================================= */}
      <div
        className={`w-full md:w-1/2 md:absolute md:top-0 md:right-0 md:h-full p-8 sm:p-12 flex flex-col justify-center transition-all duration-700 ease-in-out bg-white ${
          role === "admin"
            ? "opacity-100 z-10 md:translate-x-0"
            : "hidden md:flex md:opacity-0 md:pointer-events-none md:translate-x-12"
        }`}
      >
        <div className="w-full max-w-sm mx-auto">
          {/* Brand Badge */}
          <div className="hidden md:flex items-center gap-2.5 mb-5">
            <div className="w-10 h-10 rounded-xl bg-white p-1 border border-slate-200/80 shadow-xs flex items-center justify-center overflow-hidden">
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
                <span className="font-extrabold text-base tracking-tight text-slate-900">QPET</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-700 font-bold border border-purple-200 uppercase">
                  {staffRole} Portal
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Faculty & Administration</p>
            </div>
          </div>

          {/* Role Pill Switcher (Admin vs Trainer) */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-5 border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setStaffRole("admin");
                setError(null);
              }}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                staffRole === "admin"
                  ? "bg-white text-purple-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              Admin Portal
            </button>
            <button
              type="button"
              onClick={() => {
                setStaffRole("trainer");
                setError(null);
              }}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                staffRole === "trainer"
                  ? "bg-white text-purple-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-orange-600" />
              Trainer Portal
            </button>
          </div>

          <div className="mb-5">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {staffRole === "admin" ? "Admin Portal" : "Trainer Portal"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {staffRole === "admin"
                ? "Institutional administration, security governance & system controls."
                : "Faculty access for assigned batches, course logs & records."}
            </p>
          </div>

          {/* Error Message */}
          {error && role === "admin" && (
            <div className="mb-5 p-3.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-900 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Authentication Failed</span>
                <p className="leading-relaxed text-[11px]">{error}</p>
              </div>
            </div>
          )}

          {/* Staff Form */}
          <form onSubmit={(e) => handleSubmit(e, staffRole)} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {staffRole === "admin" ? "Admin Email / Identifier" : "Trainer Email / Mobile / ID"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  {staffRole === "admin" ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={staffRole === "admin" ? "admin077@qpet.in" : "e.g. trainer@qpet.in or Mobile"}
                  required
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {staffRole === "admin" ? "Admin Password" : "Trainer Password"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 sm:py-3.5 px-6 rounded-full text-xs font-bold tracking-wider uppercase text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 cursor-pointer"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{staffRole === "admin" ? "Sign In as Admin" : "Sign In as Trainer"}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Secure Audit Notice (Replacing the default credentials text) */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-medium">
              <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Protected Portal • Authorized Role-Based Clearance Only</span>
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* DESKTOP SLIDING OVERLAY PANEL (Vibrant Purple & Maroon Gradient)          */}
      {/* ========================================================================= */}
      <div
        className={`hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-30 shadow-2xl ${
          role === "admin" ? "-translate-x-full" : "translate-x-0"
        }`}
      >
        <div
          className={`relative -left-full h-full w-[200%] bg-gradient-to-br from-[#400d3d] via-[#631349] to-[#831843] text-white transition-transform duration-700 ease-in-out ${
            role === "admin" ? "translate-x-1/2" : "translate-x-0"
          }`}
        >
          {/* Subtle Ambient Radial Glow & Patterns */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.14),transparent)] pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-64 h-64 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

          {/* --------------------------------------------------------------------- */}
          {/* SLIDE 1 (Left 50% of inner): Displayed when role === 'admin'          */}
          {/* --------------------------------------------------------------------- */}
          <div className="w-1/2 h-full absolute top-0 left-0 p-10 lg:p-14 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-white p-2 shadow-xl mb-6 flex items-center justify-center border border-white/20">
              <Image
                src="/images/QPET PNG.png"
                alt="QPET Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
            
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-[11px] font-bold uppercase tracking-wider mb-4 border border-white/15">
              <GraduationCap className="w-3.5 h-3.5 text-orange-300" />
              Student Portal Access
            </span>

            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-3">
              Welcome, Friend!
            </h2>
            <p className="text-xs sm:text-sm text-purple-100/90 max-w-xs leading-relaxed mb-8">
              Enrolled in QPET computer courses? Sign in to view your course curriculum, installment receipts, and verified certificates.
            </p>

            <button
              type="button"
              onClick={() => handleRoleSwitch("student")}
              className="px-9 py-3 border-2 border-white text-white text-xs font-bold tracking-wider uppercase rounded-full hover:bg-white hover:text-[#581c4c] transition-all duration-300 shadow-lg active:scale-95 cursor-pointer"
            >
              Student Sign In
            </button>
          </div>

          {/* --------------------------------------------------------------------- */}
          {/* SLIDE 2 (Right 50% of inner): Displayed when role === 'student'        */}
          {/* --------------------------------------------------------------------- */}
          <div className="w-1/2 h-full absolute top-0 right-0 p-10 lg:p-14 flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-white p-2 shadow-xl mb-6 flex items-center justify-center border border-white/20">
              <Image
                src="/images/QPET PNG.png"
                alt="QPET Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-[11px] font-bold uppercase tracking-wider mb-4 border border-white/15">
              <Shield className="w-3.5 h-3.5 text-orange-300" />
              Faculty & Staff Portal
            </span>

            <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-3">
              Welcome, Friend!
            </h2>
            <p className="text-xs sm:text-sm text-purple-100/90 max-w-xs leading-relaxed mb-8">
              Are you an authorized QPET administrator or trainer? Sign in here to manage admissions, enrollments, course records, and audit reports.
            </p>

            <button
              type="button"
              onClick={() => handleRoleSwitch("admin")}
              className="px-9 py-3 border-2 border-white text-white text-xs font-bold tracking-wider uppercase rounded-full hover:bg-white hover:text-[#581c4c] transition-all duration-300 shadow-lg active:scale-95 cursor-pointer"
            >
              Staff Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-orange-500 selection:text-white">
      <Navbar />
      
      {/* Centered Hero Stage */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-10 relative overflow-hidden">
        {/* Soft Ambient Radial Backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-purple-900/20 via-rose-900/10 to-orange-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full flex justify-center">
          <Suspense fallback={<div className="text-slate-400 text-sm py-12">Loading login portal...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </main>

      <Footer />
    </div>
  );
}
