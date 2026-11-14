import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShieldCheck,
  FileText,
  CreditCard,
  Award,
  ArrowRight,
  BookOpen,
  Search,
  Sparkles,
  ChevronRight,
  GraduationCap,
  CheckCircle2,
  Users,
  Laptop,
  Check,
} from "lucide-react";
import { connectDB } from "@/lib/db/mongoose";
import { Course } from "@/lib/models/Course";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getFeaturedCourses() {
  try {
    await connectDB();
    const courses = await Course.find({ isActive: true }).sort({ durationMonths: 1 }).lean();
    return courses.map((c: any) => ({
      _id: c._id.toString(),
      code: c.code,
      title: c.title,
      description: c.description || "",
      durationMonths: c.durationMonths || 1,
      durationText: c.durationText || `${c.durationMonths || 1} Months`,
      defaultFee: c.defaultFee || 0,
    }));
  } catch (err) {
    console.error("Failed to load courses on landing:", err);
    return [];
  }
}

export default async function HomePage() {
  const courses = await getFeaturedCourses();

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F8FF] text-[#173B70] relative overflow-x-hidden selection:bg-[#3978E8] selection:text-white">
      {/* Subtle Academic Ambient Lighting (Static Soft Gradients) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[550px] bg-[radial-gradient(ellipse_at_top,_rgba(57,120,232,0.08)_0%,_transparent_70%)]" />
        <div className="absolute top-[20%] right-[-5%] w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(22,168,154,0.06)_0%,_transparent_65%)] blur-3xl" />
        <div className="absolute top-[45%] left-[-10%] w-[700px] h-[700px] bg-[radial-gradient(circle,_rgba(118,84,214,0.05)_0%,_transparent_65%)] blur-3xl" />
        <div className="absolute bottom-[10%] right-[5%] w-[600px] h-[600px] bg-[radial-gradient(circle,_rgba(57,120,232,0.05)_0%,_transparent_65%)] blur-3xl" />
      </div>

      <Navbar />

      {/* ========================================================================= */}
      {/* HERO SECTION: Academic Identity with Stationary 3D Books & Learning Desk */}
      {/* ========================================================================= */}
      <section className="relative z-10 pt-8 pb-14 sm:pt-14 sm:pb-18 lg:pt-16 lg:pb-20 px-4 sm:px-6 lg:px-8 border-b border-[#3978E8]/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 items-center">
            {/* Left Column: Academic Typography & CTAs (7 cols) */}
            <div className="md:col-span-7 space-y-5 text-left">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#3978E8]/20 text-[#173B70] text-xs font-bold tracking-wide shadow-sm shadow-[#173B70]/5">
                <span className="flex h-2 w-2 rounded-full bg-[#16A89A]" />
                <span className="uppercase tracking-wider text-[11px] font-black text-[#173B70]">
                  QPET Institute of Information Technology
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-[#3978E8] font-bold text-[11px]">ISO 9001:2015 Certified</span>
              </div>

              {/* Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#173B70] leading-[1.14]">
                Quality Professional Education &amp; Training{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#173B70] via-[#3978E8] to-[#7654D6]">
                  LMS Portal
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-[#173B70]/80 font-normal leading-relaxed max-w-xl">
                Comprehensive academic management for student registrations, sequential enrollment tracking, installment fee receipts, and official tamper-proof QR certificate verification.
              </p>

              {/* Action Buttons: 3 Modern Academic Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5 max-w-xl">
                {/* Button 1: Student Self-Registration (Primary) */}
                <Link
                  href="/register"
                  className="px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#173B70] via-[#3978E8] to-[#7654D6] hover:opacity-95 shadow-[0_8px_20px_-4px_rgba(57,120,232,0.4)] hover:-translate-y-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
                >
                  <span>Student Self-Registration</span>
                  <div className="w-5 h-5 rounded-full bg-[#16A89A] text-white flex items-center justify-center text-[10px] group-hover:translate-x-0.5 transition-transform">
                    <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                  </div>
                </Link>

                {/* Button 2: Portal Login (Navy Outline) */}
                <Link
                  href="/login"
                  className="px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-[#173B70] bg-white hover:bg-[#F5F8FF] border-2 border-[#173B70]/20 hover:border-[#173B70] shadow-sm hover:-translate-y-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 group"
                >
                  <span>Portal Login</span>
                  <ChevronRight className="w-4 h-4 text-[#3978E8] group-hover:translate-x-0.5 transition-transform stroke-[2.5]" />
                </Link>

                {/* Button 3: Verify Certificate (Glass Accent) */}
                <Link
                  href="/verify-certificate"
                  className="px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-[#173B70] bg-[#16A89A]/10 hover:bg-[#16A89A]/20 border border-[#16A89A]/30 shadow-xs hover:-translate-y-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 group"
                >
                  <ShieldCheck className="w-4 h-4 text-[#16A89A] stroke-[2.5]" />
                  <span>Verify Certificate</span>
                </Link>
              </div>

              {/* Trust Metric Counters */}
              <div className="pt-4 border-t border-[#3978E8]/15 grid grid-cols-3 gap-3 sm:gap-6 max-w-lg">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#173B70]">100%</div>
                  <div className="text-[11px] font-semibold text-[#173B70]/70 mt-0.5">Tamper-Proof QR</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#3978E8]">12,000+</div>
                  <div className="text-[11px] font-semibold text-[#173B70]/70 mt-0.5">Enrolled Students</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-[#16A89A]">ISO 9001</div>
                  <div className="text-[11px] font-semibold text-[#173B70]/70 mt-0.5">Certified Standard</div>
                </div>
              </div>
            </div>

            {/* Right Column: Realistic 3D Stationary Books & Academic Desk Scene (5 cols) */}
            {/* NOTE: BOOKS ARE COMPLETELY STATIONARY — NO SPINNING, NO BOUNCING, NO FLOATING */}
            <div className="md:col-span-5 relative flex items-center justify-center">
              <div className="w-full max-w-lg relative">
                {/* Background Academic Glow Card */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#3978E8]/10 via-[#7654D6]/10 to-[#16A89A]/10 rounded-3xl blur-2xl transform scale-95 pointer-events-none" />

                {/* Main Illustration Card */}
                <div className="relative rounded-3xl bg-white/95 backdrop-blur-xl border-2 border-[#3978E8]/20 p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(23,59,112,0.18)]">
                  {/* Stationary SVG Illustration of Open Books, Stacked Textbooks, Cap, and Certificate */}
                  <svg
                    viewBox="0 0 460 380"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-auto drop-shadow-md select-none"
                  >
                    <defs>
                      {/* Realistic book shadows & gradients */}
                      <linearGradient id="navyBookSpine" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0B1A33" />
                        <stop offset="25%" stopColor="#173B70" />
                        <stop offset="85%" stopColor="#25559C" />
                        <stop offset="100%" stopColor="#0F274A" />
                      </linearGradient>

                      <linearGradient id="royalBookSpine" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#1F4EA3" />
                        <stop offset="30%" stopColor="#3978E8" />
                        <stop offset="85%" stopColor="#689BF2" />
                        <stop offset="100%" stopColor="#1C4591" />
                      </linearGradient>

                      <linearGradient id="tealBookSpine" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0D685F" />
                        <stop offset="30%" stopColor="#16A89A" />
                        <stop offset="85%" stopColor="#38C7B9" />
                        <stop offset="100%" stopColor="#0C5750" />
                      </linearGradient>

                      <linearGradient id="openPageGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#E5EDF9" />
                        <stop offset="10%" stopColor="#FFFFFF" />
                        <stop offset="90%" stopColor="#FFFFFF" />
                        <stop offset="100%" stopColor="#D9E4F5" />
                      </linearGradient>

                      <linearGradient id="goldSeal" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFE066" />
                        <stop offset="50%" stopColor="#F5B700" />
                        <stop offset="100%" stopColor="#D49A00" />
                      </linearGradient>

                      <radialGradient id="deskShadow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="rgba(23,59,112,0.22)" />
                        <stop offset="60%" stopColor="rgba(23,59,112,0.08)" />
                        <stop offset="100%" stopColor="transparent" />
                      </radialGradient>
                    </defs>

                    {/* Desk Surface Shadow (Stationary Ground Plane) */}
                    <ellipse cx="230" cy="350" rx="195" ry="22" fill="url(#deskShadow)" />

                    {/* ========================================================= */}
                    {/* 1. STACKED HARDCOVER TEXTBOOKS (Stationary 3D Stack, Left) */}
                    {/* ========================================================= */}
                    {/* Bottom Textbook: Navy Blue (#173B70) */}
                    <g id="bottom-book">
                      {/* Shadow under book */}
                      <rect x="42" y="324" width="220" height="12" rx="4" fill="rgba(11,26,51,0.25)" />
                      {/* Pages block */}
                      <rect x="50" y="304" width="210" height="22" rx="2" fill="#F0F4FA" stroke="#D1DCED" strokeWidth="1" />
                      <line x1="60" y1="310" x2="250" y2="310" stroke="#CBD8EB" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="60" y1="315" x2="250" y2="315" stroke="#CBD8EB" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="60" y1="320" x2="250" y2="320" stroke="#CBD8EB" strokeWidth="1" strokeDasharray="3 3" />
                      {/* Spine & Cover */}
                      <rect x="38" y="300" width="22" height="28" rx="4" fill="url(#navyBookSpine)" />
                      <rect x="52" y="300" width="210" height="5" rx="1" fill="#173B70" />
                      <rect x="52" y="324" width="210" height="5" rx="1" fill="#0B1A33" />
                      {/* Gold foil text on spine */}
                      <text x="49" y="318" fontSize="8" fontWeight="bold" fill="#FFE066" transform="rotate(-90 49 318)" letterSpacing="1">
                        QPET ADVANCED
                      </text>
                    </g>

                    {/* Middle Textbook: Royal Blue (#3978E8) */}
                    <g id="middle-book">
                      {/* Pages block */}
                      <rect x="56" y="278" width="198" height="20" rx="2" fill="#F8FAFD" stroke="#D6E2F5" strokeWidth="1" />
                      <line x1="66" y1="284" x2="244" y2="284" stroke="#D1DCED" strokeWidth="1" strokeDasharray="3 3" />
                      <line x1="66" y1="290" x2="244" y2="290" stroke="#D1DCED" strokeWidth="1" strokeDasharray="3 3" />
                      {/* Spine & Cover */}
                      <rect x="44" y="274" width="20" height="26" rx="4" fill="url(#royalBookSpine)" />
                      <rect x="58" y="274" width="198" height="4" rx="1" fill="#3978E8" />
                      <rect x="58" y="296" width="198" height="4" rx="1" fill="#1F4EA3" />
                      {/* Foil text on spine */}
                      <text x="54" y="290" fontSize="7" fontWeight="bold" fill="#FFFFFF" transform="rotate(-90 54 290)" letterSpacing="1">
                        IT &amp; CODING
                      </text>
                    </g>

                    {/* Top Textbook: Teal (#16A89A) */}
                    <g id="top-book">
                      {/* Pages block */}
                      <rect x="62" y="254" width="186" height="18" rx="2" fill="#FFFFFF" stroke="#D6E2F5" strokeWidth="1" />
                      <line x1="72" y1="260" x2="238" y2="260" stroke="#D1DCED" strokeWidth="1" strokeDasharray="3 3" />
                      {/* Spine & Cover */}
                      <rect x="50" y="250" width="18" height="24" rx="4" fill="url(#tealBookSpine)" />
                      <rect x="62" y="250" width="186" height="4" rx="1" fill="#16A89A" />
                      <rect x="62" y="270" width="186" height="4" rx="1" fill="#0D685F" />
                      {/* Indigo bookmark ribbon hanging out */}
                      <path d="M220 254 L220 286 L226 280 L232 286 L232 254 Z" fill="#7654D6" />
                    </g>

                    {/* ========================================================= */}
                    {/* 2. LAPTOP PREVIEWING QPET LMS PLATFORM (Stationary, Back) */}
                    {/* ========================================================= */}
                    <g id="laptop-mockup">
                      {/* Laptop Base */}
                      <path d="M230 248 L390 248 L405 264 L215 264 Z" fill="#CBD5E1" />
                      <path d="M275 262 L345 262 L343 264 L277 264 Z" fill="#94A3B8" />
                      {/* Laptop Screen Bezel */}
                      <rect x="238" y="145" width="144" height="103" rx="8" fill="#1E293B" stroke="#0F172A" strokeWidth="3" />
                      <circle cx="310" cy="151" r="2" fill="#64748B" />
                      {/* Screen Content: LMS Dashboard UI */}
                      <rect x="244" y="157" width="132" height="85" rx="4" fill="#FFFFFF" />
                      {/* Top Bar */}
                      <rect x="244" y="157" width="132" height="14" fill="#173B70" />
                      <circle cx="252" cy="164" r="2" fill="#16A89A" />
                      <text x="258" y="167" fontSize="6" fontWeight="bold" fill="#FFFFFF">QPET LMS Student Portal</text>
                      <rect x="350" y="161" width="20" height="6" rx="2" fill="#3978E8" />
                      {/* Dashboard Content Mockup */}
                      <rect x="250" y="177" width="70" height="28" rx="3" fill="#F0EBFA" stroke="#D8C7F5" strokeWidth="0.8" />
                      <text x="255" y="186" fontSize="5" fontWeight="bold" fill="#7654D6">Active Course</text>
                      <text x="255" y="195" fontSize="7" fontWeight="bold" fill="#173B70">ADCA Diploma</text>
                      <text x="255" y="202" fontSize="5" fill="#16A89A">Progress: 94%</text>
                      {/* Small Chart */}
                      <rect x="325" y="177" width="45" height="28" rx="3" fill="#F5F8FF" stroke="#D1DCED" strokeWidth="0.8" />
                      <line x1="330" y1="200" x2="335" y2="192" stroke="#3978E8" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="335" y1="192" x2="342" y2="196" stroke="#3978E8" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="342" y1="196" x2="350" y2="185" stroke="#16A89A" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="350" y1="185" x2="362" y2="182" stroke="#16A89A" strokeWidth="1.5" strokeLinecap="round" />
                      {/* Certificate status pill on screen */}
                      <rect x="250" y="212" width="120" height="22" rx="3" fill="#E6F7F5" stroke="#16A89A" strokeWidth="0.8" />
                      <circle cx="258" cy="223" r="4" fill="#16A89A" />
                      <path d="M256 223 L257.5 224.5 L260.5 221.5" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
                      <text x="266" y="222" fontSize="5" fontWeight="bold" fill="#0D685F">Verified Certificate Ready</text>
                      <text x="266" y="228" fontSize="4.5" fill="#173B70">ID: QPET-CERT-2026-00001</text>
                    </g>

                    {/* ========================================================= */}
                    {/* 3. LARGE STATIONARY OPEN BOOK (Stationary 3D Centerpiece)  */}
                    {/* ========================================================= */}
                    <g id="open-textbook">
                      {/* Deep Soft Drop Shadow under open pages */}
                      <path
                        d="M80 326 C155 338 200 328 230 334 C260 328 305 338 380 326 C380 328 260 348 230 342 C200 348 80 328 80 326 Z"
                        fill="rgba(23,59,112,0.22)"
                      />

                      {/* Hardcover Outer Binding (Deep Navy #173B70) */}
                      <path
                        d="M74 316 C145 324 195 318 230 324 C265 318 315 324 386 316 L388 322 C315 330 265 324 230 330 C195 324 145 330 72 322 Z"
                        fill="#0F274A"
                      />

                      {/* Book Pages - Left Page (Realistic curved open page) */}
                      <path
                        d="M80 312 C140 318 190 306 228 316 L228 250 C190 240 140 252 80 246 Z"
                        fill="url(#openPageGrad)"
                        stroke="#CBD8EB"
                        strokeWidth="1"
                      />
                      {/* Page depth lines on left page */}
                      <path d="M78 314 C138 320 188 308 228 318" stroke="#BACCE6" strokeWidth="1" />
                      <path d="M76 316 C136 322 186 310 228 320" stroke="#BACCE6" strokeWidth="1" />

                      {/* Book Pages - Right Page (Realistic curved open page) */}
                      <path
                        d="M232 316 C270 306 320 318 380 312 L380 246 C320 252 270 240 232 250 Z"
                        fill="url(#openPageGrad)"
                        stroke="#CBD8EB"
                        strokeWidth="1"
                      />
                      {/* Page depth lines on right page */}
                      <path d="M232 318 C272 308 322 320 382 314" stroke="#BACCE6" strokeWidth="1" />
                      <path d="M232 320 C272 310 322 322 384 316" stroke="#BACCE6" strokeWidth="1" />

                      {/* Center Gutter / Spine Fold Shadow */}
                      <path d="M228 250 L230 324 L232 250 Z" fill="#BACCE6" />

                      {/* Content on Left Page: Printed Academic Lines */}
                      <line x1="95" y1="260" x2="160" y2="260" stroke="#173B70" strokeWidth="2.5" strokeLinecap="round" />
                      <line x1="95" y1="270" x2="210" y2="270" stroke="#BACCE6" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="95" y1="277" x2="212" y2="277" stroke="#BACCE6" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="95" y1="284" x2="208" y2="284" stroke="#BACCE6" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="95" y1="291" x2="195" y2="291" stroke="#BACCE6" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="95" y1="298" x2="205" y2="298" stroke="#BACCE6" strokeWidth="1.5" strokeLinecap="round" />

                      {/* Content on Right Page: Diagram / Seal & Academic Text */}
                      <line x1="250" y1="260" x2="310" y2="260" stroke="#3978E8" strokeWidth="2.5" strokeLinecap="round" />
                      <rect x="250" y="268" width="55" height="34" rx="3" fill="#F0EBFA" stroke="#7654D6" strokeWidth="1" />
                      {/* Mini certificate seal in book */}
                      <circle cx="277" cy="285" r="9" fill="#16A89A" />
                      <path d="M273 285 L276 288 L282 282" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <line x1="315" y1="272" x2="365" y2="272" stroke="#BACCE6" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="315" y1="279" x2="362" y2="279" stroke="#BACCE6" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="315" y1="286" x2="365" y2="286" stroke="#BACCE6" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="315" y1="293" x2="355" y2="293" stroke="#BACCE6" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="250" y1="308" x2="365" y2="308" stroke="#BACCE6" strokeWidth="1.5" strokeLinecap="round" />
                    </g>

                    {/* ========================================================= */}
                    {/* 4. GRADUATION CAP (MORTARBOARD) & GOLD TASSEL (Stationary) */}
                    {/* ========================================================= */}
                    <g id="graduation-cap">
                      {/* Shadow under cap */}
                      <ellipse cx="140" cy="226" rx="55" ry="14" fill="rgba(11,26,51,0.28)" />
                      {/* Cap Skull Base */}
                      <path d="M110 210 Q140 228 170 210 L170 218 Q140 236 110 218 Z" fill="#0B1A33" />
                      {/* Diamond Top (Perspective 3D) */}
                      <polygon points="140,172 205,196 140,220 75,196" fill="#173B70" stroke="#0B1A33" strokeWidth="1.5" />
                      {/* Center Button */}
                      <circle cx="140" cy="196" r="3.5" fill="#FFE066" />
                      {/* Golden Tassel Draped over edge */}
                      <path d="M140 196 Q175 198 185 212 Q192 222 195 240" stroke="#FFE066" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                      {/* Tassel Fringe */}
                      <polygon points="193,240 197,240 200,256 190,256" fill="url(#goldSeal)" />
                    </g>

                    {/* ========================================================= */}
                    {/* 5. OFFICIAL CERTIFICATE SCROLL WITH WAX RIBBON SEAL       */}
                    {/* ========================================================= */}
                    <g id="certificate-scroll">
                      {/* Shadow under scroll */}
                      <ellipse cx="370" cy="336" rx="42" ry="10" fill="rgba(23,59,112,0.25)" />
                      {/* Rolled Certificate Parchment */}
                      <rect x="335" y="270" width="70" height="62" rx="4" fill="#FFFFFF" stroke="#D1DCED" strokeWidth="1" transform="rotate(8 335 270)" />
                      <line x1="345" y1="282" x2="395" y2="289" stroke="#173B70" strokeWidth="1.5" strokeLinecap="round" />
                      <line x1="347" y1="290" x2="390" y2="296" stroke="#CBD8EB" strokeWidth="1" strokeLinecap="round" />
                      <line x1="349" y1="298" x2="392" y2="304" stroke="#CBD8EB" strokeWidth="1" strokeLinecap="round" />
                      {/* Official Teal/Gold Ribbon Seal */}
                      <circle cx="380" cy="318" r="13" fill="url(#goldSeal)" stroke="#FFFFFF" strokeWidth="1.5" />
                      <circle cx="380" cy="318" r="10" fill="#16A89A" />
                      {/* QPET Star in Seal */}
                      <polygon points="380,311 382.5,316 388,316.5 384,320 385.5,325 380,322 374.5,325 376,320 372,316.5 377.5,316" fill="#FFE066" />
                      {/* Hanging Ribbon tails */}
                      <path d="M375 328 L370 348 L376 344 L382 348 L380 328 Z" fill="#7654D6" />
                    </g>

                    {/* Stationery: Fountain Pen on desk */}
                    <g id="stationery-pen">
                      <polygon points="65,340 135,346 133,350 63,344" fill="#173B70" />
                      <polygon points="63,344 55,343 65,340" fill="#FFE066" />
                      <rect x="100" y="342" width="28" height="6" rx="1.5" fill="#3978E8" />
                    </g>
                  </svg>

                  {/* Floating Micro-Badge on illustration card (Stationary) */}
                  <div className="mt-4 pt-4 border-t border-[#3978E8]/15 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#16A89A]" />
                      <span className="font-bold text-[#173B70]">Academic Excellence</span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#173B70]/70">
                      Standardized Digital Records
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4 CORE CAPABILITIES: Refined Educational Cards with Soft Shadows           */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Heading */}
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#3978E8]/10 text-[#173B70] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-[#3978E8]" />
              Institutional Standard Architecture
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-[#173B70] tracking-tight">
              Built for Academic Integrity &amp; Administration
            </h2>
            <p className="text-xs sm:text-sm text-[#173B70]/75 font-normal">
              Modern digital infrastructure replacing manual paperwork with automated, tamper-proof student workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Sequential Numbering (Royal Blue Accent) */}
            <div className="p-6 rounded-2xl bg-white hover:bg-[#F5F8FF] border border-[#3978E8]/20 shadow-[0_10px_30px_-5px_rgba(23,59,112,0.06)] hover:shadow-[0_16px_36px_-5px_rgba(57,120,232,0.12)] hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-[#3978E8]/10 border border-[#3978E8]/20 text-[#3978E8] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="font-bold text-[#173B70] text-base mb-1.5">
                Sequential Numbering
              </h3>
              <p className="text-xs text-[#173B70]/75 leading-relaxed">
                Unique QPET-YYYY-NNNNN counter generated atomically per calendar year with zero collision risk.
              </p>
              <div className="mt-4 pt-3 border-t border-[#3978E8]/10 flex items-center text-[11px] font-bold text-[#3978E8]">
                <span>Atomic Counter Service</span>
              </div>
            </div>

            {/* Card 2: Fees & Installments (Teal Accent) */}
            <div className="p-6 rounded-2xl bg-white hover:bg-[#F5F8FF] border border-[#16A89A]/20 shadow-[0_10px_30px_-5px_rgba(23,59,112,0.06)] hover:shadow-[0_16px_36px_-5px_rgba(22,168,154,0.12)] hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-[#16A89A]/10 border border-[#16A89A]/20 text-[#16A89A] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <CreditCard className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="font-bold text-[#173B70] text-base mb-1.5">
                Fees &amp; Installments
              </h3>
              <p className="text-xs text-[#173B70]/75 leading-relaxed">
                Full or installment schedules with instant vector PDF receipts and real-time live balance audits.
              </p>
              <div className="mt-4 pt-3 border-t border-[#16A89A]/10 flex items-center text-[11px] font-bold text-[#16A89A]">
                <span>Automated Ledger Engine</span>
              </div>
            </div>

            {/* Card 3: Issued Certificates (Indigo Accent) */}
            <div className="p-6 rounded-2xl bg-white hover:bg-[#F5F8FF] border border-[#7654D6]/20 shadow-[0_10px_30px_-5px_rgba(23,59,112,0.06)] hover:shadow-[0_16px_36px_-5px_rgba(118,84,214,0.12)] hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-[#7654D6]/10 border border-[#7654D6]/20 text-[#7654D6] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Award className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="font-bold text-[#173B70] text-base mb-1.5">
                Issued Certificates
              </h3>
              <p className="text-xs text-[#173B70]/75 leading-relaxed">
                Admin-authorized completion certificates with scannable tamper-proof QR verification hashes.
              </p>
              <div className="mt-4 pt-3 border-t border-[#7654D6]/10 flex items-center text-[11px] font-bold text-[#7654D6]">
                <span>Vector PDF &amp; QR Codes</span>
              </div>
            </div>

            {/* Card 4: Public Verification (Navy Accent) */}
            <div className="p-6 rounded-2xl bg-white hover:bg-[#F5F8FF] border border-[#173B70]/20 shadow-[0_10px_30px_-5px_rgba(23,59,112,0.06)] hover:shadow-[0_16px_36px_-5px_rgba(23,59,112,0.12)] hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-[#173B70]/10 border border-[#173B70]/20 text-[#173B70] flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <h3 className="font-bold text-[#173B70] text-base mb-1.5">
                Public Verification
              </h3>
              <p className="text-xs text-[#173B70]/75 leading-relaxed">
                Instant public lookup protecting student privacy while preventing forged credential misuse.
              </p>
              <div className="mt-4 pt-3 border-t border-[#173B70]/10 flex items-center text-[11px] font-bold text-[#173B70]">
                <span>Instant QR Scanner Page</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* COURSES CATALOG: Clean Academic Cards with Hover Elevation                */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8 bg-white/60 border-y border-[#3978E8]/10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16A89A]/10 text-[#16A89A] text-xs font-bold uppercase tracking-wider mb-2">
                <BookOpen className="w-3.5 h-3.5" />
                Industry-Recognized Curriculum
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-[#173B70] tracking-tight">
                Computer Courses Offered
              </h2>
              <p className="text-[#173B70]/75 text-xs sm:text-sm font-normal mt-1 max-w-2xl">
                Practical, job-oriented computer training programs with structured syllabus, lab assignments, and official certifications.
              </p>
            </div>

            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#173B70] via-[#3978E8] to-[#7654D6] shadow-md shadow-[#3978E8]/25 hover:opacity-95 hover:-translate-y-0.5 transition-all group shrink-0"
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
                  className="rounded-2xl bg-white border border-[#3978E8]/20 p-6 flex flex-col justify-between shadow-[0_8px_25px_-5px_rgba(23,59,112,0.06)] hover:shadow-[0_16px_35px_-5px_rgba(57,120,232,0.12)] hover:border-[#3978E8]/40 hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs px-2.5 py-1 rounded-md bg-[#173B70]/10 text-[#173B70] font-black border border-[#173B70]/15">
                        {course.code}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-[#16A89A]/10 text-[#16A89A] border border-[#16A89A]/25 text-xs font-bold">
                        {course.durationText || `${course.durationMonths} Months`}
                      </span>
                    </div>

                    <h3 className="text-lg font-black text-[#173B70] group-hover:text-[#3978E8] transition-colors leading-snug">
                      {course.title}
                    </h3>

                    <p className="text-xs text-[#173B70]/70 leading-relaxed line-clamp-3 font-normal">
                      {course.description || "Comprehensive hands-on computer training, practical lab work, and professional certification."}
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-[#3978E8]/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#173B70]/60 uppercase font-bold tracking-wider block">
                        Course Tuition Fee
                      </span>
                      <span className="text-lg font-black text-[#173B70]">
                        ₹{course.defaultFee.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <Link
                      href={`/register?course=${course._id.toString()}`}
                      className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-white bg-[#173B70] hover:bg-[#3978E8] transition-colors shadow-xs"
                    >
                      Apply Now
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-16 text-[#173B70]/70 text-sm bg-white/50 rounded-2xl border border-dashed border-[#3978E8]/30">
                Loading QPET courses catalog...
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* CERTIFICATE VERIFICATION CALLOUT BANNER: Institutional Trust Banner       */}
      {/* ========================================================================= */}
      <section className="relative z-10 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto rounded-3xl bg-gradient-to-br from-[#173B70] via-[#1F4EA3] to-[#0D203D] text-white p-8 sm:p-12 text-center shadow-[0_20px_50px_-10px_rgba(23,59,112,0.3)] relative overflow-hidden">
          {/* Subtle Accent Glows */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-[#3978E8]/30 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-[#16A89A]/20 blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 border border-white/20 text-white shadow-md mx-auto">
              <ShieldCheck className="w-8 h-8 text-[#16A89A] stroke-[2.2]" />
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Need to Verify a Student's Certificate?
            </h2>

            <p className="text-xs sm:text-sm text-blue-100/80 font-normal leading-relaxed">
              Employers, recruiters, and educational institutions can verify the authenticity of certificates issued by QPET instantly using our tamper-proof QR code lookup.
            </p>

            <div className="pt-2">
              <Link
                href="/verify-certificate"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#173B70] bg-white hover:bg-[#F5F8FF] shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <Search className="w-4 h-4 text-[#3978E8] stroke-[2.5]" />
                <span>Open Public Verification Page</span>
                <ArrowRight className="w-4 h-4 text-[#173B70] stroke-[2.5]" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
