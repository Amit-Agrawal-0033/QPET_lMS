"use client";

import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Filter,
  Edit2,
  X,
  Sparkles,
  Copy,
  Check,
  MapPin,
  GraduationCap,
  Lock,
  KeyRound,
} from "lucide-react";

export default function TrainerStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
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

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    fullName: "",
    fatherOrGuardianName: "",
    dateOfBirth: "",
    gender: "male",
    mobileNumber: "",
    email: "",
    address: "",
    qualification: "",
    courseId: "",
    customFee: "",
    paymentType: "full",
    installmentCount: "3",
    password: "",
  });

  const [editFormData, setEditFormData] = useState({
    fullName: "",
    fatherOrGuardianName: "",
    dateOfBirth: "",
    gender: "male",
    mobileNumber: "",
    email: "",
    address: "",
    qualification: "",
  });

  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});
    fetchStudents();
    fetchCourses();
  }, []);

  const canEditStudents =
    currentUser?.role === "admin" || !!currentUser?.permissions?.editStudents;

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/students?status=approved");
      const json = await res.json();
      if (res.ok && json.success) {
        setStudents(json.students || []);
      } else {
        setError(json.error || "Unable to load student directory.");
      }
    } catch {
      setError("Network error loading students.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/admin/courses");
      const data = await res.json();
      if (data.courses) {
        setCourses(data.courses.filter((c: any) => c.isActive));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const copyCreds = (username: string, pass: string) => {
    const text = `QPET LMS Student Login Credentials:\nLogin Mobile: ${username}\nPassword: ${pass}\nPortal URL: ${window.location.origin}/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Add Student Handler
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error || "Failed to create student.");
        setSaving(false);
        return;
      }

      setSuccessInfo(data);
      setIsAddModalOpen(false);
      setSaving(false);
      // Reset form
      setFormData({
        fullName: "",
        fatherOrGuardianName: "",
        dateOfBirth: "",
        gender: "male",
        mobileNumber: "",
        email: "",
        address: "",
        qualification: "",
        courseId: "",
        customFee: "",
        paymentType: "full",
        installmentCount: "3",
        password: "",
      });
      fetchStudents();
    } catch (err: any) {
      setModalError("Network error. Please try again.");
      setSaving(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (student: any) => {
    setSelectedStudent(student);
    setEditFormData({
      fullName: student.fullName,
      fatherOrGuardianName: student.fatherOrGuardianName || "",
      dateOfBirth: student.dateOfBirth
        ? new Date(student.dateOfBirth).toISOString().split("T")[0]
        : "",
      gender: student.gender || "male",
      mobileNumber: student.mobileNumber,
      email: student.email || "",
      address: student.address || "",
      qualification: student.qualification || "",
    });
    setModalError(null);
    setIsEditModalOpen(true);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setModalError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/admin/students", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent._id,
          ...editFormData,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error || "Failed to update student profile.");
        setSaving(false);
        return;
      }

      setIsEditModalOpen(false);
      setSaving(false);
      fetchStudents();
    } catch (err: any) {
      setModalError("Network error. Please try again.");
      setSaving(false);
    }
  };

  const filtered = students.filter((s) => {
    const term = search.toLowerCase();
    return (
      (s.fullName || "").toLowerCase().includes(term) ||
      (s.mobileNumber || "").includes(term) ||
      (s.email || "").toLowerCase().includes(term) ||
      (s.preferredCourseId?.title || "").toLowerCase().includes(term)
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
            Student Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            View active students and manage academic enrollments
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, phone, course..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-xs"
            />
          </div>

          {canEditStudents && (
            <button
              onClick={() => {
                setModalError(null);
                setIsAddModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-purple-600/20 transition-all cursor-pointer shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Student</span>
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
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No students found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((s) => (
            <div
              key={s._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 font-bold flex items-center justify-center text-sm border border-purple-200/60 shrink-0">
                    {s.fullName ? s.fullName.charAt(0).toUpperCase() : "S"}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Enrolled
                    </span>
                    {canEditStudents && (
                      <button
                        onClick={() => openEditModal(s)}
                        className="p-1 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Edit Student Info"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{s.fullName}</h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  Guardian: {s.fatherOrGuardianName || "N/A"}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{s.mobileNumber}</span>
                  </div>
                  {s.email && (
                    <div className="flex items-center gap-2 text-slate-600 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{s.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-700 font-semibold">
                    <BookOpen className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span>{s.preferredCourseId?.title || "Course Assigned"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(s.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="font-mono text-purple-700 font-semibold">
                  {s.preferredCourseId?.code || "QPET"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD STUDENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200/80 shadow-2xl p-6 sm:p-7 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/60">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Add New Student</h3>
                  <p className="text-xs text-slate-500">
                    Register student and configure immediate course enrollment
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
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

            <form onSubmit={handleAddStudent} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Father / Guardian Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fatherOrGuardianName}
                    onChange={(e) =>
                      setFormData({ ...formData, fatherOrGuardianName: e.target.value })
                    }
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Mobile Number (Login ID) *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={formData.mobileNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, mobileNumber: e.target.value.replace(/\D/g, "") })
                    }
                    placeholder="10-digit mobile"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="student@example.com"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Complete Address *
                </label>
                <textarea
                  required
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Permanent residential address"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Highest Qualification
                  </label>
                  <input
                    type="text"
                    value={formData.qualification}
                    onChange={(e) =>
                      setFormData({ ...formData, qualification: e.target.value })
                    }
                    placeholder="e.g. 12th Pass / Graduate"
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Course to Enroll
                  </label>
                  <select
                    value={formData.courseId}
                    onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title} ({c.code}) - ₹{c.defaultFee}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Custom Student Password (Optional)
                </label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Leave empty for auto QPET@<last4>"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all disabled:opacity-50"
                >
                  {saving ? "Creating Student..." : "Create Student Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {isEditModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200/80 shadow-2xl p-6 sm:p-7 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/60">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Edit Student Profile</h3>
                  <p className="text-xs text-slate-500">Update academic and personal information</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
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

            <form onSubmit={handleSaveEdit} className="mt-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.fullName}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, fullName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Father / Guardian Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.fatherOrGuardianName}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, fatherOrGuardianName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={editFormData.mobileNumber}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        mobileNumber: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, email: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={editFormData.dateOfBirth}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, dateOfBirth: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Gender
                  </label>
                  <select
                    value={editFormData.gender}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, gender: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Complete Address *
                </label>
                <textarea
                  required
                  rows={2}
                  value={editFormData.address}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, address: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Highest Qualification
                </label>
                <input
                  type="text"
                  value={editFormData.qualification}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, qualification: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-600/20 transition-all disabled:opacity-50"
                >
                  {saving ? "Saving Changes..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUCCESS CREDENTIALS POPUP */}
      {successInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 text-center animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Student Account Created!</h3>
            <p className="text-xs text-slate-500 mt-1">
              Provide these login credentials to the student to access their Student Portal.
            </p>

            <div className="mt-4 p-4 rounded-xl bg-purple-50/70 border border-purple-200/60 text-left space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Student:</span>
                <span className="font-bold text-slate-800">{successInfo.student?.fullName}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Username (Mobile):</span>
                <span className="font-mono font-bold text-purple-700">
                  {successInfo.credentials?.username}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Initial Password:</span>
                <span className="font-mono font-bold text-purple-700">
                  {successInfo.credentials?.password}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={() =>
                  copyCreds(
                    successInfo.credentials?.username,
                    successInfo.credentials?.password
                  )
                }
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied!" : "Copy Credentials"}</span>
              </button>
              <button
                onClick={() => setSuccessInfo(null)}
                className="py-2 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
