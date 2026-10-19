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
} from "lucide-react";

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [eligibleEnrollments, setEligibleEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  useEffect(() => {
    fetchData();
  }, []);

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

      setFeedback({ type: "success", text: data.message });
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
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Award className="w-6 h-6 text-yellow-400" />
            Certificate Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manual authorization, issue official completion certificates, and manage revocation.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-3 border ${
            feedback.type === "success"
              ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
              : "bg-rose-950/40 border-rose-800 text-rose-300"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Eligible Students Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Eligible Students Ready for Certification ({eligibleEnrollments.length})
            </h2>
            <p className="text-[11px] text-slate-400">
              Students who have fully cleared their course fee balance. Explicit admin authorization is required to issue.
            </p>
          </div>
        </div>

        {eligibleEnrollments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {eligibleEnrollments.map((enr) => (
              <div
                key={enr._id}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs space-y-1"
              >
                <div className="truncate pr-2">
                  <p className="font-bold text-white truncate">{enr.studentId?.fullName}</p>
                  <p className="font-mono text-teal-300 text-[11px]">{enr.enrollmentNumber}</p>
                  <p className="text-slate-400 text-[11px] truncate">{enr.courseNameSnapshot}</p>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    Fee Balance: ₹0 (Cleared)
                  </span>
                </div>
                <button
                  onClick={() => openIssueModal(enr)}
                  className="shrink-0 px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-colors shadow-sm"
                >
                  Issue
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-slate-500 italic">
            No students currently pending certificate authorization.
          </div>
        )}
      </div>

      {/* Issued Certificates Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-yellow-400" />
            Issued Certificates Directory ({certificates.length})
          </h2>

          <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-80">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search certificate or student..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-slate-800 text-xs font-semibold rounded-xl text-slate-200 border border-slate-700 hover:bg-slate-700"
            >
              Filter
            </button>
          </form>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
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
              <tbody className="divide-y divide-slate-800/80 font-normal">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
                      Loading certificates...
                    </td>
                  </tr>
                ) : certificates.length > 0 ? (
                  certificates.map((cert) => (
                    <tr key={cert._id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-yellow-300 text-xs">
                        {cert.certificateNumber}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-white text-xs">{cert.studentName}</p>
                        <p className="font-mono text-slate-400 text-[11px]">
                          {cert.enrollmentNumber}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-200">{cert.courseName}</p>
                        <p className="text-[11px] text-slate-400">{cert.courseDuration}</p>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        {new Date(cert.issueDate).toLocaleDateString("en-IN")}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-teal-300">
                        {cert.grade || "A"}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            cert.status === "issued"
                              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                              : "bg-rose-500/10 text-rose-300 border-rose-500/20"
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
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-yellow-500/10 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/20 transition-colors"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>PDF</span>
                              </a>
                              <button
                                onClick={() => openRevokeModal(cert)}
                                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-950/40 text-rose-300 border border-rose-800 hover:bg-rose-900/50 transition-colors"
                              >
                                Revoke
                              </button>
                            </>
                          )}
                          <Link
                            href={`/verify-certificate?cert=${encodeURIComponent(
                              cert.certificateNumber
                            )}`}
                            target="_blank"
                            className="p-1 text-slate-400 hover:text-white"
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
                    <td colSpan={7} className="py-8 text-center text-slate-500">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                Authorize Certificate Issuance
              </h2>
              <button
                onClick={() => setIsIssueModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
              <p className="text-white font-bold">{selectedEnrollment.studentId?.fullName}</p>
              <p className="font-mono text-teal-300">{selectedEnrollment.enrollmentNumber}</p>
              <p className="text-slate-300">{selectedEnrollment.courseNameSnapshot}</p>
            </div>

            <form onSubmit={handleIssueCertificate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Certificate Number (Optional - leave blank for auto QPET-CERT-YYYY-NNNNN)
                </label>
                <input
                  type="text"
                  value={issueData.customCertificateNumber}
                  onChange={(e) =>
                    setIssueData({ ...issueData, customCertificateNumber: e.target.value })
                  }
                  placeholder="Leave empty to auto-generate"
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Issue Date *</label>
                  <input
                    type="date"
                    value={issueData.issueDate}
                    onChange={(e) => setIssueData({ ...issueData, issueDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Grade Awarded *</label>
                  <select
                    value={issueData.grade}
                    onChange={(e) => setIssueData({ ...issueData, grade: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  >
                    <option value="A+">A+ (Outstanding)</option>
                    <option value="A">A (Excellent)</option>
                    <option value="B+">B+ (Very Good)</option>
                    <option value="B">B (Good)</option>
                    <option value="Distinction">Distinction</option>
                  </select>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                A high-resolution landscape certificate PDF with embedded verification QR code and secure token will be generated.
              </p>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsIssueModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-5 py-2.5 bg-yellow-600 hover:bg-yellow-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-400" />
                Revoke Certificate
              </h2>
              <button
                onClick={() => setIsRevokeModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              You are about to revoke certificate <strong>{selectedCert.certificateNumber}</strong> for{" "}
              <strong>{selectedCert.studentName}</strong>. Public verification will immediately mark this certificate as Revoked.
            </p>

            <form onSubmit={handleRevokeCertificate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Official Revocation Reason *
                </label>
                <textarea
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  required
                  rows={3}
                  placeholder="e.g. Administrative cancellation, academic violation, duplicate issuance..."
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsRevokeModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
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
