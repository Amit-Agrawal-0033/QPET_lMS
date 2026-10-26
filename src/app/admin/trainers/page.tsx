"use client";

import { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  UserX,
  Shield,
  KeyRound,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Edit2,
  Trash2,
  Lock,
  Eye,
  EyeOff,
  Filter,
  Check,
  ShieldAlert,
  GraduationCap,
  Sparkles,
} from "lucide-react";

interface ITrainer {
  _id: string;
  name: string;
  identifier: string;
  email?: string;
  mobileNumber?: string;
  status: "active" | "inactive";
  permissions: Record<string, boolean>;
  lastLogin?: string;
  createdAt: string;
}

const AVAILABLE_PERMISSIONS = [
  { key: "viewStudents", label: "View Students", group: "Students" },
  { key: "editStudents", label: "Edit / Add Students", group: "Students" },
  { key: "viewRegistrations", label: "View Registrations", group: "Registrations" },
  { key: "editRegistrations", label: "Approve Registrations", group: "Registrations" },
  { key: "viewCourses", label: "View Courses", group: "Curriculum" },
  { key: "editCourses", label: "Create / Edit Courses", group: "Curriculum" },
  { key: "viewEnrollments", label: "View Enrollments", group: "Enrollments" },
  { key: "editEnrollments", label: "Manage Enrollments", group: "Enrollments" },
  { key: "viewFees", label: "View Fee Ledger", group: "Fees & Accounts" },
  { key: "editFees", label: "Collect / Record Fees", group: "Fees & Accounts" },
  { key: "viewReceipts", label: "View Receipts", group: "Fees & Accounts" },
  { key: "viewCertificates", label: "View Certificates", group: "Certificates" },
  { key: "generateCertificates", label: "Generate Certificate", group: "Certificates" },
  { key: "editCertificates", label: "Issue / Edit Certificates", group: "Certificates" },
  { key: "viewReports", label: "View Reports & Export", group: "Reports" },
  { key: "viewAuditReports", label: "View Audit Reports", group: "Security & Auditing" },
];

