"use client";

import { useState, useEffect } from "react";
import { Receipt, Download, Calendar, IndianRupee, Printer } from "lucide-react";

export default function StudentReceiptsPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/receipts");
      const json = await res.json();
      if (json.receipts) setReceipts(json.receipts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <Receipt className="w-6 h-6 text-teal-400" />
          My Fee Receipts ({receipts.length})
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Download and print your official QPET computer-generated fee payment receipts.
        </p>
      </div>

      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Receipt Number</th>
                <th className="py-3.5 px-4">Payment Date</th>
                <th className="py-3.5 px-4">Course Enrolled</th>
                <th className="py-3.5 px-4">Amount Paid</th>
                <th className="py-3.5 px-4">Remaining Balance</th>
                <th className="py-3.5 px-4">Method</th>
                <th className="py-3.5 px-4 text-right">PDF Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Loading receipts...
                  </td>
                </tr>
              ) : receipts.length > 0 ? (
                receipts.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-300 text-xs">
                      {rec.receiptNumber}
                    </td>

                    <td className="py-3.5 px-4 text-slate-300">
                      {new Date(rec.receiptDate).toLocaleDateString("en-IN")}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-white">
                      {rec.courseName}
                    </td>

                    <td className="py-3.5 px-4 font-extrabold text-emerald-400 text-sm">
                      ₹{rec.currentPaymentAmount.toLocaleString("en-IN")}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-300">
                      ₹{rec.outstandingBalanceAfterThis.toLocaleString("en-IN")}
                    </td>

                    <td className="py-3.5 px-4 uppercase text-slate-400 text-[11px]">
                      {rec.paymentMethod}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={`/api/pdf/receipt/${rec._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white transition-colors shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No fee receipts recorded for your account.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
