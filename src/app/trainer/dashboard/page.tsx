"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  BookOpen,
  Award,
  FileCheck2,
  ArrowRight,
  Sparkles,
  GraduationCap,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

interface TrainerDashboardData {
  trainer: {
    name: string;
    identifier: string;
    role: string;
    permissions?: Record<string, boolean>;
  };
  stats: {
    totalStudents: number;
    activeEnrollments: number;
    totalCourses: number;
    certificatesIssued: number;
  };
  recentEnrollments: {
    _id: string;
    enrollmentNumber: string;
    studentName: string;
    studentPhone: string;
    studentEmail: string;
    courseTitle: string;
    courseCode: string;
    duration: string;
    enrolledAt: string;
  }[];
}

export default function TrainerDashboardPage() {
  const [data, setData] = useState<TrainerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/trainer/dashboard");
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error("Trainer dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-28 bg-purple-100/50 rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-white border border-slate-200/80 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const { trainer, stats, recentEnrollments } = data;
  const perms = trainer.permissions || {};

  const kpis = [
    ...(perms.viewStudents
      ? [
          {
            label: "Active Students",
            value: stats.totalStudents,
            subtext: "Enrolled in Training",
            icon: Users,
            color: "text-purple-600",
            bg: "bg-purple-50",
            border: "border-purple-200/60",
            link: "/trainer/students",
          },
        ]
      : []),
    ...(perms.viewEnrollments
      ? [
          {
            label: "Active Enrollments",
            value: stats.activeEnrollments,
            subtext: "Ongoing Course Batches",
            icon: FileCheck2,
            color: "text-blue-600",
            bg: "bg-blue-50",
            border: "border-blue-200/60",
            link: "/trainer/enrollments",
          },
        ]
      : []),
    ...(perms.viewCourses
      ? [
          {
            label: "Courses in Syllabus",
            value: stats.totalCourses,
            subtext: "Active Training Modules",
            icon: BookOpen,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
            border: "border-indigo-200/60",
            link: "/trainer/courses",
          },
        ]
      : []),
    ...(perms.viewCertificates
      ? [
          {
            label: "Certificates Awarded",
            value: stats.certificatesIssued,
            subtext: "Successfully Graduated",
            icon: Award,
            color: "text-emerald-600",
            bg: "bg-emerald-50",
            border: "border-emerald-200/60",
            link: "/trainer/certificates",
          },
        ]
      : []),
  ];

  const hasAnyPermission = Object.values(perms).some(Boolean);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-700 via-purple-800 to-indigo-900 text-white p-6 sm:p-8 shadow-lg shadow-purple-900/10">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-purple-200 text-xs font-semibold mb-3 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>QPET Faculty & Training Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {trainer.name}! 👋
            </h1>
            <p className="text-sm text-purple-100/90 mt-1.5 max-w-xl">
              Access your student batches, course curriculum, and verify candidate certificates. All training operations are synced with the live LMS.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {(perms.createStudents || perms.editStudents) && (
              <Link
                href="/trainer/students"
                className="px-3.5 py-2 rounded-xl bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Users className="w-4 h-4 text-purple-700" />
                <span>+ Add Student</span>
              </Link>
            )}
            {perms.viewRegistrations && (
              <Link
                href="/trainer/registrations"
                className="px-3.5 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-900/80 border border-purple-400/40 text-white font-bold text-xs backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4 text-purple-200" />
                <span>Admissions</span>
              </Link>
            )}
            {(perms.createCourses || perms.editCourses) && (
              <Link
                href="/trainer/courses"
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white font-bold text-xs backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>+ Course</span>
              </Link>
            )}
            {(perms.generateCertificates || perms.editCertificates) && (
              <Link
                href="/trainer/certificates"
                className="px-3.5 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-100 font-bold text-xs backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Award className="w-4 h-4 text-emerald-300" />
                <span>Issue Certificate</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Notice if Trainer has zero permissions granted */}
      {!hasAnyPermission && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-bold">No Module Clearances Assigned</h3>
            <p className="text-xs text-amber-800 mt-1 leading-relaxed">
              Your account has been initialized with default denied permissions. Please contact your system Administrator to assign View, Create, or Edit clearances to your profile.
            </p>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      {kpis.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <Link
                key={idx}
                href={kpi.link}
                className={`p-5 rounded-2xl bg-white border ${kpi.border} shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all group block`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    {kpi.label}
                  </span>
                  <div className={`w-9 h-9 rounded-xl ${kpi.bg} ${kpi.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {kpi.value}
                </div>
                <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {kpi.subtext}
                </p>
              </Link>
            );
          })}
        </div>
      )}

      {/* Main Grid: Recent Student Enrollments & Faculty Quick Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Enrollments Table (2 Cols) */}
        {(perms.viewEnrollments || perms.viewStudents) && (
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                  Recent Student Enrollments
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Students recently registered and enrolled in courses</p>
              </div>
              <Link
                href="/trainer/students"
                className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1"
              >
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Enrollment Date</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentEnrollments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No active enrollments found.
                      </td>
                    </tr>
                  ) : (
                    recentEnrollments.map((item) => (
                      <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{item.studentName}</div>
                          <div className="text-[11px] text-slate-500">{item.studentPhone}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-800">{item.courseTitle}</span>
                          <span className="ml-1.5 px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-mono">
                            {item.courseCode}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {item.duration}
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {new Date(item.enrolledAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Active
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Faculty Guide & Security Info (1 Col) */}
        <div className={`space-y-6 ${(perms.viewEnrollments || perms.viewStudents) ? "" : "lg:col-span-3"}`}>
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Role & Assigned Permissions
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              You are authenticated as <strong>{trainer.name}</strong> with <strong>Faculty Trainer</strong> clearance.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-700">
                <span>Account Identifier:</span>
                <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded font-semibold">
                  {trainer.identifier}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Students Directory:</span>
                <span className={`font-semibold ${perms.editStudents ? "text-purple-700" : perms.viewStudents ? "text-emerald-600" : "text-slate-400"}`}>
                  {perms.editStudents ? "✓ Add & Edit" : perms.viewStudents ? "✓ View Only" : "✕ Restricted"}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Course Curriculum:</span>
                <span className={`font-semibold ${perms.editCourses ? "text-purple-700" : perms.viewCourses ? "text-emerald-600" : "text-slate-400"}`}>
                  {perms.editCourses ? "✓ Create & Edit" : perms.viewCourses ? "✓ View Only" : "✕ Restricted"}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Certificates:</span>
                <span className={`font-semibold ${(perms.generateCertificates || perms.editCertificates) ? "text-purple-700" : perms.viewCertificates ? "text-emerald-600" : "text-slate-400"}`}>
                  {(perms.generateCertificates || perms.editCertificates) ? "✓ Issue & Verify" : perms.viewCertificates ? "✓ View Only" : "✕ Restricted"}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>New Admissions:</span>
                <span className={`font-semibold ${perms.editRegistrations ? "text-purple-700" : perms.viewRegistrations ? "text-emerald-600" : "text-slate-400"}`}>
                  {perms.editRegistrations ? "✓ Approve & Reject" : perms.viewRegistrations ? "✓ View Only" : "✕ Restricted"}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Security Audit Logs:</span>
                <span className="font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">Restricted (Admin Only)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
