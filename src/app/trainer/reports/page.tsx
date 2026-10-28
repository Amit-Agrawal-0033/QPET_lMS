"use client";

import { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Users,
  FileCheck2,
  BookOpen,
  Filter,
  AlertCircle,
  FileText,
  Clock,
  Sparkles,
} from "lucide-react";

export default function TrainerReportsPage() {
  const [reportType, setReportType] = useState<"students" | "enrollments" | "courses">("students");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReportPreview();
  }, [reportType, fromDate, toDate]);

  const fetchReportPreview = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set("type", reportType);
      params.set("format", "json");
      if (fromDate) params.set("fromDate", fromDate);
      if (toDate) params.set("toDate", toDate);

      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      const json = await res.json();
      if (res.ok && json.success) {
        setReportData(json.data || []);
      } else {
        setError(json.error || "Unable to generate academic report preview.");
      }
    } catch {
      setError("Network error loading report.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    setExporting(true);
    const params = new URLSearchParams();
    params.set("type", reportType);
    params.set("format", "csv");
    if (fromDate) params.set("fromDate", fromDate);
    if (toDate) params.set("toDate", toDate);

    window.open(`/api/admin/reports?${params.toString()}`, "_blank");
    setTimeout(() => setExporting(false), 2000);
  };

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
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Academic Reports & Exports
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View student academic records, course completions, and download official CSV reports
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          disabled={exporting}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-purple-600/20 transition-all cursor-pointer shrink-0 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{exporting ? "Preparing..." : "Export to Excel/CSV"}</span>
        </button>
      </div>

      {/* Report Switcher & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setReportType("students")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              reportType === "students"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Students Directory</span>
          </button>
          <button
            onClick={() => setReportType("enrollments")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              reportType === "enrollments"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Batch Enrollments</span>
          </button>
          <button
            onClick={() => setReportType("courses")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              reportType === "courses"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Course Catalog</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-slate-500 font-medium mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-slate-800"
            />
          </div>
          <div>
            <label className="block text-slate-500 font-medium mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none text-slate-800"
            />
          </div>
          <div className="sm:col-span-2 flex items-end">
            <span className="text-xs text-slate-400">
              Showing <strong>{reportData.length}</strong> matching records from live database
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Report Preview Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-purple-600" />
            <span>Report Data Preview</span>
          </h3>
          <span className="text-xs text-slate-400">Real-time sync</span>
        </div>

        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-8 bg-slate-100 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : reportData.length === 0 ? (
          <div className="p-12 text-center">
            <FileSpreadsheet className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No records found for selected period</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                  {Object.keys(reportData[0] || {}).map((header, idx) => (
                    <th key={idx} className="py-3 px-4">
                      {header.replace(/([A-Z])/g, " $1").trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {reportData.slice(0, 15).map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-purple-50/40 transition-colors">
                    {Object.values(row).map((val: any, cIdx) => (
                      <td key={cIdx} className="py-2.5 px-4 font-medium">
                        {typeof val === "object" ? JSON.stringify(val) : String(val ?? "N/A")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
