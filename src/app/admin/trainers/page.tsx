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
  BookOpen,
  Award,
  FileCheck2,
  FileSpreadsheet,
  CheckSquare,
  Square,
  HelpCircle,
} from "lucide-react";
import {
  PERMISSION_MATRIX,
  MODULE_DEFINITIONS,
  PERMISSION_PRESETS,
} from "@/lib/auth/permissions";

interface ITrainer {
  _id: string;
  name: string;
  identifier: string;
  email?: string;
  mobileNumber?: string;
  status: "active" | "inactive";
  permissions: Record<string, boolean>;
  permissionsUpdatedAt?: string;
  permissionsUpdatedBy?: string;
  permissionPreset?: string;
  lastLogin?: string;
  createdAt: string;
}

const AVAILABLE_PERMISSIONS = [
  { key: "viewStudents", label: "View Students", group: "Students", description: "Access student profiles & contact records" },
  { key: "editStudents", label: "Edit / Add Students", group: "Students", description: "Update student details and record changes" },
  { key: "viewRegistrations", label: "View Registrations", group: "Registrations", description: "View admission registration forms" },
  { key: "editRegistrations", label: "Approve Registrations", group: "Registrations", description: "Review and approve student admissions" },
  { key: "viewCourses", label: "View Courses", group: "Curriculum", description: "Access course syllabus and outlines" },
  { key: "editCourses", label: "Create / Edit Courses", group: "Curriculum", description: "Modify syllabus modules and details" },
  { key: "viewEnrollments", label: "View Enrollments", group: "Enrollments", description: "View student course enrollment rosters" },
  { key: "editEnrollments", label: "Manage Enrollments", group: "Enrollments", description: "Assign batches and course enrollments" },
  { key: "viewFees", label: "View Fee Ledger", group: "Fees & Accounts", description: "View student fee agreement ledger" },
  { key: "editFees", label: "Collect / Record Fees", group: "Fees & Accounts", description: "Record student installment payments" },
  { key: "viewReceipts", label: "View Receipts", group: "Fees & Accounts", description: "Access official payment receipts" },
  { key: "viewCertificates", label: "View Certificates", group: "Certificates", description: "View issued certificates and verify QR" },
  { key: "generateCertificates", label: "Generate Certificate", group: "Certificates", description: "Issue official course completion certificates" },
  { key: "editCertificates", label: "Issue / Edit Certificates", group: "Certificates", description: "Modify certificate details or mark revoked" },
  { key: "viewReports", label: "View Reports & Export", group: "Reports", description: "View academic reports and exports" },
  { key: "viewAuditReports", label: "View Audit Reports", group: "Security & Auditing", description: "Access immutable security audit trail" },
];

