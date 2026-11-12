"use client";

import { useState, useEffect } from "react";
import {
  Receipt,
  Search,
  Download,
  Calendar,
  IndianRupee,
  User,
  CreditCard,
  FileText,
  Sparkles,
  Printer,
  ShieldCheck,
} from "lucide-react";

export default function TrainerReceiptsPage() {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [currentUser, setCurrentUser] = useState<{
    role: string;
    permissions?: Record<string, boolean>;
  } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
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

  const canDownloadReceipts =
    currentUser?.role === "admin" ||
    !!currentUser?.permissions?.viewReceipts ||
    !!currentUser?.permissions?.createReceipts ||
    !!currentUser?.permissions?.exportReceipts;

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
              Fee Receipts Repository
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/80 shadow-xs">
              {receipts.length} Official Receipts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse, reprint, and download official computer-generated student fee receipts.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by receipt number (e.g. QPET-REC-2026-00001), enrollment, student name..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border border-purple-600 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setTimeout(() => fetchReceipts(), 50);
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Receipts Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-xs">
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
                      <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading receipts repository...</span>
                    </div>
                  </td>
                </tr>
              ) : receipts.length > 0 ? (
                receipts.map((rec) => (
                  <tr key={rec._id} className="hover:bg-purple-50/30 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-purple-700 text-xs">
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
                      <p className="font-mono text-purple-600 text-[11px]">{rec.enrollmentNumber}</p>
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
                      {canDownloadReceipts ? (
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/api/pdf/receipt/${rec._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white border border-purple-200/80 transition-all shadow-xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF</span>
                          </a>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Restricted</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    {search ? "No receipts found matching your search." : "No fee receipts generated yet."}
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
