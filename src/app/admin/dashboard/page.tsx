"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  FileCheck2,
  IndianRupee,
  CreditCard,
  AlertCircle,
  Award,
  Calendar,
  ArrowRight,
  TrendingUp,
  Receipt,
  CheckCircle2,
  Clock,
} from "lucide-react";

interface DashboardData {
  stats: {
    totalStudents: number;
    pendingRegistrations: number;
    activeEnrollments: number;
    totalFeesPayable: number;
    totalFeesCollected: number;
    outstandingFees: number;
    installmentsDue: number;
    certificatesIssued: number;
  };
  recentRegistrations: any[];
  recentPayments: any[];
  recentEnrollments: any[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/admin/dashboard");
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-900 border border-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { stats, recentRegistrations, recentPayments, recentEnrollments } = data;

  const cards = [
    {
      label: "Total Students",
      value: stats.totalStudents,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20",
      link: "/admin/students",
    },
    {
      label: "Pending Registrations",
      value: stats.pendingRegistrations,
      icon: UserCheck,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      link: "/admin/registrations",
      badge: stats.pendingRegistrations > 0 ? "Action Needed" : undefined,
    },
    {
      label: "Active Enrollments",
      value: stats.activeEnrollments,
      icon: FileCheck2,
      color: "text-teal-400",
      bg: "bg-teal-500/10",
      border: "border-teal-500/20",
      link: "/admin/enrollments",
    },
    {
      label: "Total Fees Payable",
      value: `₹${stats.totalFeesPayable.toLocaleString("en-IN")}`,
      icon: IndianRupee,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
      link: "/admin/fees",
    },
    {
      label: "Total Fees Collected",
      value: `₹${stats.totalFeesCollected.toLocaleString("en-IN")}`,
      icon: CreditCard,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      link: "/admin/fees",
    },
    {
      label: "Outstanding Balance",
      value: `₹${stats.outstandingFees.toLocaleString("en-IN")}`,
      icon: AlertCircle,
      color: "text-rose-400",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
      link: "/admin/fees",
    },
    {
      label: "Installments Due",
      value: stats.installmentsDue,
      icon: Clock,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      border: "border-orange-500/20",
      link: "/admin/fees",
    },
    {
      label: "Certificates Issued",
      value: stats.certificatesIssued,
      icon: Award,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      border: "border-yellow-500/20",
      link: "/admin/certificates",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time snapshot of admissions, student enrollments, fees, and certifications.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/registrations"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 transition-colors flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>Review Registrations ({stats.pendingRegistrations})</span>
          </Link>
          <Link
            href="/admin/fees"
            className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <span>Record Payment</span>
          </Link>
        </div>
      </div>

      {/* 8 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              href={card.link}
              className={`p-5 rounded-2xl bg-slate-900 border ${card.border} hover:scale-[1.01] transition-all flex flex-col justify-between group shadow-sm`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{card.label}</span>
                <div className={`p-2 rounded-xl ${card.bg} ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-2xl font-extrabold text-white tracking-tight">
                  {card.value}
                </span>
                {card.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {card.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Registrations Column */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-400" />
              Pending Applications
            </h2>
            <Link
              href="/admin/registrations"
              className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentRegistrations && recentRegistrations.length > 0 ? (
              recentRegistrations.map((reg) => (
                <div
                  key={reg._id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <p className="font-semibold text-white truncate">{reg.fullName}</p>
                    <p className="text-slate-400 text-[11px] truncate">
                      {reg.preferredCourseId?.title || "Course Selected"}
                    </p>
                  </div>
                  <Link
                    href="/admin/registrations"
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 hover:bg-amber-500/30 text-[11px]"
                  >
                    Review
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                No pending registrations at this time.
              </div>
            )}
          </div>
        </div>

        {/* Recent Enrollments Column */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-teal-400" />
              Latest Enrollments
            </h2>
            <Link
              href="/admin/enrollments"
              className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentEnrollments && recentEnrollments.length > 0 ? (
              recentEnrollments.map((enr) => (
                <div
                  key={enr._id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <p className="font-mono text-teal-300 font-semibold text-[11px]">
                      {enr.enrollmentNumber}
                    </p>
                    <p className="text-white font-medium truncate">
                      {enr.studentId?.fullName || "Student"}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {enr.courseNameSnapshot}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                    ₹{enr.totalFee}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                No recent enrollments recorded.
              </div>
            )}
          </div>
        </div>

        {/* Recent Fee Receipts Column */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              Recent Fee Collections
            </h2>
            <Link
              href="/admin/fees"
              className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {recentPayments && recentPayments.length > 0 ? (
              recentPayments.map((pay) => (
                <div
                  key={pay._id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <p className="font-mono text-emerald-300 font-semibold text-[11px]">
                      {pay.receiptNumber || "Payment"}
                    </p>
                    <p className="text-slate-400 text-[11px]">
                      Mode: <span className="uppercase text-slate-200">{pay.paymentMethod}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-white text-xs block">
                      +₹{pay.amount.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(pay.paymentDate).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                No fee collections recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
