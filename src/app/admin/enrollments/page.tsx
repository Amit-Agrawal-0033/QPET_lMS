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
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileCheck2 className="w-6 h-6 text-teal-400" />
            Course Enrollments ({enrollments.length})
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tracking student course admissions with permanent sequential numbers (QPET-YYYY-NNNNN).
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 shadow-sm shadow-teal-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Course Enrollment</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col lg:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2 w-full lg:w-auto">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by enrollment number (e.g. QPET-2026-00001), student name, mobile, course..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 rounded-xl"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3 w-full lg:w-auto flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Enrollment Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">All Payment Statuses</option>
            <option value="unpaid">Unpaid</option>
            <option value="partially_paid">Partially Paid</option>
            <option value="paid">Fully Paid</option>
          </select>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Enrollment Number</th>
                <th className="py-3.5 px-4">Student Details</th>
                <th className="py-3.5 px-4">Course Enrolled</th>
                <th className="py-3.5 px-4">Fee Summary</th>
                <th className="py-3.5 px-4">Payment Status</th>
                <th className="py-3.5 px-4">Enrollment Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-normal">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Loading enrollment records...
                  </td>
                </tr>
              ) : enrollments.length > 0 ? (
                enrollments.map((enr) => (
                  <tr key={enr._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-teal-300 text-sm">
                      {enr.enrollmentNumber}
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white text-xs">
                        {enr.studentId?.fullName || "Student"}
                      </p>
                      <p className="text-[11px] text-slate-400">{enr.studentId?.mobileNumber}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-slate-200">{enr.courseNameSnapshot}</p>
                      <span className="text-[11px] text-slate-400">
                        {enr.durationMonthsSnapshot} Months duration
                      </span>
                    </td>

                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex justify-between max-w-[140px] text-[11px]">
                        <span className="text-slate-400">Total:</span>
                        <span className="font-bold text-white">₹{enr.totalFee}</span>
                      </div>
                      <div className="flex justify-between max-w-[140px] text-[11px]">
                        <span className="text-slate-400">Paid:</span>
                        <span className="text-emerald-400">₹{enr.paidAmount}</span>
                      </div>
                      <div className="flex justify-between max-w-[140px] text-[11px]">
                        <span className="text-slate-400">Balance:</span>
                        <span className="text-rose-400 font-semibold">₹{enr.outstandingBalance}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          enr.paymentStatus === "paid"
                            ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                            : enr.paymentStatus === "partially_paid"
                            ? "bg-amber-500/10 text-amber-300 border-amber-500/20"
                            : "bg-rose-500/10 text-rose-300 border-rose-500/20"
                        }`}
                      >
                        {enr.paymentStatus.replace("_", " ")}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 capitalize">
                        {enr.enrollmentStatus}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href={`/admin/fees?enrollmentId=${enr._id}`}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-teal-600 text-slate-200 hover:text-white transition-colors border border-slate-700"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Fees</span>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No course enrollments matching filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Enrollment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-teal-400" />
                Create Course Enrollment
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
                {error}
              </div>
            )}

            {duplicateWarning && (
              <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-800 text-xs text-amber-300 space-y-2">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>Duplicate Enrollment Notice</span>
                </div>
                <p>{duplicateWarning}</p>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="allowDupCheck"
                    checked={formData.allowDuplicate}
                    onChange={(e) =>
                      setFormData({ ...formData, allowDuplicate: e.target.checked })
                    }
                    className="rounded bg-slate-900 border-slate-700 text-teal-600 focus:ring-teal-500"
                  />
                  <label htmlFor="allowDupCheck" className="text-white font-medium">
                    Authorize and create duplicate enrollment anyway
                  </label>
                </div>
              </div>
            )}

            <form onSubmit={handleCreateEnrollment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Select Approved Student *
                </label>
                <select
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.fullName} ({s.mobileNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Select Course *
                </label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title} ({c.code}) — Default Fee: ₹{c.defaultFee}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Agreed Course Fee (INR)
                </label>
                <input
                  type="number"
                  value={formData.customFee}
                  onChange={(e) => setFormData({ ...formData, customFee: e.target.value })}
                  placeholder="Leave blank to use course default fee"
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Payment Arrangement
                </label>
                <select
                  value={formData.paymentType}
                  onChange={(e) => setFormData({ ...formData, paymentType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="full">Full Payment Plan</option>
                  <option value="installment">Installment-Based Plan</option>
                </select>
              </div>

              {formData.paymentType === "installment" && (
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Number of Installments
                  </label>
                  <select
                    value={formData.installmentCount}
                    onChange={(e) =>
                      setFormData({ ...formData, installmentCount: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="2">2 Installments</option>
                    <option value="3">3 Installments</option>
                    <option value="4">4 Installments</option>
                    <option value="6">6 Installments</option>
                  </select>
                </div>
              )}

              <p className="text-[11px] text-slate-400">
                A permanent enrollment number (format: <strong>QPET-YYYY-NNNNN</strong>) will be generated atomically upon submission.
              </p>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
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
