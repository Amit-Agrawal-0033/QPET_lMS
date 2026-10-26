"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Award,
  Plus,
  Search,
  Download,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  X,
  User,
  Calendar,
  Lock,
} from "lucide-react";

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [eligibleEnrollments, setEligibleEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    identifier: string;
    role: "admin" | "trainer" | "student";
    name?: string;
    permissions?: Record<string, boolean>;
  } | null>(null);

  // Modals
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isRevokeModalOpen, setIsRevokeModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<any | null>(null);
  const [selectedCert, setSelectedCert] = useState<any | null>(null);

  const [issueData, setIssueData] = useState({
    customCertificateNumber: "",
    issueDate: new Date().toISOString().split("T")[0],
    grade: "A",
  });
  const [revokeReason, setRevokeReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string; downloadId?: string } | null>(
    null
  );

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated && d.user) setCurrentUser(d.user);
      })
      .catch(() => {});
    fetchData();
  }, []);

  const canGenerate =
    currentUser?.role === "admin" ||
    !!(currentUser?.permissions?.generateCertificates || currentUser?.permissions?.editCertificates);
  const isAdmin = currentUser?.role === "admin";

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("query", search);

      const res = await fetch(`/api/admin/certificates?${params.toString()}`);
      const data = await res.json();
      if (data.certificates) setCertificates(data.certificates);
      if (data.eligibleEnrollments) setEligibleEnrollments(data.eligibleEnrollments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const openIssueModal = (enrollment: any) => {
    setSelectedEnrollment(enrollment);
    setIssueData({
      customCertificateNumber: "",
      issueDate: new Date().toISOString().split("T")[0],
      grade: "A",
    });
    setFeedback(null);
    setIsIssueModalOpen(true);
  };

  const openRevokeModal = (cert: any) => {
    setSelectedCert(cert);
    setRevokeReason("");
    setFeedback(null);
    setIsRevokeModalOpen(true);
  };

  const handleIssueCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnrollment) return;

    setProcessing(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enrollmentId: selectedEnrollment._id,
          customCertificateNumber: issueData.customCertificateNumber.trim() || undefined,
          issueDate: issueData.issueDate,
          grade: issueData.grade,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", text: data.error || "Failed to issue certificate." });
        setProcessing(false);
        return;
      }

      setFeedback({
        type: "success",
        text: data.message || "Certificate generated successfully.",
        downloadId: data.certificate?._id,
      });
      setIsIssueModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFeedback({ type: "error", text: "Network error occurred." });
    } finally {
      setProcessing(false);
    }
  };

  const handleRevokeCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCert) return;

    setProcessing(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/admin/certificates", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificateId: selectedCert._id,
          reason: revokeReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", text: data.error || "Failed to revoke certificate." });
        setProcessing(false);
        return;
      }

      setFeedback({ type: "success", text: data.message });
      setIsRevokeModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFeedback({ type: "error", text: "Network error occurred." });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Certificate Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
              {certificates.length} Issued
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manual authorization, issue official completion certificates, and manage revocation.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {canGenerate ? (
            <button
              onClick={() => {
                if (eligibleEnrollments.length > 0) {
                  openIssueModal(eligibleEnrollments[0]);
                } else {
                  setFeedback({
                    type: "error",
                    text: "No eligible cleared enrollments currently available to generate a certificate.",
                  });
                }
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Generate Certificate</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span>Generation Restricted (View Only)</span>
            </div>
          )}
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-center justify-between gap-3 border shadow-sm ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-3">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.text}</span>
          </div>

          {feedback.downloadId && (
            <a
              href={`/api/pdf/certificate/${feedback.downloadId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </a>
          )}
        </div>
      )}

      {/* Trainer Permission Warning if Restricted */}
      {currentUser?.role === "trainer" && !canGenerate && (
        <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 text-amber-950 text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Trainer Notice:</strong> Certificate generation permission is currently not enabled for your account. You can view and download issued certificates. Please request Administrator authorization to generate student certificates.
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white text-amber-800 border border-amber-200 shrink-0">
            PERMISSION REQUIRED
          </span>
        </div>
      )}

      {/* Eligible Students Section */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">
                Eligible Students Ready for Certification
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                {eligibleEnrollments.length} Cleared
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Students who have fully cleared their course fee balance. Explicit authorization is required to generate.
            </p>
          </div>
        </div>

        {eligibleEnrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {eligibleEnrollments.map((enr) => (
              <div
                key={enr._id}
                className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-center justify-between text-xs space-y-1 hover:border-slate-300 transition-all"
              >
                <div className="truncate pr-3 space-y-0.5">
                  <p className="font-bold text-slate-900 truncate">{enr.studentId?.fullName}</p>
                  <p className="font-mono text-blue-600 text-[11px] font-semibold">{enr.enrollmentNumber}</p>
                  <p className="text-slate-500 text-[11px] truncate">{enr.courseNameSnapshot}</p>
                  <span className="inline-block text-[10px] text-emerald-700 bg-emerald-50 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                    Fee Cleared (₹0 Bal)
                  </span>
                </div>

                {canGenerate ? (
                  <button
                    onClick={() => openIssueModal(enr)}
                    className="shrink-0 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
                  >
                    Generate
                  </button>
                ) : (
                  <span className="shrink-0 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-400 font-semibold text-[10px] border border-slate-200 flex items-center gap-1 select-none">
                    <Lock className="w-3 h-3" />
                    Locked
                  </span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400 italic bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
            No students currently pending certificate authorization.
          </div>
        )}
      </div>

      {/* Issued Certificates Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-600" />
            Issued Certificates Directory ({certificates.length})
          </h2>

          <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-80">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search certificate or student..."
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-slate-100 text-xs font-semibold rounded-xl text-slate-700 border border-slate-200 hover:bg-slate-200 transition-colors"
            >
              Filter
            </button>
          </form>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200/80 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Certificate Number</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Course & Duration</th>
                  <th className="py-3.5 px-4">Issue Date</th>
                  <th className="py-3.5 px-4">Grade</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span>Loading certificates...</span>
                      </div>
                    </td>
                  </tr>
                ) : certificates.length > 0 ? (
                  certificates.map((cert) => (
                    <tr key={cert._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 text-xs">
                        {cert.certificateNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 text-xs">{cert.studentName}</p>
                        <p className="font-mono text-slate-500 text-[11px]">
                          {cert.enrollmentNumber}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-800">{cert.courseName}</p>
                        <p className="text-[11px] text-slate-500">{cert.courseDuration}</p>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {new Date(cert.issueDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded text-xs">
                          {cert.grade || "A"}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            cert.status === "issued"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {cert.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {cert.status === "issued" && (
                            <>
                              <a
                                href={`/api/pdf/certificate/${cert._id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 hover:bg-blue-100 transition-colors shadow-xs"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>PDF</span>
                              </a>
                              {isAdmin && (
                                <button
                                  onClick={() => openRevokeModal(cert)}
                                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/80 hover:bg-rose-100 transition-colors"
                                >
                                  Revoke
                                </button>
                              )}
                            </>
                          )}
                          <Link
                            href={`/verify-certificate?cert=${encodeURIComponent(
                              cert.certificateNumber
                            )}`}
                            target="_blank"
                            className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                            title="Open Public Verification"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No certificates issued yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Issue Certificate Modal */}
      {isIssueModalOpen && selectedEnrollment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Authorize Certificate Issuance
                  </h2>
                  <p className="text-xs text-slate-500">Generate high-res verifiable certificate with secure QR</p>
                </div>
              </div>
              <button
                onClick={() => setIsIssueModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {eligibleEnrollments.length > 1 && (
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Select Eligible Student / Enrollment</label>
                <select
                  value={selectedEnrollment._id}
                  onChange={(e) => {
                    const found = eligibleEnrollments.find((en: any) => en._id === e.target.value);
                    if (found) setSelectedEnrollment(found);
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {eligibleEnrollments.map((en: any) => (
                    <option key={en._id} value={en._id}>
                      {en.studentId?.fullName} ({en.enrollmentNumber}) — {en.courseNameSnapshot}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-slate-900 font-bold text-sm">{selectedEnrollment.studentId?.fullName || "Student"}</p>
                <span className="font-mono text-blue-600 font-semibold bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded text-[11px]">
                  {selectedEnrollment.enrollmentNumber}
                </span>
              </div>
              <p className="text-slate-600">{selectedEnrollment.courseNameSnapshot}</p>
              {selectedEnrollment.studentId?.mobile && (
                <p className="text-slate-400 text-[11px]">Mobile: {selectedEnrollment.studentId.mobile}</p>
              )}
            </div>

            <form onSubmit={handleIssueCertificate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Certificate Number (Optional - leave blank for auto QPET-CERT-YYYY-NNNNN)
                </label>
                <input
                  type="text"
                  value={issueData.customCertificateNumber}
                  onChange={(e) =>
                    setIssueData({ ...issueData, customCertificateNumber: e.target.value })
                  }
                  placeholder="Leave empty to auto-generate"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">Issue Date *</label>
                  <input
                    type="date"
                    value={issueData.issueDate}
                    onChange={(e) => setIssueData({ ...issueData, issueDate: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">Grade Awarded *</label>
                  <select
                    value={issueData.grade}
                    onChange={(e) => setIssueData({ ...issueData, grade: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="A+">A+ (Outstanding)</option>
                    <option value="A">A (Excellent)</option>
                    <option value="B+">B+ (Very Good)</option>
                    <option value="B">B (Good)</option>
                    <option value="Distinction">Distinction</option>
                  </select>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                A high-resolution landscape certificate PDF with embedded verification QR code and secure token will be generated.
              </p>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  {processing ? "Issuing..." : "Confirm & Issue Certificate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Revoke Modal */}
      {isRevokeModalOpen && selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Revoke Certificate
                </h2>
              </div>
              <button
                onClick={() => setIsRevokeModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              You are about to revoke certificate <strong className="text-slate-900">{selectedCert.certificateNumber}</strong> for{" "}
              <strong className="text-slate-900">{selectedCert.studentName}</strong>. Public verification will immediately mark this certificate as Revoked.
            </p>

            <form onSubmit={handleRevokeCertificate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Official Revocation Reason *
                </label>
                <textarea
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  required
                  rows={3}
                  placeholder="e.g. Administrative cancellation, academic violation, duplicate issuance..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsRevokeModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-sm shadow-rose-500/20 transition-all disabled:opacity-50"
                >
                  {processing ? "Revoking..." : "Confirm Revocation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
