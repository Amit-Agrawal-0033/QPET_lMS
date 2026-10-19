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
        <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
        <div className="h-40 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
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
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <CreditCard className="w-6 h-6 text-teal-400" />
          My Fees & Installment Schedules
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Complete transparent breakdown of course fees, installment schedules, and payment receipts.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Total Course Fees</span>
          <span className="text-2xl font-bold text-white">
            ₹{totalPayable.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Total Amount Paid</span>
          <span className="text-2xl font-bold text-emerald-400">
            ₹{totalPaid.toLocaleString("en-IN")}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs text-slate-400 block mb-1">Outstanding Balance</span>
          <span className="text-2xl font-bold text-rose-400">
            ₹{totalBalance.toLocaleString("en-IN")}
          </span>
        </div>
      </div>

      {/* Installment Schedules Table (if installments exist) */}
      {installments && installments.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-orange-400" />
            Installment Due Dates & Status
          </h2>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
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
                <tbody className="divide-y divide-slate-800/80">
                  {installments.map((inst: any) => (
                    <tr key={inst._id} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-white">{inst.enrollmentId?.courseNameSnapshot}</p>
                        <p className="font-mono text-teal-300 text-[11px]">{inst.enrollmentId?.enrollmentNumber}</p>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-200">
                        Installment {inst.installmentNumber}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-white">
                        ₹{inst.amount}
                      </td>

                      <td className="py-3.5 px-4 text-emerald-400 font-semibold">
                        ₹{inst.paidAmount || 0}
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        {new Date(inst.dueDate).toLocaleDateString("en-IN")}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            inst.status === "paid"
                              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                              : inst.status === "partially_paid"
                              ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                              : "bg-orange-500/10 text-orange-300 border-orange-500/20"
                          }`}
                        >
                          {inst.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        {inst.paidDate
                          ? new Date(inst.paidDate).toLocaleDateString("en-IN")
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
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Receipt className="w-4 h-4 text-emerald-400" />
          Recorded Payment History ({payments.length})
        </h2>

        <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Receipt Number</th>
                  <th className="py-3.5 px-4">Payment Date</th>
                  <th className="py-3.5 px-4">Amount Paid</th>
                  <th className="py-3.5 px-4">Payment Mode</th>
                  <th className="py-3.5 px-4">Txn Reference</th>
                  <th className="py-3.5 px-4 text-right">Fee Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {payments.length > 0 ? (
                  payments.map((p: any) => (
                    <tr key={p._id} className="hover:bg-slate-800/40">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-300">
                        {p.receiptNumber}
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        {new Date(p.paymentDate).toLocaleDateString("en-IN")}
                      </td>

                      <td className="py-3.5 px-4 font-extrabold text-white text-sm">
                        ₹{p.amount.toLocaleString("en-IN")}
                      </td>

                      <td className="py-3.5 px-4 uppercase text-slate-300 font-semibold">
                        {p.paymentMethod}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-400 text-[11px]">
                        {p.transactionReference || "Direct Cash"}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {p.receiptId ? (
                          <a
                            href={`/api/pdf/receipt/${p.receiptId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                          </a>
                        ) : (
                          <span className="text-slate-500 italic">No receipt</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
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
