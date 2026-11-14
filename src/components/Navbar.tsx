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
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-[#3978E8]/15 text-[#173B70] shadow-[0_4px_25px_-5px_rgba(23,59,112,0.06)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* =================================================================== */}
        {/* BRAND LOGO & INSTITUTION NAME                                       */}
        {/* =================================================================== */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-2xl bg-white p-1 flex items-center justify-center shadow-md shadow-[#173B70]/10 group-hover:scale-105 transition-transform overflow-hidden border border-[#3978E8]/20">
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
              <span className="font-black text-xl tracking-tight text-[#173B70]">QPET</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#16A89A]/15 text-[#16A89A] font-black border border-[#16A89A]/30">
                LMS
              </span>
            </div>
            <p className="text-[11px] text-[#173B70]/75 font-semibold tracking-wide">
              Qplus Education &amp; Training
            </p>
          </div>
        </Link>

        {/* =================================================================== */}
        {/* DESKTOP NAVIGATION LINKS WITH ANIMATED ACTIVE INDICATORS            */}
        {/* =================================================================== */}
        <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 rounded-full text-xs font-bold tracking-wide transition-all flex items-center gap-1.5 ${
                  isActive
                    ? "text-[#173B70] bg-[#3978E8]/10 border border-[#3978E8]/25 shadow-xs"
                    : "text-[#173B70]/80 hover:text-[#3978E8] hover:bg-[#F5F8FF]"
                }`}
              >
                {Icon && (
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? "text-[#3978E8]" : "text-[#173B70]/60"
                    }`}
                  />
                )}
                <span>{link.label}</span>
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#3978E8] shadow-[0_0_8px_#3978E8]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* =================================================================== */}
        {/* ACTION BUTTONS (Login & Register in Premium Academic Style)         */}
        {/* =================================================================== */}
        <div className="hidden sm:flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-[#173B70] bg-white hover:bg-[#F5F8FF] border-2 border-[#3978E8]/25 shadow-xs hover:border-[#3978E8] hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
          >
            <LogIn className="w-3.5 h-3.5 text-[#3978E8] stroke-[2.5]" />
            <span>Login</span>
          </Link>

          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#173B70] via-[#3978E8] to-[#7654D6] hover:opacity-95 shadow-[0_8px_20px_-4px_rgba(57,120,232,0.35)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all group"
          >
            <span>Register</span>
            <div className="w-5 h-5 rounded-full bg-[#16A89A] text-white flex items-center justify-center text-[10px] group-hover:translate-x-0.5 transition-transform">
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
          className="md:hidden p-2 rounded-xl text-[#173B70] hover:bg-[#F5F8FF] border border-[#3978E8]/20 transition-colors"
        >
          {mobileOpen ? <X className="w-6 h-6 stroke-[2.5]" /> : <Menu className="w-6 h-6 stroke-[2.5]" />}
        </button>
      </div>

      {/* ===================================================================== */}
      {/* MOBILE RESPONSIVE DRAWER OVERLAY                                      */}
      {/* ===================================================================== */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-2xl border-b-2 border-[#3978E8]/20 px-5 pt-3 pb-6 space-y-4 shadow-2xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-1.5 pt-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-bold tracking-wide transition-all ${
                    isActive
                      ? "text-[#173B70] bg-[#3978E8]/10 border border-[#3978E8]/25 shadow-xs"
                      : "text-[#173B70]/80 hover:text-[#3978E8] hover:bg-[#F5F8FF]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {Icon && (
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? "text-[#3978E8]" : "text-[#173B70]/60"
                        }`}
                      />
                    )}
                    <span>{link.label}</span>
                  </div>
                  {isActive && (
                    <span className="w-2 h-2 rounded-full bg-[#3978E8] shadow-[0_0_8px_#3978E8]" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-[#3978E8]/15 grid grid-cols-2 gap-3">
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="py-3 rounded-xl text-center text-xs font-bold uppercase tracking-wider text-[#173B70] bg-[#F5F8FF] border border-[#3978E8]/30 shadow-xs"
            >
              Portal Login
            </Link>
            <Link
              href="/register"
              onClick={() => setMobileOpen(false)}
              className="py-3 rounded-xl text-center text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#173B70] via-[#3978E8] to-[#7654D6] shadow-md"
            >
              Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
