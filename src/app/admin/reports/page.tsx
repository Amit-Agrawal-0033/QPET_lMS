"use client";

import { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Download,
  Filter,
  Calendar,
  Search,
  CheckCircle2,
  Users,
  CreditCard,
  FileCheck2,
  Award,
  AlertCircle,
} from "lucide-react";

const reportTypes = [
  { id: "students", label: "Student Registrations", icon: Users },
  { id: "enrollments", label: "Course Enrollments", icon: FileCheck2 },
  { id: "payments", label: "Payment Collections", icon: CreditCard },
  { id: "course_fees", label: "Course-wise Fee Summary", icon: FileSpreadsheet },
  { id: "outstanding_balances", label: "Outstanding Student Balances", icon: AlertCircle },
  { id: "installments", label: "Installment Schedules", icon: Calendar },
  { id: "certificates", label: "Certificate Records", icon: Award },
];

export default function AdminReportsPage() {
  const [selectedType, setSelectedType] = useState("students");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [reportData, setReportData] = useState<{ headers: string[]; rows: any[][]; count: number } | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportPreview();
  }, [selectedType]);

  const fetchReportPreview = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ type: selectedType, format: "json" });
      if (fromDate) params.set("fromDate", fromDate);
      if (toDate) params.set("toDate", toDate);

      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setReportData(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReportPreview();
  };

  const handleExportCsv = () => {
    const params = new URLSearchParams({ type: selectedType, format: "csv" });
    if (fromDate) params.set("fromDate", fromDate);
    if (toDate) params.set("toDate", toDate);
    window.location.href = `/api/admin/reports?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-teal-400" />
            Administrative Reports & Excel Export
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Generate and export institutional records in Microsoft Excel-compatible CSV format.
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-sm shadow-emerald-600/30 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export to Excel (CSV)</span>
        </button>
      </div>

      {/* Filter and Type Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        {/* Report Types Pills */}
        <div className="flex flex-wrap gap-2">
          {reportTypes.map((t) => {
            const Icon = t.icon;
            const active = selectedType === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  active
                    ? "bg-teal-600 text-white shadow-sm"
                    : "bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Date Filter Form */}
        <form onSubmit={handleApplyFilter} className="flex flex-wrap items-center gap-3 pt-2 text-xs">
          <div className="flex items-center gap-2">
            <label className="text-slate-400">From Date:</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="text-slate-400">To Date:</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 rounded-xl"
          >
            Filter Records
          </button>

          {(fromDate || toDate) && (
            <button
              type="button"
              onClick={() => {
                setFromDate("");
                setToDate("");
                fetchReportPreview();
              }}
              className="text-xs text-slate-400 hover:text-rose-400 underline"
            >
              Reset Dates
            </button>
          )}

          <div className="ml-auto text-xs text-slate-400 font-medium">
            Total Records: <strong className="text-white">{reportData?.count || 0}</strong>
          </div>
        </form>
      </div>

      {/* Report Data Preview Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="sticky top-0 bg-slate-950 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold shadow-sm">
              <tr>
                {reportData?.headers.map((h, i) => (
                  <th key={i} className="py-3.5 px-4 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-normal">
              {loading ? (
                <tr>
                  <td
                    colSpan={reportData?.headers.length || 6}
                    className="py-12 text-center text-slate-500"
                  >
                    Loading report preview...
                  </td>
                </tr>
              ) : reportData && reportData.rows.length > 0 ? (
                reportData.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-800/40 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="py-3 px-4 whitespace-nowrap">
                        {String(cell || "—")}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={reportData?.headers.length || 6}
                    className="py-12 text-center text-slate-500"
                  >
                    No matching records found for this report.
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
