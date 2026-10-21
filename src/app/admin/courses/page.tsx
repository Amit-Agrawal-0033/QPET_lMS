"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  IndianRupee,
  Users,
  X,
  GraduationCap,
} from "lucide-react";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    durationMonths: 2,
    defaultFee: 2000,
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/courses");
      const data = await res.json();
      if (data.courses) setCourses(data.courses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingCourse(null);
    setFormData({
      code: "",
      title: "",
      description: "",
      durationMonths: 2,
      defaultFee: 2000,
      isActive: true,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (course: any) => {
    setEditingCourse(course);
    setFormData({
      code: course.code,
      title: course.title,
      description: course.description || "",
      durationMonths: course.durationMonths,
      defaultFee: course.defaultFee,
      isActive: course.isActive,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);

    try {
      const url = "/api/admin/courses";
      const method = editingCourse ? "PUT" : "POST";
      const payload = editingCourse ? { id: editingCourse._id, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Operation failed.");
        setSaving(false);
        return;
      }

      setIsModalOpen(false);
      fetchCourses();
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
              Course Curriculum Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
              {courses.length} Courses
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage certificate programs, durations, default fee structures, and catalog statuses.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Course</span>
        </button>
      </div>

      {/* Snapshot preservation notice */}
      <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/70 flex items-start gap-3 text-xs text-blue-900 shadow-xs">
        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-blue-950">Historical Snapshot Preservation:</span>
          <p className="mt-0.5 text-blue-800/90 leading-relaxed">
            When students enroll, an immutable snapshot of their agreed course fee and duration is saved. Any subsequent changes to default course prices will not alter the fees of previously enrolled students.
          </p>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-xs text-slate-500 shadow-sm flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span>Loading courses catalog...</span>
          </div>
        ) : courses.map((course) => (
          <div
            key={course._id}
            className="rounded-2xl bg-white border border-slate-200/80 p-5 sm:p-6 flex flex-col justify-between hover:shadow-md hover:border-slate-300/80 transition-all space-y-4 shadow-sm"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold border border-blue-200/60">
                  {course.code}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                    course.isActive
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-slate-100 text-slate-500 border-slate-200"
                  }`}
                >
                  {course.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                  {course.description || "Practical computer & IT certification program."}
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{course.durationText || `${course.durationMonths} Months`}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>{course.enrolledCount || 0} Enrolled</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Default Fee</span>
                  <span className="text-base font-bold text-slate-900">
                    ₹{course.defaultFee.toLocaleString("en-IN")}
                  </span>
                </div>
                <button
                  onClick={() => openEditModal(course)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80 transition-colors flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-blue-600">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {editingCourse ? "Edit Course Details" : "Create New Course"}
                  </h2>
                  <p className="text-xs text-slate-500">Configure code, curriculum, fee and duration</p>
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

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    disabled={!!editingCourse}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                    placeholder="e.g. MSO-105"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-semibold uppercase disabled:opacity-50 disabled:bg-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Duration (Months) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="36"
                    value={formData.durationMonths}
                    onChange={(e) =>
                      setFormData({ ...formData, durationMonths: Number(e.target.value) })
                    }
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g. Course on Computer Concepts (CCC)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Default Course Fee (INR) *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.defaultFee}
                  onChange={(e) =>
                    setFormData({ ...formData, defaultFee: Number(e.target.value) })
                  }
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Summary of syllabus and learning outcomes"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCourse"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActiveCourse" className="text-slate-700 font-medium select-none cursor-pointer">
                  Course is Active & Available for Enrollments
                </label>
              </div>

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
                  {saving ? "Saving..." : editingCourse ? "Save Changes" : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
