"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CreditCard,
  Plus,
  Receipt,
  FileText,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Download,
  Clock,
  IndianRupee,
  Calendar,
  Sparkles,
  ShieldCheck,
  User,
  Phone,
} from "lucide-react";

function TrainerFeesContent() {
  const searchParams = useSearchParams();
  const preselectedEnrollmentId = searchParams.get("enrollmentId");

  const [payments, setPayments] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [installments, setInstallments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"passbook" | "installments" | "payments">("passbook");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Current Trainer Auth & Permissions
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    identifier: string;
    role: "admin" | "trainer" | "student";
    name?: string;
    permissions?: Record<string, boolean>;
  } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newReceiptResult, setNewReceiptResult] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    enrollmentId: preselectedEnrollmentId || "",
    amount: "",
    paymentMethod: "upi",
    transactionReference: "",
    remarks: "",
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
    fetchData();
  }, []);

  const canCollectFees =
    currentUser?.role === "admin" ||
    !!currentUser?.permissions?.createFees ||
    !!currentUser?.permissions?.editFees;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [payRes, enrRes, instRes] = await Promise.all([
        fetch("/api/admin/fees"),
        fetch("/api/admin/enrollments?status=active"),
        fetch("/api/admin/installments"),
      ]);

      const payData = await payRes.json();
      const enrData = await enrRes.json();
      const instData = await instRes.json();

      if (payData.payments) setPayments(payData.payments);
      if (enrData.enrollments) {
        setEnrollments(enrData.enrollments);
        if (preselectedEnrollmentId) {
          const match = enrData.enrollments.find((e: any) => e._id === preselectedEnrollmentId);
          if (match) {
            setFormData((prev) => ({
              ...prev,
              enrollmentId: preselectedEnrollmentId,
              amount: String(match.outstandingBalance > 0 ? match.outstandingBalance : ""),
            }));
            setIsModalOpen(true);
          }
        } else if (enrData.enrollments.length > 0 && !formData.enrollmentId) {
          const firstWithBalance = enrData.enrollments.find((e: any) => e.outstandingBalance > 0) || enrData.enrollments[0];
          setFormData((prev) => ({
            ...prev,
            enrollmentId: firstWithBalance._id,
            amount: String(firstWithBalance.outstandingBalance > 0 ? firstWithBalance.outstandingBalance : ""),
          }));
        }
      }
      if (instData.installments) setInstallments(instData.installments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectedEnrollment = enrollments.find((e) => e._id === formData.enrollmentId);

  const openRecordModal = () => {
    setError(null);
    setNewReceiptResult(null);
    setIsModalOpen(true);
  };

  const paySpecificInstallment = (inst: any) => {
    const dueAmount = (inst.amount || 0) - (inst.paidAmount || 0);
    setFormData({
      enrollmentId: inst.enrollmentId?._id || inst.enrollmentId,
      amount: String(dueAmount > 0 ? dueAmount : inst.amount),
      paymentMethod: "upi",
      transactionReference: "",
      remarks: `Payment for Installment #${inst.installmentNumber}`,
    });
    setError(null);
    setNewReceiptResult(null);
    setIsModalOpen(true);
  };

  const payEnrollmentBalance = (enr: any) => {
    setFormData({
      enrollmentId: enr._id,
      amount: String(enr.outstandingBalance > 0 ? enr.outstandingBalance : ""),
      paymentMethod: "upi",
      transactionReference: "",
      remarks: `Fee settlement for ${enr.courseNameSnapshot}`,
    });
    setError(null);
    setNewReceiptResult(null);
    setIsModalOpen(true);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/admin/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to record payment.");
        setSaving(false);
        return;
      }

      setNewReceiptResult(data);
      setSaving(false);
      fetchData();
    } catch (err: any) {
      setError("Network error occurred while saving payment.");
      setSaving(false);
    }
  };

  // Filtered Payments
  const filteredPayments = payments.filter((p) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const studentName = p.studentId?.fullName?.toLowerCase() || "";
    const receiptNum = p.receiptNumber?.toLowerCase() || "";
    const enrNum = p.enrollmentId?.enrollmentNumber?.toLowerCase() || "";
    const mobile = p.studentId?.mobileNumber?.toLowerCase() || "";
    return (
      studentName.includes(term) ||
      receiptNum.includes(term) ||
      enrNum.includes(term) ||
      mobile.includes(term)
    );
  });

  // Filtered Installments
  const filteredInstallments = installments.filter((inst) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const studentName = inst.studentId?.fullName?.toLowerCase() || "";
    const enrNum = inst.enrollmentId?.enrollmentNumber?.toLowerCase() || "";
    return studentName.includes(term) || enrNum.includes(term);
  });

  const totalCollectedAmount = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalOutstandingAmount = enrollments.reduce((sum, e) => sum + (e.outstandingBalance || 0), 0);

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
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Fees & Payment Collections
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/80 shadow-xs">
              ₹{totalCollectedAmount.toLocaleString("en-IN")} Total Collected
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Record student fee payments, track installment schedules, and view official payment records.
          </p>
        </div>

        {canCollectFees ? (
          <button
            onClick={openRecordModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-sm shadow-purple-600/25 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Collect / Add Fee</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
            <ShieldCheck className="w-4 h-4 text-slate-400" />
            <span>View Only (Collection Disabled)</span>
          </div>
        )}
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Total Fees Collected</p>
            <p className="text-lg font-extrabold text-slate-900">
              ₹{totalCollectedAmount.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Total Outstanding Dues</p>
            <p className="text-lg font-extrabold text-amber-700">
              ₹{totalOutstandingAmount.toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500">Payment Transactions</p>
            <p className="text-lg font-extrabold text-slate-900">{payments.length} Payments</p>
          </div>
        </div>
      </div>

      {/* Controls Bar: Segmented Tabs */}
      <div className="flex border-b border-slate-200 gap-4 sm:gap-8 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab("passbook")}
          className={`pb-3.5 transition-all flex items-center gap-2 text-xs shrink-0 ${
            activeTab === "passbook"
              ? "text-purple-600 border-b-2 border-purple-600 font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Course EMI Passbooks ({enrollments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("installments")}
          className={`pb-3.5 transition-all flex items-center gap-2 text-xs shrink-0 ${
            activeTab === "installments"
              ? "text-purple-600 border-b-2 border-purple-600 font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>All Installment Schedules ({installments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("payments")}
          className={`pb-3.5 transition-all flex items-center gap-2 text-xs shrink-0 ${
            activeTab === "payments"
              ? "text-purple-600 border-b-2 border-purple-600 font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Recorded Payments ({payments.length})</span>
        </button>
      </div>

      {/* Tab 1: Course EMI Passbooks */}
      {activeTab === "passbook" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, mobile, course, or enrollment number..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
            />
          </div>

          {(() => {
            const q = searchTerm.toLowerCase().trim();
            const filteredEnrollments = enrollments.filter((e) => {
              if (!q) return true;
              return (
                (e.studentId?.fullName || "").toLowerCase().includes(q) ||
                (e.studentId?.mobileNumber || "").includes(q) ||
                (e.courseNameSnapshot || "").toLowerCase().includes(q) ||
                (e.enrollmentNumber || "").toLowerCase().includes(q)
              );
            });

            if (filteredEnrollments.length === 0) {
              return (
                <div className="rounded-2xl bg-white border border-slate-200/80 p-12 text-center shadow-sm">
                  <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No student course records found matching your search.</p>
                </div>
              );
            }

            return filteredEnrollments.map((enr) => {
              const enrInsts = installments
                .filter((i) => (i.enrollmentId?._id || i.enrollmentId) === enr._id)
                .sort((a, b) => (a.installmentNumber || 0) - (b.installmentNumber || 0));

              return (
                <div
                  key={enr._id}
                  className="bg-white border border-slate-200/80 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all space-y-4"
                >
                  {/* Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-700 font-bold border border-purple-200/60">
                          {enr.enrollmentNumber}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-slate-900">
                          {enr.studentId?.fullName || "Student"}
                        </h3>
                        <span className="text-xs text-slate-500 font-mono">
                          ({enr.studentId?.mobileNumber})
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-purple-700 mt-1">
                        {enr.courseNameSnapshot}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          enr.paymentStatus === "paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : enr.paymentStatus === "partially_paid"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {enr.paymentStatus ? enr.paymentStatus.replace("_", " ") : "unpaid"}
                      </span>

                      {canCollectFees && enr.outstandingBalance > 0 && (
                        <button
                          onClick={() => payEnrollmentBalance(enr)}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          Record Payment
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Financial Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Agreed Course Fee</span>
                      <span className="font-bold text-slate-800">
                        ₹{(enr.agreedFeeSnapshot || enr.totalFee || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Discount</span>
                      <span className="font-bold text-emerald-600">
                        - ₹{(enr.discountAmount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Final Net Fee</span>
                      <span className="font-extrabold text-purple-700">
                        ₹{(enr.totalFee || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Paid So Far</span>
                      <span className="font-bold text-emerald-700">
                        ₹{(enr.paidAmount || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 font-medium block">Outstanding Balance</span>
                      <span className="font-extrabold text-rose-600">
                        ₹{(enr.outstandingBalance || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>

                  {/* EMI Installment Table */}
                  <div className="overflow-x-auto rounded-xl border border-slate-100">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase">
                          <th className="py-2.5 px-3">EMI #</th>
                          <th className="py-2.5 px-3">Amount Due</th>
                          <th className="py-2.5 px-3">Amount Paid</th>
                          <th className="py-2.5 px-3">Due Date</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3">Paid Date</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {enrInsts.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="py-4 text-center text-slate-400 text-xs">
                              Full one-time fee payment arrangement (no installment schedule)
                            </td>
                          </tr>
                        ) : (
                          enrInsts.map((inst) => (
                            <tr key={inst._id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-2.5 px-3 font-bold text-slate-900">
                                EMI {inst.installmentNumber}
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-slate-900">
                                ₹{inst.amount.toLocaleString("en-IN")}
                              </td>
                              <td className="py-2.5 px-3 font-bold text-emerald-700">
                                ₹{(inst.paidAmount || 0).toLocaleString("en-IN")}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600">
                                {new Date(inst.dueDate).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                    inst.status === "paid"
                                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                      : inst.status === "partially_paid"
                                      ? "bg-amber-50 text-amber-700 border border-amber-200"
                                      : "bg-rose-50 text-rose-700 border border-rose-200"
                                  }`}
                                >
                                  {inst.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-slate-500">
                                {inst.paidDate
                                  ? new Date(inst.paidDate).toLocaleDateString("en-IN", {
                                      day: "numeric",
                                      month: "short",
                                      year: "numeric",
                                    })
                                  : "—"}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                {inst.status === "paid" ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Settled</span>
                                  </span>
                                ) : canCollectFees ? (
                                  <button
                                    onClick={() => paySpecificInstallment(inst)}
                                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                                  >
                                    Pay EMI {inst.installmentNumber} (₹{(inst.amount - (inst.paidAmount || 0)).toLocaleString("en-IN")})
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-slate-400 italic">Pending</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            });
          })()}
        </div>
      )}

      {/* Tab 2: Installments Table */}
      {activeTab === "installments" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Student Installment Schedules</h3>
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredInstallments.length} schedule records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Enrollment</th>
                  <th className="py-3 px-4">EMI #</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredInstallments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No installment schedules found.
                    </td>
                  </tr>
                ) : (
                  filteredInstallments.map((inst) => (
                    <tr key={inst._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {inst.studentId?.fullName || "Student"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {inst.studentId?.mobileNumber}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-purple-700">
                        {inst.enrollmentId?.enrollmentNumber || "—"}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        EMI {inst.installmentNumber}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        ₹{inst.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {new Date(inst.dueDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            inst.status === "paid"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : inst.status === "partially_paid"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {inst.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {inst.status !== "paid" && canCollectFees && (
                          <button
                            onClick={() => paySpecificInstallment(inst)}
                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            Collect
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Payments List */}
      {activeTab === "payments" && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Recorded Receipts & Transactions</h3>
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredPayments.length} transactions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Receipt #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Enrollment</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4 text-right">Official Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No payment transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-purple-700">
                        {p.receiptNumber}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {new Date(p.paymentDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">
                          {p.studentId?.fullName || "Student"}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {p.studentId?.mobileNumber}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {p.enrollmentId?.enrollmentNumber || "—"}
                      </td>
                      <td className="py-3 px-4 font-bold text-emerald-600">
                        ₹{p.amount.toLocaleString("en-IN")}
                      </td>
                      <td className="py-3 px-4">
                        <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px]">
                          {p.paymentMethod.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {p.receiptId?._id || p.receiptId ? (
                          <a
                            href={`/api/pdf/receipt/${p.receiptId?._id || p.receiptId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200/80 rounded-lg hover:bg-purple-100 text-xs font-bold transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Processing</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-7 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/60">
                  <Receipt className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Collect Student Fee Payment
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {newReceiptResult ? (
              <div className="mt-4 space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900">
                  Payment Recorded Successfully!
                </h4>
                <p className="text-xs text-slate-600">
                  Receipt Number:{" "}
                  <strong className="text-purple-700 font-mono">
                    {newReceiptResult.receipt?.receiptNumber}
                  </strong>
                </p>

                <div className="pt-3 flex gap-3">
                  <a
                    href={`/api/pdf/receipt/${newReceiptResult.receipt?._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Receipt (PDF)</span>
                  </a>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setNewReceiptResult(null);
                    }}
                    className="px-4 py-2.5 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRecordPayment} className="mt-5 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Select Active Student Enrollment *
                  </label>
                  <select
                    value={formData.enrollmentId}
                    onChange={(e) => {
                      const enrId = e.target.value;
                      const enr = enrollments.find((x) => x._id === enrId);
                      setFormData({
                        ...formData,
                        enrollmentId: enrId,
                        amount: enr ? String(enr.outstandingBalance > 0 ? enr.outstandingBalance : "") : "",
                      });
                    }}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                  >
                    <option value="">-- Choose Enrolled Student --</option>
                    {enrollments.map((enr) => (
                      <option key={enr._id} value={enr._id}>
                        {enr.enrollmentNumber} — {enr.studentId?.fullName} ({enr.courseNameSnapshot}) — Balance: ₹
                        {enr.outstandingBalance}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedEnrollment && (
                  <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 flex justify-between items-center text-xs">
                    <div>
                      <span className="text-slate-500 block">Total Course Fee:</span>
                      <span className="font-bold text-slate-800">₹{selectedEnrollment.totalFee}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Paid So Far:</span>
                      <span className="text-emerald-600 font-bold">₹{selectedEnrollment.paidAmount}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Outstanding Due:</span>
                      <span className="text-rose-600 font-bold">₹{selectedEnrollment.outstandingBalance}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1.5">
                      Payment Amount (₹ INR) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedEnrollment ? selectedEnrollment.outstandingBalance : undefined}
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                      placeholder="e.g. 1500"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1.5">
                      Payment Method *
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                      required
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                    >
                      <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                      <option value="cash">Cash (Direct Counter)</option>
                      <option value="bank_transfer">Bank Transfer (NEFT / IMPS)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Transaction Reference / UPI ID (Optional for Cash)
                  </label>
                  <input
                    type="text"
                    value={formData.transactionReference}
                    onChange={(e) =>
                      setFormData({ ...formData, transactionReference: e.target.value })
                    }
                    placeholder="e.g. UPI Ref / Bank UTR / Receipt Slip #"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Faculty Remarks / Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="e.g. 1st installment paid in full by student"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-purple-500/20 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? "Recording..." : "Save Payment & Generate Receipt"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrainerFeesPage() {
  return (
    <Suspense fallback={<div className="text-slate-500 text-xs p-6">Loading fees module...</div>}>
      <TrainerFeesContent />
    </Suspense>
  );
}
