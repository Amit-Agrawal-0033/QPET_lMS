"use client";

import { useState, useEffect } from "react";
import {
  ShieldAlert,
  Search,
  Filter,
  Calendar,
  User,
  Activity,
  Lock,
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function TrainerAuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/audit-logs");
      const json = await res.json();
      if (res.ok && json.success) {
        setLogs(json.logs || []);
      } else {
        setError(json.error || "You do not have administrative clearance to view audit logs.");
      }
    } catch {
      setError("Network error loading audit logs.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = logs.filter((log) => {
    const term = search.toLowerCase();
    const matchesSearch =
      (log.action || "").toLowerCase().includes(term) ||
      (log.performedBy || "").toLowerCase().includes(term) ||
      (log.targetType || "").toLowerCase().includes(term) ||
      (log.targetId || "").toLowerCase().includes(term);

    const matchesAction = actionFilter === "all" || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">
              Governance & Security
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Faculty Audit Trail
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable security log of student enrollments, certificate issuances, and faculty actions
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search action, actor, ID..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-xs"
            />
          </div>
        </div>
      </div>

      {error ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200 mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Audit Access Restricted</h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            {error}
          </p>
          <p className="text-[11px] text-slate-400 mt-3">
            To view security audit logs, please request <strong>Audit Logs → View</strong> clearance from your Administrator.
          </p>
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-16 bg-white border border-slate-200/70 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
          <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No audit events found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Event Action</th>
                  <th className="py-3 px-4">Performed By</th>
                  <th className="py-3 px-4">Target Resource</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{log.performedBy}</div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        {log.performedByRole}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <span className="font-medium text-slate-700">{log.targetType || "System"}</span>
                      {log.targetId && (
                        <span className="ml-1 text-[10px] font-mono text-slate-400">
                          #{log.targetId.slice(-6)}
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(log.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Logged
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
