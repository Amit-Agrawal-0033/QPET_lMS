"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Award,
  Calendar,
  User,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface VerificationResult {
  status: "valid" | "revoked" | "invalid";
  certificateNumber?: string;
  studentName?: string;
  enrollmentNumber?: string;
  courseName?: string;
  courseDuration?: string;
  issueDate?: string;
  grade?: string;
  revocationReason?: string;
  revokedAt?: string;
}

function CertificateVerifier() {
  const searchParams = useSearchParams();
  const certFromQuery = searchParams.get("cert") || searchParams.get("token") || "";

  const [query, setQuery] = useState(certFromQuery);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (certFromQuery) {
      handleVerify(certFromQuery);
    }
  }, [certFromQuery]);

  const handleVerify = async (queryValue?: string) => {
    const q = queryValue !== undefined ? queryValue : query;
    if (!q || !q.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/certificates/verify?query=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ status: "invalid" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl space-y-8 relative z-10">
      {/* 3D Glassmorphic Main Card */}
      <div className="bg-white/80 backdrop-blur-2xl border-2 border-white/95 rounded-[2.5rem] p-7 sm:p-12 shadow-[0_24px_60px_-12px_rgba(59,7,100,0.22),inset_0_2px_4px_rgba(255,255,255,1)] relative overflow-hidden">
        {/* Ambient Corner Accents */}
        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-[#D4FF3F]/35 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-[#E34234]/20 blur-2xl pointer-events-none" />

        {/* Card Header */}
        <div className="text-center space-y-4 mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#3B0764]/10 backdrop-blur-md border border-[#3B0764]/15 text-[#3B0764] text-xs font-black uppercase tracking-widest mb-1 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#E34234]" />
            <span>Public Credential Verification</span>
            <span className="w-2 h-2 rounded-full bg-[#D4FF3F] border border-[#8EB605]" />
          </div>

          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#FFA8A0] to-[#E34234] text-white shadow-[0_14px_28px_rgba(227,66,52,0.4)] flex items-center justify-center mx-auto border-2 border-white">
            <ShieldCheck className="w-9 h-9 stroke-[2.2]" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#1E0B36] tracking-tight">
            Certificate Verification
          </h1>

          <p className="text-xs sm:text-sm text-[#402C5E] font-medium max-w-md mx-auto leading-relaxed">
            Verify the authenticity and institutional validity of graduation certificates issued by QPET Institute of Information Technology.
          </p>
        </div>

        {/* Search Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
          className="flex flex-col sm:flex-row gap-3.5 relative z-10 mb-8"
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#58337A]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Certificate Number (e.g. QPET-CERT-2026-00001)"
              required
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50/90 border-2 border-purple-200/80 rounded-2xl text-sm text-[#1E0B36] placeholder-[#58337A]/50 font-medium focus:outline-none focus:bg-white focus:border-[#3B0764] focus:ring-4 focus:ring-purple-500/15 transition-all shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider text-white bg-gradient-to-b from-[#4C1D95] to-[#3B0764] hover:from-[#581C87] hover:to-[#4C1D95] shadow-[0_14px_28px_-6px_rgba(59,7,100,0.45),inset_0_2px_4px_rgba(255,255,255,0.4),inset_0_-3px_0_rgba(0,0,0,0.35)] hover:-translate-y-1 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Verify Now</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        {/* ===================================================================== */}
        {/* VERIFICATION RESULT DISPLAY                                           */}
        {/* ===================================================================== */}
        {hasSearched && result && (
          <div className="relative z-10 transition-all duration-500">
            {/* 1. VALID CERTIFICATE RESULT */}
            {result.status === "valid" ? (
              <div className="rounded-3xl border-2 border-[#8EB605]/50 bg-gradient-to-br from-[#D4FF3F]/20 via-white/80 to-[#D4FF3F]/10 backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#D4FF3F] text-[#1E0B36] border border-[#8EB605] shadow-[0_8px_20px_rgba(142,182,5,0.4)] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#455C02]">
                      Verification Seal
                    </span>
                    <h3 className="text-xl font-black text-[#1E0B36]">
                      Official Certificate is Valid &amp; Authentic
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-white/90 p-5 rounded-2xl border border-purple-200/80 shadow-sm">
                  <div>
                    <span className="text-[#58337A] font-bold block mb-1">Student Legal Name:</span>
                    <span className="text-base font-black text-[#1E0B36] uppercase tracking-tight">
                      {result.studentName}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#58337A] font-bold block mb-1">Certificate Number:</span>
                    <span className="text-sm font-mono font-extrabold text-[#3B0764] px-2 py-0.5 rounded bg-purple-100/80 border border-purple-200 inline-block">
                      {result.certificateNumber}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#58337A] font-bold block mb-1">Certified Course:</span>
                    <span className="text-sm font-extrabold text-[#1E0B36]">
                      {result.courseName}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#58337A] font-bold block mb-1">Duration &amp; Grade:</span>
                    <span className="text-sm font-semibold text-[#1E0B36]">
                      {result.courseDuration} {result.grade ? `— (Grade: ${result.grade})` : ""}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#58337A] font-bold block mb-1">Issue Date:</span>
                    <span className="text-sm font-semibold text-[#1E0B36]">
                      {result.issueDate
                        ? new Date(result.issueDate).toLocaleDateString("en-IN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "N/A"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#58337A] font-bold block mb-1">Verification Status:</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-[#D4FF3F] text-[#1E0B36] border border-[#8EB605]">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" /> Verified Authentic
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#402C5E] font-medium leading-relaxed text-center">
                  This official institutional record confirms that the candidate successfully completed all academic and practical requirements for the program at QPET.
                </p>
              </div>
            ) : result.status === "revoked" ? (
              /* 2. REVOKED CERTIFICATE RESULT */
              <div className="rounded-3xl border-2 border-[#E34234]/40 bg-rose-50/90 backdrop-blur-xl p-6 sm:p-8 space-y-4 shadow-lg text-left">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#E34234] text-white shadow-[0_8px_20px_rgba(227,66,52,0.4)] flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-7 h-7 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#A8190E]">
                      Notice of Revocation
                    </span>
                    <h3 className="text-xl font-black text-[#5E0802]">
                      Certificate Has Been Revoked
                    </h3>
                  </div>
                </div>

                <div className="bg-white/95 p-4 rounded-2xl border border-rose-200 text-xs space-y-2.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Certificate No:</span>
                    <span className="font-mono font-bold text-slate-900">{result.certificateNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Candidate Name:</span>
                    <span className="font-bold text-slate-900">{result.studentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Course:</span>
                    <span className="font-bold text-slate-900">{result.courseName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">Revocation Reason:</span>
                    <span className="text-[#A8190E] font-extrabold">{result.revocationReason || "Administrative decision"}</span>
                  </div>
                </div>

                <p className="text-xs text-[#A8190E] font-bold text-center">
                  This certificate has been revoked by QPET authorities and is no longer valid.
                </p>
              </div>
            ) : (
              /* 3. INVALID / NOT FOUND RESULT */
              <div className="rounded-3xl border-2 border-amber-400/50 bg-amber-50/90 backdrop-blur-xl p-6 sm:p-8 space-y-3 text-center shadow-lg">
                <div className="w-12 h-12 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center mx-auto shadow-md">
                  <AlertTriangle className="w-7 h-7 stroke-[2.5]" />
                </div>
                <h3 className="text-lg font-black text-amber-950">
                  Certificate Not Found or Invalid
                </h3>
                <p className="text-xs text-[#58337A] font-medium max-w-sm mx-auto leading-relaxed">
                  No matching record was found in the official QPET database for the entered query. Please double-check the certificate number or scan the QR code again.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-center text-xs text-[#402C5E] font-medium max-w-md mx-auto">
        In compliance with privacy and data protection standards, private contact numbers, physical addresses, and fee data are not disclosed on this public verification portal.
      </div>
    </div>
  );
}

export default function VerifyCertificatePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#CBB3E6] text-[#1E0B36] relative overflow-x-hidden selection:bg-[#E34234] selection:text-white">
      {/* Dynamic Keyframes */}
      <style>{`
        @keyframes floatSlow1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(4deg); }
        }
        @keyframes floatSlow2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(22px) rotate(-5deg); }
        }
        .anim-float-1 { animation: floatSlow1 7s ease-in-out infinite; }
        .anim-float-2 { animation: floatSlow2 9s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .anim-float-1, .anim-float-2 { animation: none !important; }
        }
      `}</style>

      {/* Volumetric Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[650px] bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.7)_0%,_transparent_70%)]" />
        <div className="absolute top-[20%] right-[-5%] w-[500px] h-[500px] bg-[radial-gradient(circle,_rgba(212,255,63,0.3)_0%,_transparent_65%)] blur-2xl" />
        <div className="absolute bottom-[10%] left-[-5%] w-[550px] h-[550px] bg-[radial-gradient(circle,_rgba(59,7,100,0.22)_0%,_transparent_65%)] blur-2xl" />
      </div>

      {/* Floating 3D Background Elements */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* 3D Bright Chartreuse Sphere (#D4FF3F) - Top Right */}
        <div className="absolute top-24 right-[8%] anim-float-1 hidden md:block">
          <div className="relative w-36 h-36 rounded-full shadow-[0_30px_60px_-10px_rgba(85,115,5,0.5)]">
            <div
              className="w-full h-full rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 34% 28%, #FFFFFF 0%, #F1FFA8 18%, #D4FF3F 45%, #8EB605 76%, #455C02 100%)",
                boxShadow:
                  "inset -12px -14px 24px rgba(0,0,0,0.38), inset 7px 9px 16px rgba(255,255,255,0.9)",
              }}
            />
            <div className="absolute top-4 left-6 w-9 h-5 rounded-full bg-white/75 blur-[1.5px] rotate-[-28deg]" />
          </div>
        </div>

        {/* 3D Deep Purple Fluid Shape - Left */}
        <div className="absolute top-[38%] left-[4%] anim-float-2 hidden md:block">
          <svg
            viewBox="0 0 200 200"
            className="w-52 h-52 filter drop-shadow-[0_30px_45px_rgba(46,16,101,0.4)]"
          >
            <defs>
              <radialGradient id="verifyPurple" cx="35%" cy="30%" r="70%">
                <stop offset="0%" stopColor="#E9D5FF" />
                <stop offset="22%" stopColor="#A855F7" />
                <stop offset="55%" stopColor="#581C87" />
                <stop offset="85%" stopColor="#3B0764" />
                <stop offset="100%" stopColor="#1C0530" />
              </radialGradient>
            </defs>
            <path
              d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.3,88.7,-0.7C87.4,14.8,82.3,29.6,73.8,42.4C65.3,55.2,53.4,66,39.8,73.1C26.1,80.2,10.7,83.5,-4.4,81.1C-19.5,78.6,-34.3,70.3,-46.8,61.4C-59.3,52.4,-69.6,42.8,-76.9,30.8C-84.2,18.8,-88.7,4.4,-86.6,-9.3C-84.5,-23,-75.8,-36,-65.3,-46.6C-54.8,-57.2,-42.6,-65.4,-29.6,-73.1C-16.5,-80.7,-2.6,-87.7,11,-84.9C24.7,-82.1,30.6,-83.6,44.7,-76.4Z"
              transform="translate(100 100)"
              fill="url(#verifyPurple)"
            />
          </svg>
        </div>

        {/* 3D Tomato Red Curved Accent - Bottom Right */}
        <div className="absolute bottom-24 right-[6%] anim-float-1 hidden lg:block">
          <div className="relative w-24 h-24 rounded-full shadow-[0_24px_45px_rgba(227,66,52,0.45)]">
            <div
              className="w-full h-full rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 35% 28%, #FFFFFF 0%, #FFA8A0 18%, #E34234 50%, #9F160C 80%, #540601 100%)",
                boxShadow:
                  "inset -10px -12px 20px rgba(0,0,0,0.4), inset 6px 8px 14px rgba(255,255,255,0.85)",
              }}
            />
            <div className="absolute top-2.5 left-4 w-7 h-3.5 rounded-full bg-white/70 blur-[1px] rotate-[-28deg]" />
          </div>
        </div>
      </div>

      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative z-10">
        <Suspense fallback={<div className="text-[#3B0764] font-bold text-sm">Loading verification...</div>}>
          <CertificateVerifier />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
