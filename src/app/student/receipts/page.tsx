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
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            My Fee Receipts
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
            {receipts.length} Official Receipts
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Download and print your official QPET computer-generated fee payment receipts.
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200/80 font-semibold">
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
            <tbody className="divide-y divide-slate-100 font-normal">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading receipts...</span>
                    </div>
                  </td>
                </tr>
              ) : receipts.length > 0 ? (
                receipts.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 text-xs">
                      {rec.receiptNumber}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(rec.receiptDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      {rec.courseName}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                      ₹{rec.currentPaymentAmount.toLocaleString("en-IN")}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-600">
                      ₹{rec.outstandingBalanceAfterThis.toLocaleString("en-IN")}
                    </td>

                    <td className="py-3.5 px-4 uppercase text-slate-500 text-[11px] font-medium">
                      {rec.paymentMethod}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <a
                        href={`/api/pdf/receipt/${rec._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white transition-all border border-blue-200 shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
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
