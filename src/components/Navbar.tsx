"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  LogIn,
  ArrowRight,
  Menu,
  X,
  GraduationCap,
  Sparkles,
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Verify Certificate", href: "/verify-certificate", icon: ShieldCheck },
    { label: "Student Registration", href: "/register" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-purple-200/70 text-[#1E0B36] shadow-[0_8px_30px_-5px_rgba(59,7,100,0.08)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* =================================================================== */}
        {/* BRAND LOGO & INSTITUTION NAME                                       */}
        {/* =================================================================== */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-white p-1 flex items-center justify-center shadow-md shadow-purple-900/10 group-hover:scale-105 transition-transform overflow-hidden border border-purple-200/80">
            <Image
              src="/images/QPET PNG.png"
              alt="QPET - Qplus Education & Training"
              width={44}
              height={44}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-xl tracking-tight text-[#1E0B36]">QPET</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4FF3F] text-[#1E0B36] font-black border border-[#8EB605] shadow-xs">
                LMS
              </span>
            </div>
            <p className="text-[11px] text-[#58337A] font-semibold tracking-wide">
              Qplus Education &amp; Training
            </p>
          </div>
        </Link>

        {/* =================================================================== */}
        {/* DESKTOP NAVIGATION LINKS WITH ANIMATED ACTIVE INDICATORS            */}
        {/* =================================================================== */}
        <nav className="hidden md:flex items-center gap-2 lg:gap-3">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 rounded-full text-xs font-black tracking-wide transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "text-[#3B0764] bg-[#3B0764]/10 border border-[#3B0764]/15 shadow-xs"
                    : "text-[#402C5E] hover:text-[#1E0B36] hover:bg-purple-50/80"
                }`}
              >
                {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[#E34234]" : "text-[#58337A]"}`} />}
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#E34234] shadow-[0_0_8px_#E34234]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* =================================================================== */}
        {/* ACTION BUTTONS (Login & Register in 3D Lavender Glass Style)        */}
        {/* =================================================================== */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider text-[#3B0764] bg-white hover:bg-purple-50 border-2 border-purple-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
          >
            <LogIn className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Login</span>
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#3B0764] via-[#581C87] to-[#E34234] hover:from-[#4C1D95] hover:to-[#C22B1E] shadow-[0_10px_20px_-4px_rgba(59,7,100,0.35),inset_0_1px_2px_rgba(255,255,255,0.4)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all group"
          >
            <span>Register</span>
            <div className="w-5 h-5 rounded-full bg-[#D4FF3F] text-[#1E0B36] flex items-center justify-center text-[10px] group-hover:translate-x-0.5 transition-transform">
              <ArrowRight className="w-3 h-3 stroke-[2.5]" />
            </div>
          </Link>
        </div>

        {/* =================================================================== */}
        {/* MOBILE MENU TOGGLE BUTTON                                           */}
        {/* =================================================================== */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Navigation Menu"
          className="md:hidden p-2 rounded-xl text-[#3B0764] hover:bg-purple-100/70 border border-purple-200 transition-colors"
        >
          {mobileOpen ? <X className="w-6 h-6 stroke-[2.5]" /> : <Menu className="w-6 h-6 stroke-[2.5]" />}
        </button>
      </div>

      {/* ===================================================================== */}
      {/* MOBILE RESPONSIVE DRAWER OVERLAY                                      */}
      {/* ===================================================================== */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-2xl border-b-2 border-purple-200 px-5 pt-3 pb-6 space-y-4 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1.5 pt-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-black tracking-wide transition-all ${
                    isActive
                      ? "text-[#3B0764] bg-[#3B0764]/10 border border-[#3B0764]/20 shadow-xs"
                      : "text-[#402C5E] hover:text-[#1E0B36] hover:bg-purple-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {Icon && <Icon className={`w-4 h-4 ${isActive ? "text-[#E34234]" : "text-[#58337A]"}`} />}
                    <span>{link.label}</span>
                  </div>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-[#E34234] shadow-[0_0_8px_#E34234]" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-purple-200/60 grid grid-cols-2 gap-3">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="py-3 rounded-xl text-center text-xs font-black uppercase tracking-wider text-[#3B0764] bg-purple-50 border-2 border-purple-200 shadow-xs"
            >
              Portal Login
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="py-3 rounded-xl text-center text-xs font-black uppercase tracking-wider text-white bg-gradient-to-r from-[#3B0764] to-[#E34234] shadow-md"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
