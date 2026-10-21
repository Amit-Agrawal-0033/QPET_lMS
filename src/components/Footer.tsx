import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Sparkles,
  Heart,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-[#250645] via-[#1B0333] to-[#120224] text-purple-200 border-t-2 border-purple-900/60 text-sm overflow-hidden z-10">
      {/* Ambient Volumetric Lighting Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] bg-[radial-gradient(circle,_rgba(203,179,230,0.12)_0%,_transparent_70%)] blur-2xl" />
        <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-[radial-gradient(circle,_rgba(212,255,63,0.08)_0%,_transparent_70%)] blur-2xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 pb-12 border-b border-purple-800/40">
          {/* =================================================================== */}
          {/* COLUMN 1 & 2: BRAND & MISSION                                       */}
          {/* =================================================================== */}
          <div className="lg:col-span-2 space-y-5">
            <Link href="/" className="flex items-center gap-3 group inline-flex">
              <div className="w-12 h-12 rounded-2xl bg-white p-1.5 flex items-center justify-center shadow-lg shadow-black/30 group-hover:scale-105 transition-transform overflow-hidden border border-white/20">
                <Image
                  src="/images/QPET PNG.png"
                  alt="QPET Logo"
                  width={46}
                  height={46}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-2xl text-white tracking-tight">QPET</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4FF3F] text-[#1E0B36] font-black border border-[#8EB605]">
                    PORTAL
                  </span>
                </div>
                <p className="text-xs text-purple-300 font-semibold tracking-wide">
                  Qplus Education &amp; Training
                </p>
              </div>
            </Link>

            <p className="text-xs sm:text-sm text-purple-300/80 leading-relaxed max-w-sm font-medium">
              QPET Institute of Information Technology is dedicated to providing quality professional education, job-oriented practical computer training, and tamper-proof industry certifications.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-purple-700/50 text-[11px] font-semibold text-purple-200">
              <Sparkles className="w-3.5 h-3.5 text-[#E34234]" />
              <span>Empower Learning, Empower Future</span>
            </div>

            {/* Social Links */}
            <div className="pt-2 flex items-center gap-3">
              {/* YouTube */}
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#E34234] border border-white/15 flex items-center justify-center text-white hover:scale-110 hover:shadow-lg transition-all"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>

              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-gradient-to-tr hover:from-amber-500 hover:to-rose-600 border border-white/15 flex items-center justify-center text-white hover:scale-110 hover:shadow-lg transition-all"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-blue-600 border border-white/15 flex items-center justify-center text-white hover:scale-110 hover:shadow-lg transition-all"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-[#0077B5] border border-white/15 flex items-center justify-center text-white hover:scale-110 hover:shadow-lg transition-all"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* =================================================================== */}
          {/* COLUMN 2: QUICK NAVIGATION LINKS                                    */}
          {/* =================================================================== */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D4FF3F]" />
              Quick Portals
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <Link
                  href="/"
                  className="hover:text-[#D4FF3F] hover:translate-x-1 inline-flex items-center gap-1.5 transition-all"
                >
                  <ArrowRight className="w-3 h-3 text-purple-400" />
                  <span>Home Page</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="hover:text-[#D4FF3F] hover:translate-x-1 inline-flex items-center gap-1.5 transition-all"
                >
                  <ArrowRight className="w-3 h-3 text-purple-400" />
                  <span>Student Self-Registration</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-[#D4FF3F] hover:translate-x-1 inline-flex items-center gap-1.5 transition-all"
                >
                  <ArrowRight className="w-3 h-3 text-purple-400" />
                  <span>Portal Login (Admin &amp; Student)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/verify-certificate"
                  className="hover:text-[#D4FF3F] hover:translate-x-1 inline-flex items-center gap-1.5 transition-all text-purple-100"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#E34234]" />
                  <span>Public QR Verification</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* =================================================================== */}
          {/* COLUMN 3: COMPUTER CURRICULUM                                       */}
          {/* =================================================================== */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E34234]" />
              Courses Offered
            </h4>
            <ul className="space-y-2.5 text-xs font-medium text-purple-300/90">
              <li className="flex items-center justify-between">
                <span>ADCA (Advance Diploma)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300">12M</span>
              </li>
              <li className="flex items-center justify-between">
                <span>DCA (Computer Applications)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300">6M</span>
              </li>
              <li className="flex items-center justify-between">
                <span>CCC (Computer Concepts)</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300">3M</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Tally Prime + GST</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300">3M</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Web Designing &amp; Coding</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300">6M</span>
              </li>
            </ul>
          </div>

          {/* =================================================================== */}
          {/* COLUMN 4: ADMINISTRATIVE CONTACT                                    */}
          {/* =================================================================== */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
              Administrative Office
            </h4>
            <ul className="space-y-3 text-xs font-medium">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#D4FF3F] shrink-0 mt-0.5" />
                <span className="text-purple-300/90">QPET Computer Academy &amp; IT Learning Campus</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#D4FF3F] shrink-0" />
                <span className="text-purple-200 font-mono">+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#D4FF3F] shrink-0" />
                <span className="text-purple-200">support@qpet.org</span>
              </li>
              <li className="pt-1">
                <div className="px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-800 text-[11px] text-purple-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D4FF3F]" />
                  <span>ISO 9001:2015 Certified System</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* =================================================================== */}
        {/* BOTTOM UTILITY BAR                                                  */}
        {/* =================================================================== */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-purple-400 font-medium">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} QPET LMS (Qplus Education &amp; Training).</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 text-[11px]">
            <Link href="/verify-certificate" className="hover:text-white transition-colors">
              Certificate Policy
            </Link>
            <Link href="/register" className="hover:text-white transition-colors">
              Admission Guidelines
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Staff Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
