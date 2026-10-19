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
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-teal-400" />
            Course Curriculum Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage course offerings, durations, default pricing, and catalog status.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 shadow-sm shadow-teal-600/30 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Course</span>
        </button>
      </div>

      {/* Snapshot preservation notice */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-start gap-3 text-xs text-slate-400">
        <AlertCircle className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">Historical Snapshot Preservation:</span>
          <p className="mt-0.5 leading-relaxed">
            When students enroll, an immutable snapshot of their agreed course fee and duration is saved. Any subsequent changes to default course prices will not alter the fees of previously enrolled students.
          </p>
        </div>
      </div>

      {/* Courses Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-xs text-slate-500">
            Loading courses...
          </div>
        ) : courses.map((course) => (
          <div
            key={course._id}
            className="rounded-2xl bg-slate-900 border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs px-2.5 py-0.5 rounded-lg bg-slate-800 text-teal-300 font-bold border border-slate-700">
                  {course.code}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                    course.isActive
                      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                      : "bg-slate-800 text-slate-400 border-slate-700"
                  }`}
                >
                  {course.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div>
                <h3 className="text-base font-bold text-white">{course.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                  {course.description || "Practical computer course."}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{course.durationText || `${course.durationMonths} Months`}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-500" />
                  <span>{course.enrolledCount || 0} Enrolled</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-base font-extrabold text-white">
                  ₹{course.defaultFee.toLocaleString("en-IN")}
                </span>
                <button
                  onClick={() => openEditModal(course)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Course Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-teal-400" />
                {editingCourse ? "Edit Course Details" : "Create New Course"}
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

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    disabled={!!editingCourse}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                    placeholder="e.g. MSO-105"
                    className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500 uppercase disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">
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
                    className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Course Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="e.g. Course on Computer Concepts (CCC)"
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
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
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  placeholder="Summary of syllabus and learning outcomes"
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCourse"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded bg-slate-900 border-slate-700 text-teal-600 focus:ring-teal-500"
                />
                <label htmlFor="isActiveCourse" className="text-slate-300">
                  Course is Active & Available for Enrollments
                </label>
              </div>

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
