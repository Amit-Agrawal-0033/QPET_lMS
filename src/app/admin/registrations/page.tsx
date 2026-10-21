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
  ShieldCheck,
  Clock,
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Pending Registrations
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
              {registrations.length} Pending
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review student admission applications, assign official enrollment numbers, and create student portal login credentials.
          </p>
        </div>
      </div>

      {feedbackMsg && (
        <div
          className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-3 border shadow-sm ${
            feedbackMsg.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          {feedbackMsg.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span className="font-medium">{feedbackMsg.text}</span>
        </div>
      )}

      {/* Registrations List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-xs text-slate-500 shadow-sm flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Loading pending applications...</span>
          </div>
        ) : registrations.length > 0 ? (
          registrations.map((reg) => (
            <div
              key={reg._id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{reg.fullName}</h3>
                    {reg.gender && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60">
                        {reg.gender}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Guardian: <strong className="text-slate-700 font-medium">{reg.fatherOrGuardianName}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openApproveModal(reg)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Create Credentials</span>
                  </button>
                  <button
                    onClick={() => openRejectModal(reg)}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-white hover:bg-rose-50 border border-rose-200/80 transition-colors flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="space-y-1.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Contact & Mobile
                  </span>
                  <div className="flex items-center gap-2 text-slate-800 font-medium">
                    <Phone className="w-3.5 h-3.5 text-blue-600" />
                    <span>{reg.mobileNumber}</span>
                  </div>
                  {reg.email && (
                    <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{reg.email}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Desired Course
                  </span>
                  <div className="flex items-center gap-2 text-blue-700 font-semibold">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{reg.preferredCourseId?.title || "Not selected"}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 block">
                    Default Fee: <strong className="text-slate-700 font-medium">₹{reg.preferredCourseId?.defaultFee || 0}</strong> ({reg.preferredCourseId?.durationMonths || 1} Months)
                  </span>
                </div>

                <div className="space-y-1.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Address & Date
                  </span>
                  <div className="flex items-start gap-1.5 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <p className="line-clamp-1">{reg.address}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>Applied on: {new Date(reg.registrationDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl bg-white border border-slate-200/80 p-12 text-center shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No Pending Applications</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              All student admission registrations have been processed and enrolled. New submissions from the portal will appear here.
            </p>
          </div>
        )}
      </div>

      {/* Approve & Create Credentials Modal */}
      {isApproveModalOpen && selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Approve Student & Create Account
                  </h2>
                  <p className="text-xs text-slate-500">Assign fee structure and student portal login</p>
                </div>
              </div>
              <button
                onClick={() => setIsApproveModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-slate-900 font-bold text-sm">{selectedReg.fullName}</p>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                  {selectedReg.preferredCourseId?.title}
                </span>
              </div>
              <p className="text-slate-500">
                Login Mobile / ID: <strong className="text-slate-800 font-medium">{selectedReg.mobileNumber}</strong>
              </p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Agreed Course Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={agreedFee}
                    onChange={(e) => setAgreedFee(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Payment Arrangement
                  </label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  >
                    <option value="full">Full Payment</option>
                    <option value="installment">Installment-Based</option>
                  </select>
                </div>
              </div>

              {paymentType === "installment" && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Number of Installments
                  </label>
                  <select
                    value={installmentCount}
                    onChange={(e) => setInstallmentCount(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  >
                    <option value="2">2 Monthly Installments</option>
                    <option value="3">3 Monthly Installments</option>
                    <option value="4">4 Monthly Installments</option>
                    <option value="6">6 Monthly Installments</option>
                  </select>
                </div>
              )}

              {/* Login Password Creation by Admin */}
              <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-blue-900 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-blue-600" />
                    Set Student Login Password *
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-blue-200/80 shadow-xs"
                  >
                    <Sparkles className="w-3 h-3 text-blue-600" />
                    Generate Random
                  </button>
                </div>
                <input
                  type="text"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  required
                  placeholder="Minimum 6 characters"
                  className="w-full px-3.5 py-2.5 bg-white border border-blue-200 rounded-xl text-xs text-slate-900 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                />
                <p className="text-[11px] text-slate-500">
                  Student username will be their mobile number: <strong className="text-slate-800">{selectedReg.mobileNumber}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsApproveModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={processing}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm shadow-blue-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
              >
                {processing ? "Processing..." : "Approve & Create Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Credentials Created Confirmation Modal */}
      {approvedDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-900">Student Account Activated!</h2>
              <p className="text-xs text-slate-500">
                Enrollment created and login credentials generated successfully.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-left space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Student Name:</span>
                <span className="text-slate-900 font-bold">{approvedDetails.studentName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Enrollment No:</span>
                <span className="text-blue-600 font-mono font-bold">
                  {approvedDetails.enrollmentNumber}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Login Mobile:</span>
                <span className="text-slate-900 font-mono font-semibold">
                  {approvedDetails.username}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200/80">
                <span className="text-slate-500">Password:</span>
                <span className="text-emerald-700 font-mono font-bold text-sm bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {approvedDetails.password}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                onClick={copyCredentials}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 transition-colors flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied to Clipboard!" : "Copy Details to Share"}</span>
              </button>
              <button
                onClick={() => setApprovedDetails(null)}
                className="py-2.5 px-6 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {isRejectModalOpen && selectedReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                  <XCircle className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  Reject Application
                </h2>
              </div>
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Are you sure you want to reject the registration application for <strong className="text-slate-900">{selectedReg.fullName}</strong>?
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Reason for Rejection
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="e.g. Incomplete details, age criteria not met, etc."
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={processing}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs rounded-xl shadow-sm shadow-rose-500/20 transition-all disabled:opacity-50"
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
