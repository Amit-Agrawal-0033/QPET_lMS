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
  Layers,
  Clock,
  IndianRupee,
  ShieldCheck,
} from "lucide-react";

export default function TrainerRegistrationsPage() {
  const [activeTab, setActiveTab] = useState<"students" | "course_requests">("students");
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [courseRequests, setCourseRequests] = useState<any[]>([]);
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
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [isCourseRequestModal, setIsCourseRequestModal] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [agreedFee, setAgreedFee] = useState<number | string>("");
  const [discountAmount, setDiscountAmount] = useState<number | string>("");
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
        if (json.courseRequests) setCourseRequests(json.courseRequests);
      } else {
        setError(json.error || "Unable to load pending registrations.");
      }
    } catch {
      setError("Network error loading registrations.");
    } finally {
      setLoading(false);
    }
  };

  const openApproveStudentModal = (reg: any) => {
    setSelectedItem(reg);
    setIsCourseRequestModal(false);
    setAgreedFee(reg.preferredCourseId?.defaultFee || "");
    setDiscountAmount("");
    setPaymentType("full");
    setInstallmentCount("3");
    const defaultPass = "QPET@" + reg.mobileNumber.slice(-4);
    setStudentPassword(defaultPass);
    setFeedbackMsg(null);
    setIsApproveModalOpen(true);
  };

  const openApproveCourseRequestModal = (req: any) => {
    setSelectedItem(req);
    setIsCourseRequestModal(true);
    setAgreedFee(req.courseId?.defaultFee || "");
    setDiscountAmount("");
    setPaymentType("full");
    setInstallmentCount("3");
    setStudentPassword("");
    setFeedbackMsg(null);
    setIsApproveModalOpen(true);
  };

  const openRejectModal = (item: any, isCourseReq: boolean) => {
    setSelectedItem(item);
    setIsCourseRequestModal(isCourseReq);
    setRejectionReason("");
    setFeedbackMsg(null);
    setIsRejectModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedItem) return;
    setProcessing(true);
    setFeedbackMsg(null);

    try {
      const payload: any = {
        action: "approve",
        agreedFee: agreedFee !== "" ? Number(agreedFee) : undefined,
        discountAmount: discountAmount !== "" ? Number(discountAmount) : 0,
        paymentType,
        installmentCount: paymentType === "installment" ? Number(installmentCount) : undefined,
      };

      if (isCourseRequestModal) {
        payload.type = "course_request";
        payload.requestId = selectedItem._id;
      } else {
        payload.type = "student";
        payload.studentId = selectedItem._id;
        payload.password = studentPassword;
      }

      const res = await fetch("/api/admin/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

      if (isCourseRequestModal) {
        setFeedbackMsg({
          type: "success",
          text: `Enrolled student into ${selectedItem.courseId?.title} successfully (${data.enrollment?.enrollmentNumber}).`,
        });
      } else {
        setApprovedDetails({
          studentName: selectedItem.fullName,
          enrollmentNumber: data.enrollment?.enrollmentNumber,
          courseName: selectedItem.preferredCourseId?.title,
          username: data.credentials?.username,
          password: data.credentials?.password,
        });
      }

      setIsApproveModalOpen(false);
      setProcessing(false);
      fetchRegistrations();
    } catch {
      setFeedbackMsg({ type: "error", text: "Network error during approval." });
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedItem) return;
    setProcessing(true);
    setFeedbackMsg(null);

    try {
      const payload: any = {
        action: "reject",
        rejectionReason,
      };

      if (isCourseRequestModal) {
        payload.type = "course_request";
        payload.requestId = selectedItem._id;
      } else {
        payload.type = "student";
        payload.studentId = selectedItem._id;
      }

      const res = await fetch("/api/admin/registrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      setFeedbackMsg({ type: "error", text: "Network error during rejection." });
      setProcessing(false);
    }
  };

  const copyCreds = (u: string, p: string) => {
    const text = `QPET LMS Student Login Credentials:\nLogin Mobile: ${u}\nPassword: ${p}\nPortal URL: http://localhost:3005/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredRegistrations = registrations.filter((r) => {
    const term = search.toLowerCase();
    return (
      (r.fullName || "").toLowerCase().includes(term) ||
      (r.mobileNumber || "").includes(term) ||
      (r.preferredCourseId?.title || "").toLowerCase().includes(term)
    );
  });

  const filteredRequests = courseRequests.filter((r) => {
    const term = search.toLowerCase();
    return (
      (r.studentProfileId?.fullName || "").toLowerCase().includes(term) ||
      (r.studentProfileId?.mobileNumber || "").includes(term) ||
      (r.courseId?.title || "").toLowerCase().includes(term)
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
            Student Admissions & Course Approvals
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review online student applicants and multi-course enrollments
          </p>
        </div>

        <div className="relative w-full sm:w-64">
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

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-8 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("students")}
          className={`pb-3.5 transition-all flex items-center gap-2 ${
            activeTab === "students"
              ? "text-purple-600 border-b-2 border-purple-600 font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>New Student Admissions ({registrations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("course_requests")}
          className={`pb-3.5 transition-all flex items-center gap-2 ${
            activeTab === "course_requests"
              ? "text-purple-600 border-b-2 border-purple-600 font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Multi-Course Requests ({courseRequests.length})</span>
        </button>
      </div>

      {/* Content */}
      {activeTab === "students" && (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-44 bg-white border border-slate-200/80 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredRegistrations.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200/80 rounded-2xl p-6">
              <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No pending student admission forms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRegistrations.map((reg) => (
                <div
                  key={reg._id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Pending Verification
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(reg.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{reg.fullName}</h3>
                      <p className="text-xs text-slate-500">S/o, D/o: {reg.fatherOrGuardianName || "—"}</p>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono">{reg.mobileNumber}</span>
                      </div>
                      {reg.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{reg.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                      <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                        {reg.preferredCourseId?.title || "Selected Course"}
                      </span>
                    </div>
                  </div>

                  {canApproveRegistrations && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => openRejectModal(reg, false)}
                        className="px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => openApproveStudentModal(reg)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                      >
                        Approve & Enroll
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "course_requests" && (
        <div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-44 bg-white border border-slate-200/80 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200/80 rounded-2xl p-6">
              <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">No multi-course enrollment requests from existing students.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRequests.map((req) => (
                <div
                  key={req._id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        Multi-Course Request
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(req.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{req.studentProfileId?.fullName}</h3>
                      <p className="text-xs text-slate-500 font-mono">Mobile: {req.studentProfileId?.mobileNumber}</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-purple-50/50 border border-purple-100 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-purple-700 block tracking-wider">
                        Requested Course:
                      </span>
                      <span className="text-xs font-bold text-slate-900 block">
                        {req.courseId?.title} ({req.courseId?.code})
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Default Course Fee: ₹{req.courseId?.defaultFee}
                      </span>
                    </div>
                  </div>

                  {canApproveRegistrations && (
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                      <button
                        onClick={() => openRejectModal(req, true)}
                        className="px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => openApproveCourseRequestModal(req)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer"
                      >
                        Approve Course
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* APPROVE MODAL */}
      {isApproveModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200/80 shadow-2xl p-6 sm:p-7 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/60">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {isCourseRequestModal ? "Approve Multi-Course Enrollment" : "Approve Student Admission"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Define course fee, discount, and installment plan
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
                  <span className="text-slate-500">Student:</span>
                  <span className="font-bold text-slate-800">
                    {isCourseRequestModal ? selectedItem.studentProfileId?.fullName : selectedItem.fullName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Course:</span>
                  <span className="font-bold text-purple-700">
                    {isCourseRequestModal ? selectedItem.courseId?.title : selectedItem.preferredCourseId?.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mobile (Username):</span>
                  <span className="font-mono font-medium text-slate-700">
                    {isCourseRequestModal ? selectedItem.studentProfileId?.mobileNumber : selectedItem.mobileNumber}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Agreed Course Fee (₹) *
                  </label>
                  <input
                    type="number"
                    value={agreedFee}
                    onChange={(e) => setAgreedFee(e.target.value)}
                    placeholder="Standard course fee"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Discount Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    placeholder="Optional discount (₹)"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              {/* Live Net Fee & EMI preview */}
              {(() => {
                const baseF = Number(agreedFee) || 0;
                const discF = Number(discountAmount) || 0;
                const netF = Math.max(0, baseF - discF);
                const instC = Number(installmentCount) || 1;
                const perInst = Math.round(netF / instC);

                return (
                  <div className="space-y-2">
                    <div className="p-3 bg-purple-50/60 border border-purple-200/80 rounded-xl space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Base Fee:</span>
                        <span className="font-semibold text-slate-900">₹{baseF.toLocaleString("en-IN")}</span>
                      </div>
                      {discF > 0 && (
                        <div className="flex justify-between items-center text-emerald-700">
                          <span>Discount / Concession:</span>
                          <span className="font-bold">- ₹{discF.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-1 border-t border-purple-200/80 font-bold">
                        <span className="text-slate-800">Final Net Fee:</span>
                        <span className="text-purple-700 text-sm font-black">₹{netF.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    {paymentType === "installment" && (
                      <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-center justify-between font-medium">
                        <span>Installment Schedule:</span>
                        <span className="font-bold">
                          {installmentCount} Monthly Payments of ~₹{perInst.toLocaleString("en-IN")} each
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Payment Arrangement
                  </label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  >
                    <option value="full">One-time / Full</option>
                    <option value="installment">Installment-Based Plan</option>
                  </select>
                </div>

                {paymentType === "installment" && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Number of Installments
                    </label>
                    <select
                      value={installmentCount}
                      onChange={(e) => setInstallmentCount(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                    >
                      <option value="1">1 Installment (Full Settlement)</option>
                      <option value="2">2 Monthly Installments (EMIs)</option>
                      <option value="3">3 Monthly Installments (EMIs)</option>
                      <option value="4">4 Monthly Installments (EMIs)</option>
                      <option value="5">5 Monthly Installments (EMIs)</option>
                      <option value="6">6 Monthly Installments (EMIs)</option>
                    </select>
                  </div>
                )}
              </div>

              {!isCourseRequestModal && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Student Login Password
                  </label>
                  <input
                    type="text"
                    value={studentPassword}
                    onChange={(e) => setStudentPassword(e.target.value)}
                    placeholder="QPET@XXXX"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Student uses their 10-digit mobile number as username.
                  </p>
                </div>
              )}

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
                  {processing ? "Enrolling..." : "Confirm & Enroll"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT MODAL */}
      {isRejectModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200/80 shadow-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 mb-2">
              {isCourseRequestModal ? "Decline Multi-Course Request" : "Reject Admission Application"}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Please enter the reason for declining this application.
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Ineligible qualifications, duplicate submission..."
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 mb-4"
            />
            <div className="flex items-center justify-end gap-2">
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
                disabled={processing}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
              >
                {processing ? "Declining..." : "Confirm Decline"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS CREDENTIALS MODAL */}
      {approvedDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200/80 shadow-2xl p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Student Admitted & Enrolled!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Enrollment ID: <strong className="font-mono text-purple-700">{approvedDetails.enrollmentNumber}</strong>
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Student:</span>
                <span className="font-bold text-slate-800">{approvedDetails.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Course:</span>
                <span className="font-bold text-purple-700">{approvedDetails.courseName}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200">
                <span className="text-slate-500">Login Username:</span>
                <span className="font-mono font-bold text-slate-900">{approvedDetails.username}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Password:</span>
                <span className="font-mono font-bold text-purple-700">{approvedDetails.password}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => copyCreds(approvedDetails.username, approvedDetails.password)}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy Credentials"}</span>
              </button>
              <button
                onClick={() => setApprovedDetails(null)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
