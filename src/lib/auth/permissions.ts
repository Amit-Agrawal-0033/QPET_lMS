export type IUserPermissions = Record<string, boolean>;

export interface PermissionDefinition {
  key: string;
  label: string;
  action: "view" | "create" | "edit" | "delete" | "report";
  module: string;
  moduleLabel: string;
  description: string;
  adminOnly?: boolean;
}

export const MODULE_DEFINITIONS = [
  { id: "students", label: "Students", icon: "Users" },
  { id: "courses", label: "Courses & Syllabus", icon: "BookOpen" },
  { id: "enrollments", label: "Batches & Enrollments", icon: "FileCheck2" },
  { id: "registrations", label: "Admissions & Registrations", icon: "UserCheck" },
  { id: "certificates", label: "Certificates", icon: "Award" },
  { id: "fees", label: "Fees Management", icon: "DollarSign" },
  { id: "receipts", label: "Fee Receipts", icon: "Receipt" },
  { id: "reports", label: "Reports & Analytics", icon: "FileSpreadsheet" },
];

export const PERMISSION_MATRIX: PermissionDefinition[] = [
  // 1. Students Module
  { key: "viewStudents", label: "View Students", action: "view", module: "students", moduleLabel: "Students", description: "Access student directory and academic profile" },
  { key: "createStudents", label: "Create Student", action: "create", module: "students", moduleLabel: "Students", description: "Add and register new student records" },
  { key: "editStudents", label: "Edit Student", action: "edit", module: "students", moduleLabel: "Students", description: "Modify student profiles, guardians, and contact details" },
  { key: "deleteStudents", label: "Delete Student", action: "delete", module: "students", moduleLabel: "Students", description: "Delete or drop student accounts (Admin Only)", adminOnly: true },
  { key: "exportStudents", label: "Student Reports", action: "report", module: "students", moduleLabel: "Students", description: "Export student rosters and directory reports" },

  // 2. Courses Module
  { key: "viewCourses", label: "View Courses", action: "view", module: "courses", moduleLabel: "Courses & Syllabus", description: "View curriculum syllabus, modules, and duration" },
  { key: "createCourses", label: "Create Course", action: "create", module: "courses", moduleLabel: "Courses & Syllabus", description: "Create and publish new training courses" },
  { key: "editCourses", label: "Edit Course", action: "edit", module: "courses", moduleLabel: "Courses & Syllabus", description: "Update course curriculum, codes, and tuition fees" },
  { key: "deleteCourses", label: "Delete Course", action: "delete", module: "courses", moduleLabel: "Courses & Syllabus", description: "Deactivate or remove course records (Admin Only)", adminOnly: true },
  { key: "exportCourses", label: "Course Reports", action: "report", module: "courses", moduleLabel: "Courses & Syllabus", description: "Export course syllabus and curriculum outlines" },

  // 3. Batches & Enrollments Module
  { key: "viewEnrollments", label: "View Enrollments", action: "view", module: "enrollments", moduleLabel: "Batches & Enrollments", description: "View student course enrollment rosters and batch status" },
  { key: "createEnrollments", label: "Create Enrollment", action: "create", module: "enrollments", moduleLabel: "Batches & Enrollments", description: "Enroll students into active courses and batches" },
  { key: "editEnrollments", label: "Edit Enrollment", action: "edit", module: "enrollments", moduleLabel: "Batches & Enrollments", description: "Modify batch schedules, duration, and enrollment details" },
  { key: "deleteEnrollments", label: "Delete Enrollment", action: "delete", module: "enrollments", moduleLabel: "Batches & Enrollments", description: "Cancel or drop student enrollments (Admin Only)", adminOnly: true },
  { key: "exportEnrollments", label: "Enrollment Reports", action: "report", module: "enrollments", moduleLabel: "Batches & Enrollments", description: "Download batch roster exports and enrollment reports" },

  // 4. Registrations & Admissions Module
  { key: "viewRegistrations", label: "View Registrations", action: "view", module: "registrations", moduleLabel: "Admissions & Registrations", description: "View pending online student admissions" },
  { key: "createRegistrations", label: "Create Registration", action: "create", module: "registrations", moduleLabel: "Admissions & Registrations", description: "Submit manual admission forms" },
  { key: "editRegistrations", label: "Approve Registrations", action: "edit", module: "registrations", moduleLabel: "Admissions & Registrations", description: "Approve or reject student admissions" },
  { key: "deleteRegistrations", label: "Delete Registration", action: "delete", module: "registrations", moduleLabel: "Admissions & Registrations", description: "Purge registration applications (Admin Only)", adminOnly: true },
  { key: "exportRegistrations", label: "Registration Reports", action: "report", module: "registrations", moduleLabel: "Admissions & Registrations", description: "Export applicant rosters and admission reports" },

  // 5. Certificates Module
  { key: "viewCertificates", label: "View Certificates", action: "view", module: "certificates", moduleLabel: "Certificates", description: "View issued certificates and verify QR codes" },
  { key: "generateCertificates", label: "Generate Certificate", action: "create", module: "certificates", moduleLabel: "Certificates", description: "Issue official completion certificates" },
  { key: "editCertificates", label: "Revoke Certificate", action: "edit", module: "certificates", moduleLabel: "Certificates", description: "Revoke or update certificate status" },
  { key: "deleteCertificates", label: "Delete Certificate", action: "delete", module: "certificates", moduleLabel: "Certificates", description: "Permanently delete certificate records (Admin Only)", adminOnly: true },
  { key: "exportCertificates", label: "Certificate Reports", action: "report", module: "certificates", moduleLabel: "Certificates", description: "Download certificate issuance registers" },

  // 6. Fees Management Module
  { key: "viewFees", label: "View Fee Ledger", action: "view", module: "fees", moduleLabel: "Fees Management", description: "View student fee agreement ledger and balance" },
  { key: "createFees", label: "Collect Fee Payment", action: "create", module: "fees", moduleLabel: "Fees Management", description: "Record student tuition installment payments" },
  { key: "editFees", label: "Edit Fee Structure", action: "edit", module: "fees", moduleLabel: "Fees Management", description: "Modify agreed fees or installment schedule" },
  { key: "deleteFees", label: "Delete Fee Record", action: "delete", module: "fees", moduleLabel: "Fees Management", description: "Delete fee transactions or adjustments (Admin Only)", adminOnly: true },
  { key: "exportFees", label: "Fee Reports", action: "report", module: "fees", moduleLabel: "Fees Management", description: "Download fee balance and collection reports" },

  // 7. Receipts Module
  { key: "viewReceipts", label: "View Receipts", action: "view", module: "receipts", moduleLabel: "Fee Receipts", description: "Access official payment receipts and invoices" },
  { key: "createReceipts", label: "Generate Receipt", action: "create", module: "receipts", moduleLabel: "Fee Receipts", description: "Generate printable student fee receipts" },
  { key: "editReceipts", label: "Edit Receipt", action: "edit", module: "receipts", moduleLabel: "Fee Receipts", description: "Update receipt remarks or metadata" },
  { key: "deleteReceipts", label: "Delete Receipt", action: "delete", module: "receipts", moduleLabel: "Fee Receipts", description: "Void or delete receipts (Admin Only)", adminOnly: true },
  { key: "exportReceipts", label: "Receipt Reports", action: "report", module: "receipts", moduleLabel: "Fee Receipts", description: "Export receipt transaction archives" },

  // 8. Academic Reports & Analytics Module
  { key: "viewReports", label: "View Reports", action: "view", module: "reports", moduleLabel: "Reports & Analytics", description: "View academic reports and completion analytics" },
  { key: "createReports", label: "Custom Reports", action: "create", module: "reports", moduleLabel: "Reports & Analytics", description: "Generate customized academic query reports" },
  { key: "editReports", label: "Configure Reports", action: "edit", module: "reports", moduleLabel: "Reports & Analytics", description: "Configure report templates and query parameters" },
  { key: "deleteReports", label: "Delete Report", action: "delete", module: "reports", moduleLabel: "Reports & Analytics", description: "Delete saved reports (Admin Only)", adminOnly: true },
  { key: "exportReports", label: "Export to Excel/CSV", action: "report", module: "reports", moduleLabel: "Reports & Analytics", description: "Download official CSV/Excel data exports" },
];

