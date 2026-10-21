"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Plus,
  Search,
  IndianRupee,
  CreditCard,
  User,
  Calendar,
  Clock,
  X,
  AlertCircle,
  CheckCircle2,
  Receipt,
  Filter,
} from "lucide-react";

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");

  // Modal
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
  const [error, setError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  useEffect(() => {
    fetchEnrollments();
    fetchDropdowns();
  }, [statusFilter, paymentStatusFilter]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("query", search);
      if (statusFilter) params.set("status", statusFilter);
      if (paymentStatusFilter) params.set("paymentStatus", paymentStatusFilter);

      const res = await fetch(`/api/admin/enrollments?${params.toString()}`);
      const data = await res.json();
      if (data.enrollments) setEnrollments(data.enrollments);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [stRes, cRes] = await Promise.all([
        fetch("/api/admin/students?status=approved"),
        fetch("/api/admin/courses"),
      ]);
      const stData = await stRes.json();
      const cData = await cRes.json();
      if (stData.students) setStudents(stData.students);
      if (cData.courses) setCourses(cData.courses.filter((c: any) => c.isActive));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEnrollments();
  };

  const openCreateModal = () => {
    setFormData({
      studentId: students[0]?._id || "",
      courseId: courses[0]?._id || "",
      customFee: "",
      paymentType: "full",
      installmentCount: "3",
      allowDuplicate: false,
    });
    setError(null);
    setDuplicateWarning(null);
    setIsModalOpen(true);
  };

  const handleCreateEnrollment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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
        if (data.duplicateDetected) {
          setDuplicateWarning(data.error);
        } else {
          setError(data.error || "Failed to create enrollment.");
        }
        setSaving(false);
        return;
      }

      setIsModalOpen(false);
      fetchEnrollments();
    } catch (err: any) {
      setError("Network error occurred.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Course Enrollments
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
              {enrollments.length} Active Records
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tracking student course admissions with permanent sequential numbers (QPET-YYYY-NNNNN).
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Course Enrollment</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex flex-col lg:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2 w-full lg:w-auto">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by enrollment number (e.g. QPET-2026-00001), student name, mobile, course..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 rounded-xl transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="">All Enrollment Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="">All Payment Statuses</option>
            <option value="unpaid">Unpaid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Fully Paid</option>
          </select>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/80 text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-200/80 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Enrollment Number</th>
                <th className="py-3.5 px-4">Student Details</th>
                <th className="py-3.5 px-4">Course Enrolled</th>
                <th className="py-3.5 px-4">Fee Summary</th>
                <th className="py-3.5 px-4">Payment Status</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <span>Loading enrollment records...</span>
                    </div>
                  </td>
                </tr>
              ) : enrollments.length > 0 ? (
                enrollments.map((enr) => (
                  <tr key={enr._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-600 text-xs sm:text-sm">
                      {enr.enrollmentNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 text-xs">
                        {enr.studentId?.fullName || "Student"}
                      </p>
                      <p className="text-[11px] text-slate-500">{enr.studentId?.mobileNumber}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-800">{enr.courseNameSnapshot}</p>
                      <span className="text-[11px] text-slate-500">
                        {enr.durationMonthsSnapshot} Months duration
                      </span>
                    </td>

                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex justify-between max-w-[140px] text-[11px]">
                        <span className="text-slate-500">Total:</span>
                        <span className="font-bold text-slate-900">₹{enr.totalFee}</span>
                      </div>
                      <div className="flex justify-between max-w-[140px] text-[11px]">
                        <span className="text-slate-500">Paid:</span>
                        <span className="text-emerald-600 font-semibold">₹{enr.paidAmount}</span>
                      </div>
                      <div className="flex justify-between max-w-[140px] text-[11px]">
                        <span className="text-slate-500">Balance:</span>
                        <span className="text-rose-600 font-semibold">₹{enr.outstandingBalance}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          enr.paymentStatus === "paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : enr.paymentStatus === "partially_paid"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {enr.paymentStatus.replace("_", " ")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 capitalize">
                        {enr.enrollmentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/fees?enrollmentId=${enr._id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-blue-600 text-slate-700 hover:text-white transition-all border border-slate-200/80 shadow-xs"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Fees</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No course enrollments found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Enrollment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Create Course Enrollment
                  </h2>
                  <p className="text-xs text-slate-500">Assign course and generate sequential enrollment number</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {duplicateWarning && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2.5">
                <div className="flex items-center gap-2 font-semibold text-amber-950">
                  <AlertCircle className="w-4 h-4 text-amber-600" />
                  <span>Duplicate Enrollment Notice</span>
                </div>
                <p className="text-amber-800 leading-relaxed">{duplicateWarning}</p>
                <div className="flex items-center gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="allowDupCheck"
                    checked={formData.allowDuplicate}
                    onChange={(e) =>
                      setFormData({ ...formData, allowDuplicate: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <label htmlFor="allowDupCheck" className="text-amber-950 font-medium select-none cursor-pointer">
                    Authorize and create duplicate enrollment anyway
                  </label>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateEnrollment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Select Approved Student *
                </label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.fullName} ({s.mobileNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Select Course *
                </label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title} ({c.code}) — Default Fee: ₹{c.defaultFee}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Agreed Course Fee (INR)
                </label>
                <input
                  type="number"
                  value={formData.customFee}
                  onChange={(e) => setFormData({ ...formData, customFee: e.target.value })}
                  placeholder="Leave blank to use course default fee"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Payment Arrangement
                </label>
                <select
                  value={formData.paymentType}
                  onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                >
                  <option value="full">Full Payment Plan</option>
                  <option value="installment">Installment-Based Plan</option>
                </select>
              </div>

              {formData.paymentType === "installment" && (
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Number of Installments
                  </label>
                  <select
                    value={formData.installmentCount}
                    onChange={(e) =>
                      setFormData({ ...formData, installmentCount: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  >
                    <option value="2">2 Installments</option>
                    <option value="3">3 Installments</option>
                    <option value="4">4 Installments</option>
                    <option value="6">6 Installments</option>
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
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50"
                >
                  {saving ? "Generating..." : "Generate Enrollment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
