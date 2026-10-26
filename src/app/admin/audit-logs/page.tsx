"use client";

import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Search,
  Clock,
  User,
  Filter,
  CheckCircle2,
  AlertTriangle,
  History,
  Download,
  Shield,
  FileSpreadsheet,
  Lock,
  ChevronDown,
  Eye,
  RefreshCw,
} from "lucide-react";
import { generateExcelCsv } from "@/lib/export/csv";

interface IAuditItem {
  _id: string;
  action: string;
  performedBy: string;
  performedByRole: string;
  targetType: string;
  targetId?: string;
  details: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<IAuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<IAuditItem | null>(null);

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, roleFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (actionFilter) params.set("action", actionFilter);
      if (roleFilter !== "all") params.set("role", roleFilter);
      if (search.trim()) params.set("search", search.trim());
      params.set("limit", "250");

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch (err) {
      console.error("Error loading audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  const exportToCSV = () => {
    if (!logs || logs.length === 0) return;

    const headers = [
      "Log ID",
      "Timestamp",
      "Action",
      "Performed By",
      "Performer Role",
      "Target Entity",
      "Target ID",
      "IP Address",
      "Details / Changes",
    ];

    const rows = logs.map((log) => [
      log._id,
      new Date(log.createdAt).toISOString(),
      log.action,
      log.performedBy,
      log.performedByRole || "admin",
      log.targetType,
      log.targetId || "",
      log.ipAddress || "system",
      JSON.stringify(log.details || {}),
    ]);

    const csvContent = generateExcelCsv(headers, rows);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `QPET_Audit_Report_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes("TRAINER")) return "bg-purple-50 text-purple-700 border-purple-200";
    if (action.includes("PAYMENT") || action.includes("FEE"))
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (action.includes("ISSUED")) return "bg-amber-50 text-amber-700 border-amber-200";
    if (action.includes("REVOKED") || action.includes("REJECTED") || action.includes("DELETED"))
      return "bg-rose-50 text-rose-700 border-rose-200";
    if (action.includes("PASSWORD") || action.includes("LOGIN") || action.includes("AUTH"))
      return "bg-indigo-50 text-indigo-700 border-indigo-200";
    if (action.includes("UPDATED") || action.includes("STATUS"))
      return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  const trainerCount = logs.filter((l) => l.performedByRole === "trainer").length;
  const adminCount = logs.filter((l) => l.performedByRole === "admin" || !l.performedByRole).length;
  const loginCount = logs.filter((l) => l.action === "USER_LOGGED_IN").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/60">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Audit Reports & Activity Tracking
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Immutable, cryptographically verifiable log of all staff activities, administrative actions, and credential events.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Refresh Logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>

          <button
            onClick={exportToCSV}
            disabled={logs.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>Export to CSV</span>
          </button>
        </div>
      </div>

      {/* Security Immutability Alert */}
      <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-amber-950 text-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Lock className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>Immutable Audit Standard:</strong> Logs in this ledger cannot be edited or deleted by any user or faculty member. All entries are append-only.
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-amber-800 border border-amber-200 font-bold">
          COMPLIANT
        </span>
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Total Recorded Entries</span>
          <p className="text-xl font-black text-slate-900 mt-1">{logs.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Administrator Actions</span>
          <p className="text-xl font-black text-blue-600 mt-1">{adminCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Trainer Faculty Actions</span>
          <p className="text-xl font-black text-purple-600 mt-1">{trainerCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500">Authentication & Logins</span>
          <p className="text-xl font-black text-emerald-600 mt-1">{loginCount}</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by action, performer, or target..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-semibold">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="admin">Administrator Only</option>
              <option value="trainer">Trainer Only</option>
            </select>
          </div>

          {/* Action Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-semibold">Action:</span>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-xs"
            >
              <option value="">All Actions</option>
              <option value="USER_LOGGED_IN">USER_LOGGED_IN</option>
              <option value="TRAINER_CREATED">TRAINER_CREATED</option>
              <option value="TRAINER_UPDATED">TRAINER_UPDATED</option>
              <option value="TRAINER_STATUS_CHANGED">TRAINER_STATUS_CHANGED</option>
              <option value="TRAINER_PASSWORD_RESET">TRAINER_PASSWORD_RESET</option>
              <option value="TRAINER_DELETED">TRAINER_DELETED</option>
              <option value="PAYMENT_RECORDED">PAYMENT_RECORDED</option>
              <option value="STUDENT_APPROVED">STUDENT_APPROVED</option>
              <option value="STUDENT_PROFILE_UPDATED">STUDENT_PROFILE_UPDATED</option>
              <option value="CERTIFICATE_GENERATED">CERTIFICATE_GENERATED</option>
              <option value="CERTIFICATE_ISSUED">CERTIFICATE_ISSUED</option>
              <option value="CERTIFICATE_REVOKED">CERTIFICATE_REVOKED</option>
              <option value="ENROLLMENT_CREATED">ENROLLMENT_CREATED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200/80 font-bold">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Action Performed</th>
                <th className="py-3.5 px-4">Performer & Role</th>
                <th className="py-3.5 px-4">Target Entity</th>
                <th className="py-3.5 px-4">Audit Details & Changes</th>
                <th className="py-3.5 px-4">Date / Time</th>
                <th className="py-3.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading audit records...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <div className="flex items-center gap-1.5">
                        <span>{log.performedBy}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            log.performedByRole === "trainer"
                              ? "bg-purple-50 text-purple-700 border border-purple-200"
                              : "bg-blue-50 text-blue-700 border border-blue-200"
                          }`}
                        >
                          {log.performedByRole || "admin"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                        {log.targetType}
                      </span>
                      {log.targetId && (
                        <span className="block text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
                          {log.targetId}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-sm">
                      <pre className="text-[11px] text-slate-700 font-mono bg-slate-50 p-2 rounded-xl border border-slate-200/80 overflow-x-auto max-h-20 leading-tight">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                      <div>
                        {new Date(log.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                        title="View Full Payload"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No matching audit records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* AUDIT DETAIL MODAL                                                        */}
      {/* ========================================================================= */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-100 overflow-hidden my-8 max-h-[85vh] flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                  <Shield className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Audit Record Details</h3>
                  <p className="text-[11px] font-mono text-slate-400">ID: {selectedLog._id}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Action</span>
                  <span className="font-bold text-slate-900">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Performer</span>
                  <span className="font-bold text-slate-900">
                    {selectedLog.performedBy} ({selectedLog.performedByRole || "admin"})
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Target Entity</span>
                  <span className="font-bold text-slate-900">{selectedLog.targetType}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Timestamp</span>
                  <span className="font-mono text-slate-700">
                    {new Date(selectedLog.createdAt).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-900 mb-1.5 block">Full Event Payload</span>
                <pre className="p-4 bg-slate-950 text-slate-100 rounded-2xl text-[11px] font-mono overflow-x-auto max-h-64">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex justify-end bg-slate-50/50">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
