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
  Lock,
  FileCheck,
  Building,
  QrCode,
} from "lucide-react";

export const dynamic = "force-dynamic";

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
    <div className="w-full max-w-4xl space-y-10 relative z-10 py-6">
      {/* Verification Card in Premium Academic Styling */}
      <div className="bg-white/95 backdrop-blur-xl border-2 border-[#3978E8]/20 rounded-3xl p-7 sm:p-12 shadow-[0_20px_50px_-10px_rgba(23,59,112,0.12)] relative overflow-hidden">
        {/* Subtle Ambient Corner Accents */}
        <div className="absolute -top-16 -right-16 w-44 h-44 rounded-full bg-[#3978E8]/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-[#16A89A]/10 blur-2xl pointer-events-none" />

        {/* Card Header with Stationary Document Seal */}
        <div className="text-center space-y-3.5 mb-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#3978E8]/10 border border-[#3978E8]/20 text-[#173B70] text-xs font-bold uppercase tracking-wider shadow-xs">
            <ShieldCheck className="w-4 h-4 text-[#16A89A]" />
            <span>Official Credential Registry</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#173B70] tracking-tight">
            Certificate Verification Portal
          </h1>

          <p className="text-xs sm:text-sm text-[#173B70]/75 font-normal max-w-xl mx-auto leading-relaxed">
            Verify the authenticity, accreditation, and institutional validity of graduation certificates issued by QPET Institute of Information Technology.
          </p>
        </div>

        {/* Search Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
          className="flex flex-col sm:flex-row gap-3 relative z-10 mb-8 max-w-2xl mx-auto"
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#173B70]/50">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Certificate Number (e.g. QPET-CERT-2026-00001)"
              required
              className="w-full pl-10 pr-4 py-3.5 bg-[#F5F8FF] border border-[#3978E8]/25 rounded-xl text-sm text-[#173B70] placeholder-[#173B70]/40 font-medium focus:outline-none focus:bg-white focus:border-[#3978E8] focus:ring-3 focus:ring-[#3978E8]/15 transition-all shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-[#173B70] via-[#3978E8] to-[#7654D6] hover:opacity-95 shadow-md shadow-[#3978E8]/25 hover:-translate-y-0.5 active:translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Verify Certificate</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        {/* ===================================================================== */}
        {/* VERIFICATION RESULT DISPLAY                                           */}
        {/* ===================================================================== */}
        {hasSearched && result && (
          <div className="relative z-10 transition-all duration-300 max-w-2xl mx-auto">
            {/* 1. VALID CERTIFICATE RESULT */}
            {result.status === "valid" ? (
              <div className="rounded-2xl border-2 border-[#16A89A]/40 bg-[#16A89A]/5 p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#16A89A] text-white shadow-md shadow-[#16A89A]/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#16A89A]">
                      Verification Seal
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-[#173B70]">
                      Official Certificate is Valid &amp; Authentic
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-white p-5 rounded-xl border border-[#3978E8]/15 shadow-xs">
                  <div>
                    <span className="text-[#173B70]/60 font-bold block mb-1">Student Legal Name:</span>
                    <span className="text-base font-black text-[#173B70] uppercase tracking-tight">
                      {result.studentName}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#173B70]/60 font-bold block mb-1">Certificate Number:</span>
                    <span className="text-xs font-mono font-bold text-[#173B70] px-2.5 py-1 rounded bg-[#3978E8]/10 border border-[#3978E8]/20 inline-block">
                      {result.certificateNumber}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#173B70]/60 font-bold block mb-1">Certified Course:</span>
                    <span className="text-sm font-bold text-[#173B70]">
                      {result.courseName}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#173B70]/60 font-bold block mb-1">Duration &amp; Grade:</span>
                    <span className="text-sm font-medium text-[#173B70]">
                      {result.courseDuration} {result.grade ? `— (Grade: ${result.grade})` : ""}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#173B70]/60 font-bold block mb-1">Issue Date:</span>
                    <span className="text-sm font-medium text-[#173B70]">
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
                    <span className="text-[#173B70]/60 font-bold block mb-1">Verification Status:</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#16A89A]/15 text-[#16A89A] border border-[#16A89A]/30">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" /> Verified Authentic
                    </span>
                  </div>
                </div>

                <p className="text-xs text-[#173B70]/75 font-normal leading-relaxed text-center">
                  This official institutional record confirms that the candidate successfully completed all academic, laboratory, and examination requirements at QPET.
                </p>
              </div>
            ) : result.status === "revoked" ? (
              /* 2. REVOKED CERTIFICATE RESULT */
              <div className="rounded-2xl border-2 border-rose-300 bg-rose-50/90 p-6 sm:p-8 space-y-4 shadow-sm text-left">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-rose-600 text-white shadow-md shadow-rose-600/30 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-7 h-7 stroke-[2.5]" />
                  </div>
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-wider text-rose-700">
                      Notice of Revocation
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-rose-950">
                      Certificate Has Been Revoked
                    </h3>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-rose-200 text-xs space-y-2.5">
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
                    <span className="text-rose-700 font-bold">{result.revocationReason || "Administrative decision"}</span>
                  </div>
                </div>

                <p className="text-xs text-rose-700 font-medium text-center">
                  This certificate was revoked by QPET examination authorities and is no longer valid for any employment or educational verification.
                </p>
              </div>
            ) : (
              /* 3. INVALID / NOT FOUND RESULT */
              <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/90 p-6 sm:p-8 space-y-3 text-center shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center mx-auto shadow-xs">
                  <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h3 className="text-base sm:text-lg font-black text-amber-950">
                  Certificate Not Found or Invalid
                </h3>
                <p className="text-xs text-[#173B70]/75 font-normal max-w-sm mx-auto leading-relaxed">
                  No matching record was found in the official QPET database. Please double-check the certificate number or scan the QR code printed on the physical document.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3 Pillars of Security / Info Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 text-left">
        <div className="p-5 rounded-2xl bg-white border border-[#3978E8]/15 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#3978E8]/10 text-[#3978E8] flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-[#173B70]">Cryptographic Hash</h4>
          <p className="text-xs text-[#173B70]/70 leading-relaxed">
            Every issued certificate contains an immutable cryptographic signature verifiable globally.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#16A89A]/15 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#16A89A]/10 text-[#16A89A] flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-[#173B70]">Live Registry Audit</h4>
          <p className="text-xs text-[#173B70]/70 leading-relaxed">
            Instant real-time synchronization with the QPET central academic database ledger.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#7654D6]/15 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-[#7654D6]/10 text-[#7654D6] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-[#173B70]">Privacy Safeguard</h4>
          <p className="text-xs text-[#173B70]/70 leading-relaxed">
            Confidential contact and financial records remain strictly protected under privacy standards.
          </p>
        </div>
      </div>

      {/* Institutional Guarantee Card for Employers & Recruiters */}
      <div className="p-6 rounded-2xl bg-[#173B70] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-bold text-sm text-white flex items-center gap-2 justify-center sm:justify-start">
            <Building className="w-4 h-4 text-[#16A89A]" />
            For Employers, HR Recruiters &amp; Background Check Agencies
          </h4>
          <p className="text-xs text-blue-100/80 max-w-xl">
            For written official confirmation or duplicate transcript inquiries, please contact the Controller of Examinations at <a href="mailto:info@qpet.in" className="underline text-blue-200">info@qpet.in</a> with the candidate's certificate ID.
          </p>
        </div>

        <Link
          href="/register"
          className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-[#173B70] bg-[#16A89A] hover:bg-white transition-colors shrink-0"
        >
          Explore Courses
        </Link>
      </div>
    </div>
  );
}

export default function VerifyCertificatePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F5F8FF] text-[#173B70] relative overflow-x-hidden selection:bg-[#3978E8] selection:text-white">
      {/* Subtle Academic Ambient Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] bg-[radial-gradient(ellipse_at_top,_rgba(57,120,232,0.08)_0%,_transparent_70%)]" />
        <div className="absolute top-[25%] right-[-5%] w-[500px] h-[500px] bg-[radial-gradient(circle,_rgba(22,168,154,0.06)_0%,_transparent_65%)] blur-3xl" />
        <div className="absolute bottom-[10%] left-[-5%] w-[550px] h-[550px] bg-[radial-gradient(circle,_rgba(118,84,214,0.05)_0%,_transparent_65%)] blur-3xl" />
      </div>

      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12 relative z-10">
        <Suspense fallback={<div className="text-[#173B70] font-bold text-sm">Loading verification portal...</div>}>
          <CertificateVerifier />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
