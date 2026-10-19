"use client";

import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Search,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
  CheckCircle2,
  AlertCircle,
  FileText,
  CreditCard,
  Edit2,
  Key,
  UserX,
  UserCheck,
  RotateCcw,
  Copy,
  Check,
  Sparkles,
  Info,
} from "lucide-react";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("approved"); // default to active/approved

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDropModalOpen, setIsDropModalOpen] = useState(false);

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

  const [newPassword, setNewPassword] = useState("");
  const [dropReason, setDropReason] = useState("");

  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, [statusFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set("query", search);
      if (statusFilter) params.set("status", statusFilter);

      const res = await fetch(`/api/admin/students?${params.toString()}`);
      const data = await res.json();
      if (data.students) setStudents(data.students);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/admin/courses");
      const data = await res.json();
      if (data.courses) setCourses(data.courses.filter((c: any) => c.isActive));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
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
      fatherOrGuardianName: student.fatherOrGuardianName,
      dateOfBirth: student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split("T")[0] : "",
      gender: student.gender || "male",
      mobileNumber: student.mobileNumber,
      email: student.email || "",
      address: student.address,
      qualification: student.qualification || "",
    });
    setModalError(null);
    setIsEditModalOpen(true);
  };

  // Submit Edit Form
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
        setModalError(data.error || "Failed to update details.");
        setSaving(false);
        return;
      }

      setIsEditModalOpen(false);
      fetchStudents();
    } catch (err: any) {
      setModalError("Network error during update.");
    } finally {
      setSaving(false);
    }
  };

  // Open Password Modal
  const openPasswordModal = (student: any) => {
    setSelectedStudent(student);
    setNewPassword("QPET@" + student.mobileNumber.slice(-4));
    setModalError(null);
    setIsPasswordModalOpen(true);
  };

  // Submit Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setModalError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/admin/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent._id,
          action: "reset_password",
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error || "Failed to reset password.");
        setSaving(false);
        return;
      }

      setSuccessInfo({
        credentials: {
          username: data.username,
          password: data.newPassword,
        },
        student: selectedStudent,
        message: "Password updated successfully!",
      });
      setIsPasswordModalOpen(false);
      fetchStudents();
    } catch (err: any) {
      setModalError("Network error during password reset.");
    } finally {
      setSaving(false);
    }
  };

  // Open Drop Modal
  const openDropModal = (student: any) => {
    setSelectedStudent(student);
    setDropReason("");
    setModalError(null);
    setIsDropModalOpen(true);
  };

  // Submit Drop
  const handleDropStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setModalError(null);
    setSaving(true);

    try {
      const res = await fetch("/api/admin/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: selectedStudent._id,
          action: "drop",
          dropReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setModalError(data.error || "Failed to drop student.");
        setSaving(false);
        return;
      }

      setIsDropModalOpen(false);
      fetchStudents();
    } catch (err: any) {
      setModalError("Network error.");
    } finally {
      setSaving(false);
    }
  };

  // Reactivate Student
  const handleReactivate = async (student: any) => {
    if (!confirm(`Are you sure you want to reactivate ${student.fullName}?`)) return;

    try {
      const res = await fetch("/api/admin/students", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student._id,
          action: "reactivate",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to reactivate student.");
        return;
      }
      fetchStudents();
    } catch (err) {
      alert("Network error.");
    }
  };

  const copyCreds = (username: string, pass: string) => {
    navigator.clipboard.writeText(`QPET LMS Credentials:\nUsername/Mobile: ${username}\nPassword: ${pass}\nLogin: http://localhost:3005/login`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-teal-400" />
            Student Management & Profiles
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage student registrations, edit admission details, reset passwords, and track mid-course dropped students.
          </p>
        </div>

        <button
          onClick={() => {
            setSuccessInfo(null);
            setModalError(null);
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
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 shadow-sm shadow-teal-600/30 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Register New Student</span>
        </button>
      </div>

      {/* Filter Tabs: Active Students vs Inactive / Dropped Students vs All */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl w-fit">
        <button
          onClick={() => setStatusFilter("approved")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            statusFilter === "approved"
              ? "bg-teal-600 text-white shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Active Students</span>
        </button>

        <button
          onClick={() => setStatusFilter("dropped_or_inactive")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            statusFilter === "dropped_or_inactive"
              ? "bg-rose-950/60 text-rose-300 border border-rose-800/80 shadow-sm"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <UserX className="w-3.5 h-3.5" />
          <span>Inactive / Dropped Students</span>
        </button>

        <button
          onClick={() => setStatusFilter("")}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            statusFilter === ""
              ? "bg-slate-800 text-white"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <span>All Students</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by student name, mobile, email, or guardian..."
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
      </div>

      {/* Students Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800 font-semibold">
              <tr>
                <th className="py-3.5 px-4">Student Details</th>
                <th className="py-3.5 px-4">Contact Info</th>
                <th className="py-3.5 px-4">Guardian / Address</th>
                <th className="py-3.5 px-4">Active Course & Enr #</th>
                <th className="py-3.5 px-4">Status & Notes</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-normal">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    Loading student records...
                  </td>
                </tr>
              ) : students.length > 0 ? (
                students.map((st) => (
                  <tr key={st._id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white text-sm">{st.fullName}</p>
                      <span className="text-[11px] text-slate-400 capitalize">
                        {st.gender || "Gender unspecified"}
                        {st.qualification ? ` • ${st.qualification}` : ""}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-200">
                        <Phone className="w-3.5 h-3.5 text-teal-400" />
                        <span>{st.mobileNumber}</span>
                      </div>
                      {st.email && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                          <Mail className="w-3.5 h-3.5 text-slate-500" />
                          <span>{st.email}</span>
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-slate-300 font-medium">{st.fatherOrGuardianName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{st.address}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      {st.enrollments && st.enrollments.length > 0 ? (
                        <div className="space-y-1">
                          {st.enrollments.map((e: any) => (
                            <div key={e._id} className="flex items-center gap-1.5">
                              <span className="font-mono text-teal-300 font-semibold text-[11px]">
                                {e.enrollmentNumber}
                              </span>
                              <span className="text-slate-400 text-[11px] truncate max-w-[120px]">
                                ({e.courseNameSnapshot})
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">No enrollments</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            st.registrationStatus === "approved"
                              ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                              : st.registrationStatus === "dropped" || st.registrationStatus === "inactive"
                              ? "bg-rose-500/10 text-rose-300 border-rose-500/20"
                              : "bg-amber-500/10 text-amber-300 border-amber-500/20"
                          }`}
                        >
                          {st.registrationStatus}
                        </span>
                        {st.dropReason && (
                          <p className="text-[10px] text-rose-300 truncate max-w-[150px]" title={st.dropReason}>
                            Reason: {st.dropReason}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">
                        {/* Edit Button */}
                        <button
                          onClick={() => openEditModal(st)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1"
                          title="Edit Student Details"
                        >
                          <Edit2 className="w-3 h-3 text-teal-400" />
                          <span>Edit</span>
                        </button>

                        {/* Reset Password Button */}
                        <button
                          onClick={() => openPasswordModal(st)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex items-center gap-1"
                          title="Reset Login Password"
                        >
                          <Key className="w-3 h-3 text-amber-400" />
                          <span>Password</span>
                        </button>

                        {/* Drop / Reactivate Button */}
                        {st.registrationStatus === "dropped" || st.registrationStatus === "inactive" ? (
                          <button
                            onClick={() => handleReactivate(st)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800 transition-colors flex items-center gap-1"
                            title="Reactivate Student"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reactivate</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => openDropModal(st)}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800 transition-colors flex items-center gap-1"
                            title="Mark as Dropped / Inactive"
                          >
                            <UserX className="w-3 h-3" />
                            <span>Drop</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No student records found matching filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Student Details Modal */}
      {isEditModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-teal-400" />
                Edit Student Details: {selectedStudent.fullName}
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Full Legal Name *</label>
                  <input
                    type="text"
                    value={editFormData.fullName}
                    onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Father / Guardian Name *</label>
                  <input
                    type="text"
                    value={editFormData.fatherOrGuardianName}
                    onChange={(e) => setEditFormData({ ...editFormData, fatherOrGuardianName: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    value={editFormData.mobileNumber}
                    onChange={(e) => setEditFormData({ ...editFormData, mobileNumber: e.target.value })}
                    required
                    className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Gender</label>
                  <select
                    value={editFormData.gender}
                    onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={editFormData.dateOfBirth}
                    onChange={(e) => setEditFormData({ ...editFormData, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Qualification</label>
                  <input
                    type="text"
                    value={editFormData.qualification}
                    onChange={(e) => setEditFormData({ ...editFormData, qualification: e.target.value })}
                    placeholder="e.g. 12th Pass, Graduate"
                    className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Complete Address *</label>
                <textarea
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  rows={2}
                  required
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {isPasswordModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                Change Student Password
              </h2>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
              <p className="text-white font-bold">{selectedStudent.fullName}</p>
              <p className="text-slate-400 font-mono">Login Mobile: {selectedStudent.mobileNumber}</p>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
                {modalError}
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-slate-300 font-medium">New Password *</label>
                  <button
                    type="button"
                    onClick={() => {
                      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
                      let r = "";
                      for (let i = 0; i < 4; i++) r += chars.charAt(Math.floor(Math.random() * chars.length));
                      setNewPassword(`QPET#${r}`);
                    }}
                    className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Auto-Generate
                  </button>
                </div>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Minimum 6 characters"
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
                >
                  {saving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mark Dropped / Inactive Modal */}
      {isDropModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <UserX className="w-5 h-5 text-rose-400" />
                Mark Student as Dropped / Inactive
              </h2>
              <button
                onClick={() => setIsDropModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Agar <strong>{selectedStudent.fullName}</strong> ne beech me hi course chhod diya hai, toh unhe Inactive / Dropped mark karein. Unke past fee aur receipt records database me safe rahenge.
            </p>

            {modalError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
                {modalError}
              </div>
            )}

            <form onSubmit={handleDropStudent} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">
                  Reason for Dropping Course *
                </label>
                <textarea
                  value={dropReason}
                  onChange={(e) => setDropReason(e.target.value)}
                  required
                  rows={3}
                  placeholder="e.g. Left after 1 month due to relocation / financial reasons"
                  className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDropModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all"
                >
                  {saving ? "Processing..." : "Confirm Drop"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Direct Add Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-teal-400" />
                Admin Student Direct Registration
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-4">
              {modalError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300">
                  {modalError}
                </div>
              )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Father / Guardian Name *
                    </label>
                    <input
                      type="text"
                      name="fatherOrGuardianName"
                      value={formData.fatherOrGuardianName}
                      onChange={(e) => setFormData({ ...formData, fatherOrGuardianName: e.target.value })}
                      required
                      placeholder="e.g. Suresh Kumar"
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Mobile Number * (Username)
                    </label>
                    <input
                      type="tel"
                      name="mobileNumber"
                      value={formData.mobileNumber}
                      onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                      required
                      placeholder="10 digit mobile"
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="email@example.com"
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950/60 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Login Credentials Setup */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-teal-300 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5" />
                      Student Login Password
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const last4 = formData.mobileNumber ? formData.mobileNumber.trim().slice(-4) : "1234";
                          setFormData({ ...formData, password: `QPET@${last4}` });
                        }}
                        className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium"
                      >
                        Default (QPET@last4)
                      </button>
                      <span className="text-slate-600">•</span>
                      <button
                        type="button"
                        onClick={() => {
                          const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
                          let r = "";
                          for (let i = 0; i < 4; i++) r += chars.charAt(Math.floor(Math.random() * chars.length));
                          setFormData({ ...formData, password: `QPET#${r}` });
                        }}
                        className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium"
                      >
                        <Sparkles className="w-3 h-3" />
                        Auto-Generate
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={`Leave empty for default QPET@${formData.mobileNumber ? formData.mobileNumber.trim().slice(-4) : "<last4>"}`}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <p className="text-[11px] text-slate-400">
                    If left blank, student's password will be:{" "}
                    <span className="text-teal-300 font-mono font-semibold">
                      QPET@{formData.mobileNumber && formData.mobileNumber.trim().length >= 4 ? formData.mobileNumber.trim().slice(-4) : "XXXX"}
                    </span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Complete Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    required
                    rows={2}
                    placeholder="Residential address"
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  />
                </div>

                {/* Immediate Course Enrollment */}
                <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-semibold text-teal-300 uppercase tracking-wider">
                    Immediate Course Enrollment (Optional)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Select Course
                      </label>
                      <select
                        name="courseId"
                        value={formData.courseId}
                        onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      >
                        <option value="">-- No Enrollment Now --</option>
                        {courses.map((c) => (
                          <option key={c._id} value={c._id}>
                            {c.title} ({c.code}) — ₹{c.defaultFee}
                          </option>
                        ))}
                      </select>
                    </div>

                    {formData.courseId && (
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Agreed Course Fee (INR)
                        </label>
                        <input
                          type="number"
                          name="customFee"
                          value={formData.customFee}
                          onChange={(e) => setFormData({ ...formData, customFee: e.target.value })}
                          placeholder="Course default fee"
                          className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
                  >
                    {saving ? "Registering..." : "Register Student"}
                  </button>
                </div>
              </form>
          </div>
        </div>
      )}

      {/* Universal Credentials / Success Modal (For both Add Student & Password Reset) */}
      {successInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white">
                {successInfo.message || "Student Account Activated!"}
              </h2>
              <p className="text-xs text-slate-400">
                Official student login credentials have been saved.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Student Name:</span>
                <span className="text-white font-bold">{successInfo.student?.fullName}</span>
              </div>
              {successInfo.enrollment && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Enrollment No:</span>
                  <span className="text-teal-400 font-mono font-bold">
                    {successInfo.enrollment.enrollmentNumber}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Login Mobile:</span>
                <span className="text-white font-mono font-semibold">
                  {successInfo.credentials?.username}
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-800">
                <span className="text-slate-400">Password:</span>
                <span className="text-emerald-300 font-mono font-bold text-sm bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {successInfo.credentials?.password}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                onClick={() => copyCreds(successInfo.credentials?.username, successInfo.credentials?.password)}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied!" : "Copy Credentials"}</span>
              </button>
              <button
                type="button"
                onClick={() => setSuccessInfo(null)}
                className="px-6 py-2.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white transition-colors"
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
