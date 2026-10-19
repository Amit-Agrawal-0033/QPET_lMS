"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  CreditCard,
  Receipt,
  Award,
  Download,
  Calendar,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  ArrowRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  PieChart,
  User,
} from "lucide-react";

export default function StudentDashboardPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/dashboard");
      const json = await res.json();
      if (json.success) setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-slate-800 rounded animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-900 border border-slate-800 rounded-3xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-slate-900 border border-slate-800 rounded-3xl animate-pulse lg:col-span-1" />
          <div className="h-80 bg-slate-900 border border-slate-800 rounded-3xl animate-pulse lg:col-span-2" />
        </div>
      </div>
    );
  }

  const { profile, summary, enrollments, receipts, certificates, installments } = data;

  // Chart calculations
  const totalFees = summary.totalFees || 0;
  const paidFees = summary.paidFees || 0;
  const outstandingBalance = summary.outstandingBalance || 0;
  const paidPercentage = totalFees > 0 ? Math.min(100, Math.round((paidFees / totalFees) * 100)) : 0;

  // SVG Donut Circle parameters
  const radius = 70;
  const circumference = 2 * Math.PI * radius; // ~439.82
  const strokeDashoffset = circumference - (paidPercentage / 100) * circumference;

  const primaryEnrollment = enrollments && enrollments.length > 0 ? enrollments[0] : null;

  // Course duration progress calculation
  let courseProgressPercent = 0;
  let daysElapsed = 0;
  let totalDays = 60;
  if (primaryEnrollment) {
    const start = new Date(primaryEnrollment.enrollmentDate).getTime();
    const end = primaryEnrollment.expectedCompletionDate
      ? new Date(primaryEnrollment.expectedCompletionDate).getTime()
      : start + (primaryEnrollment.durationMonthsSnapshot || 2) * 30 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    totalDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    daysElapsed = Math.max(0, Math.round((now - start) / (1000 * 60 * 60 * 24)));
    courseProgressPercent = Math.min(100, Math.max(5, Math.round((daysElapsed / totalDays) * 100)));
  }

  return (
    <div className="space-y-8">
      {/* 1. Header Banner / Student Identity Card */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950 border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-teal-500 to-blue-600 p-0.5 shadow-lg shadow-teal-500/20">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-teal-400 font-extrabold text-2xl sm:text-3xl">
                  {profile.fullName.charAt(0)}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  {profile.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  {profile.registrationStatus === "approved" ? "Active Student" : profile.registrationStatus}
                </span>
                {primaryEnrollment && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                    {primaryEnrollment.enrollmentNumber}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-300 pt-0.5">
                <span>Guardian: <strong className="text-white">{profile.fatherOrGuardianName}</strong></span>
                <span>Mobile: <strong className="text-white font-mono">{profile.mobileNumber}</strong></span>
                {profile.qualification && <span>Qualification: <strong className="text-white">{profile.qualification}</strong></span>}
              </div>

              <p className="text-[11px] text-slate-400 truncate max-w-lg">
                Address: {profile.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto">
            <Link
              href="/student/fees"
              className="flex-1 md:flex-none text-center px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 shadow-md shadow-teal-600/30 transition-all"
            >
              Fee Statement
            </Link>
            <Link
              href="/student/certificates"
              className="flex-1 md:flex-none text-center px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 transition-all flex items-center justify-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-yellow-400" />
              <span>Certificates</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Top Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Enrolled Courses</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white">{summary.totalCourses}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Active Computer Curriculum</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Total Agreed Fees</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-white">
              ₹{totalFees.toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Fixed Agreement Snapshot</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Amount Cleared</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-extrabold text-emerald-400">
              ₹{paidFees.toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold block mt-0.5">
              {paidPercentage}% Cleared
            </span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Outstanding Dues</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-extrabold ${outstandingBalance <= 0 ? "text-emerald-400" : "text-rose-400"}`}>
              ₹{outstandingBalance.toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">
              {outstandingBalance <= 0 ? "Zero Dues • Fully Settled" : "Balance Due for Course"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Visual Charts & Gauges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Visual SVG Circular Ring / Donut Chart for Fees */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <PieChart className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-white">Fee Settlement Chart</h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-teal-300 border border-slate-700">
              Live DB
            </span>
          </div>

          {/* SVG Circular Ring */}
          <div className="relative flex items-center justify-center py-2">
            <svg className="w-44 h-44 transform -rotate-90" viewBox="0 0 160 160">
              {/* Background Ring */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-slate-800"
                strokeWidth="14"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-teal-400 transition-all duration-1000 ease-out"
                strokeWidth="14"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="url(#feeGradient)"
                fill="transparent"
              />
              <defs>
                <linearGradient id="feeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center Text inside Ring */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-white tracking-tight">
                {paidPercentage}%
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-teal-400 mt-0.5">
                {paidPercentage >= 100 ? "Fully Paid" : "Paid"}
              </span>
            </div>
          </div>

          {/* Legend Details */}
          <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                Paid to Date:
              </span>
              <span className="font-bold text-white">₹{paidFees.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                Outstanding Balance:
              </span>
              <span className="font-bold text-rose-400">₹{outstandingBalance.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Course Timeline Progress Gauge & Milestone Tracker */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 shadow-xl lg:col-span-2 flex flex-col justify-between space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">
                  Academic Timeline & Course Progress
                </h2>
                <p className="text-[11px] text-slate-400">
                  {primaryEnrollment ? primaryEnrollment.courseNameSnapshot : "Course curriculum tracker"}
                </p>
              </div>
            </div>

            {primaryEnrollment && (
              <span className="px-3 py-1 rounded-xl bg-slate-800 text-teal-300 font-mono text-xs font-bold border border-slate-700 self-start sm:self-auto">
                {primaryEnrollment.enrollmentNumber}
              </span>
            )}
          </div>

          {/* Progress Bar & Gauge */}
          <div className="space-y-3 bg-slate-950/70 p-5 rounded-2xl border border-slate-800/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-medium">
                Syllabus & Training Progression:
              </span>
              <span className="text-teal-300 font-bold font-mono">
                {courseProgressPercent}% ({daysElapsed} / {totalDays} Days)
              </span>
            </div>

            {/* Gradient Multi-Tier Progress Track */}
            <div className="h-4 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-teal-500 via-blue-500 to-emerald-400 rounded-full transition-all duration-1000 shadow-sm"
                style={{ width: `${courseProgressPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-3 text-[10px] text-slate-400 pt-1">
              <span>Phase 1: Fundamentals</span>
              <span className="text-center">Phase 2: Practical Labs</span>
              <span className="text-right">Phase 3: Certification</span>
            </div>
          </div>

          {/* Milestone Stepper */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Journey Milestones
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              {/* Milestone 1 */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-teal-500/30 space-y-1">
                <div className="flex items-center gap-1.5 text-teal-400 font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>1. Enrolled</span>
                </div>
                <p className="text-[10px] text-slate-400">Application approved & admitted</p>
              </div>

              {/* Milestone 2 */}
              <div className={`p-3 rounded-2xl bg-slate-950/60 border space-y-1 ${
                outstandingBalance <= 0 ? "border-emerald-500/30 text-emerald-300" : "border-slate-800 text-slate-400"
              }`}>
                <div className="flex items-center gap-1.5 font-bold text-[11px]">
                  {outstandingBalance <= 0 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5 text-amber-400" />}
                  <span>2. Fees Settled</span>
                </div>
                <p className="text-[10px]">
                  {outstandingBalance <= 0 ? "Fee cleared in full" : `₹${outstandingBalance} balance pending`}
                </p>
              </div>

              {/* Milestone 3 */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1 text-slate-400">
                <div className="flex items-center gap-1.5 font-bold text-[11px] text-blue-400">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>3. Coursework</span>
                </div>
                <p className="text-[10px]">Hands-on practical training</p>
              </div>

              {/* Milestone 4 */}
              <div className={`p-3 rounded-2xl bg-slate-950/60 border space-y-1 ${
                certificates && certificates.length > 0 ? "border-yellow-500/40 text-yellow-300" : "border-slate-800 text-slate-400"
              }`}>
                <div className="flex items-center gap-1.5 font-bold text-[11px]">
                  {certificates && certificates.length > 0 ? <Award className="w-3.5 h-3.5 text-yellow-400" /> : <Clock className="w-3.5 h-3.5 text-slate-500" />}
                  <span>4. Certificate</span>
                </div>
                <p className="text-[10px]">
                  {certificates && certificates.length > 0 ? "Issued & Verified" : "Awaiting clearance"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Active Enrollments Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-teal-400" />
            My Registered Courses
          </h2>
          <Link
            href="/student/courses"
            className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1"
          >
            <span>View All Courses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {enrollments && enrollments.length > 0 ? (
            enrollments.map((enr: any) => (
              <div
                key={enr._id}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all space-y-4 shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-teal-300 font-bold border border-slate-700 inline-block mb-2">
                      {enr.enrollmentNumber}
                    </span>
                    <h3 className="text-base font-bold text-white">{enr.courseNameSnapshot}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Duration: {enr.durationMonthsSnapshot} Months • Mode: {enr.paymentType === "installment" ? "Installment Plan" : "Full Payment"}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                      enr.paymentStatus === "paid"
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                        : enr.paymentStatus === "partially_paid"
                        ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                        : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                    }`}
                  >
                    {enr.paymentStatus.replace("_", " ")}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Course Fee:</span>
                    <span className="font-bold text-white">₹{enr.totalFee}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Amount Paid:</span>
                    <span className="font-bold text-emerald-400">₹{enr.paidAmount}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[11px] block">Balance:</span>
                    <span className={`font-bold ${enr.outstandingBalance <= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      ₹{enr.outstandingBalance}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Enrolled: {new Date(enr.enrollmentDate).toLocaleDateString("en-IN")}</span>
                  <Link
                    href="/student/fees"
                    className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
                  >
                    <span>View Receipts & Ledger</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-8 text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-3xl">
              No course enrollments found.
            </div>
          )}
        </div>
      </div>

      {/* 5. Recent Receipts & Certificates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Fee Receipts */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              Recent Fee Receipts
            </h2>
            <Link
              href="/student/receipts"
              className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1"
            >
              <span>All Receipts</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {receipts && receipts.length > 0 ? (
              receipts.map((rec: any) => (
                <div
                  key={rec._id}
                  className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700 transition-all"
                >
                  <div>
                    <p className="font-mono text-emerald-300 font-bold">{rec.receiptNumber}</p>
                    <p className="text-slate-400 text-[11px]">
                      {new Date(rec.receiptDate).toLocaleDateString("en-IN")} • {rec.courseName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-white">
                      ₹{rec.currentPaymentAmount.toLocaleString("en-IN")}
                    </span>
                    <a
                      href={`/api/pdf/receipt/${rec._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-500">
                No fee receipts recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Issued Certificates */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-yellow-400" />
              Completion Certificates
            </h2>
            <Link
              href="/student/certificates"
              className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1"
            >
              <span>All Certificates</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {certificates && certificates.length > 0 ? (
              certificates.map((cert: any) => (
                <div
                  key={cert._id}
                  className="p-4 rounded-2xl bg-gradient-to-r from-yellow-950/20 via-slate-950/80 to-slate-950/80 border border-yellow-500/30 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <span className="font-mono text-yellow-300 font-bold block">
                      {cert.certificateNumber}
                    </span>
                    <p className="text-white font-medium">{cert.courseName}</p>
                    <p className="text-slate-400 text-[11px]">
                      Awarded: {new Date(cert.issueDate).toLocaleDateString("en-IN")} • Grade: <strong className="text-teal-300">{cert.grade || "A"}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {cert.status === "issued" ? (
                      <a
                        href={`/api/pdf/certificate/${cert._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 shadow-md shadow-yellow-500/20"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    ) : (
                      <span className="text-rose-400 font-bold text-xs">Revoked</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-2xl bg-slate-950/50 border border-slate-800 text-center space-y-2">
                <Award className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-300 font-medium">No certificate issued yet.</p>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                  Upon clearing course fees and course completion, official certificates are issued by administration.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
