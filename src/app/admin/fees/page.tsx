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
} from "lucide-react";

function FeesContent() {
  const searchParams = useSearchParams();
  const preselectedEnrollmentId = searchParams.get("enrollmentId");

  const [payments, setPayments] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [installments, setInstallments] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"payments" | "installments">("payments");
  const [loading, setLoading] = useState(true);

  // Modal
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
    fetchData();
  }, []);

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
          setFormData((prev) => ({
            ...prev,
            enrollmentId: enrData.enrollments[0]._id,
            amount: String(enrData.enrollments[0].outstandingBalance),
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
      setError("Network error occurred.");
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Fees & Payment Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
              ₹{payments.reduce((sum, p) => sum + (p.amount || 0), 0).toLocaleString("en-IN")} Total Collected
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Record student fee transactions, generate PDF receipts, and track installment schedules.
          </p>
        </div>

        <button
          onClick={openRecordModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Record New Payment</span>
        </button>
      </div>

      {/* Segmented Tab Controls */}
      <div className="flex border-b border-slate-200 gap-8 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("payments")}
          className={`pb-3.5 transition-all flex items-center gap-2 text-xs ${
            activeTab === "payments"
              ? "text-blue-600 border-b-2 border-blue-600 font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Recorded Payments ({payments.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("installments")}
          className={`pb-3.5 transition-all flex items-center gap-2 text-xs ${
            activeTab === "installments"
              ? "text-blue-600 border-b-2 border-blue-600 font-bold"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Installment Schedules ({installments.length})</span>
        </button>
      </div>

      {/* Tab: Payments List */}
      {activeTab === "payments" && (
        <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200/80 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Receipt Number</th>
                  <th className="py-3.5 px-4">Student & Enrollment</th>
                  <th className="py-3.5 px-4">Amount Paid</th>
                  <th className="py-3.5 px-4">Method & Ref</th>
                  <th className="py-3.5 px-4">Payment Date</th>
                  <th className="py-3.5 px-4">Recorded By</th>
                  <th className="py-3.5 px-4 text-right">Receipt PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        <span>Loading payment transactions...</span>
                      </div>
                    </td>
                  </tr>
                ) : payments.length > 0 ? (
                  payments.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600 text-xs">
                        {p.receiptNumber || "N/A"}
                      </td>

                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 text-xs">{p.studentId?.fullName}</p>
                        <p className="font-mono text-blue-600 text-[11px]">
                          {p.enrollmentId?.enrollmentNumber}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 text-sm">
                          ₹{p.amount.toLocaleString("en-IN")}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                          {p.paymentMethod}
                        </span>
                        {p.transactionReference && (
                          <p className="font-mono text-[10px] text-slate-500 mt-0.5">
                            Ref: {p.transactionReference}
                          </p>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {new Date(p.paymentDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                        {p.recordedByAdminName}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {p.receiptId?._id ? (
                          <a
                            href={`/api/pdf/receipt/${p.receiptId._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80 hover:bg-blue-100 transition-colors shadow-xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 italic">No receipt</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No payments recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Installments List */}
      {activeTab === "installments" && (
        <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200/80 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Student & Enrollment</th>
                  <th className="py-3.5 px-4">Installment #</th>
                  <th className="py-3.5 px-4">Amount Due</th>
                  <th className="py-3.5 px-4">Paid Amount</th>
                  <th className="py-3.5 px-4">Due Date</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Paid Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {installments.length > 0 ? (
                  installments.map((inst) => (
                    <tr key={inst._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-slate-900 text-xs">{inst.studentId?.fullName}</p>
                        <p className="font-mono text-blue-600 text-[11px]">
                          {inst.enrollmentId?.enrollmentNumber}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        Installment {inst.installmentNumber}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        ₹{inst.amount}
                      </td>

                      <td className="py-3.5 px-4 text-emerald-600 font-semibold">
                        ₹{inst.paidAmount || 0}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {new Date(inst.dueDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            inst.status === "paid"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : inst.status === "partially_paid"
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : "bg-rose-50 text-rose-700 border-rose-200"
                          }`}
                        >
                          {inst.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {inst.paidDate
                          ? new Date(inst.paidDate).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No installment plans configured.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Record Fee Payment
                  </h2>
                  <p className="text-xs text-slate-500">Collect fee, update balance and generate receipt</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {newReceiptResult ? (
              <div className="p-6 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Payment Recorded!</h3>
                <p className="text-xs text-slate-600">{newReceiptResult.message}</p>
                <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 text-xs text-left space-y-2 max-w-sm mx-auto shadow-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Receipt Number:</span>
                    <span className="text-blue-600 font-mono font-bold">
                      {newReceiptResult.receipt.receiptNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Remaining Balance:</span>
                    <span className="text-slate-900 font-bold">
                      ₹{newReceiptResult.enrollment.outstandingBalance}
                    </span>
                  </div>
                </div>

                <div className="flex justify-center gap-3 pt-2">
                  <a
                    href={`/api/pdf/receipt/${newReceiptResult.receipt._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Fee Receipt PDF</span>
                  </a>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
                {error && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Select Enrollment *
                  </label>
                  <select
                    value={formData.enrollmentId}
                    onChange={(e) => {
                      const id = e.target.value;
                      const enr = enrollments.find((x) => x._id === id);
                      setFormData({
                        ...formData,
                        enrollmentId: id,
                        amount: String(enr && enr.outstandingBalance > 0 ? enr.outstandingBalance : ""),
                      });
                    }}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    {enrollments.map((e) => (
                      <option key={e._id} value={e._id}>
                        {e.enrollmentNumber} — {e.studentId?.fullName} ({e.courseNameSnapshot}) — Bal: ₹{e.outstandingBalance}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedEnrollment && (
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-3 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Total Fee:</span>
                      <span className="text-slate-900 font-bold">₹{selectedEnrollment.totalFee}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Paid So Far:</span>
                      <span className="text-emerald-600 font-bold">₹{selectedEnrollment.paidAmount}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Outstanding:</span>
                      <span className="text-rose-600 font-bold">₹{selectedEnrollment.outstandingBalance}</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1.5">
                      Payment Amount (INR) *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={selectedEnrollment ? selectedEnrollment.outstandingBalance : undefined}
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                      placeholder="e.g. 1500"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
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
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    >
                      <option value="upi">UPI (GPay / PhonePe / Paytm)</option>
                      <option value="cash">Cash (Direct Counter)</option>
                      <option value="bank_transfer">Bank Transfer (NEFT / IMPS)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Transaction / Reference Number (Optional for Cash)
                  </label>
                  <input
                    type="text"
                    value={formData.transactionReference}
                    onChange={(e) =>
                      setFormData({ ...formData, transactionReference: e.target.value })
                    }
                    placeholder="e.g. UPI Ref / Bank UTR / Receipt Slip #"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Remarks / Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="e.g. 1st installment paid in full"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save Payment & Generate Receipt"}
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

export default function AdminFeesPage() {
  return (
    <Suspense fallback={<div className="text-slate-500 text-xs">Loading fees module...</div>}>
      <FeesContent />
    </Suspense>
  );
}
