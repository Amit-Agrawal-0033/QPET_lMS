"use client";

import { useState, useEffect } from "react";
import {
  FileCheck2,
  Search,
  Plus,
  Calendar,
  Clock,
  User,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  ShieldCheck,
} from "lucide-react";

export default function TrainerEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Trainer Auth & Permissions
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    identifier: string;
    role: "admin" | "trainer" | "student";
    name?: string;
    permissions?: Record<string, boolean>;
  } | null>(null);

  // Enroll Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    courseId: "",
    customFee: "",
    paymentType: "full",
    installmentCount: "3",
    allowDuplicate: false,
  });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
    fetchEnrollments();
    fetchDropdowns();
  }, []);

  const canEditEnrollments =
    currentUser?.role === "admin" || !!currentUser?.permissions?.editEnrollments;

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/enrollments");
      const json = await res.json();
      if (res.ok && json.success) {
        setEnrollments(json.enrollments || []);
      } else {
        setError(json.error || "Unable to load enrollments.");
      }
    } catch {
      setError("Network error loading enrollments.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [stRes, crRes] = await Promise.all([
        fetch("/api/admin/students?status=approved"),
        fetch("/api/admin/courses"),
      ]);
      const [stData, crData] = await Promise.all([stRes.json(), crRes.json()]);
      if (stData.students) setStudents(stData.students);
      if (crData.courses) setCourses(crData.courses.filter((c: any) => c.isActive));
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/admin/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error || "Failed to create enrollment.");
        setSaving(false);
        return;
      }

      setIsModalOpen(false);
      setSaving(false);
      fetchEnrollments();
    } catch {
      setModalError("Network error occurred. Please try again.");
      setSaving(false);
    }
  };

  const filtered = enrollments.filter((e) => {
    const term = search.toLowerCase();
    return (
      (e.enrollmentNumber || "").toLowerCase().includes(term) ||
      (e.studentId?.fullName || "").toLowerCase().includes(term) ||
      (e.studentId?.mobileNumber || "").includes(term) ||
      (e.courseNameSnapshot || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">
              Faculty Portal
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Batch Enrollments
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Student course batch assignments and active training rosters
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search enrollment or student..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-xs"
            />
          </div>

          {canEditEnrollments && (
            <button
              onClick={() => {
                setModalError(null);
                setFormData({
                  studentId: students.length > 0 ? students[0]._id : "",
                  courseId: courses.length > 0 ? courses[0]._id : "",
                  customFee: "",
                  paymentType: "full",
                  installmentCount: "3",
                  allowDuplicate: false,
                });
                setIsModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-purple-600/20 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll Student</span>
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-44 bg-white border border-slate-200/70 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No enrollments found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((en) => (
            <div
              key={en._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-mono font-bold text-xs border border-purple-200/60">
                    {en.enrollmentNumber}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    {en.enrollmentStatus === "active" ? "Active Batch" : en.enrollmentStatus}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">
                  {en.studentId?.fullName || "Student"}
                </h3>
                <p className="text-xs text-purple-700 font-semibold mt-0.5">
                  {en.courseNameSnapshot || "Assigned Course"}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Mobile:</span>
                    <span className="font-mono text-slate-700">
                      {en.studentId?.mobileNumber || "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Duration:</span>
                    <span>{en.durationMonthsSnapshot || 3} Months</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(en.enrollmentDate).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="font-semibold text-slate-600">
                  Fee: ₹{en.agreedFeeSnapshot || en.totalFee || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ENROLL MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200/80 shadow-2xl p-6 sm:p-7 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/60">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Assign Course Enrollment</h3>
                  <p className="text-xs text-slate-500">Enroll student into an active training syllabus</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleEnrollSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Student *
                </label>
                <select
                  required
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.fullName} ({st.mobileNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Course *
                </label>
                <select
                  required
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                >
                  <option value="">-- Choose Course --</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title} ({c.code}) - ₹{c.defaultFee}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Custom Agreed Fee (₹)
                </label>
                <input
                  type="number"
                  value={formData.customFee}
                  onChange={(e) => setFormData({ ...formData, customFee: e.target.value })}
                  placeholder="Leave empty for course standard fee"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all disabled:opacity-50"
                >
                  {saving ? "Enrolling..." : "Confirm Enrollment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
