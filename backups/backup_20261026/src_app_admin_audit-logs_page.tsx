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
} from "lucide-react";

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");

  useEffect(() => {
    fetchLogs();
  }, [actionFilter]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (actionFilter) params.set("action", actionFilter);

      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      const data = await res.json();
      if (data.logs) setLogs(data.logs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadgeColor = (action: string) => {
    if (action.includes("PAYMENT")) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (action.includes("ISSUED")) return "bg-amber-50 text-amber-700 border-amber-200";
    if (action.includes("REVOKED") || action.includes("REJECTED") || action.includes("DROPPED"))
      return "bg-rose-50 text-rose-700 border-rose-200";
    if (action.includes("PASSWORD")) return "bg-indigo-50 text-indigo-700 border-indigo-200";
    if (action.includes("UPDATED")) return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-slate-100 text-slate-700 border-slate-200";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              System Audit Trail
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
              {logs.length} Logged Entries
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Immutable log of all financial transactions, certificate actions, and administrative approvals.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto bg-white p-2 rounded-2xl border border-slate-200/80 shadow-xs">
          <label className="text-xs text-slate-500 font-semibold pl-2">Filter Action:</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Actions</option>
            <option value="PAYMENT_RECORDED">PAYMENT_RECORDED</option>
            <option value="PASSWORD_RESET_BY_ADMIN">PASSWORD_RESET_BY_ADMIN</option>
            <option value="STUDENT_PROFILE_UPDATED">STUDENT_PROFILE_UPDATED</option>
            <option value="STUDENT_MARKED_DROPPED">STUDENT_MARKED_DROPPED</option>
            <option value="STUDENT_REACTIVATED">STUDENT_REACTIVATED</option>
            <option value="STUDENT_APPROVED">STUDENT_APPROVED</option>
            <option value="STUDENT_CREATED_BY_ADMIN">STUDENT_CREATED_BY_ADMIN</option>
            <option value="STUDENT_SELF_REGISTERED">STUDENT_SELF_REGISTERED</option>
            <option value="CERTIFICATE_ISSUED">CERTIFICATE_ISSUED</option>
            <option value="CERTIFICATE_REVOKED">CERTIFICATE_REVOKED</option>
            <option value="ENROLLMENT_CREATED">ENROLLMENT_CREATED</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200/80 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Performed By</th>
                <th className="py-3.5 px-4">Target Entity</th>
                <th className="py-3.5 px-4">Audit Details</th>
                <th className="py-3.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading audit trail...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {log.performedBy}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80 text-[11px]">
                        {log.targetType}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 max-w-md">
                      <pre className="text-[11px] text-slate-700 font-mono bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/80 overflow-x-auto max-h-24">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No audit records logged yet.
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
