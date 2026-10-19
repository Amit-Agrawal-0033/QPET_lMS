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
    if (action.includes("PAYMENT")) return "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";
    if (action.includes("ISSUED")) return "bg-yellow-500/10 text-yellow-300 border-yellow-500/20";
    if (action.includes("REVOKED") || action.includes("REJECTED") || action.includes("DROPPED"))
      return "bg-rose-500/10 text-rose-300 border-rose-500/20";
    if (action.includes("PASSWORD")) return "bg-amber-500/10 text-amber-300 border-amber-500/20";
    if (action.includes("UPDATED")) return "bg-blue-500/10 text-blue-300 border-blue-500/20";
    return "bg-teal-500/10 text-teal-300 border-teal-500/20";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-teal-400" />
            System Audit Trail
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable log of all financial transactions, certificate actions, and administrative approvals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400">Filter Action:</label>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
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
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Performed By</th>
                <th className="py-3.5 px-4">Target Entity</th>
                <th className="py-3.5 px-4">Audit Details</th>
                <th className="py-3.5 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-normal">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    Loading audit records...
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getActionBadgeColor(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-white">
                      {log.performedBy}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      <span className="font-medium text-slate-300">{log.targetType}</span>
                    </td>

                    <td className="py-3.5 px-4 max-w-md">
                      <pre className="text-[11px] text-slate-400 font-mono bg-slate-950/80 p-2 rounded-lg border border-slate-800/80 overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
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
