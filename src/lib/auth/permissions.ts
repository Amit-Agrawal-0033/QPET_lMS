export type IUserPermissions = Record<string, boolean>;

export interface PermissionDefinition {
  key: string;
  label: string;
  action: "view" | "create" | "edit" | "delete" | "export" | "generate" | "audit";
  module: string;
  description: string;
}

export const MODULE_DEFINITIONS = [
  { id: "students", label: "Students", icon: "Users" },
  { id: "courses", label: "Courses & Syllabus", icon: "BookOpen" },
  { id: "enrollments", label: "Batches & Enrollments", icon: "FileCheck2" },
  { id: "registrations", label: "Admissions & Registrations", icon: "UserCheck" },
  { id: "certificates", label: "Certificates", icon: "Award" },
  { id: "reports", label: "Reports & Analytics", icon: "FileSpreadsheet" },
  { id: "auditLogs", label: "Security Audit Logs", icon: "ShieldAlert" },
];

export const PERMISSION_MATRIX: PermissionDefinition[] = [
  // Students
  { key: "viewStudents", label: "View Students", action: "view", module: "students", description: "Access student profiles and enrollment status" },
  { key: "editStudents", label: "Edit / Add Students", action: "edit", module: "students", description: "Update student details and record changes" },
  { key: "deleteStudents", label: "Delete / Drop Students", action: "delete", module: "students", description: "Mark students as dropped or inactive" },
  { key: "exportStudents", label: "Export Student Data", action: "export", module: "students", description: "Download CSV/Excel student directory" },

  // Courses
  { key: "viewCourses", label: "View Courses", action: "view", module: "courses", description: "View curriculum syllabus and modules" },
  { key: "editCourses", label: "Create / Edit Courses", action: "edit", module: "courses", description: "Update course duration, codes, and details" },
  { key: "deleteCourses", label: "Delete / Deactivate Course", action: "delete", module: "courses", description: "Deactivate course from active catalog" },
  { key: "exportCourses", label: "Export Curriculum", action: "export", module: "courses", description: "Download course outlines" },

  // Enrollments
  { key: "viewEnrollments", label: "View Enrollments", action: "view", module: "enrollments", description: "View ongoing batch and course assignments" },
  { key: "editEnrollments", label: "Manage Enrollments", action: "edit", module: "enrollments", description: "Assign courses or modify student batches" },
  { key: "exportEnrollments", label: "Export Enrollments", action: "export", module: "enrollments", description: "Export batch enrollment rosters" },

  // Registrations
  { key: "viewRegistrations", label: "View Registrations", action: "view", module: "registrations", description: "View pending student admissions" },
  { key: "editRegistrations", label: "Approve Admissions", action: "edit", module: "registrations", description: "Approve or reject student registration requests" },

  // Certificates
  { key: "viewCertificates", label: "View Certificates", action: "view", module: "certificates", description: "View student completion certificates and verify QR" },
  { key: "generateCertificates", label: "Generate Certificate", action: "generate", module: "certificates", description: "Issue official certificates for completed courses" },
  { key: "editCertificates", label: "Edit / Revoke Certificates", action: "edit", module: "certificates", description: "Modify issue details or mark as revoked" },
  { key: "exportCertificates", label: "Export Certificate List", action: "export", module: "certificates", description: "Download issuance registers" },

  // Reports
  { key: "viewReports", label: "View Reports", action: "view", module: "reports", description: "View academic reports and completion statistics" },
  { key: "exportReports", label: "Export Reports", action: "export", module: "reports", description: "Export administrative reports to Excel/PDF" },

  // Security Audit Logs
  { key: "viewAuditReports", label: "View Audit Reports", action: "audit", module: "auditLogs", description: "View system audit trail and login events (Strictly Monitored)" },
  { key: "exportAuditReports", label: "Export Audit Logs", action: "export", module: "auditLogs", description: "Export immutable audit trails" },
];

export const PERMISSION_PRESETS: Record<string, { name: string; description: string; permissions: IUserPermissions }> = {
  readOnly: {
    name: "Read Only Faculty",
    description: "Can view student directory, courses, and certificates without editing permissions.",
    permissions: {
      viewStudents: true,
      editStudents: false,
      deleteStudents: false,
      exportStudents: false,
      viewCourses: true,
      editCourses: false,
      deleteCourses: false,
      exportCourses: false,
      viewEnrollments: true,
      editEnrollments: false,
      exportEnrollments: false,
      viewRegistrations: false,
      editRegistrations: false,
      viewCertificates: true,
      generateCertificates: false,
      editCertificates: false,
      exportCertificates: false,
      viewReports: false,
      exportReports: false,
      viewAuditReports: false,
      exportAuditReports: false,
      viewFees: false,
      editFees: false,
      viewReceipts: false,
    },
  },
  trainerStandard: {
    name: "Standard Trainer",
    description: "Standard academic access for classroom instruction, student viewing, and curriculum access.",
    permissions: {
      viewStudents: true,
      editStudents: false,
      deleteStudents: false,
      exportStudents: true,
      viewCourses: true,
      editCourses: false,
      deleteCourses: false,
      exportCourses: true,
      viewEnrollments: true,
      editEnrollments: false,
      exportEnrollments: true,
      viewRegistrations: false,
      editRegistrations: false,
      viewCertificates: true,
      generateCertificates: false,
      editCertificates: false,
      exportCertificates: false,
      viewReports: false,
      exportReports: false,
      viewAuditReports: false,
      exportAuditReports: false,
      viewFees: false,
      editFees: false,
      viewReceipts: false,
    },
  },
  academicLead: {
    name: "Academic Lead",
    description: "Senior faculty with student editing, batch management, certificate generation, and reporting.",
    permissions: {
      viewStudents: true,
      editStudents: true,
      deleteStudents: false,
      exportStudents: true,
      viewCourses: true,
      editCourses: true,
      deleteCourses: false,
      exportCourses: true,
      viewEnrollments: true,
      editEnrollments: true,
      exportEnrollments: true,
      viewRegistrations: true,
      editRegistrations: true,
      viewCertificates: true,
      generateCertificates: true,
      editCertificates: false,
      exportCertificates: true,
      viewReports: true,
      exportReports: true,
      viewAuditReports: false,
      exportAuditReports: false,
      viewFees: false,
      editFees: false,
      viewReceipts: false,
    },
  },
  fullFaculty: {
    name: "Full Faculty (All Academic)",
    description: "Comprehensive academic authority across curriculum, students, and certificates.",
    permissions: {
      viewStudents: true,
      editStudents: true,
      deleteStudents: false,
      exportStudents: true,
      viewCourses: true,
      editCourses: true,
      deleteCourses: false,
      exportCourses: true,
      viewEnrollments: true,
      editEnrollments: true,
      exportEnrollments: true,
      viewRegistrations: true,
      editRegistrations: true,
      viewCertificates: true,
      generateCertificates: true,
      editCertificates: true,
      exportCertificates: true,
      viewReports: true,
      exportReports: true,
      viewAuditReports: false,
      exportAuditReports: false,
      viewFees: false,
      editFees: false,
      viewReceipts: false,
    },
  },
};

/**
 * Check if a session or user object has a given permission
 */
export function hasPermission(
  user: { role: string; permissions?: Record<string, boolean> },
  permissionKey: string
): boolean {
  if (user.role === "admin") return true;
  if (user.role !== "trainer") return false;
  return !!user.permissions?.[permissionKey];
}
