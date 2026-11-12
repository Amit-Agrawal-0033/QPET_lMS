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
  CreditCard,
  Award,
  IndianRupee,
  Search,
} from "lucide-react";

interface ReportTypeOption {
  id: string;
  label: string;
  icon: any;
  requiredPerm?: string;
  category: "academic" | "financial" | "certification";
}

const ALL_REPORT_TYPES: ReportTypeOption[] = [
  { id: "students", label: "Student Registrations", icon: Users, requiredPerm: "viewStudents", category: "academic" },
  { id: "enrollments", label: "Course Enrollments", icon: FileCheck2, requiredPerm: "viewEnrollments", category: "academic" },
  { id: "payments", label: "Payment Collections", icon: CreditCard, requiredPerm: "viewFees", category: "financial" },
  { id: "course_fees", label: "Course-wise Fee Summary", icon: IndianRupee, requiredPerm: "viewFees", category: "financial" },
  { id: "outstanding_balances", label: "Outstanding Student Balances", icon: AlertCircle, requiredPerm: "viewFees", category: "financial" },
  { id: "installments", label: "Installment Schedules", icon: Calendar, requiredPerm: "viewFees", category: "financial" },
  { id: "certificates", label: "Certificate Records", icon: Award, requiredPerm: "viewCertificates", category: "certification" },
];

export default function TrainerReportsPage() {
  const [selectedType, setSelectedType] = useState<string>("students");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [reportData, setReportData] = useState<{ headers: string[]; rows: any[][]; count: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
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
  }, []);

  // Filter allowed report types based on trainer permissions
  const availableReports = ALL_REPORT_TYPES.filter((r) => {
    if (!currentUser) return true; // optimistic while fetching
    if (currentUser.role === "admin") return true;
    if (!r.requiredPerm) return true;
    return !!currentUser.permissions?.[r.requiredPerm] || !!currentUser.permissions?.viewReports;
  });

  // Ensure selected type is always an allowed report
  useEffect(() => {
    if (availableReports.length > 0 && !availableReports.some((r) => r.id === selectedType)) {
      setSelectedType(availableReports[0].id);
    }
  }, [availableReports, selectedType]);

  const canExportReports =
    currentUser?.role === "admin" || !!currentUser?.permissions?.exportReports;

  useEffect(() => {
    if (selectedType) {
      fetchReportPreview();
    }
  }, [selectedType]);

  const fetchReportPreview = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set("type", selectedType);
      params.set("format", "json");
      if (fromDate) params.set("fromDate", fromDate);
      if (toDate) params.set("toDate", toDate);

      const res = await fetch(`/api/admin/reports?${params.toString()}`);
      const json = await res.json();

      if (res.ok && json.success) {
        setReportData({
          headers: json.headers || [],
          rows: json.rows || [],
          count: json.count || 0,
        });
      } else {
        setError(json.error || "Unable to generate report data.");
        setReportData(null);
      }
    } catch {
      setError("Network error while generating report preview.");
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReportPreview();
  };

  const handleExportCsv = () => {
    setExporting(true);
    const params = new URLSearchParams();
    params.set("type", selectedType);
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
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Institutional Reports & Exports
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/80 shadow-xs">
              {availableReports.length} Reports Available
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Access student registers, course enrollments, fee collections, outstanding dues, and official certificates.
          </p>
        </div>

        {canExportReports ? (
          <button
            onClick={handleExportCsv}
            disabled={exporting}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-purple-600/20 transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? "Preparing Export..." : "Export to Excel/CSV"}</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
            <span>View Only (Export Disabled)</span>
          </div>
        )}
      </div>

      {/* Report Switcher & Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        {/* Report Types Pills */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Select Report Module
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {availableReports.map((t) => {
              const Icon = t.icon;
              const active = selectedType === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-purple-600 text-white shadow-sm shadow-purple-600/25"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-slate-200/60"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date Filter Bar */}
        <form
          onSubmit={handleApplyFilter}
          className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100 text-xs"
        >
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold">From Date:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-semibold">To Date:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            />
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 font-bold text-xs transition-colors cursor-pointer"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Apply Filters</span>
          </button>

          {(fromDate || toDate) && (
            <button
              type="button"
              onClick={() => {
                setFromDate("");
                setToDate("");
                setTimeout(() => fetchReportPreview(), 50);
              }}
              className="text-slate-500 hover:text-slate-800 text-xs font-semibold underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}

          {reportData && (
            <span className="ml-auto text-slate-500 font-medium text-xs">
              Showing <strong>{reportData.count}</strong> record{reportData.count === 1 ? "" : "s"}
            </span>
          )}
        </form>
      </div>

      {/* Error Notice */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200/80 font-bold">
              <tr>
                {reportData?.headers.map((h, i) => (
                  <th key={i} className="py-3.5 px-4 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {loading ? (
                <tr>
                  <td
                    colSpan={reportData?.headers.length || 6}
                    className="py-16 text-center text-slate-400"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      <span>Generating report preview...</span>
                    </div>
                  </td>
                </tr>
              ) : reportData && reportData.rows.length > 0 ? (
                reportData.rows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-purple-50/30 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td
                        key={cIdx}
                        className={`py-3 px-4 whitespace-nowrap ${
                          cIdx === 0 ? "font-bold text-slate-900" : ""
                        }`}
                      >
                        {typeof cell === "number" ? cell.toLocaleString("en-IN") : String(cell || "—")}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={reportData?.headers.length || 6}
                    className="py-16 text-center text-slate-400"
                  >
                    No records found for the selected report and date criteria.
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
