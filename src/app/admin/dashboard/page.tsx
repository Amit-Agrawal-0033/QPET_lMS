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
  PieChart,
  Sparkles,
  ArrowUpRight,
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
      setLoading(true);
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
        <div className="h-10 w-64 bg-slate-200/80 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-white border border-slate-200/70 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { stats, recentRegistrations, recentPayments, recentEnrollments } = data;

  // Realization & percentage calculations for charts
  const collectionRate =
    stats.totalFeesPayable > 0
      ? Math.min(100, Math.round((stats.totalFeesCollected / stats.totalFeesPayable) * 100))
      : 0;
  const outstandingRate = 100 - collectionRate;

  // SVG Donut Chart parameters
  const radius = 58;
  const circumference = 2 * Math.PI * radius; // ~364.42
  const strokeDashoffset = circumference - (collectionRate / 100) * circumference;

  const cards = [
    {
      label: "Total Students",
      value: stats.totalStudents,
      subtext: "Enrolled & Registered",
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-100",
      link: "/admin/students",
    },
    {
      label: "Pending Registrations",
      value: stats.pendingRegistrations,
      subtext: stats.pendingRegistrations > 0 ? "Requires review" : "All cleared",
      icon: UserCheck,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
      link: "/admin/registrations",
      badge: stats.pendingRegistrations > 0 ? "Action Required" : undefined,
    },
    {
      label: "Active Enrollments",
      value: stats.activeEnrollments,
      subtext: "In active courses",
      icon: FileCheck2,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-100",
      link: "/admin/enrollments",
    },
    {
      label: "Total Fees Payable",
      value: `₹${stats.totalFeesPayable.toLocaleString("en-IN")}`,
      subtext: "Agreed course snapshots",
      icon: IndianRupee,
      color: "text-slate-700",
      bg: "bg-slate-100",
      border: "border-slate-200",
      link: "/admin/fees",
    },
    {
      label: "Fees Collected",
      value: `₹${stats.totalFeesCollected.toLocaleString("en-IN")}`,
      subtext: `${collectionRate}% fee realization`,
      icon: CreditCard,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
      link: "/admin/fees",
    },
    {
      label: "Outstanding Balance",
      value: `₹${stats.outstandingFees.toLocaleString("en-IN")}`,
      subtext: `${outstandingRate}% remaining dues`,
      icon: AlertCircle,
      color: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-100",
      link: "/admin/fees",
    },
    {
      label: "Installments Due",
      value: stats.installmentsDue,
      subtext: "Scheduled payments",
      icon: Clock,
      color: "text-orange-600",
      bg: "bg-orange-50",
      border: "border-orange-100",
      link: "/admin/fees",
    },
    {
      label: "Certificates Issued",
      value: stats.certificatesIssued,
      subtext: "Verified graduates",
      icon: Award,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-100",
      link: "/admin/certificates",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header & Quick Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Dashboard Overview
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
              Live Analytics
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time management summary of admissions, fee collections, enrollments, and certifications.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            href="/admin/registrations"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/20 transition-all flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>Review Registrations ({stats.pendingRegistrations})</span>
          </Link>
          <Link
            href="/admin/fees"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 shadow-sm transition-all flex items-center gap-2"
          >
            <CreditCard className="w-4 h-4 text-emerald-600" />
            <span>Record Payment</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards (8 Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              href={card.link}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {card.label}
                </span>
                <div className={`p-2.5 rounded-xl ${card.bg} ${card.color} transition-transform group-hover:scale-105`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-2xl font-bold text-slate-900 tracking-tight">
                    {card.value}
                  </span>
                  {card.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                      {card.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  {card.subtext}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Visual Analytics & Data Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Realization Ring Chart */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Fee Realization Ratio</h2>
                <p className="text-[11px] text-slate-400">Total payable vs collected</p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
              FY 2026
            </span>
          </div>

          {/* SVG Donut Chart */}
          <div className="relative flex items-center justify-center py-2">
            <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 140 140">
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="text-slate-100"
                strokeWidth="12"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="70"
                cy="70"
                r={radius}
                className="text-blue-600 transition-all duration-1000 ease-out"
                strokeWidth="12"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="url(#blueIndigoGradient)"
                fill="transparent"
              />
              <defs>
                <linearGradient id="blueIndigoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#6366F1" />
                </linearGradient>
              </defs>
            </svg>

            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {collectionRate}%
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 mt-0.5">
                Realized
              </span>
            </div>
          </div>

          {/* Financial Breakdown Legend */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-500 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                Fees Cleared:
              </span>
              <span className="font-bold text-slate-900">
                ₹{stats.totalFeesCollected.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-500 font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Outstanding Dues:
              </span>
              <span className="font-bold text-rose-600">
                ₹{stats.outstandingFees.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>

        {/* Academic & Operations Performance Summary */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm lg:col-span-2 flex flex-col justify-between space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">Academic & Certification Progress</h2>
                <p className="text-[11px] text-slate-400">Institutional performance health indicators</p>
              </div>
            </div>
            <Link
              href="/admin/reports"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 self-start sm:self-auto"
            >
              <span>View Full Analytics</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Progress Indicators */}
          <div className="space-y-5">
            {/* Metric 1 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Course Completion & Certification Rate:</span>
                <span className="font-bold text-blue-600">
                  {stats.activeEnrollments > 0
                    ? Math.round((stats.certificatesIssued / (stats.activeEnrollments + stats.certificatesIssued || 1)) * 100)
                    : 0}
                  % ({stats.certificatesIssued} of {stats.activeEnrollments + stats.certificatesIssued} Enrolled)
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-1000"
                  style={{
                    width: `${
                      stats.activeEnrollments > 0
                        ? Math.min(100, Math.round((stats.certificatesIssued / (stats.activeEnrollments + stats.certificatesIssued || 1)) * 100))
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>

            {/* Metric 2 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Revenue Settlement Progress:</span>
                <span className="font-bold text-emerald-600">
                  {collectionRate}% Cleared
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-1000"
                  style={{ width: `${collectionRate}%` }}
                />
              </div>
            </div>

            {/* Metric 3 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Pending Installment Balance:</span>
                <span className="font-bold text-amber-600">
                  {stats.installmentsDue} Overdue / Pending Installments
                </span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(100, stats.installmentsDue * 15)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-[10px] uppercase font-bold text-slate-400">Total Students</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{stats.totalStudents}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-[10px] uppercase font-bold text-slate-400">Active Batches</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{stats.activeEnrollments}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-[10px] uppercase font-bold text-slate-400">Certificates</p>
              <p className="text-lg font-bold text-slate-900 mt-0.5">{stats.certificatesIssued}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <p className="text-[10px] uppercase font-bold text-slate-400">Due Dues</p>
              <p className="text-lg font-bold text-rose-600 mt-0.5">₹{stats.outstandingFees.toLocaleString("en-IN")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feeds: 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Registrations Column */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-amber-500" />
              Pending Applications
            </h2>
            <Link
              href="/admin/registrations"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
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
                  className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs hover:border-slate-200 transition-colors"
                >
                  <div className="truncate pr-2">
                    <p className="font-semibold text-slate-900 truncate">{reg.fullName}</p>
                    <p className="text-slate-500 text-[11px] truncate">
                      {reg.preferredCourseId?.title || "Course Selected"}
                    </p>
                  </div>
                  <Link
                    href="/admin/registrations"
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-semibold border border-amber-200/80 hover:bg-amber-100 text-[11px] transition-colors"
                  >
                    Review
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No pending registrations at this time.
              </div>
            )}
          </div>
        </div>

        {/* Recent Enrollments Column */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-blue-600" />
              Latest Enrollments
            </h2>
            <Link
              href="/admin/enrollments"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
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
                  className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs hover:border-slate-200 transition-colors"
                >
                  <div className="truncate pr-2">
                    <span className="font-mono text-blue-700 font-semibold text-[11px] block">
                      {enr.enrollmentNumber}
                    </span>
                    <p className="text-slate-900 font-medium truncate">
                      {enr.studentId?.fullName || "Student"}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">
                      {enr.courseNameSnapshot}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                    ₹{enr.totalFee}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No recent enrollments recorded.
              </div>
            )}
          </div>
        </div>

        {/* Recent Fee Collections Column */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-600" />
              Recent Fee Collections
            </h2>
            <Link
              href="/admin/fees"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
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
                  className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs hover:border-slate-200 transition-colors"
                >
                  <div className="truncate pr-2">
                    <p className="font-mono text-emerald-700 font-semibold text-[11px]">
                      {pay.receiptNumber || "Payment"}
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Mode: <span className="uppercase font-semibold text-slate-700">{pay.paymentMethod}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-600 text-xs block">
                      +₹{pay.amount.toLocaleString("en-IN")}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {new Date(pay.paymentDate).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No fee collections recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
