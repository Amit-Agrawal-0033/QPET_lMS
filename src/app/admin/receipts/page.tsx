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
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Receipt className="w-6 h-6 text-teal-400" />
            Fee Receipts Repository ({receipts.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse, reprint, and download official computer-generated fee receipts.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by receipt number (e.g. QPET-REC-2026-00001), enrollment, student name..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 rounded-xl"
          >
            Search
          </button>
        </form>
      </div>

      {/* Receipts Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Receipt Number</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Student & Enrollment</th>
                <th className="py-3.5 px-4">Course</th>
                <th className="py-3.5 px-4">Amount Received</th>
                <th className="py-3.5 px-4">Balance Remaining</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-normal">
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

                    <td className="py-3.5 px-4 text-slate-400">
                      {new Date(rec.receiptDate).toLocaleDateString("en-IN")}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white text-xs">{rec.studentName}</p>
                      <p className="font-mono text-teal-300 text-[11px]">{rec.enrollmentNumber}</p>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {rec.courseName}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-extrabold text-emerald-400 text-sm">
                        ₹{rec.currentPaymentAmount.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-slate-400 block uppercase">
                        via {rec.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`font-semibold ${
                          rec.outstandingBalanceAfterThis <= 0
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        ₹{rec.outstandingBalanceAfterThis.toLocaleString("en-IN")}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {rec.outstandingBalanceAfterThis <= 0 ? "Fully Settled" : "Pending"}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/api/pdf/receipt/${rec._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white transition-colors shadow-sm"
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
                  <td colSpan={7} className="py-8 text-center text-slate-500">
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
