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
        <div className="h-10 w-64 bg-slate-200 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white border border-slate-200/80 rounded-2xl animate-pulse shadow-sm" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="h-80 bg-white border border-slate-200/80 rounded-2xl animate-pulse shadow-sm lg:col-span-1" />
          <div className="h-80 bg-white border border-slate-200/80 rounded-2xl animate-pulse shadow-sm lg:col-span-2" />
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
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-teal-950/15 border border-teal-700/40">
        <div className="absolute right-0 top-0 -mt-12 -mr-12 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-teal-200 font-black text-2xl sm:text-3xl shadow-inner">
                {profile.fullName.charAt(0)}
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-slate-900 flex items-center justify-center shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {profile.fullName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {profile.registrationStatus === "approved" ? "Active Student" : profile.registrationStatus}
                </span>
                {primaryEnrollment && (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-200 border border-teal-400/30">
                    {primaryEnrollment.enrollmentNumber}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-teal-100/80 pt-0.5">
                <span>Guardian: <strong className="text-white font-medium">{profile.fatherOrGuardianName}</strong></span>
                <span>Mobile: <strong className="text-white font-mono font-medium">{profile.mobileNumber}</strong></span>
                {profile.qualification && <span>Qualification: <strong className="text-white font-medium">{profile.qualification}</strong></span>}
              </div>

              <p className="text-[11px] text-teal-200/70 truncate max-w-lg">
                Address: {profile.address}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch md:self-auto">
            <Link
              href="/student/fees"
              className="flex-1 md:flex-none text-center px-4 py-2.5 rounded-xl text-xs font-bold text-slate-900 bg-white hover:bg-teal-50 shadow-md shadow-white/10 transition-all cursor-pointer"
            >
              Fee Statement
            </Link>
            <Link
              href="/student/certificates"
              className="flex-1 md:flex-none text-center px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-teal-300" />
              <span>Certificates</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Top Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-teal-100/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Enrolled Courses</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600 border border-teal-200/60">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900">{summary.totalCourses}</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Active Computer Curriculum</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Agreed Fees</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">
              ₹{totalFees.toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Fixed Agreement Snapshot</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Amount Cleared</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-emerald-600">
              ₹{paidFees.toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">
              {paidPercentage}% Cleared
            </span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Outstanding Dues</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-200/60">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className={`text-2xl font-bold ${outstandingBalance <= 0 ? "text-emerald-600" : "text-rose-600"}`}>
              ₹{outstandingBalance.toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] text-slate-500 block mt-0.5">
              {outstandingBalance <= 0 ? "Zero Dues • Fully Settled" : "Balance Due for Course"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Visual Charts & Gauges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Visual SVG Circular Ring / Donut Chart for Fees */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60">
                <PieChart className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Fee Settlement Chart</h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
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
                className="text-slate-100"
                strokeWidth="14"
                stroke="currentColor"
                fill="transparent"
              />
              {/* Animated Progress Ring */}
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="text-blue-600 transition-all duration-1000 ease-out"
                strokeWidth="14"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="url(#studentFeeGradient)"
                fill="transparent"
              />
              <defs>
                <linearGradient id="studentFeeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#6366F1" />
                </linearGradient>
              </defs>
            </svg>

            {/* Center Text inside Ring */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black text-slate-900 tracking-tight">
                {paidPercentage}%
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 mt-0.5">
                {paidPercentage >= 100 ? "Fully Paid" : "Paid"}
              </span>
            </div>
          </div>

          {/* Legend Details */}
          <div className="space-y-2.5 pt-3 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                Paid to Date:
              </span>
              <span className="font-bold text-slate-900">₹{paidFees.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Outstanding Balance:
              </span>
              <span className="font-bold text-rose-600">₹{outstandingBalance.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Course Timeline Progress Gauge & Milestone Tracker */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm lg:col-span-2 flex flex-col justify-between space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Academic Timeline & Course Progress
                </h2>
                <p className="text-[11px] text-slate-500">
                  {primaryEnrollment ? primaryEnrollment.courseNameSnapshot : "Course curriculum tracker"}
                </p>
              </div>
            </div>

            {primaryEnrollment && (
              <span className="px-3 py-1 rounded-xl bg-blue-50 text-blue-700 font-mono text-xs font-bold border border-blue-200/60 self-start sm:self-auto">
                {primaryEnrollment.enrollmentNumber}
              </span>
            )}
          </div>

          {/* Progress Bar & Gauge */}
          <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 font-medium">
                Syllabus & Training Progression:
              </span>
              <span className="text-blue-600 font-bold font-mono">
                {courseProgressPercent}% ({daysElapsed} / {totalDays} Days)
              </span>
            </div>

            {/* Gradient Multi-Tier Progress Track */}
            <div className="h-3.5 w-full bg-slate-200/80 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-1000 shadow-xs"
                style={{ width: `${courseProgressPercent}%` }}
              />
            </div>

            <div className="grid grid-cols-3 text-[10px] text-slate-500 pt-1 font-medium">
              <span>Phase 1: Fundamentals</span>
              <span className="text-center">Phase 2: Practical Labs</span>
              <span className="text-right">Phase 3: Certification</span>
            </div>
          </div>

          {/* Milestone Stepper */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Journey Milestones
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              {/* Milestone 1 */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-1">
                <div className="flex items-center gap-1.5 text-blue-700 font-bold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>1. Enrolled</span>
                </div>
                <p className="text-[10px] text-slate-600">Application approved & admitted</p>
              </div>

              {/* Milestone 2 */}
              <div className={`p-3.5 rounded-xl border space-y-1 ${
                outstandingBalance <= 0 ? "bg-emerald-50/60 border-emerald-200 text-emerald-800" : "bg-slate-50 border-slate-200 text-slate-600"
              }`}>
                <div className="flex items-center gap-1.5 font-bold text-[11px]">
                  {outstandingBalance <= 0 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Clock className="w-3.5 h-3.5 text-amber-500" />}
                  <span>2. Fees Settled</span>
                </div>
                <p className="text-[10px]">
                  {outstandingBalance <= 0 ? "Fee cleared in full" : `₹${outstandingBalance} balance pending`}
                </p>
              </div>

              {/* Milestone 3 */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-slate-600">
                <div className="flex items-center gap-1.5 font-bold text-[11px] text-indigo-600">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>3. Coursework</span>
                </div>
                <p className="text-[10px] text-slate-500">Hands-on practical training</p>
              </div>

              {/* Milestone 4 */}
              <div className={`p-3.5 rounded-xl border space-y-1 ${
                certificates && certificates.length > 0 ? "bg-amber-50/60 border-amber-200 text-amber-800" : "bg-slate-50 border-slate-200 text-slate-600"
              }`}>
                <div className="flex items-center gap-1.5 font-bold text-[11px]">
                  {certificates && certificates.length > 0 ? <Award className="w-3.5 h-3.5 text-amber-600" /> : <Clock className="w-3.5 h-3.5 text-slate-400" />}
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
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600" />
            My Registered Courses
          </h2>
          <Link
            href="/student/courses"
            className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
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
                className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 hover:shadow-md transition-all space-y-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200/60 inline-block mb-2">
                      {enr.enrollmentNumber}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{enr.courseNameSnapshot}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Duration: {enr.durationMonthsSnapshot} Months • Mode: {enr.paymentType === "installment" ? "Installment Plan" : "Full Payment"}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                      enr.paymentStatus === "paid"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : enr.paymentStatus === "partially_paid"
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    {enr.paymentStatus.replace("_", " ")}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 text-[11px] block">Course Fee:</span>
                    <span className="font-bold text-slate-900">₹{enr.totalFee}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Amount Paid:</span>
                    <span className="font-bold text-emerald-600">₹{enr.paidAmount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[11px] block">Balance:</span>
                    <span className={`font-bold ${enr.outstandingBalance <= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      ₹{enr.outstandingBalance}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                  <span>Enrolled: {new Date(enr.enrollmentDate).toLocaleDateString("en-IN")}</span>
                  <Link
                    href="/student/fees"
                    className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                  >
                    <span>View Receipts & Ledger</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-8 text-xs text-slate-400 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
              No course enrollments found.
            </div>
          )}
        </div>
      </div>

      {/* 5. Recent Receipts & Certificates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Fee Receipts */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-blue-600" />
              Recent Fee Receipts
            </h2>
            <Link
              href="/student/receipts"
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
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
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs hover:bg-slate-100/70 transition-all"
                >
                  <div>
                    <p className="font-mono text-blue-600 font-bold">{rec.receiptNumber}</p>
                    <p className="text-slate-500 text-[11px]">
                      {new Date(rec.receiptDate).toLocaleDateString("en-IN")} • {rec.courseName}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900">
                      ₹{rec.currentPaymentAmount.toLocaleString("en-IN")}
                    </span>
                    <a
                      href={`/api/pdf/receipt/${rec._id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-600 hover:text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-xs"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-slate-400">
                No fee receipts recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* Issued Certificates */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              Completion Certificates
            </h2>
            <Link
              href="/student/certificates"
              className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
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
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <span className="font-mono text-blue-600 font-bold block">
                      {cert.certificateNumber}
                    </span>
                    <p className="text-slate-900 font-semibold">{cert.courseName}</p>
                    <p className="text-slate-500 text-[11px]">
                      Awarded: {new Date(cert.issueDate).toLocaleDateString("en-IN")} • Grade: <strong className="text-blue-600">{cert.grade || "A"}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {cert.status === "issued" ? (
                      <a
                        href={`/api/pdf/certificate/${cert._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-500/20"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    ) : (
                      <span className="text-rose-600 font-bold text-xs">Revoked</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 text-center space-y-2">
                <Award className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs text-slate-700 font-medium">No certificate issued yet.</p>
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
