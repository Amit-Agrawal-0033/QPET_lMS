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
    discountAmount: "",
    paymentType: "full",
    installmentCount: "3",
    allowDuplicate: false,
  });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

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

  const canCreateEnrollments =
    currentUser?.role === "admin" ||
    !!currentUser?.permissions?.createEnrollments ||
    !!currentUser?.permissions?.editEnrollments;

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

  const openCreateModal = () => {
    const firstStudent = students[0];
    const activeCourseIds = new Set(
      (firstStudent?.enrollments || [])
        .filter((e: any) => e.enrollmentStatus === "active")
        .map((e: any) => e.courseId?._id || e.courseId)
    );
    const nextCourse = courses.find((c) => !activeCourseIds.has(c._id)) || courses[0];

    setFormData({
      studentId: firstStudent?._id || "",
      courseId: nextCourse?._id || "",
      customFee: nextCourse?.defaultFee !== undefined ? String(nextCourse.defaultFee) : "",
      discountAmount: "",
      paymentType: "full",
      installmentCount: "3",
      allowDuplicate: false,
    });
    setModalError(null);
    setDuplicateWarning(null);
    setIsModalOpen(true);
  };

  const handleStudentSelect = (stId: string) => {
    const selectedStudent = students.find((s) => s._id === stId);
    const activeCourseIds = new Set(
      (selectedStudent?.enrollments || [])
        .filter((e: any) => e.enrollmentStatus === "active")
        .map((e: any) => e.courseId?._id || e.courseId)
    );
    const nextCourse = courses.find((c) => !activeCourseIds.has(c._id)) || courses[0];

    setFormData((prev) => ({
      ...prev,
      studentId: stId,
      courseId: nextCourse?._id || prev.courseId,
      customFee: nextCourse?.defaultFee !== undefined ? String(nextCourse.defaultFee) : prev.customFee,
      discountAmount: "",
      allowDuplicate: false,
    }));
    setDuplicateWarning(null);
    setModalError(null);
  };

  const handleCourseSelect = (cId: string) => {
    const selectedCourse = courses.find((c) => c._id === cId);
    setFormData((prev) => ({
      ...prev,
      courseId: cId,
      customFee: selectedCourse?.defaultFee !== undefined ? String(selectedCourse.defaultFee) : prev.customFee,
      allowDuplicate: false,
    }));
    setDuplicateWarning(null);
    setModalError(null);
  };

  const handleEnrollSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setDuplicateWarning(null);
    setSaving(true);

    try {
      const res = await fetch("/api/admin/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        if (data.isDuplicate) {
          setDuplicateWarning(data.error);
        } else {
          setModalError(data.error || "Failed to create enrollment.");
        }
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

          {canCreateEnrollments && (
            <button
              onClick={openCreateModal}
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

      {/* Grid of Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-white border border-slate-200/80 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-white border border-slate-200/80 rounded-2xl p-6">
          <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="text-xs text-slate-500">No student enrollments found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((en) => (
            <div
              key={en._id}
              className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-purple-50 text-purple-700 font-bold border border-purple-200/60">
                    {en.enrollmentNumber}
                  </span>
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      en.paymentStatus === "paid"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : en.paymentStatus === "partially_paid"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {en.paymentStatus ? en.paymentStatus.replace("_", " ") : "unpaid"}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {en.studentId?.fullName || "Student"}
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {en.studentId?.mobileNumber || "—"}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span className="text-xs font-semibold text-slate-800 line-clamp-1">
                    {en.courseNameSnapshot || "Course"}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>
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
                  <h3 className="text-base font-bold text-slate-900">Create Course Enrollment</h3>
                  <p className="text-xs text-slate-500">Assign course and generate sequential enrollment number</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {duplicateWarning && (
              <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block font-semibold">Duplicate Enrollment Notice</strong>
                    <span>{duplicateWarning}</span>
                  </div>
                </div>
                <label className="flex items-center gap-2 pt-1 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowDuplicate}
                    onChange={(e) => setFormData({ ...formData, allowDuplicate: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                  />
                  <span>Authorize and create duplicate enrollment anyway</span>
                </label>
              </div>
            )}

            {modalError && (
              <div className="mt-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleEnrollSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Approved Student *
                </label>
                <select
                  required
                  value={formData.studentId}
                  onChange={(e) => handleStudentSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                >
                  <option value="">-- Choose Student --</option>
                  {students.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.fullName} ({st.mobileNumber})
                    </option>
                  ))}
                </select>

                {(() => {
                  const selectedStudent = students.find((s) => s._id === formData.studentId);
                  const activeEnrs = (selectedStudent?.enrollments || []).filter(
                    (e: any) => e.enrollmentStatus === "active"
                  );
                  if (activeEnrs.length > 0) {
                    return (
                      <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-600 flex items-center justify-between flex-wrap gap-2">
                        <span className="text-slate-500 font-medium">Currently Enrolled:</span>
                        <div className="flex gap-1.5 flex-wrap">
                          {activeEnrs.map((e: any) => (
                            <span
                              key={e._id}
                              className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold border border-purple-200/60"
                            >
                              {e.courseNameSnapshot || "Course"} ({e.enrollmentNumber})
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Course *
                </label>
                <select
                  required
                  value={formData.courseId}
                  onChange={(e) => handleCourseSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                >
                  <option value="">-- Choose Course --</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title} ({c.code}) — Default Fee: ₹{c.defaultFee}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Agreed Course Fee (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.customFee}
                    onChange={(e) => setFormData({ ...formData, customFee: e.target.value })}
                    placeholder="Standard fee"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Discount Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.discountAmount}
                    onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                    placeholder="Optional discount"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              {/* Dynamic Fee & Discount Summary */}
              {(() => {
                const selectedC = courses.find((c) => c._id === formData.courseId);
                const baseF = formData.customFee !== "" ? Number(formData.customFee) : (selectedC?.defaultFee || 0);
                const discF = Number(formData.discountAmount) || 0;
                const netF = Math.max(0, baseF - discF);
                const instC = Number(formData.installmentCount) || 1;
                const perInst = Math.round(netF / instC);

                return (
                  <div className="space-y-2">
                    <div className="p-3 bg-purple-50/60 border border-purple-200/80 rounded-xl space-y-1 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-600">Base Agreed Fee:</span>
                        <span className="font-semibold text-slate-900">₹{baseF.toLocaleString("en-IN")}</span>
                      </div>
                      {discF > 0 && (
                        <div className="flex justify-between items-center text-emerald-700">
                          <span>Discount / Concession:</span>
                          <span className="font-bold">- ₹{discF.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center pt-1 border-t border-purple-200/80 font-bold">
                        <span className="text-slate-800">Final Net Payable Fee:</span>
                        <span className="text-purple-700 text-sm font-black">₹{netF.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    {formData.paymentType === "installment" && (
                      <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-center justify-between font-medium">
                        <span>Installment Schedule:</span>
                        <span className="font-bold">
                          {formData.installmentCount} Monthly Payments of ~₹{perInst.toLocaleString("en-IN")} each
                        </span>
                      </div>
                    )}
                  </div>
                );
              })()}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Payment Arrangement
                </label>
                <select
                  value={formData.paymentType}
                  onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                >
                  <option value="full">Full Payment Plan</option>
                  <option value="installment">Installment-Based Plan</option>
                </select>
              </div>

              {formData.paymentType === "installment" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Number of Installments
                  </label>
                  <select
                    value={formData.installmentCount}
                    onChange={(e) =>
                      setFormData({ ...formData, installmentCount: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  >
                    <option value="1">1 Installment (Full Settlement)</option>
                    <option value="2">2 Monthly Installments (EMIs)</option>
                    <option value="3">3 Monthly Installments (EMIs)</option>
                    <option value="4">4 Monthly Installments (EMIs)</option>
                    <option value="5">5 Monthly Installments (EMIs)</option>
                    <option value="6">6 Monthly Installments (EMIs)</option>
                  </select>
                </div>
              )}

              <p className="text-[11px] text-slate-500">
                A permanent enrollment number (format: <strong className="text-slate-800">QPET-YYYY-NNNNN</strong>) will be generated atomically upon submission.
              </p>

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
