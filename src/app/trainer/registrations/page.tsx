"use client";

import { useState, useEffect } from "react";
import {
  FileCheck2,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  BookOpen,
  Calendar,
  X,
  UserCheck,
  Sparkles,
  Copy,
  Check,
  User,
  MapPin,
  GraduationCap,
} from "lucide-react";

export default function TrainerRegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
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

  // Approval modal states
  const [selectedReg, setSelectedReg] = useState<any | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [agreedFee, setAgreedFee] = useState<number | string>("");
  const [paymentType, setPaymentType] = useState("full");
  const [installmentCount, setInstallmentCount] = useState("3");
  const [studentPassword, setStudentPassword] = useState("");
  const [processing, setProcessing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Credentials display after approval
  const [approvedDetails, setApprovedDetails] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
    fetchRegistrations();
  }, []);

  const canApproveRegistrations =
    currentUser?.role === "admin" ||
    !!currentUser?.permissions?.editRegistrations;

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/registrations");
      const json = await res.json();
      if (res.ok && json.success) {
        setRegistrations(json.registrations || []);
      } else {
        setError(json.error || "Unable to load pending registrations.");
      }
    } catch {
      setError("Network error loading registrations.");
    } finally {
      setLoading(false);
    }
  };

  const openApproveModal = (reg: any) => {
    setSelectedReg(reg);
    setAgreedFee(reg.preferredCourseId?.defaultFee || "");
    setPaymentType("full");
    setInstallmentCount("3");
    const defaultPass = "QPET@" + reg.mobileNumber.slice(-4);
    setStudentPassword(defaultPass);
    setFeedbackMsg(null);
    setIsApproveModalOpen(true);
  };

  const openRejectModal = (reg: any) => {
    setSelectedReg(reg);
    setRejectionReason("");
    setFeedbackMsg(null);
    setIsRejectModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedReg) return;
    setProcessing(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch("/api/admin/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedReg._id,
          action: "approve",
          agreedFee: agreedFee !== "" ? Number(agreedFee) : undefined,
          paymentType,
          installmentCount:
            paymentType === "installment" ? Number(installmentCount) : undefined,
          password: studentPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedbackMsg({
          type: "error",
          text: data.error || "Approval failed.",
        });
        setProcessing(false);
        return;
      }

      setApprovedDetails({
        studentName: selectedReg.fullName,
        enrollmentNumber: data.enrollment?.enrollmentNumber,
        courseName: selectedReg.preferredCourseId?.title,
        username: data.credentials?.username,
        password: data.credentials?.password,
      });

      setIsApproveModalOpen(false);
      setProcessing(false);
      fetchRegistrations();
    } catch {
      setFeedbackMsg({ type: "error", text: "Network error during approval." });
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReg) return;
    setProcessing(true);
    setFeedbackMsg(null);

    try {
      const res = await fetch("/api/admin/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedReg._id,
          action: "reject",
          rejectionReason: rejectionReason.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedbackMsg({
          type: "error",
          text: data.error || "Rejection failed.",
        });
        setProcessing(false);
        return;
      }

      setIsRejectModalOpen(false);
      setProcessing(false);
      fetchRegistrations();
    } catch {
      setFeedbackMsg({
        type: "error",
        text: "Network error during rejection.",
      });
      setProcessing(false);
    }
  };

  const copyCreds = (username: string, pass: string) => {
    const text = `QPET LMS Student Login Credentials:\nLogin Mobile: ${username}\nPassword: ${pass}\nPortal URL: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const filtered = registrations.filter((r) => {
    const term = search.toLowerCase();
    return (
      (r.fullName || "").toLowerCase().includes(term) ||
      (r.mobileNumber || "").includes(term) ||
      (r.email || "").toLowerCase().includes(term) ||
      (r.preferredCourseId?.title || "").toLowerCase().includes(term)
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
            New Admissions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review pending student online admission applications
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applicant name, phone, course..."
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-xs"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-48 bg-white border border-slate-200/70 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">
            No pending registration applications
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            All submitted student admission requests have been reviewed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((reg) => (
            <div
              key={reg._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 font-bold flex items-center justify-center text-sm border border-purple-200/60 shrink-0">
                    {reg.fullName ? reg.fullName.charAt(0).toUpperCase() : "A"}
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    Pending Admission
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{reg.fullName}</h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Guardian: {reg.fatherOrGuardianName || "N/A"}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{reg.mobileNumber}</span>
                  </div>
                  {reg.email && (
                    <div className="flex items-center gap-2 text-slate-600 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{reg.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-700 font-semibold">
                    <BookOpen className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>
                      {reg.preferredCourseId?.title || "Course Not Assigned"}
                    </span>
                  </div>
                  {reg.qualification && (
                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{reg.qualification}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(reg.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span className="font-mono text-purple-700 font-semibold">
                    Fee: ₹{reg.preferredCourseId?.defaultFee || 0}
                  </span>
                </div>

                {canApproveRegistrations && (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => openApproveModal(reg)}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs shadow-purple-600/20"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => openRejectModal(reg)}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs transition-colors cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* APPROVE ADMISSION MODAL */}
      {isApproveModalOpen && selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200/80 shadow-2xl p-6 sm:p-7 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/60">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Approve Student Admission
                  </h3>
                  <p className="text-xs text-slate-500">
                    Grant enrollment and create portal access for {selectedReg.fullName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsApproveModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedbackMsg && (
              <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            <div className="mt-5 space-y-4">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="font-bold text-slate-800">
                    {selectedReg.fullName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Course Selected:</span>
                  <span className="font-bold text-purple-700">
                    {selectedReg.preferredCourseId?.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mobile (Login ID):</span>
                  <span className="font-mono font-medium text-slate-700">
                    {selectedReg.mobileNumber}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Agreed Course Fee (₹)
                </label>
                <input
                  type="number"
                  value={agreedFee}
                  onChange={(e) => setAgreedFee(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Payment Schedule
                  </label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  >
                    <option value="full">One-time / Full</option>
                    <option value="installment">Installments</option>
                  </select>
                </div>

                {paymentType === "installment" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Installments Count
                    </label>
                    <select
                      value={installmentCount}
                      onChange={(e) => setInstallmentCount(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                    >
                      <option value="2">2 Installments</option>
                      <option value="3">3 Installments</option>
                      <option value="4">4 Installments</option>
                      <option value="6">6 Installments</option>
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Initial Login Password
                </label>
                <input
                  type="text"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsApproveModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={processing}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all disabled:opacity-50"
                >
                  {processing ? "Approving..." : "Confirm & Enroll Student"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {isRejectModalOpen && selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200/80 shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900">
              Reject Registration Application
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Provide a reason for rejecting the admission application of{" "}
              {selectedReg.fullName}.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Rejection Reason *
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Incomplete eligibility documentation / Batch full"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={processing || !rejectionReason.trim()}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
              >
                {processing ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* APPROVED CREDENTIALS MODAL */}
      {approvedDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Student Admission Approved!
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Active student profile created and login credentials generated.
            </p>

            <div className="mt-4 p-4 rounded-xl bg-purple-50/70 border border-purple-200/60 text-left space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Student:</span>
                <span className="font-bold text-slate-800">
                  {approvedDetails.studentName}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Enrollment No:</span>
                <span className="font-mono font-bold text-purple-700">
                  {approvedDetails.enrollmentNumber}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Username (Mobile):</span>
                <span className="font-mono font-bold text-purple-700">
                  {approvedDetails.username}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Initial Password:</span>
                <span className="font-mono font-bold text-purple-700">
                  {approvedDetails.password}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={() =>
                  copyCreds(approvedDetails.username, approvedDetails.password)
                }
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy Credentials"}</span>
              </button>
              <button
                onClick={() => setApprovedDetails(null)}
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
