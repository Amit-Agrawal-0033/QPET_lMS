"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  Calendar,
  User,
  BookOpen,
  ArrowRight,
  ShieldAlert,
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
    <div className="w-full max-w-2xl space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400 flex items-center justify-center mx-auto shadow-md">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Certificate Verification
        </h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          Verify the authenticity and validity of completion certificates issued by QPET Institute of Information Technology.
        </p>
      </div>

      {/* Verification Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Certificate Number (e.g. QPET-CERT-2026-00001)"
              required
              className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-md shadow-teal-600/30 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Verify Now</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Verification Result Card */}
        {hasSearched && result && (
          <div className="pt-2">
            {result.status === "valid" ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                      Verification Result
                    </span>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      Official Certificate is Valid
                    </h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Student Legal Name:</span>
                    <span className="text-sm font-bold text-white uppercase">
                      {result.studentName}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Certificate Number:</span>
                    <span className="text-sm font-mono font-semibold text-teal-300">
                      {result.certificateNumber}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Certified Course:</span>
                    <span className="text-sm font-semibold text-slate-200">
                      {result.courseName}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Duration & Grade:</span>
                    <span className="text-sm text-slate-200">
                      {result.courseDuration} {result.grade ? `(Grade ${result.grade})` : ""}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Issue Date:</span>
                    <span className="text-sm text-slate-200">
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
                    <span className="text-slate-400 block mb-0.5">Status:</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Authentic & Verified
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 leading-relaxed text-center">
                  This record confirms that the candidate successfully completed all institutional requirements for the named program at QPET.
                </p>
              </div>
            ) : result.status === "revoked" ? (
              <div className="rounded-2xl border border-rose-500/40 bg-rose-950/20 p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-rose-400">
                      Verification Result
                    </span>
                    <h3 className="text-lg font-bold text-white">
                      Certificate Has Been Revoked
                    </h3>
                  </div>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Certificate No:</span>
                    <span className="font-mono text-slate-200">{result.certificateNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Candidate Name:</span>
                    <span className="font-semibold text-slate-200">{result.studentName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Course:</span>
                    <span className="text-slate-200">{result.courseName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Revocation Reason:</span>
                    <span className="text-rose-300 font-medium">{result.revocationReason}</span>
                  </div>
                </div>

                <p className="text-xs text-rose-300">
                  This certificate has been revoked by QPET authorities and is no longer valid.
                </p>
              </div>
            ) : (
              <div className="rounded-2xl border border-amber-500/40 bg-amber-950/20 p-6 space-y-3 text-center">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white">
                  Certificate Not Found or Invalid
                </h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                  No matching record was found in the official QPET database for the entered query. Please check the number and try again.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-center text-xs text-slate-500">
        In compliance with privacy standards, private contact and personal information is not disclosed on this public verification portal.
      </div>
    </div>
  );
}

export default function VerifyCertificatePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-12">
        <Suspense fallback={<div className="text-slate-400 text-sm">Loading verification...</div>}>
          <CertificateVerifier />
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
