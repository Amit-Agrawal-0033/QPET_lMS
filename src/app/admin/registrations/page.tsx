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
  Layers,
  GraduationCap,
  IndianRupee,
} from "lucide-react";

export default function AdminRegistrationsPage() {
  const [activeTab, setActiveTab] = useState<"students" | "course_requests">("students");
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [courseRequests, setCourseRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Approval modal state
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
      if (data.courseRequests) setCourseRequests(data.courseRequests);
    } catch (err) {
      console.error(err);
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
    // Default password suggested: QPET@ + last 4 digits of mobile
    const defaultPass = "QPET@" + reg.mobileNumber.slice(-4);
    setStudentPassword(defaultPass);
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

  const openRejectModal = (item: any, isCourseReq: boolean) => {
    setSelectedItem(item);
    setIsCourseRequestModal(isCourseReq);
    setRejectionReason("");
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
        setFeedbackMsg({ type: "error", text: data.error || "Approval failed." });
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
      fetchRegistrations();
    } catch (err: any) {
      setFeedbackMsg({ type: "error", text: "Network error during approval." });
    } finally {
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
        setFeedbackMsg({ type: "error", text: data.error || "Rejection failed." });
        setProcessing(false);
        return;
      }

      setFeedbackMsg({
        type: "success",
        text: isCourseRequestModal
          ? "Course request rejected."
          : "Student registration application rejected.",
      });
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
    const text = `QPET LMS Student Login Credentials:\nName: ${approvedDetails.studentName}\nEnrollment No: ${approvedDetails.enrollmentNumber}\nLogin Mobile: ${approvedDetails.username}\nPassword: ${approvedDetails.password}\nPortal URL: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Live Calculations for Modal
  const baseFeeNum = Number(agreedFee) || 0;
  const discountNum = Number(discountAmount) || 0;
  const finalPayableNum = Math.max(0, baseFeeNum - discountNum);
  const instCountNum = Number(installmentCount) || 1;
  const perInstallmentEst = Math.round(finalPayableNum / instCountNum);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Admissions &amp; Registrations
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/80">
              {registrations.length + courseRequests.length} Total Pending
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Review online student applications, allot official enrollment sequences, and configure custom fee &amp; installment structures.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab("students")}
          className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-2 ${
            activeTab === "students"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>New Student Admissions</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "students"
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {registrations.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("course_requests")}
          className={`pb-3 px-4 text-xs font-bold transition-all relative flex items-center gap-2 ${
            activeTab === "course_requests"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Multi-Course Requests</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              activeTab === "course_requests"
                ? "bg-blue-100 text-blue-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {courseRequests.length}
          </span>
        </button>
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

      {/* ===================================================================== */}
      {/* TAB 1: NEW STUDENT ADMISSIONS                                         */}
      {/* ===================================================================== */}
      {activeTab === "students" && (
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-xs text-slate-500 shadow-sm flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Loading pending student applications...</span>
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
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60 capitalize">
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
                      onClick={() => openApproveStudentModal(reg)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve &amp; Set Fees</span>
                    </button>
                    <button
                      onClick={() => openRejectModal(reg, false)}
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
                      Contact &amp; Mobile
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
                      Default Fee: <strong className="text-slate-700 font-medium">₹{reg.preferredCourseId?.defaultFee || 0}</strong> ({reg.preferredCourseId?.durationText || `${reg.preferredCourseId?.durationMonths || 1} Months`})
                    </span>
                  </div>

                  <div className="space-y-1.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Address &amp; Date
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
              <h3 className="text-sm font-semibold text-slate-800">No Pending Student Applications</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                All student admission registrations have been processed and enrolled. New submissions from the portal will appear here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* TAB 2: MULTI-COURSE ENROLLMENT REQUESTS                                */}
      {/* ===================================================================== */}
      {activeTab === "course_requests" && (
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-xs text-slate-500 shadow-sm flex flex-col items-center justify-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Loading course enrollment requests...</span>
            </div>
          ) : courseRequests.length > 0 ? (
            courseRequests.map((req) => (
              <div
                key={req._id}
                className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{req.studentId?.fullName}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        Existing Student
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Contact: <strong className="text-slate-700 font-medium">{req.studentId?.mobileNumber}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openApproveCourseRequestModal(req)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve &amp; Enroll</span>
                    </button>
                    <button
                      onClick={() => openRejectModal(req, true)}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 bg-white hover:bg-rose-50 border border-rose-200/80 transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Requested Course
                    </span>
                    <div className="flex items-center gap-2 text-blue-700 font-bold">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{req.courseId?.title} ({req.courseId?.code})</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block">
                      Standard Fee: <strong className="text-slate-800 font-semibold">₹{req.courseId?.defaultFee || 0}</strong> ({req.courseId?.durationText || `${req.courseId?.durationMonths || 1} Months`})
                    </span>
                  </div>

                  <div className="space-y-1.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Student Notes / Preferred Batch
                    </span>
                    <p className="text-slate-700 font-medium italic">
                      {req.notes ? `"${req.notes}"` : "No special notes provided."}
                    </p>
                  </div>

                  <div className="space-y-1.5 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Request Timestamp
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{new Date(req.requestDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl bg-white border border-slate-200/80 p-12 text-center shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-slate-800">No Pending Course Requests</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Existing students who apply for 2nd or 3rd courses via their student portal will appear here for fee agreement and installment scheduling.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* APPROVE & CONFIGURE FEES MODAL                                        */}
      {/* ===================================================================== */}
      {isApproveModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 my-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {isCourseRequestModal ? "Approve Multi-Course Enrollment" : "Approve Student & Set Fees"}
                  </h2>
                  <p className="text-xs text-slate-500">Configure tuition fee, discount &amp; installment structure</p>
                </div>
              </div>
              <button
                onClick={() => setIsApproveModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Target Info */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-slate-900 font-bold text-sm">
                  {isCourseRequestModal ? selectedItem.studentId?.fullName : selectedItem.fullName}
                </p>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                  {isCourseRequestModal ? selectedItem.courseId?.title : selectedItem.preferredCourseId?.title}
                </span>
              </div>
              <p className="text-slate-500">
                Registered Contact / Login ID:{" "}
                <strong className="text-slate-800 font-medium">
                  {isCourseRequestModal ? selectedItem.studentId?.mobileNumber : selectedItem.mobileNumber}
                </strong>
              </p>
            </div>

            {/* Fee & Discount Inputs */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Agreed Course Fee (₹) *
                  </label>
                  <input
                    type="number"
                    value={agreedFee}
                    onChange={(e) => setAgreedFee(e.target.value)}
                    required
                    placeholder="e.g. 15000"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Discount / Concession (₹)
                  </label>
                  <input
                    type="number"
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value)}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-semibold"
                  />
                </div>
              </div>

              {/* Dynamic Fee Summary Card */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-600">Base Course Fee:</span>
                  <span className="text-slate-900 font-semibold">₹{baseFeeNum.toLocaleString("en-IN")}</span>
                </div>
                {discountNum > 0 && (
                  <div className="flex justify-between items-center text-xs text-emerald-700">
                    <span>Discount Applied:</span>
                    <span className="font-bold">- ₹{discountNum.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs pt-1.5 border-t border-blue-200/80 font-bold">
                  <span className="text-slate-800">Final Payable Fee:</span>
                  <span className="text-blue-700 text-sm font-black">
                    ₹{finalPayableNum.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Payment Arrangement */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Payment Plan
                  </label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                  >
                    <option value="full">Full Payment Plan</option>
                    <option value="installment">Installment-Based Plan</option>
                  </select>
                </div>

                {paymentType === "installment" && (
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1.5">
                      Installment Count
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
              </div>

              {paymentType === "installment" && (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-center justify-between">
                  <span className="font-medium">Installment Breakdown:</span>
                  <span className="font-bold">
                    {installmentCount} Monthly Payments of ~₹{perInstallmentEst.toLocaleString("en-IN")} each
                  </span>
                </div>
              )}

              {/* Password configuration only for new students */}
              {!isCourseRequestModal && (
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
                    Student username is their mobile number: <strong className="text-slate-800">{selectedItem.mobileNumber}</strong>
                  </p>
                </div>
              )}
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
                {processing ? "Processing..." : isCourseRequestModal ? "Approve & Enroll" : "Approve & Create Account"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* CREDENTIALS CREATED MODAL (For New Students)                          */}
      {/* ===================================================================== */}
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

      {/* ===================================================================== */}
      {/* REJECT MODAL                                                          */}
      {/* ===================================================================== */}
      {isRejectModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600">
                  <XCircle className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900">
                  {isCourseRequestModal ? "Reject Course Request" : "Reject Student Application"}
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
              Are you sure you want to reject the application for{" "}
              <strong className="text-slate-900">
                {isCourseRequestModal ? selectedItem.studentId?.fullName : selectedItem.fullName}
              </strong>
              ?
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Reason for Rejection
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="e.g. Schedule clash, prerequisite not met, etc."
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
