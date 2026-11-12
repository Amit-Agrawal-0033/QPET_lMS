"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Search,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  Edit2,
  X,
  IndianRupee,
  Layers,
  Sparkles,
} from "lucide-react";

export default function TrainerCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Current Trainer Auth & Permissions
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    identifier: string;
    role: "admin" | "trainer" | "student";
    name?: string;
    permissions?: Record<string, boolean>;
  } | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    durationValue: 3,
    durationUnit: "months" as "months" | "days",
    durationMonths: 3,
    defaultFee: 3000,
    isActive: true,
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
    fetchCourses();
  }, []);

  const canCreateCourses =
    currentUser?.role === "admin" ||
    !!currentUser?.permissions?.createCourses ||
    !!currentUser?.permissions?.editCourses;

  const canEditCourses =
    currentUser?.role === "admin" || !!currentUser?.permissions?.editCourses;

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/courses");
      const json = await res.json();
      if (res.ok && json.success) {
        setCourses(json.courses || []);
      } else {
        setError(json.error || "Unable to load curriculum.");
      }
    } catch {
      setError("Network error loading courses.");
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
      durationValue: 3,
      durationUnit: "months",
      durationMonths: 3,
      defaultFee: 3000,
      isActive: true,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (course: any) => {
    setEditingCourse(course);
    const unit: "months" | "days" = course.durationUnit === "days" ? "days" : "months";
    const val = Number(course.durationValue || course.durationMonths || 1);
    setFormData({
      code: course.code,
      title: course.title,
      description: course.description || "",
      durationValue: val,
      durationUnit: unit,
      durationMonths: unit === "months" ? val : Math.max(1, Math.round(val / 30)),
      defaultFee: course.defaultFee,
      isActive: course.isActive !== false,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSaving(true);

    try {
      const url = "/api/admin/courses";
      const method = editingCourse ? "PUT" : "POST";
      const payload = editingCourse
        ? { id: editingCourse._id, ...formData }
        : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error || "Operation failed.");
        setSaving(false);
        return;
      }

      setIsModalOpen(false);
      setSaving(false);
      fetchCourses();
    } catch {
      setModalError("Network error occurred. Please try again.");
      setSaving(false);
    }
  };

  const filtered = courses.filter((c) => {
    const term = search.toLowerCase();
    return (
      (c.title || "").toLowerCase().includes(term) ||
      (c.code || "").toLowerCase().includes(term) ||
      (c.description || "").toLowerCase().includes(term)
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
            Course Curriculum
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active syllabus and training modules for student instruction
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search course title or code..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-xs"
            />
          </div>

          {canCreateCourses && (
            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-purple-600/20 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Create Course</span>
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
              className="h-48 bg-white border border-slate-200/70 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No courses found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-mono font-bold text-xs border border-purple-200/60">
                    {course.code}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Active Syllabus
                    </span>
                    {canEditCourses && (
                      <button
                        onClick={() => openEditModal(course)}
                        className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Edit Course Details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 line-clamp-1">
                  {course.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-3 leading-relaxed">
                  {course.description ||
                    "Comprehensive syllabus and hands-on practical curriculum."}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                <span className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {course.durationText ||
                    (course.durationUnit === "days"
                      ? `${course.durationValue || course.durationMonths} Days`
                      : `${course.durationMonths} ${course.durationMonths === 1 ? "Month" : "Months"}`)}
                </span>
                <span className="flex items-center gap-1.5 font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  {course.enrolledCount || 0} Enrolled
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT COURSE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200/80 shadow-2xl p-6 sm:p-7 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/60">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingCourse ? "Edit Course Module" : "Create New Course"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingCourse
                      ? "Update course curriculum details"
                      : "Add a new syllabus offering to the LMS"}
                  </p>
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

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingCourse}
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g. DCA, PGDCA"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none uppercase font-mono disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Duration *
                    </label>
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200/80 px-2 py-0.5 rounded-md">
                      {formData.durationValue}{" "}
                      {formData.durationUnit === "days"
                        ? formData.durationValue === 1 ? "Day" : "Days"
                        : formData.durationValue === 1 ? "Month" : "Months"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      required
                      min={1}
                      max={formData.durationUnit === "days" ? 365 : 48}
                      value={formData.durationValue}
                      onChange={(e) => {
                        const val = Math.max(1, Number(e.target.value));
                        setFormData({
                          ...formData,
                          durationValue: val,
                          durationMonths: formData.durationUnit === "months" ? val : Math.max(1, Math.round(val / 30)),
                        });
                      }}
                      placeholder={formData.durationUnit === "days" ? "e.g. 7, 15, 45" : "e.g. 1, 2, 6"}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                    />
                    <select
                      value={formData.durationUnit}
                      onChange={(e) => {
                        const newUnit = e.target.value as "months" | "days";
                        setFormData({
                          ...formData,
                          durationUnit: newUnit,
                          durationValue: newUnit === "days" && formData.durationValue <= 3 ? 15 : formData.durationValue,
                          durationMonths: newUnit === "months" ? formData.durationValue : Math.max(1, Math.round(formData.durationValue / 30)),
                        });
                      }}
                      className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none bg-white font-semibold cursor-pointer"
                    >
                      <option value="months">Months (महीने)</option>
                      <option value="days">Days (दिन)</option>
                    </select>
                  </div>

                  {/* Quick presets */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] text-slate-400 font-medium">Quick:</span>
                    {[
                      { val: 7, unit: "days", label: "7 Days" },
                      { val: 15, unit: "days", label: "15 Days" },
                      { val: 30, unit: "days", label: "30 Days" },
                      { val: 1, unit: "months", label: "1M" },
                      { val: 2, unit: "months", label: "2M" },
                      { val: 3, unit: "months", label: "3M" },
                      { val: 6, unit: "months", label: "6M" },
                    ].map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            durationValue: preset.val,
                            durationUnit: preset.unit as "months" | "days",
                            durationMonths: preset.unit === "months" ? preset.val : Math.max(1, Math.round(preset.val / 30)),
                          })
                        }
                        className={`text-[10px] px-2 py-0.5 rounded-md font-semibold transition-colors ${
                          formData.durationValue === preset.val && formData.durationUnit === preset.unit
                            ? "bg-purple-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Course Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Diploma in Computer Applications"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Default Fee (₹) *
                </label>
                <div className="relative">
                  <IndianRupee className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.defaultFee}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        defaultFee: Number(e.target.value),
                      })
                    }
                    placeholder="e.g. 5000"
                    className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Description & Syllabus Highlights
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Summary of course modules, curriculum, and practical training..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveCourse"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
                <label
                  htmlFor="isActiveCourse"
                  className="text-xs text-slate-700 font-medium select-none cursor-pointer"
                >
                  Active course (available for student admission)
                </label>
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
                  {saving
                    ? "Saving..."
                    : editingCourse
                    ? "Update Course"
                    : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
