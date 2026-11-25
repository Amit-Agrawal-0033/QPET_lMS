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
  Plus,
  X,
  Layers,
  Sparkles,
} from "lucide-react";

export default function StudentCoursesPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [courseRequests, setCourseRequests] = useState<any[]>([]);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Request modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, reqRes, crRes] = await Promise.all([
        fetch("/api/student/dashboard"),
        fetch("/api/student/course-requests"),
        fetch("/api/courses"),
      ]);

      const [dashData, reqData, crData] = await Promise.all([
        dashRes.json(),
        reqRes.json(),
        crRes.json(),
      ]);

      if (dashData.enrollments) setEnrollments(dashData.enrollments);
      if (reqData.requests) setCourseRequests(reqData.requests);
      if (crData.courses) {
        setAvailableCourses(crData.courses.filter((c: any) => c.isActive !== false));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    // Exclude courses student is already enrolled in
    const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId?._id || e.courseId));
    const pendingCourseIds = new Set(
      courseRequests.filter((r) => r.status === "pending").map((r) => r.courseId?._id || r.courseId)
    );

    const eligible = availableCourses.filter(
      (c) => !enrolledCourseIds.has(c._id) && !pendingCourseIds.has(c._id)
    );

    setSelectedCourseId(eligible[0]?._id || "");
    setNotes("");
    setFeedback(null);
    setIsModalOpen(true);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      setFeedback({ type: "error", text: "Please choose a course to request." });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/student/course-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId: selectedCourseId,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: "error", text: data.error || "Failed to submit request." });
        setSubmitting(false);
        return;
      }

      setFeedback({ type: "success", text: data.message });
      setTimeout(() => {
        setIsModalOpen(false);
        fetchData();
      }, 1800);
    } catch (err) {
      setFeedback({ type: "error", text: "Network error. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const enrolledCourseIds = new Set(enrollments.map((e) => e.courseId?._id || e.courseId));
  const eligibleCourses = availableCourses.filter(
    (c) => !enrolledCourseIds.has(c._id)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Apply for Another Course</span>
        </button>
      </div>

      {/* Pending Course Requests Banner */}
      {courseRequests.filter((r) => r.status === "pending").length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Pending Course Admission Requests ({courseRequests.filter((r) => r.status === "pending").length})</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courseRequests
              .filter((r) => r.status === "pending")
              .map((req) => (
                <div
                  key={req._id}
                  className="rounded-2xl bg-amber-50/60 border border-amber-200/80 p-5 space-y-3 shadow-xs"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 border border-amber-300/60 inline-block mb-1.5">
                        Course Request Under Review
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{req.courseId?.title}</h3>
                      <p className="text-xs text-slate-500">
                        Duration: {req.courseId?.durationText || `${req.courseId?.durationMonths || 1} Months`} — Standard Fee: ₹{req.courseId?.defaultFee || 0}
                      </p>
                    </div>
                  </div>

                  {req.notes && (
                    <p className="text-xs text-amber-900 bg-white/80 p-2.5 rounded-xl border border-amber-200/50 italic">
                      Notes: "{req.notes}"
                    </p>
                  )}

                  <p className="text-[11px] text-slate-500">
                    Requested on {new Date(req.requestDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}. Administration desk will finalize tuition fee &amp; installment breakdown.
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Enrolled Courses Grid */}
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
                    Duration: <strong className="text-slate-800 font-medium">{enr.durationSnapshot || `${enr.durationMonthsSnapshot} Months`}</strong>
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

      {/* ===================================================================== */}
      {/* REQUEST ANOTHER COURSE MODAL                                          */}
      {/* ===================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Apply for Another Course
                  </h2>
                  <p className="text-xs text-slate-500">Expand your skill set with additional IT training</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {feedback && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
                  feedback.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                    : "bg-rose-50 border-rose-200 text-rose-800"
                }`}
              >
                {feedback.type === "success" ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{feedback.text}</span>
              </div>
            )}

            <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Select Course to Enroll *
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {eligibleCourses.length === 0 ? (
                    <option value="" disabled>No new courses available to select</option>
                  ) : (
                    eligibleCourses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title} ({c.code}) — {c.durationText || `${c.durationMonths} Months`} (₹{c.defaultFee})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Preferred Batch / Shift / Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. Morning 8:00 AM batch preferred, interested in weekend sessions, etc."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-medium"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/60 text-[11px] text-blue-900 space-y-1">
                <p className="font-bold">Multi-Course Admission Policy:</p>
                <p className="text-blue-800">
                  Aapki admission request submit hone ke baad administrative desk aapka course fee concession/discount aur installment schedule finalize karegi.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || eligibleCourses.length === 0}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit Admission Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