/**
 * Default permissions for any newly created trainer:
 * MANDATORY REQUIREMENT: Default permissions MUST BE DENIED (all false / empty).
 */
export const DEFAULT_TRAINER_PERMISSIONS: IUserPermissions = {};

export const PERMISSION_PRESETS: Record<
  string,
  { name: string; description: string; permissions: IUserPermissions }
> = {
  denied: {
    name: "Default (All Denied)",
    description: "All permissions denied. Trainer cannot access any module until explicitly granted.",
    permissions: {},
  },
  readOnly: {
    name: "Read Only Faculty",
    description: "Can view student directory, courses, and certificates without editing or creating.",
    permissions: {
      viewStudents: true,
      createStudents: false,
      editStudents: false,
      deleteStudents: false,
      exportStudents: false,
      viewCourses: true,
      createCourses: false,
      editCourses: false,
      deleteCourses: false,
      exportCourses: false,
      viewEnrollments: true,
      createEnrollments: false,
      editEnrollments: false,
      deleteEnrollments: false,
      exportEnrollments: false,
      viewRegistrations: false,
      createRegistrations: false,
      editRegistrations: false,
      deleteRegistrations: false,
      exportRegistrations: false,
      viewCertificates: true,
      generateCertificates: false,
      editCertificates: false,
      deleteCertificates: false,
      exportCertificates: false,
      viewFees: false,
      createFees: false,
      editFees: false,
      deleteFees: false,
      exportFees: false,
      viewReceipts: false,
      createReceipts: false,
      editReceipts: false,
      deleteReceipts: false,
      exportReceipts: false,
      viewReports: false,
      createReports: false,
      editReports: false,
      deleteReports: false,
      exportReports: false,
    },
  },
  trainerStandard: {
    name: "Standard Trainer",
    description: "Classroom instruction access: View students, courses, enrollments, certificates, and export rosters.",
    permissions: {
      viewStudents: true,
      createStudents: false,
      editStudents: false,
      deleteStudents: false,
      exportStudents: true,
      viewCourses: true,
      createCourses: false,
      editCourses: false,
      deleteCourses: false,
      exportCourses: true,
      viewEnrollments: true,
      createEnrollments: false,
      editEnrollments: false,
      deleteEnrollments: false,
      exportEnrollments: true,
      viewRegistrations: false,
      createRegistrations: false,
      editRegistrations: false,
      deleteRegistrations: false,
      exportRegistrations: false,
      viewCertificates: true,
      generateCertificates: false,
      editCertificates: false,
      deleteCertificates: false,
      exportCertificates: false,
      viewFees: false,
      createFees: false,
      editFees: false,
      deleteFees: false,
      exportFees: false,
      viewReceipts: false,
      createReceipts: false,
      editReceipts: false,
      deleteReceipts: false,
      exportReceipts: false,
      viewReports: false,
      createReports: false,
      editReports: false,
      deleteReports: false,
      exportReports: false,
    },
  },
  academicLead: {
    name: "Academic Lead",
    description: "Senior faculty with student creation & editing, batch enrollment, certificate issuance, and reports.",
    permissions: {
      viewStudents: true,
      createStudents: true,
      editStudents: true,
      deleteStudents: false,
      exportStudents: true,
      viewCourses: true,
      createCourses: false,
      editCourses: true,
      deleteCourses: false,
      exportCourses: true,
      viewEnrollments: true,
      createEnrollments: true,
      editEnrollments: true,
      deleteEnrollments: false,
      exportEnrollments: true,
      viewRegistrations: true,
      createRegistrations: false,
      editRegistrations: true,
      deleteRegistrations: false,
      exportRegistrations: true,
      viewCertificates: true,
      generateCertificates: true,
      editCertificates: false,
      deleteCertificates: false,
      exportCertificates: true,
      viewFees: false,
      createFees: false,
      editFees: false,
      deleteFees: false,
      exportFees: false,
      viewReceipts: false,
      createReceipts: false,
      editReceipts: false,
      deleteReceipts: false,
      exportReceipts: false,
      viewReports: true,
      createReports: false,
      editReports: false,
      deleteReports: false,
      exportReports: true,
    },
  },
  fullFaculty: {
    name: "Full Academic Faculty",
    description: "Complete academic authority across courses, students, batch enrollments, certificates, and reports.",
    permissions: {
      viewStudents: true,
      createStudents: true,
      editStudents: true,
      deleteStudents: false,
      exportStudents: true,
      viewCourses: true,
      createCourses: true,
      editCourses: true,
      deleteCourses: false,
      exportCourses: true,
      viewEnrollments: true,
      createEnrollments: true,
      editEnrollments: true,
      deleteEnrollments: false,
      exportEnrollments: true,
      viewRegistrations: true,
      createRegistrations: true,
      editRegistrations: true,
      deleteRegistrations: false,
      exportRegistrations: true,
      viewCertificates: true,
      generateCertificates: true,
      editCertificates: true,
      deleteCertificates: false,
      exportCertificates: true,
      viewFees: false,
      createFees: false,
      editFees: false,
      deleteFees: false,
      exportFees: false,
      viewReceipts: false,
      createReceipts: false,
      editReceipts: false,
      deleteReceipts: false,
      exportReceipts: false,
      viewReports: true,
      createReports: true,
      editReports: true,
      deleteReports: false,
      exportReports: true,
    },
  },
};

