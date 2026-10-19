"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  GraduationCap,
  Lock,
  User,
  Shield,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Eye,
  EyeOff,
  Clock,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [role, setRole] = useState<"student" | "admin">("student");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
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
        body: JSON.stringify({ identifier: identifier.trim(), password: password.trim(), role }),
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

      // Success redirect
      if (data.user.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/student/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setError("An unexpected network error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-sm">
      {/* Role Switcher Tabs */}
      <div className="grid grid-cols-2 p-1 bg-slate-950/80 rounded-2xl mb-8 border border-slate-800">
        <button
          type="button"
          onClick={() => {
            setRole("student");
            setError(null);
            setIsPending(false);
          }}
          className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition-all ${
            role === "student"
              ? "bg-teal-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Student Login</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setRole("admin");
            setError(null);
            setIsPending(false);
          }}
          className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded-xl transition-all ${
            role === "admin"
              ? "bg-slate-800 text-teal-300 border border-slate-700 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Admin Login</span>
        </button>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          {role === "student" ? "Welcome Back Student" : "Administrator Portal"}
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          {role === "student"
            ? "Enter your mobile number or email and password to access your dashboard."
            : "Authorized QPET staff login for course & fee operations."}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div
          className={`mb-6 p-4 rounded-xl border text-xs flex items-start gap-3 ${
            isPending
              ? "bg-amber-950/40 border-amber-800/60 text-amber-300"
              : "bg-rose-950/40 border-rose-800/60 text-rose-300"
          }`}
        >
          {isPending ? (
            <Clock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}
          <div>
            <span className="font-semibold block mb-0.5">
              {isPending ? "Application Pending Approval" : "Authentication Notice"}
            </span>
            <p className="leading-relaxed">{error}</p>
          </div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            {role === "student" ? "Mobile Number or Email" : "Admin Identifier / Email"}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={
                role === "student" ? "e.g. 9876543210 or name@example.com" : "admin@qpet.org"
              }
              required
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full pl-10 pr-10 py-2.5 bg-slate-950/60 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-teal-600 hover:bg-teal-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-600/20"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Helper Links */}
      <div className="mt-8 pt-6 border-t border-slate-800 text-center">
        {role === "student" ? (
          <p className="text-xs text-slate-400">
            Don't have an account yet?{" "}
            <Link href="/register" className="text-teal-400 hover:text-teal-300 font-semibold underline ml-1">
              Register as Student
            </Link>
          </p>
        ) : (
          <p className="text-xs text-slate-500">
            Default credentials: <span className="font-mono text-slate-400">admin@qpet.org</span> / <span className="font-mono text-slate-400">Admin@QPET2026</span>
          </p>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <Suspense fallback={<div className="text-slate-400 text-sm">Loading login...</div>}>
          <LoginForm />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
