"use client";

import { useState, useEffect } from "react";
import {
  Receipt,
  Search,
  Download,
  Printer,
  Calendar,
  IndianRupee,
  User,
  CreditCard,
  FileText,
} from "lucide-react";

export default function AdminReceiptsPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("query", search);

      const res = await fetch(`/api/admin/receipts?${params.toString()}`);
      const data = await res.json();
      if (data.receipts) setReceipts(data.receipts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReceipts();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Fee Receipts Repository
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
              {receipts.length} Generated Receipts
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Browse, reprint, and download official computer-generated student fee receipts.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by receipt number (e.g. QPET-REC-2026-00001), enrollment, student name..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Receipts Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200/80 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Receipt Number</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Student & Enrollment</th>
                <th className="py-3.5 px-4">Course</th>
                <th className="py-3.5 px-4">Amount Received</th>
                <th className="py-3.5 px-4">Balance Remaining</th>
                <th className="py-3.5 px-4 text-right">PDF Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading receipts repository...</span>
                    </div>
                  </td>
                </tr>
              ) : receipts.length > 0 ? (
                receipts.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 text-xs">
                      {rec.receiptNumber}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(rec.receiptDate).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 text-xs">{rec.studentName}</p>
                      <p className="font-mono text-blue-600 text-[11px]">{rec.enrollmentNumber}</p>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      {rec.courseName}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 text-sm">
                        ₹{rec.currentPaymentAmount.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">
                        via {rec.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold ${
                          rec.outstandingBalanceAfterThis <= 0
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        ₹{rec.outstandingBalanceAfterThis.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {rec.outstandingBalanceAfterThis <= 0 ? "Fully Settled" : "Pending Balance"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/api/pdf/receipt/${rec._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200/80 transition-all shadow-xs"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No fee receipts found.
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
