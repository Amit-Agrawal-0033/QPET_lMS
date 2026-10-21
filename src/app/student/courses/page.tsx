"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Clock,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  ArrowRight,
} from "lucide-react";

export default function StudentCoursesPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/student/dashboard");
      const json = await res.json();
      if (json.enrollments) setEnrollments(json.enrollments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            My Enrolled Courses
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
            {enrollments.length} Active Courses
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Review your enrolled courses, durations, completion timelines, and permanent enrollment numbers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 text-center py-12 text-xs text-slate-400 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span>Loading your courses...</span>
            </div>
          </div>
        ) : enrollments.length > 0 ? (
          enrollments.map((enr) => (
            <div
              key={enr._id}
              className="rounded-2xl bg-white border border-slate-200/80 p-6 space-y-6 hover:shadow-md transition-all shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200/60 inline-block mb-2">
                    {enr.enrollmentNumber}
                  </span>
                  <h2 className="text-lg font-bold text-slate-900">{enr.courseNameSnapshot}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Duration: <strong className="text-slate-800 font-medium">{enr.durationMonthsSnapshot} Months</strong>
                  </p>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                    enr.enrollmentStatus === "active"
                      ? "bg-blue-50 text-blue-700 border-blue-200"
                      : enr.enrollmentStatus === "completed"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  {enr.enrollmentStatus}
                </span>
              </div>

              {/* Progress & Timeline Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Enrollment Date:</span>
                  <span className="text-slate-900 font-semibold">
                    {new Date(enr.enrollmentDate).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {enr.expectedCompletionDate && (
                  <div className="flex justify-between text-slate-600">
                    <span>Expected Completion:</span>
                    <span className="text-slate-900 font-semibold">
                      {new Date(enr.expectedCompletionDate).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-slate-600 pt-2 border-t border-slate-200/80">
                  <span>Certificate Status:</span>
                  <span
                    className={`font-semibold capitalize ${
                      enr.certificateStatus === "issued"
                        ? "text-blue-700"
                        : enr.certificateStatus === "eligible"
                        ? "text-emerald-600"
                        : "text-slate-500"
                    }`}
                  >
                    {enr.certificateStatus}
                  </span>
                </div>
              </div>

              {/* Financial Box */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div>
                  <span className="text-[11px] text-slate-400 uppercase font-semibold block">Agreed Fee / Balance</span>
                  <span className="text-slate-900 font-bold text-sm">
                    ₹{enr.totalFee}{" "}
                    <span className="text-rose-600 text-xs font-normal">
                      (₹{enr.outstandingBalance} pending)
                    </span>
                  </span>
                </div>

                <Link
                  href="/student/fees"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-semibold transition-all border border-blue-200/80 shadow-xs"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Fee Ledger</span>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-12 text-xs text-slate-400 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
            You do not have any enrolled courses at this time.
          </div>
        )}
      </div>
    </div>
  );
}