/**
 * Sanitizes trainer permissions before saving to database:
 * 1. Strictly forces all "delete*" permissions to FALSE (Trainers can NEVER delete).
 * 2. Strictly strips/disallows any audit log permissions (Audit logs are strictly Admin only).
 */
export function sanitizeTrainerPermissions(
  permissions?: IUserPermissions
): IUserPermissions {
  if (!permissions || typeof permissions !== "object") {
    return {};
  }

  const sanitized: IUserPermissions = {};

  for (const [key, value] of Object.entries(permissions)) {
    // Audit logs are strictly prohibited for trainers
    if (key.toLowerCase().includes("audit")) {
      sanitized[key] = false;
      continue;
    }

    // Delete permissions are strictly prohibited for trainers
    if (key.toLowerCase().startsWith("delete") || key.toLowerCase().includes("delete")) {
      sanitized[key] = false;
      continue;
    }

    sanitized[key] = Boolean(value);
  }

  return sanitized;
}

/**
 * Check if a session or user object has a given permission
 */
export function hasPermission(
  user: { role: string; permissions?: Record<string, boolean> },
  permissionKey: string
): boolean {
  if (user.role === "admin") return true;
  if (user.role !== "trainer") return false;

  // Strict: Trainers can NEVER have delete or audit permissions
  if (
    permissionKey.toLowerCase().includes("delete") ||
    permissionKey.toLowerCase().includes("audit")
  ) {
    return false;
  }

  return !!user.permissions?.[permissionKey];
}
