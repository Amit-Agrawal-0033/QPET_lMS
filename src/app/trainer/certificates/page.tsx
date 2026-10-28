"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  Search,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Calendar,
  ShieldCheck,
  ExternalLink,
  Plus,
  X,
  Sparkles,
  User,
  GraduationCap,
} from "lucide-react";

export default function TrainerCertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [eligibleEnrollments, setEligibleEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Current Trainer Auth & Permissions
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    identifier: string;
    role: "admin" | "trainer" | "student";
    name?: string;
    permissions?: Record<string, boolean>;
  } | null>(null);

  // Issue Certificate Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState("");
  const [grade, setGrade] = useState("A");
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [customCertNumber, setCustomCertNumber] = useState("");
  const [issuing, setIssuing] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [successCert, setSuccessCert] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
    fetchCertificates();
  }, []);

  const canIssueCertificates =
    currentUser?.role === "admin" ||
    !!(
      currentUser?.permissions?.generateCertificates ||
      currentUser?.permissions?.editCertificates
    );

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/certificates");
      const json = await res.json();
      if (res.ok && json.success) {
        setCertificates(json.certificates || []);
        if (json.eligibleEnrollments) {
          setEligibleEnrollments(json.eligibleEnrollments);
        }
      } else {
        setError(
          json.error || "Certificate viewing is restricted to authorized faculty."
        );
      }
    } catch {
      setError("Network error loading certificates.");
    } finally {
      setLoading(false);
    }
  };

  const openIssueModal = () => {
    setSelectedEnrollmentId(
      eligibleEnrollments.length > 0 ? eligibleEnrollments[0]._id : ""
    );
    setGrade("A");
    setIssueDate(new Date().toISOString().split("T")[0]);
    setCustomCertNumber("");
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollmentId) {
      setModalError("Please select an eligible student enrollment.");
      return;
    }

    setIssuing(true);
    setModalError(null);

    try {
      const res = await fetch("/api/admin/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId: selectedEnrollmentId,
          grade,
          issueDate,
          customCertificateNumber: customCertNumber.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error || "Failed to generate certificate.");
        setIssuing(false);
        return;
      }

      setSuccessCert(data.certificate);
      setIsModalOpen(false);
      setIssuing(false);
      fetchCertificates();
    } catch {
      setModalError("Network error occurred. Please try again.");
      setIssuing(false);
    }
  };

  const filtered = certificates.filter((c) => {
    const term = search.toLowerCase();
    return (
      (c.studentName || "").toLowerCase().includes(term) ||
      (c.certificateNumber || "").toLowerCase().includes(term) ||
      (c.courseName || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
              Faculty Portal
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Verified Certificates
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Student certificates and digital graduation credentials
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search certificate or student..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-xs"
            />
          </div>

          {canIssueCertificates && (
            <button
              onClick={openIssueModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-purple-600/20 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Certificate</span>
            </button>
          )}
        </div>
      </div>

      {error ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center max-w-xl mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Faculty Clearance Required
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">{error}</p>
          <div className="pt-2">
            <Link
              href="/verify-certificate"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <span>Public Verification Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-44 bg-white border border-slate-200/70 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No certificates found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((cert) => (
            <div
              key={cert._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-mono font-bold text-xs border border-emerald-200">
                    {cert.certificateNumber}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    <CheckCircle2 className="w-3 h-3" />
                    Issued
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{cert.studentName}</h3>
                <p className="text-xs text-purple-700 font-semibold mt-0.5">
                  {cert.courseName}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Grade / Score:</span>
                    <span className="font-bold text-slate-800">
                      {cert.grade || "A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Issue Date:</span>
                    <span>
                      {new Date(cert.issueDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={`/api/pdf/certificate/${cert._id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ISSUE CERTIFICATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200/80 shadow-2xl p-6 sm:p-7 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/60">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Issue Student Certificate
                  </h3>
                  <p className="text-xs text-slate-500">
                    Generate official completion certificate with QR verification
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleIssueCertificate} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Eligible Student Enrollment *
                </label>
                {eligibleEnrollments.length === 0 ? (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    No students currently pending certificate generation with zero
                    outstanding balance.
                  </div>
                ) : (
                  <select
                    required
                    value={selectedEnrollmentId}
                    onChange={(e) => setSelectedEnrollmentId(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  >
                    <option value="">-- Choose Student --</option>
                    {eligibleEnrollments.map((en: any) => (
                      <option key={en._id} value={en._id}>
                        {en.studentId?.fullName} ({en.enrollmentNumber}) -{" "}
                        {en.courseNameSnapshot}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Grade Awarded *
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  >
                    <option value="A+">A+ (Distinction / Outstanding)</option>
                    <option value="A">A (First Division / Excellent)</option>
                    <option value="B+">B+ (Very Good)</option>
                    <option value="B">B (Good)</option>
                    <option value="C">C (Pass)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Issue Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Custom Certificate No. (Optional)
                </label>
                <input
                  type="text"
                  value={customCertNumber}
                  onChange={(e) => setCustomCertNumber(e.target.value)}
                  placeholder="Leave empty for auto QPET-CERT-YYYY-XXXXX"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={issuing || eligibleEnrollments.length === 0}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all disabled:opacity-50"
                >
                  {issuing ? "Generating Certificate..." : "Generate Certificate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUCCESS CERTIFICATE MODAL */}
      {successCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Certificate Issued Successfully!
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Official QR-verified certificate has been generated and enrolled in
              the public registry.
            </p>

            <div className="mt-4 p-4 rounded-xl bg-purple-50/70 border border-purple-200/60 text-left space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Student:</span>
                <span className="font-bold text-slate-800">
                  {successCert.studentName}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Certificate No:</span>
                <span className="font-mono font-bold text-purple-700">
                  {successCert.certificateNumber}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Grade Awarded:</span>
                <span className="font-bold text-emerald-700">
                  {successCert.grade}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <a
                href={`/api/pdf/certificate/${successCert._id}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF</span>
              </a>
              <button
                onClick={() => setSuccessCert(null)}
                className="py-2 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
