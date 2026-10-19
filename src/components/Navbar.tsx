"use client";

import Link from "next/link";
import { GraduationCap, ShieldCheck, User, LogIn, ArrowRight } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800 text-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xl tracking-tight text-white">QPET</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30">
                LMS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide">
              Institute of Information Technology
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <Link
            href="/verify-certificate"
            className="flex items-center gap-1.5 hover:text-teal-400 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-teal-400" />
            Verify Certificate
          </Link>
          <Link
            href="/register"
            className="hover:text-white transition-colors text-slate-300"
          >
            Student Registration
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 text-sm font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-700"
          >
            <LogIn className="w-4 h-4" />
            <span>Login</span>
          </Link>
          <Link
            href="/register"
            className="hidden sm:inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-sm shadow-teal-600/30 transition-all hover:shadow-teal-500/50"
          >
            <span>Register</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