export default function TrainersManagementPage() {
  const [trainers, setTrainers] = useState<ITrainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<ITrainer | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    identifier: "",
    email: "",
    mobileNumber: "",
    password: "",
    status: "active" as "active" | "inactive",
    permissions: {} as Record<string, boolean>,
  });
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Password Reset Modal
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetTrainer, setResetTrainer] = useState<ITrainer | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/trainers");
      const data = await res.json();
      if (res.ok) {
        setTrainers(data.trainers || []);
      } else {
        setNotification({ type: "error", message: data.error || "Failed to load trainers." });
      }
    } catch {
      setNotification({ type: "error", message: "Network error loading trainer accounts." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const openCreateModal = () => {
    setEditingTrainer(null);
    setFormData({
      name: "",
      identifier: "",
      email: "",
      mobileNumber: "",
      password: "",
      status: "active",
      permissions: {
        viewStudents: true,
        viewCourses: true,
        viewEnrollments: true,
        viewCertificates: true,
      },
    });
    setModalOpen(true);
  };

  const openEditModal = (trainer: ITrainer) => {
    setEditingTrainer(trainer);
    setFormData({
      name: trainer.name,
      identifier: trainer.identifier,
      email: trainer.email || "",
      mobileNumber: trainer.mobileNumber || "",
      password: "",
      status: trainer.status,
      permissions: trainer.permissions || {},
    });
    setModalOpen(true);
  };

  const handleTogglePermission = (key: string) => {
    setFormData((prev) => {
      const nextVal = !prev.permissions[key];
      const updated = {
        ...prev.permissions,
        [key]: nextVal,
      };
      if (key === "generateCertificates") {
        updated.editCertificates = nextVal;
        if (nextVal) updated.viewCertificates = true;
      }
      return {
        ...prev,
        permissions: updated,
      };
    });
  };

  const applyPreset = (preset: "standard" | "readOnly" | "full") => {
    let perms: Record<string, boolean> = {};
    if (preset === "standard") {
      perms = {
        viewStudents: true,
        viewCourses: true,
        viewEnrollments: true,
        editEnrollments: true,
        viewCertificates: true,
        viewReports: true,
      };
    } else if (preset === "readOnly") {
      perms = {
        viewStudents: true,
        viewRegistrations: true,
        viewCourses: true,
        viewEnrollments: true,
        viewFees: true,
        viewReceipts: true,
        viewCertificates: true,
        viewReports: true,
      };
    } else if (preset === "full") {
      AVAILABLE_PERMISSIONS.forEach((p) => {
        perms[p.key] = true;
      });
    }
    setFormData((prev) => ({ ...prev, permissions: perms }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setNotification(null);

    try {
      const isEdit = !!editingTrainer;
      const url = "/api/admin/trainers";
      const method = isEdit ? "PATCH" : "POST";
      const payload: any = {
        ...formData,
      };

      if (isEdit) {
        payload.id = editingTrainer._id;
        if (!payload.password) delete payload.password;
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setNotification({ type: "error", message: data.error || "Operation failed." });
        setSubmitting(false);
        return;
      }

      setNotification({
        type: "success",
        message: isEdit
          ? `Trainer "${formData.name}" updated successfully.`
          : `Trainer "${formData.name}" created successfully.`,
      });
      setModalOpen(false);
      fetchTrainers();
    } catch {
      setNotification({ type: "error", message: "An unexpected network error occurred." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (trainer: ITrainer) => {
    const newStatus = trainer.status === "active" ? "inactive" : "active";
    try {
      const res = await fetch("/api/admin/trainers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: trainer._id, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({
          type: "success",
          message: `Trainer "${trainer.name}" ${newStatus === "active" ? "activated" : "deactivated"}.`,
        });
        fetchTrainers();
      } else {
        setNotification({ type: "error", message: data.error || "Status update failed." });
      }
    } catch {
      setNotification({ type: "error", message: "Failed to update trainer status." });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTrainer || !newPassword || newPassword.length < 6) {
      setNotification({ type: "error", message: "Password must be at least 6 characters." });
      return;
    }

    try {
      const res = await fetch("/api/admin/trainers", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: resetTrainer._id, password: newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        setNotification({
          type: "success",
          message: `Password reset successfully for ${resetTrainer.name}.`,
        });
        setResetModalOpen(false);
        setNewPassword("");
      } else {
        setNotification({ type: "error", message: data.error || "Password reset failed." });
      }
    } catch {
      setNotification({ type: "error", message: "Network error during password reset." });
    }
  };

  const handleDelete = async (trainer: ITrainer) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete trainer account "${trainer.name}" (${trainer.identifier})? This action will be recorded in audit logs.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/trainers?id=${trainer._id}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok) {
        setNotification({ type: "success", message: `Trainer account "${trainer.name}" deleted.` });
        fetchTrainers();
      } else {
        setNotification({ type: "error", message: data.error || "Failed to delete trainer." });
      }
    } catch {
      setNotification({ type: "error", message: "Network error deleting trainer." });
    }
  };

  // Filtered List
  const filteredTrainers = trainers.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.identifier.toLowerCase().includes(search.toLowerCase()) ||
      (t.email && t.email.toLowerCase().includes(search.toLowerCase())) ||
      (t.mobileNumber && t.mobileNumber.includes(search));
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = trainers.filter((t) => t.status === "active").length;
  const inactiveCount = trainers.filter((t) => t.status === "inactive").length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/60">
              <Shield className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Trainer Management & Permissions
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Create and govern faculty accounts, assign granular module permissions, and manage credentials.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Trainer</span>
        </button>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-start justify-between gap-3 ${
            notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-900"
              : "bg-rose-50 border-rose-200 text-rose-900"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Faculty Trainers</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{trainers.length}</p>
          <p className="text-[11px] text-slate-400 mt-1">Authorized instructional personnel</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Active Accounts</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">{activeCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Can log in & manage authorized sections</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Deactivated</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <UserX className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 mt-2">{inactiveCount}</p>
          <p className="text-[11px] text-slate-400 mt-1">Access immediately blocked</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or ID..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <div className="grid grid-cols-3 p-1 bg-slate-100 rounded-xl text-xs font-medium w-full sm:w-auto">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === "all" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              All ({trainers.length})
            </button>
            <button
              onClick={() => setStatusFilter("active")}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === "active" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter("inactive")}
              className={`px-3 py-1 rounded-lg transition-all ${
                statusFilter === "inactive" ? "bg-white text-slate-900 shadow-xs font-bold" : "text-slate-500 hover:text-slate-900"
              }`}
            >
              Inactive ({inactiveCount})
            </button>
          </div>
        </div>
      </div>

      {/* Trainers Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading faculty accounts...</div>
        ) : filteredTrainers.length === 0 ? (
          <div className="p-12 text-center">
            <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">No trainers found</p>
            <p className="text-xs text-slate-400 mt-1">
              {search ? "No matching records for your search." : "Click '+ Add New Trainer' to create faculty accounts."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Trainer / Faculty</th>
                  <th className="py-3.5 px-4">Identifier / Contact</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Assigned Permissions</th>
                  <th className="py-3.5 px-4">Last Login</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredTrainers.map((t) => {
                  const permKeys = Object.keys(t.permissions || {}).filter((k) => t.permissions[k]);
                  return (
                    <tr key={t._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0 uppercase">
                            {t.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{t.name}</p>
                            <span className="inline-block text-[10px] px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 font-semibold border border-purple-200/60 mt-0.5">
                              Faculty Trainer
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        <p className="font-mono text-slate-800 font-medium">{t.identifier}</p>
                        <p className="text-[11px] text-slate-400">
                          {t.email || t.mobileNumber || "No secondary contact"}
                        </p>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            t.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                              : "bg-rose-50 text-rose-700 border border-rose-200/70"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              t.status === "active" ? "bg-emerald-500" : "bg-rose-500"
                            }`}
                          />
                          {t.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {permKeys.length === 0 ? (
                            <span className="text-[10px] text-slate-400 italic">No permissions granted</span>
                          ) : (
                            <>
                              {permKeys.slice(0, 3).map((pk) => {
                                const found = AVAILABLE_PERMISSIONS.find((p) => p.key === pk);
                                return (
                                  <span
                                    key={pk}
                                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200/80"
                                  >
                                    {found?.label || pk}
                                  </span>
                                );
                              })}
                              {permKeys.length > 3 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-700 font-bold">
                                  +{permKeys.length - 3} more
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-slate-500 text-[11px]">
                        {t.lastLogin
                          ? new Date(t.lastLogin).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Never logged in"}
                      </td>

                      <td className="py-4 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Toggle Active Status */}
                          <button
                            onClick={() => handleToggleStatus(t)}
                            title={t.status === "active" ? "Deactivate Trainer" : "Activate Trainer"}
                            className={`p-1.5 rounded-lg border transition-all ${
                              t.status === "active"
                                ? "text-amber-600 hover:bg-amber-50 border-amber-200"
                                : "text-emerald-600 hover:bg-emerald-50 border-emerald-200"
                            }`}
                          >
                            {t.status === "active" ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>

                          {/* Edit Details & Permissions */}
                          <button
                            onClick={() => openEditModal(t)}
                            title="Edit Permissions & Details"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Reset Password */}
                          <button
                            onClick={() => {
                              setResetTrainer(t);
                              setNewPassword("");
                              setResetModalOpen(true);
                            }}
                            title="Reset Password"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Account */}
                          <button
                            onClick={() => handleDelete(t)}
                            title="Delete Trainer"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* CREATE / EDIT TRAINER MODAL                                               */}
      {/* ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-100 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {editingTrainer ? `Edit Trainer: ${editingTrainer.name}` : "Create New Trainer Account"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Define credentials and assign granular module permissions.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Trainer Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Login Identifier (Email / ID) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.identifier}
                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                    placeholder="e.g. rahul@qpet.in or TR01"
                    disabled={!!editingTrainer}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Official Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. rahul@qpet.in"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Mobile Number (Optional)
                  </label>
                  <input
                    type="tel"
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Password Field (Required for new, optional for edit) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {editingTrainer ? "New Password (Leave blank to keep unchanged)" : "Password *"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingTrainer ? "••••••••" : "Minimum 6 characters"}
                    required={!editingTrainer}
                    minLength={6}
                    className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">Account Status</span>
                  <span className="text-[11px] text-slate-400">
                    Active accounts can log in; deactivated accounts are locked out immediately.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: "active" })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      formData.status === "active"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white text-slate-600 border border-slate-200"
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, status: "inactive" })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      formData.status === "inactive"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-white text-slate-600 border border-slate-200"
                    }`}
                  >
                    Inactive
                  </button>
                </div>
              </div>

              {/* Permissions Control Header & Quick Presets */}
              <div className="border-t border-slate-100 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Module Access & Permissions
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Grant or revoke specific capabilities for this trainer.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Presets:</span>
                    <button
                      type="button"
                      onClick={() => applyPreset("standard")}
                      className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      Instructor
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset("readOnly")}
                      className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 hover:bg-slate-200 text-slate-700"
                    >
                      Read Only
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset("full")}
                      className="px-2 py-0.5 text-[10px] font-bold rounded bg-purple-100 hover:bg-purple-200 text-purple-800"
                    >
                      Full Staff
                    </button>
                  </div>
                </div>

                {/* Granular Permission Checkboxes Grouped */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {AVAILABLE_PERMISSIONS.map((perm) => {
                    const isChecked = !!formData.permissions[perm.key];
                    const isAudit = perm.key === "viewAuditReports";
                    return (
                      <label
                        key={perm.key}
                        onClick={() => handleTogglePermission(perm.key)}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all select-none ${
                          isChecked
                            ? isAudit
                              ? "bg-amber-50/80 border-amber-300 text-amber-950"
                              : "bg-blue-50/70 border-blue-200 text-blue-950"
                            : "bg-white border-slate-200/80 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 transition-colors ${
                            isChecked
                              ? isAudit
                                ? "bg-amber-600 text-white"
                                : "bg-blue-600 text-white"
                              : "border border-slate-300 bg-white"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold">{perm.label}</span>
                            <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-slate-100 text-slate-500 font-medium">
                              {perm.group}
                            </span>
                          </div>
                          {isAudit && (
                            <p className="text-[10px] text-amber-700 mt-0.5 font-medium flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3 shrink-0" />
                              Allows viewing system audit reports & staff activity logs.
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 shadow-sm shadow-blue-500/25 transition-all cursor-pointer"
                >
                  {submitting
                    ? "Saving..."
                    : editingTrainer
                    ? "Save Trainer Permissions"
                    : "Create Trainer Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUICK PASSWORD RESET MODAL                                               */}
      {/* ========================================================================= */}
      {resetModalOpen && resetTrainer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Reset Password</h3>
                <p className="text-xs text-slate-400">For {resetTrainer.name} ({resetTrainer.identifier})</p>
              </div>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  New Secure Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  required
                  minLength={6}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setResetModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
