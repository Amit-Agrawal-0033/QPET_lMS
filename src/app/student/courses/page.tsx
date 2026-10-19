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
        <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-teal-400" />
          My Enrolled Courses
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review your enrolled courses, durations, completion timelines, and permanent enrollment numbers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 text-center py-12 text-xs text-slate-500">
            Loading your courses...
          </div>
        ) : enrollments.length > 0 ? (
          enrollments.map((enr) => (
            <div
              key={enr._id}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-6 space-y-6 hover:border-slate-700 transition-all shadow-lg"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-800 text-teal-300 font-bold border border-slate-700 inline-block mb-2">
                    {enr.enrollmentNumber}
                  </span>
                  <h2 className="text-lg font-bold text-white">{enr.courseNameSnapshot}</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Duration: <strong className="text-slate-300">{enr.durationMonthsSnapshot} Months</strong>
                  </p>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                    enr.enrollmentStatus === "active"
                      ? "bg-teal-500/10 text-teal-300 border-teal-500/20"
                      : enr.enrollmentStatus === "completed"
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                      : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                  }`}
                >
                  {enr.enrollmentStatus}
                </span>
              </div>

              {/* Progress & Timeline Box */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Enrollment Date:</span>
                  <span className="text-white font-medium">
                    {new Date(enr.enrollmentDate).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                {enr.expectedCompletionDate && (
                  <div className="flex justify-between text-slate-400">
                    <span>Expected Completion:</span>
                    <span className="text-white font-medium">
                      {new Date(enr.expectedCompletionDate).toLocaleDateString("en-IN", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                )}

                <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-800">
                  <span>Certificate Status:</span>
                  <span
                    className={`font-semibold capitalize ${
                      enr.certificateStatus === "issued"
                        ? "text-yellow-400"
                        : enr.certificateStatus === "eligible"
                        ? "text-emerald-400"
                        : "text-slate-400"
                    }`}
                  >
                    {enr.certificateStatus}
                  </span>
                </div>
              </div>

              {/* Financial Box */}
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="text-[11px] text-slate-400 block">Agreed Fee / Balance</span>
                  <span className="text-white font-bold">
                    ₹{enr.totalFee}{" "}
                    <span className="text-rose-400 text-xs font-normal">
                      (₹{enr.outstandingBalance} pending)
                    </span>
                  </span>
                </div>

                <Link
                  href="/student/fees"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-teal-300 text-xs font-semibold transition-colors border border-slate-700"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Fee Ledger</span>
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-12 text-xs text-slate-500 bg-slate-900 border border-slate-800 rounded-3xl">
            You do not have any enrolled courses at this time.
          </div>
        )}
      </div>
    </div>
  );
}
