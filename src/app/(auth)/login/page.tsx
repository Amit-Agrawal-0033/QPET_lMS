"use client";

import { useState, useEffect, Suspense } from "react";
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
  CheckCircle2,
  BookOpen,
} from "lucide-react";

type PortalType = "student" | "trainer" | "admin";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activePortal, setActivePortal] = useState<PortalType>("student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    const callbackUrl = searchParams.get("callbackUrl") || "";
    const portal = searchParams.get("portal") || searchParams.get("role") || "";

    if (portal === "admin" || callbackUrl.startsWith("/admin")) {
      setActivePortal("admin");
    } else if (portal === "trainer" || callbackUrl.startsWith("/trainer")) {
      setActivePortal("trainer");
    } else if (portal === "student" || callbackUrl.startsWith("/student")) {
      setActivePortal("student");
    }

    // Purge any existing session so no automatic login or session bleed can occur
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  }, [searchParams]);

  const handlePortalSwitch = (portal: PortalType) => {
    setActivePortal(portal);
    setIdentifier("");
    setPassword("");
    setError(null);
    setIsPending(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsPending(false);

    if (!identifier.trim() || !password) {
      setError("Please fill in both username/email/mobile and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: identifier.trim(),
          password: password.trim(),
          role: activePortal,
        }),
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

      // Success redirect strictly by authenticated role
      const target =
        data.redirectUrl ||
        (data.user?.role === "admin"
          ? "/admin/dashboard"
          : data.user?.role === "trainer"
          ? "/trainer/dashboard"
          : "/student/dashboard");

      window.location.replace(target);
    } catch (err: any) {
      setError("An unexpected network error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] overflow-hidden border border-slate-100 grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
      {/* =================================================================== */}
      {/* LEFT BRAND & INFO PANEL (Visible on md+ screens)                    */}
      {/* =================================================================== */}
      <div className="md:col-span-5 bg-gradient-to-br from-[#400d3d] via-[#631349] to-[#831843] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle Ambient Radial Glow & Patterns */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,_rgba(255,255,255,0.14),transparent)] pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-60 h-60 rounded-full bg-rose-500/10 blur-2xl pointer-events-none" />
        <div className="absolute -top-16 -left-16 w-60 h-60 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-white p-1.5 shadow-xl flex items-center justify-center border border-white/20 shrink-0">
              <Image
                src="/images/QPET PNG.png"
                alt="QPET Logo"
                width={44}
                height={44}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white">QPET</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4FF3F] text-[#1E0B36] font-black border border-[#8EB605]">
                  LMS
                </span>
              </div>
              <p className="text-[11px] text-purple-200/90 font-medium">Qplus Education & Training</p>
            </div>
          </div>

          <div className="mt-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-white/90 text-[11px] font-bold uppercase tracking-wider mb-3 border border-white/15">
              {activePortal === "student" && <GraduationCap className="w-3.5 h-3.5 text-orange-300" />}
              {activePortal === "trainer" && <BookOpen className="w-3.5 h-3.5 text-purple-300" />}
              {activePortal === "admin" && <Shield className="w-3.5 h-3.5 text-blue-300" />}
              <span>{activePortal} Clearance</span>
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              Welcome, Friend!
            </h2>
            <p className="text-xs sm:text-sm text-purple-100/90 leading-relaxed">
              {activePortal === "student" &&
                "Access your enrolled computer curriculum, installment receipts, and verified certificates."}
              {activePortal === "trainer" &&
                "Faculty portal to manage assigned student batches, curriculum delivery, and certificate issuance."}
              {activePortal === "admin" &&
                "Master administration portal for student admissions, financial auditing, and institution governance."}
            </p>
          </div>

          {/* Feature Highlights for Current Portal */}
          <div className="mt-8 space-y-2.5 text-xs text-purple-100/90">
            {activePortal === "student" && (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4FF3F] shrink-0" />
                  <span>Real-time Course Syllabus & Modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4FF3F] shrink-0" />
                  <span>Fee Installments & Official Receipts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4FF3F] shrink-0" />
                  <span>Tamper-proof Digital Certificate Download</span>
                </div>
              </>
            )}

            {activePortal === "trainer" && (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4FF3F] shrink-0" />
                  <span>Assigned Batches & Student Directory</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4FF3F] shrink-0" />
                  <span>Curriculum Progress & Course Modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4FF3F] shrink-0" />
                  <span>Issue & Verify Student Certifications</span>
                </div>
              </>
            )}

            {activePortal === "admin" && (
              <>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4FF3F] shrink-0" />
                  <span>Institutional Analytics & Auditing</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4FF3F] shrink-0" />
                  <span>Student Admissions & Faculty Clearances</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#D4FF3F] shrink-0" />
                  <span>System Security & Activity Audit Trails</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="relative z-10 pt-6 mt-6 border-t border-white/10 text-[11px] text-purple-200/80 flex items-center justify-between">
          <span>QPET LMS v1.0</span>
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span>Secure 256-bit Encryption</span>
          </span>
        </div>
      </div>

      {/* =================================================================== */}
      {/* RIGHT LOGIN FORM PANEL                                              */}
      {/* =================================================================== */}
      <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center bg-white">
        <div className="w-full max-w-md mx-auto">
          {/* =============================================================== */}
          {/* 3-PORTAL DEDICATED SELECTOR TABS                                */}
          {/* =============================================================== */}
          <div className="mb-6">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Your Access Portal:
            </p>
            <div className="grid grid-cols-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200/80 gap-1">
              {/* Tab 1: Student */}
              <button
                type="button"
                onClick={() => handlePortalSwitch("student")}
                className={`py-2 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activePortal === "student"
                    ? "bg-white text-orange-600 shadow-sm border border-slate-200/60"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <GraduationCap className="w-4 h-4 text-orange-500 shrink-0" />
                <span>Student</span>
              </button>

              {/* Tab 2: Trainer */}
              <button
                type="button"
                onClick={() => handlePortalSwitch("trainer")}
                className={`py-2 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activePortal === "trainer"
                    ? "bg-white text-purple-700 shadow-sm border border-slate-200/60"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <BookOpen className="w-4 h-4 text-purple-600 shrink-0" />
                <span>Trainer</span>
              </button>

              {/* Tab 3: Admin */}
              <button
                type="button"
                onClick={() => handlePortalSwitch("admin")}
                className={`py-2 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activePortal === "admin"
                    ? "bg-white text-blue-700 shadow-sm border border-slate-200/60"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Shield className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Heading for Active Portal */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {activePortal === "student" && "Student Sign In"}
                {activePortal === "trainer" && "Trainer Sign In"}
                {activePortal === "admin" && "Admin Sign In"}
              </h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                  activePortal === "student"
                    ? "bg-orange-50 text-orange-700 border-orange-200"
                    : activePortal === "trainer"
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : "bg-blue-50 text-blue-700 border-blue-200"
                }`}
              >
                {activePortal} Portal
              </span>
            </div>
            <p className="text-xs text-slate-500">
              {activePortal === "student" && "Enter your registered mobile number or email and password."}
              {activePortal === "trainer" && "Enter your faculty registered email or mobile to access assigned batches."}
              {activePortal === "admin" && "Enter institutional administrator credentials to sign in."}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div
              className={`mb-5 p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in duration-200 ${
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
                  {isPending ? "Admission Under Review" : "Authentication Failed"}
                </span>
                <p className="leading-relaxed text-[11px]">{error}</p>
              </div>
            </div>
          )}

          {/* Active Portal Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Field 1: Identifier / Username / Email / Mobile */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                {activePortal === "student" && "Mobile Number or Email"}
                {activePortal === "trainer" && "Trainer Email / Mobile / Identifier"}
                {activePortal === "admin" && "Admin Username / Email"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  {activePortal === "admin" ? (
                    <Shield className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={
                    activePortal === "student"
                      ? "e.g. 9876543210 or name@example.com"
                      : activePortal === "trainer"
                      ? "e.g. roshni.bajpai@qpet.in or Mobile"
                      : "admin or admin077@qpet.in"
                  }
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
                />
              </div>
            </div>

            {/* Field 2: Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
              </div>
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
                  className="w-full pl-10 pr-11 py-2.5 sm:py-3 bg-slate-50/80 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-all"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 py-3 sm:py-3.5 px-6 rounded-full text-xs font-bold tracking-wider uppercase text-white shadow-lg active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activePortal === "student"
                  ? "bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-orange-500/30"
                  : activePortal === "trainer"
                  ? "bg-gradient-to-r from-[#631349] to-[#831843] hover:from-[#500e39] hover:to-[#701338] shadow-purple-900/30"
                  : "bg-gradient-to-r from-slate-800 to-indigo-900 hover:from-slate-900 hover:to-indigo-950 shadow-slate-800/30"
              }`}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>
                    {activePortal === "student" && "Sign In as Student"}
                    {activePortal === "trainer" && "Sign In as Trainer"}
                    {activePortal === "admin" && "Sign In as Administrator"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Portal Footer */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            {activePortal === "student" && (
              <p className="text-xs text-slate-500">
                Don't have an account yet?{" "}
                <Link
                  href="/register"
                  className="text-orange-600 hover:text-orange-700 font-bold underline ml-1"
                >
                  Register as Student
                </Link>
              </p>
            )}

            {activePortal === "trainer" && (
              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-medium">
                <Lock className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Authorized Faculty Clearance Only • QPET Academic Division</span>
              </p>
            )}

            {activePortal === "admin" && (
              <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-medium">
                <Lock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Institutional Governance Portal • Master Clearance Required</span>
              </p>
            )}
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

      {/* Centered Stage */}
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