export default function TrainersManagementPage() {
  const [trainers, setTrainers] = useState<ITrainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Tab switcher: "trainers" vs "matrix"
  const [activeTab, setActiveTab] = useState<"trainers" | "matrix">("trainers");

  // In-modal permissions filter
  const [permFilter, setPermFilter] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string>("custom");

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
    setPermFilter("");
    setSelectedPreset("trainerStandard");
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
    setPermFilter("");
    setSelectedPreset(trainer.permissionPreset || "custom");
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
    setSelectedPreset("custom");
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

  const handleModuleSelectAll = (groupName: string, selectAll: boolean) => {
    setSelectedPreset("custom");
    setFormData((prev) => {
      const updated = { ...prev.permissions };
      AVAILABLE_PERMISSIONS.filter((p) => p.group === groupName).forEach((p) => {
        updated[p.key] = selectAll;
      });
      return { ...prev, permissions: updated };
    });
  };

  const handleGlobalSelectAll = (selectAll: boolean) => {
    setSelectedPreset(selectAll ? "fullFaculty" : "clearAll");
    setFormData((prev) => {
      const updated: Record<string, boolean> = {};
      AVAILABLE_PERMISSIONS.forEach((p) => {
        updated[p.key] = selectAll;
      });
      return { ...prev, permissions: updated };
    });
  };

  const applyPreset = (presetKey: "readOnly" | "trainerStandard" | "academicLead" | "fullFaculty" | "clearAll") => {
    if (presetKey === "clearAll") {
      handleGlobalSelectAll(false);
      return;
    }
    const presetObj = PERMISSION_PRESETS[presetKey];
    if (presetObj) {
      setFormData((prev) => ({
        ...prev,
        permissions: { ...presetObj.permissions },
      }));
      setSelectedPreset(presetKey);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setNotification(null);

    const isEdit = !!editingTrainer;
    const url = "/api/admin/trainers";
    const method = isEdit ? "PATCH" : "POST";

    try {
      const payload: any = {
        ...formData,
        permissionPreset: selectedPreset,
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
          ? `Permissions & details for "${formData.name}" saved successfully. Real-time enforcement is now active.`
          : `Trainer account "${formData.name}" created successfully.`,
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
        setNotification({ type: "error", message: data.error || "Delete failed." });
      }
    } catch {
      setNotification({ type: "error", message: "Failed to delete trainer." });
    }
  };

  // Filtered trainers list
  const filteredTrainers = trainers.filter((t) => {
    const matchesSearch =
      (t.name || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.identifier || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.email || "").toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = trainers.filter((t) => t.status === "active").length;
  const inactiveCount = trainers.filter((t) => t.status === "inactive").length;

  // Grouped permissions for modal
  const permissionGroups = Array.from(new Set(AVAILABLE_PERMISSIONS.map((p) => p.group)));

  // Count active permissions in form
  const grantedCount = Object.values(formData.permissions || {}).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/60">
              <KeyRound className="w-4 h-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Role & Permission Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Centralized RBAC administration: Govern faculty credentials, assign granular module permissions, and enforce real-time security.
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

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-1">
        <button
          onClick={() => setActiveTab("trainers")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "trainers"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Faculty Accounts ({trainers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab("matrix")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === "matrix"
              ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Permission Matrix Overview</span>
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

      {/* ========================================================================= */}
      {/* TAB 1: TRAINER ACCOUNTS VIEW                                              */}
      {/* ========================================================================= */}
      {activeTab === "trainers" && (
        <>
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
              <p className="text-[11px] text-slate-400 mt-1">Immediate dashboard & API clearance</p>
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
                      <th className="py-3.5 px-4">Permissions Granted</th>
                      <th className="py-3.5 px-4">Governance Audit</th>
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
                            <div>
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <span className="font-bold text-[11px] text-slate-800">
                                  {permKeys.length} of {AVAILABLE_PERMISSIONS.length} Enabled
                                </span>
                                {t.permissionPreset && (
                                  <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-700">
                                    {t.permissionPreset}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap gap-1 max-w-xs">
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
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-4 text-slate-500 text-[11px]">
                            {t.permissionsUpdatedAt ? (
                              <div>
                                <span className="font-medium text-slate-700 block">
                                  {new Date(t.permissionsUpdatedAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  by {t.permissionsUpdatedBy || "Admin"}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Initial Setup</span>
                            )}
                          </td>

                          <td className="py-4 px-4 sm:px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Manage Permissions Button */}
                              <button
                                onClick={() => openEditModal(t)}
                                title="Configure Module Permissions"
                                className="px-2.5 py-1.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                                <span>Permissions</span>
                              </button>

                              {/* Toggle Active Status */}
                              <button
                                onClick={() => handleToggleStatus(t)}
                                title={t.status === "active" ? "Deactivate Trainer" : "Activate Trainer"}
                                className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                                  t.status === "active"
                                    ? "text-amber-600 hover:bg-amber-50 border-amber-200"
                                    : "text-emerald-600 hover:bg-emerald-50 border-emerald-200"
                                }`}
                              >
                                {t.status === "active" ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                              </button>

                              {/* Edit Details */}
                              <button
                                onClick={() => openEditModal(t)}
                                title="Edit Trainer Account"
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
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
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-blue-600 transition-colors cursor-pointer"
                              >
                                <Lock className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Account */}
                              <button
                                onClick={() => handleDelete(t)}
                                title="Delete Trainer"
                                className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ROLE & PERMISSION MATRIX OVERVIEW                                  */}
      {/* ========================================================================= */}
      {activeTab === "matrix" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-4 h-4 text-blue-600" />
                Institutional Permission Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of module clearances across all trainers. Changes take effect on the very next request.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg font-semibold">
                <Check className="w-3.5 h-3.5" /> Granted
              </span>
              <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg font-semibold">
                <span className="w-3 h-0.5 bg-slate-400 block" /> Restricted
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 sticky left-0 bg-slate-50 z-10 shadow-xs">Faculty Trainer</th>
                  <th className="py-3.5 px-3 text-center">Students</th>
                  <th className="py-3.5 px-3 text-center">Curriculum</th>
                  <th className="py-3.5 px-3 text-center">Enrollments</th>
                  <th className="py-3.5 px-3 text-center">Registrations</th>
                  <th className="py-3.5 px-3 text-center">Certificates</th>
                  <th className="py-3.5 px-3 text-center">Reports</th>
                  <th className="py-3.5 px-3 text-center bg-amber-50/50">Audit Logs</th>
                  <th className="py-3.5 px-4 text-right">Configure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {trainers.map((t) => {
                  const p = t.permissions || {};
                  return (
                    <tr key={t._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-4 sticky left-0 bg-white z-10 font-bold text-slate-900 border-r border-slate-100">
                        <div>
                          <span>{t.name}</span>
                          <span className="block text-[10px] text-slate-400 font-mono font-normal">
                            {t.identifier}
                          </span>
                        </div>
                      </td>

                      {/* Students */}
                      <td className="py-4 px-3 text-center">
                        {p.viewStudents ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 text-slate-300 font-bold">-</span>
                        )}
                      </td>

                      {/* Curriculum */}
                      <td className="py-4 px-3 text-center">
                        {p.viewCourses ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 text-slate-300 font-bold">-</span>
                        )}
                      </td>

                      {/* Enrollments */}
                      <td className="py-4 px-3 text-center">
                        {p.viewEnrollments ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 text-slate-300 font-bold">-</span>
                        )}
                      </td>

                      {/* Registrations */}
                      <td className="py-4 px-3 text-center">
                        {p.viewRegistrations ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 text-slate-300 font-bold">-</span>
                        )}
                      </td>

                      {/* Certificates */}
                      <td className="py-4 px-3 text-center">
                        {p.viewCertificates ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 text-slate-300 font-bold">-</span>
                        )}
                      </td>

                      {/* Reports */}
                      <td className="py-4 px-3 text-center">
                        {p.viewReports ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700">
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 text-slate-300 font-bold">-</span>
                        )}
                      </td>

                      {/* Audit Logs */}
                      <td className="py-4 px-3 text-center bg-amber-50/20">
                        {p.viewAuditReports ? (
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-100 text-amber-700">
                            <ShieldAlert className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center w-6 h-6 text-slate-300 font-bold">-</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => openEditModal(t)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors cursor-pointer"
                        >
                          Configure
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* CENTRALIZED ROLE & PERMISSION MANAGEMENT MODAL                             */}
      {/* ========================================================================= */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                    {editingTrainer ? `Configure Permissions: ${editingTrainer.name}` : "Create New Trainer Account"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Define account credentials and assign granular module permissions.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1">
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
                    placeholder="e.g. Roshni Bajpai"
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
                    placeholder="e.g. roshni.bajpai@qpet.in"
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
                    placeholder="e.g. roshni.bajpai@qpet.in"
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

              {/* Password Field */}
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
              <div className="border-t border-slate-100 pt-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-blue-600" />
                      Granular Module Permissions
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {grantedCount} of {AVAILABLE_PERMISSIONS.length} Permissions Granted • Real-time server enforcement
                    </p>
                  </div>

                  {/* Permission Presets Bar */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Presets:</span>
                    <button
                      type="button"
                      onClick={() => applyPreset("trainerStandard")}
                      className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        selectedPreset === "trainerStandard"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      Standard Trainer
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset("readOnly")}
                      className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        selectedPreset === "readOnly"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      Read Only
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset("academicLead")}
                      className={`px-2 py-1 text-[10px] font-bold rounded-lg transition-all cursor-pointer ${
                        selectedPreset === "academicLead"
                          ? "bg-blue-600 text-white shadow-xs"
                          : "bg-purple-100 hover:bg-purple-200 text-purple-800"
                      }`}
                    >
                      Academic Lead
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset("clearAll")}
                      className="px-2 py-1 text-[10px] font-bold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                {/* In-Modal Filter & Global Actions */}
                <div className="flex items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={permFilter}
                      onChange={(e) => setPermFilter(e.target.value)}
                      placeholder="Filter module permissions..."
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleGlobalSelectAll(true)}
                      className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => handleGlobalSelectAll(false)}
                      className="text-[11px] font-bold text-slate-500 hover:text-slate-700 cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                </div>

                {/* Security Warning if Audit Reports is checked */}
                {formData.permissions.viewAuditReports && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-300/80 text-amber-900 text-xs flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Security Audit Clearance Enabled</span>
                      <p className="text-[11px] leading-relaxed text-amber-800">
                        This trainer will have visibility over institutional security audit trails, login records, and staff activity.
                      </p>
                    </div>
                  </div>
                )}

                {/* Grouped Permissions Matrix */}
                <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                  {permissionGroups.map((group) => {
                    const groupPerms = AVAILABLE_PERMISSIONS.filter((p) => {
                      const matchesGroup = p.group === group;
                      const matchesSearch =
                        !permFilter ||
                        p.label.toLowerCase().includes(permFilter.toLowerCase()) ||
                        p.description.toLowerCase().includes(permFilter.toLowerCase());
                      return matchesGroup && matchesSearch;
                    });

                    if (groupPerms.length === 0) return null;

                    const allGroupChecked = groupPerms.every((p) => formData.permissions[p.key]);

                    return (
                      <div key={group} className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
                        <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-200">
                          <span className="font-bold text-xs text-slate-800">{group}</span>
                          <button
                            type="button"
                            onClick={() => handleModuleSelectAll(group, !allGroupChecked)}
                            className="text-[11px] font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                          >
                            {allGroupChecked ? "Clear Group" : "Select Group"}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {groupPerms.map((perm) => {
                            const isChecked = !!formData.permissions[perm.key];
                            const isAudit = perm.key === "viewAuditReports";
                            return (
                              <label
                                key={perm.key}
                                onClick={() => handleTogglePermission(perm.key)}
                                className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all select-none ${
                                  isChecked
                                    ? isAudit
                                      ? "bg-amber-50 border-amber-300 text-amber-950 font-medium"
                                      : "bg-blue-50/80 border-blue-200 text-blue-950 font-medium"
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
                                <div>
                                  <span className="font-bold block leading-tight">{perm.label}</span>
                                  <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                                    {perm.description}
                                  </p>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
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
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-sm cursor-pointer"
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
