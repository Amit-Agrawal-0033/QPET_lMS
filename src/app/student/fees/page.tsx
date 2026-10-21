"use client";

import { useState, useEffect } from "react";
import {
  CreditCard,
  Receipt,
  Clock,
  CheckCircle2,
  AlertCircle,
  Download,
  Calendar,
  IndianRupee,
} from "lucide-react";

export default function StudentFeesPage() {
  const [data, setData] = useState<{
    enrollments: any[];
    payments: any[];
    installments: any[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/fees");
      const json = await res.json();
      if (json.success) setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded-xl animate-pulse" />
        <div className="h-40 bg-white border border-slate-200/80 rounded-2xl animate-pulse shadow-sm" />
      </div>
    );
  }

  const { enrollments, payments, installments } = data;

  const totalPayable = enrollments.reduce((acc, curr) => acc + curr.totalFee, 0);
  const totalPaid = enrollments.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalBalance = enrollments.reduce((acc, curr) => acc + curr.outstandingBalance, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            My Fees & Installment Schedules
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
            Fee Ledger
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Complete transparent breakdown of course fees, installment schedules, and payment receipts.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block mb-1">Total Course Fees</span>
          <span className="text-2xl font-bold text-slate-900">
            ₹{totalPayable.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block mb-1">Total Amount Paid</span>
          <span className="text-2xl font-bold text-emerald-600">
            ₹{totalPaid.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs text-slate-500 font-medium block mb-1">Outstanding Balance</span>
          <span className={`text-2xl font-bold ${totalBalance <= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            ₹{totalBalance.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Installment Schedules Table (if installments exist) */}
      {installments && installments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Installment Due Dates & Status
          </h2>

          <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200/80 font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Course & Enrollment</th>
                    <th className="py-3.5 px-4">Installment #</th>
                    <th className="py-3.5 px-4">Amount Due</th>
                    <th className="py-3.5 px-4">Amount Paid</th>
                    <th className="py-3.5 px-4">Due Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Settled On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {installments.map((inst: any) => (
                    <tr key={inst._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-slate-900">{inst.enrollmentId?.courseNameSnapshot}</p>
                        <p className="font-mono text-blue-600 text-[11px]">{inst.enrollmentId?.enrollmentNumber}</p>
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payment History & Receipts */}
      <div className="space-y-4">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-blue-600" />
          Recorded Payment History ({payments.length})
        </h2>

        <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200/80 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Receipt Number</th>
                  <th className="py-3.5 px-4">Payment Date</th>
                  <th className="py-3.5 px-4">Amount Paid</th>
                  <th className="py-3.5 px-4">Payment Mode</th>
                  <th className="py-3.5 px-4">Txn Reference</th>
                  <th className="py-3.5 px-4 text-right">Fee Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {payments.length > 0 ? (
                  payments.map((p: any) => (
                    <tr key={p._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        {p.receiptNumber}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600">
                        {new Date(p.paymentDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                        ₹{p.amount.toLocaleString("en-IN")}
                      </td>

                      <td className="py-3.5 px-4 uppercase text-slate-700 font-semibold">
                        {p.paymentMethod}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                        {p.transactionReference || "Direct Cash"}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {p.receiptId ? (
                          <a
                            href={`/api/pdf/receipt/${p.receiptId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white transition-all border border-blue-200 shadow-xs"
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
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      No payments recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
