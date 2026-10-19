"use client";

import { useState, useEffect } from "react";
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  BookOpen,
  Calendar,
  X,
  FileCheck2,
  Key,
  Copy,
  Check,
  Sparkles,
} from "lucide-react";

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Approval modal state
  const [selectedReg, setSelectedReg] = useState<any | null>(null);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [agreedFee, setAgreedFee] = useState<number | string>("");
  const [paymentType, setPaymentType] = useState("full");
  const [installmentCount, setInstallmentCount] = useState("3");
  const [studentPassword, setStudentPassword] = useState("");
  const [processing, setProcessing] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  // Success credentials modal
  const [approvedDetails, setApprovedDetails] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/registrations");
      const data = await res.json();
      if (data.registrations) setRegistrations(data.registrations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openApproveModal = (reg: any) => {
    setSelectedReg(reg);
    setAgreedFee(reg.preferredCourseId?.defaultFee || "");
    setPaymentType("full");
    setInstallmentCount("3");
    // Default password suggested: QPET@ + last 4 digits of mobile
    const defaultPass = "QPET@" + reg.mobileNumber.slice(-4);
    setStudentPassword(defaultPass);
    setIsApproveModalOpen(true);
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let rand = "";
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setStudentPassword(`QPET#${rand}`);
  };

  const openRejectModal = (reg: any) => {
    setSelectedReg(reg);
    setRejectionReason("");
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
          installmentCount: paymentType === "installment" ? Number(installmentCount) : undefined,
          password: studentPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedbackMsg({ type: "error", text: data.error || "Approval failed." });
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
      fetchRegistrations();
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: "Network error during approval." });
    } finally {
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
          rejectionReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedbackMsg({ type: "error", text: data.error || "Rejection failed." });
        setProcessing(false);
        return;
      }

      setFeedbackMsg({ type: "success", text: "Registration request rejected." });
      setIsRejectModalOpen(false);
      fetchRegistrations();
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: "Network error during rejection." });
    } finally {
      setProcessing(false);
    }
  };

  const copyCredentials = () => {
    if (!approvedDetails) return;
    const text = `QPET LMS Student Login Credentials:\nName: ${approvedDetails.studentName}\nEnrollment No: ${approvedDetails.enrollmentNumber}\nLogin Mobile: ${approvedDetails.username}\nPassword: ${approvedDetails.password}\nPortal URL: http://localhost:3005/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <UserCheck className="w-6 h-6 text-amber-400" />
          Pending Registrations ({registrations.length})
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review student admission applications, assign official enrollment numbers, and create student portal login credentials.
        </p>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl text-xs flex items-center gap-3 border ${
            feedbackMsg.type === "success"
              ? "bg-emerald-950/40 border-emerald-800 text-emerald-300"
              : "bg-rose-950/40 border-rose-800 text-rose-300"
          }`}
        >
          {feedbackMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* Registrations List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-xs text-slate-500">
            Loading pending registrations...
          </div>
        ) : registrations.length > 0 ? (
          registrations.map((reg) => (
            <div
              key={reg._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 transition-all hover:border-slate-700 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white">{reg.fullName}</h3>
                  <p className="text-xs text-slate-400">
                    Guardian: <strong className="text-slate-300">{reg.fatherOrGuardianName}</strong>
                    {reg.gender ? ` • ${reg.gender}` : ""}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openApproveModal(reg)}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Create Credentials</span>
                  </button>
                  <button
                    onClick={() => openRejectModal(reg)}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800 transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1">
                  <span className="text-slate-400 block font-medium">Contact & Mobile:</span>
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <Phone className="w-3.5 h-3.5 text-teal-400" />
                    <span>{reg.mobileNumber}</span>
                  </div>
                  {reg.email && (
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <span>{reg.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block font-medium">Desired Course:</span>
                  <div className="flex items-center gap-1.5 text-slate-200">
                    <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                    <span className="font-semibold">{reg.preferredCourseId?.title || "Not selected"}</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block">
                    Default Fee: ₹{reg.preferredCourseId?.defaultFee || 0} (
                    {reg.preferredCourseId?.durationMonths || 1} Mos)
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-slate-400 block font-medium">Address & Submitted:</span>
                  <p className="text-slate-300 line-clamp-2">{reg.address}</p>
                  <span className="text-[11px] text-slate-500 block">
                    Applied on: {new Date(reg.registrationDate).toLocaleDateString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-12 text-center text-xs text-slate-500">
            No pending registration requests waiting for approval.
          </div>
        )}
      </div>

      {/* Approve & Create Credentials Modal */}
      {isApproveModalOpen && selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-teal-400" />
                Approve Student & Create Login Credentials
              </h2>
              <button
                onClick={() => setIsApproveModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
              <p className="text-white font-bold">{selectedReg.fullName}</p>
              <p className="text-slate-400">Mobile (Username): {selectedReg.mobileNumber}</p>
              <p className="text-slate-300">Course: {selectedReg.preferredCourseId?.title}</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Agreed Course Fee (INR)
                  </label>
                  <input
                    type="number"
                    value={agreedFee}
                    onChange={(e) => setAgreedFee(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Payment Arrangement
                  </label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="full">Full Payment</option>
                    <option value="installment">Installment-Based</option>
                  </select>
                </div>
              </div>

              {paymentType === "installment" && (
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Number of Installments
                  </label>
                  <select
                    value={installmentCount}
                    onChange={(e) => setInstallmentCount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="2">2 Monthly Installments</option>
                    <option value="3">3 Monthly Installments</option>
                    <option value="4">4 Monthly Installments</option>
                    <option value="6">6 Monthly Installments</option>
                  </select>
                </div>
              )}

              {/* Login Password Creation by Admin */}
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-teal-300 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" />
                    Set Student Login Password *
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Generate Random
                  </button>
                </div>
                <input
                  type="text"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  required
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-[10px] text-slate-500">
                  Login ID will be student's mobile number: <strong>{selectedReg.mobileNumber}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsApproveModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={processing}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                {processing ? "Processing..." : "Approve & Create Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Created Confirmation Modal */}
      {approvedDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">Student Account Activated!</h2>
              <p className="text-xs text-slate-400">
                Enrollment created and login credentials generated successfully.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Student Name:</span>
                <span className="text-white font-bold">{approvedDetails.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Enrollment No:</span>
                <span className="text-teal-400 font-mono font-bold">
                  {approvedDetails.enrollmentNumber}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Login Mobile:</span>
                <span className="text-white font-mono font-semibold">
                  {approvedDetails.username}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                <span className="text-slate-400">Password:</span>
                <span className="text-emerald-300 font-mono font-bold text-sm bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {approvedDetails.password}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={copyCredentials}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Details to Share"}</span>
              </button>
              <button
                onClick={() => setApprovedDetails(null)}
                className="py-2.5 px-5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-400" />
                Reject Registration Request
              </h2>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to reject registration for <strong>{selectedReg.fullName}</strong>?
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Reason for Rejection
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="e.g. Incomplete details, age criteria not met, etc."
                className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={processing}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
              >
                {processing ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
