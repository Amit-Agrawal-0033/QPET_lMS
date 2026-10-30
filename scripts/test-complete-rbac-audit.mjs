import mongoose from "mongoose";

const BASE_URL = "http://localhost:4000";
const LOCAL_DB_URI = "mongodb://127.0.0.1:27017/qpet_lms";

let db = null;

async function setupDB() {
  await mongoose.connect(LOCAL_DB_URI, { serverSelectionTimeoutMS: 3000 });
  db = mongoose.connection.collection("users");
}

async function setTrainerPerms(identifier, permissions) {
  await db.updateOne(
    { identifier },
    { $set: { permissions, permissionsUpdatedAt: new Date(), permissionsUpdatedBy: "Admin" } }
  );
}

async function login(identifier, password = "123456") {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });
  const data = await res.json();
  const setCookie = res.headers.get("set-cookie");
  let cookieHeader = "";
  if (setCookie) {
    cookieHeader = setCookie.split(";")[0];
  }
  return { status: res.status, data, cookie: cookieHeader };
}

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failCount++;
  }
}

async function runTests() {
  console.log("=================================================================");
  console.log("       QPET LMS - COMPLETE RBAC & ACCESS CONTROL AUDIT TEST      ");
  console.log("=================================================================\n");

  await setupDB();

  // Test Accounts
  const ADMIN_ID = "admin077@qpet.in";
  const TRAINER_A = "roshni.bajpai@qpet.in";
  const TRAINER_B = "trainer01@qpet.in";

  // Login Admin
  const adminLogin = await login(ADMIN_ID);
  assert(adminLogin.status === 200 && adminLogin.data.user.role === "admin", "Admin login successful");

  // =========================================================================
  // TEST A: Trainer with No Permissions (Deny All)
  // =========================================================================
  console.log("\n--- [TEST A] Trainer with No Permissions (Default Denied) ---");
  await setTrainerPerms(TRAINER_A, {});
  const trainerALogin = await login(TRAINER_A);
  assert(trainerALogin.status === 200, "Trainer logs in successfully with zero permissions");

  // Unauthorized API calls must return 403 Forbidden
  const endpoints = [
    { url: "/api/admin/students", name: "Students Directory" },
    { url: "/api/admin/courses", name: "Courses Curriculum" },
    { url: "/api/admin/enrollments", name: "Batch Enrollments" },
    { url: "/api/admin/certificates", name: "Certificates" },
    { url: "/api/admin/reports", name: "Reports" },
    { url: "/api/admin/audit-logs", name: "Security Audit Logs" },
  ];

  for (const ep of endpoints) {
    const res = await fetch(`${BASE_URL}${ep.url}`, {
      headers: { Cookie: trainerALogin.cookie },
    });
    assert(res.status === 403, `Unauthorized GET ${ep.name} returns 403 Forbidden`);
  }

  // Dashboard must return 200 but with empty statistics
  const dashRes = await fetch(`${BASE_URL}/api/trainer/dashboard`, {
    headers: { Cookie: trainerALogin.cookie },
  });
  const dashData = await dashRes.json();
  assert(
    dashRes.status === 200 &&
    dashData.stats.totalStudents === 0 &&
    dashData.stats.totalCourses === 0 &&
    dashData.recentEnrollments.length === 0,
    "Trainer Dashboard returns 0/empty statistics when permissions are denied"
  );

  // =========================================================================
  // TEST B: Trainer with View Only Permissions
  // =========================================================================
  console.log("\n--- [TEST B] Trainer with View Only Permissions ---");
  await setTrainerPerms(TRAINER_A, { viewStudents: true });
  
  // Can view permitted records
  const viewRes = await fetch(`${BASE_URL}/api/admin/students`, {
    headers: { Cookie: trainerALogin.cookie },
  });
  assert(viewRes.status === 200, "Trainer can view permitted students records (200 OK)");

  // Cannot create
  const postRes = await fetch(`${BASE_URL}/api/admin/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: trainerALogin.cookie },
    body: JSON.stringify({ fullName: "Hacker Attempt" }),
  });
  assert(postRes.status === 403, "Trainer without createStudents receives 403 Forbidden on POST");

  // Cannot edit
  const putRes = await fetch(`${BASE_URL}/api/admin/students`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: trainerALogin.cookie },
    body: JSON.stringify({ id: "64a1b2c3d4e5f67890123456", fullName: "Edited Name" }),
  });
  assert(putRes.status === 403, "Trainer without editStudents receives 403 Forbidden on PUT");

  // Cannot delete
  const delRes = await fetch(`${BASE_URL}/api/admin/students?id=64a1b2c3d4e5f67890123456`, {
    method: "DELETE",
    headers: { Cookie: trainerALogin.cookie },
  });
  assert(delRes.status === 403, "Trainer receives 403 Forbidden on DELETE students");

  // =========================================================================
  // TEST C: Trainer with View and Create Permissions
  // =========================================================================
  console.log("\n--- [TEST C] Trainer with View and Create Permissions ---");
  await setTrainerPerms(TRAINER_A, { viewStudents: true, createStudents: true, editStudents: false });

  // Can view
  const viewResC = await fetch(`${BASE_URL}/api/admin/students`, {
    headers: { Cookie: trainerALogin.cookie },
  });
  assert(viewResC.status === 200, "Trainer can view students (200 OK)");

  // Create allowed (validation check: 400 means route passed authorization guard)
  const postResC = await fetch(`${BASE_URL}/api/admin/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: trainerALogin.cookie },
    body: JSON.stringify({}), // Empty body triggers validation, not 403
  });
  assert(postResC.status === 400, "Trainer with createStudents passes authorization guard (returned 400 Validation, not 403)");

  // Edit remains blocked
  const putResC = await fetch(`${BASE_URL}/api/admin/students`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", Cookie: trainerALogin.cookie },
    body: JSON.stringify({ id: "64a1b2c3d4e5f67890123456" }),
  });
  assert(putResC.status === 403, "Trainer without editStudents is blocked on PUT with 403 Forbidden");

  // =========================================================================
  // TEST D: Trainer with View, Create, Edit, Report Permissions
  // =========================================================================
  console.log("\n--- [TEST D] Trainer with View, Create, Edit, Report Permissions (Delete MUST be blocked) ---");
  await setTrainerPerms(TRAINER_A, {
    viewStudents: true,
    createStudents: true,
    editStudents: true,
    viewReports: true,
    exportReports: true,
  });

  // Report export is allowed
  const reportCsvRes = await fetch(`${BASE_URL}/api/admin/reports?type=students&format=csv`, {
    headers: { Cookie: trainerALogin.cookie },
  });
  assert(reportCsvRes.status === 200, "Trainer with exportReports can download CSV report (200 OK)");

  // Delete is strictly blocked even with all academic permissions
  const delResD = await fetch(`${BASE_URL}/api/admin/students?id=64a1b2c3d4e5f67890123456`, {
    method: "DELETE",
    headers: { Cookie: trainerALogin.cookie },
  });
  assert(delResD.status === 403, "MANDATORY: Delete students request rejected with 403 Forbidden");

  // Dropping/deleting student via PATCH is strictly blocked for trainers
  const dropResD = await fetch(`${BASE_URL}/api/admin/students`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: trainerALogin.cookie },
    body: JSON.stringify({ studentId: "64a1b2c3d4e5f67890123456", action: "drop" }),
  });
  assert(dropResD.status === 403, "MANDATORY: Mid-course student dropout via PATCH rejected with 403 Forbidden for trainers");

  // =========================================================================
  // TEST E: Multiple Trainers with Independent Configurations
  // =========================================================================
  console.log("\n--- [TEST E] Multiple Trainers with Independent Configurations ---");
  await setTrainerPerms(TRAINER_A, { viewCourses: true, viewStudents: false });
  await setTrainerPerms(TRAINER_B, { viewStudents: true, viewCourses: false });

  const trainerBLogin = await login(TRAINER_B);

  // Trainer A access check
  const tA_courses = await fetch(`${BASE_URL}/api/admin/courses`, { headers: { Cookie: trainerALogin.cookie } });
  const tA_students = await fetch(`${BASE_URL}/api/admin/students`, { headers: { Cookie: trainerALogin.cookie } });
  assert(tA_courses.status === 200 && tA_students.status === 403, "Trainer A has access to Courses (200) but blocked on Students (403)");

  // Trainer B access check
  const tB_courses = await fetch(`${BASE_URL}/api/admin/courses`, { headers: { Cookie: trainerBLogin.cookie } });
  const tB_students = await fetch(`${BASE_URL}/api/admin/students`, { headers: { Cookie: trainerBLogin.cookie } });
  assert(tB_students.status === 200 && tB_courses.status === 403, "Trainer B has access to Students (200) but blocked on Courses (403)");

  // =========================================================================
  // TEST F: Permission change takes effect immediately (Same Session)
  // =========================================================================
  console.log("\n--- [TEST F] Instant Permission Revocation in Existing Session ---");
  // Give Trainer A course access
  await setTrainerPerms(TRAINER_A, { viewCourses: true });
  const beforeRevoke = await fetch(`${BASE_URL}/api/admin/courses`, { headers: { Cookie: trainerALogin.cookie } });
  assert(beforeRevoke.status === 200, "Trainer A accesses courses with current active session");

  // Admin instantly revokes permission in database
  await setTrainerPerms(TRAINER_A, { viewCourses: false });

  // Very next request with identical session token must be denied immediately
  const afterRevoke = await fetch(`${BASE_URL}/api/admin/courses`, { headers: { Cookie: trainerALogin.cookie } });
  assert(afterRevoke.status === 403, "Very next request with existing session cookie immediately receives 403 Forbidden without delay");

  // =========================================================================
  // TEST G: API Security and Privilege Escalation Prevention
  // =========================================================================
  console.log("\n--- [TEST G] API Security and Privilege Escalation Prevention ---");
  // Direct DELETE calls on any resource
  const delCourses = await fetch(`${BASE_URL}/api/admin/courses?id=64a1b2c3d4e5f67890123456`, {
    method: "DELETE",
    headers: { Cookie: trainerALogin.cookie },
  });
  assert(delCourses.status === 403, "Direct DELETE /api/admin/courses returns 403 Forbidden");

  const delTrainers = await fetch(`${BASE_URL}/api/admin/trainers?id=64a1b2c3d4e5f67890123456`, {
    method: "DELETE",
    headers: { Cookie: trainerALogin.cookie },
  });
  assert(delTrainers.status === 403, "Direct DELETE /api/admin/trainers returns 403 Forbidden");

  // Trainer attempts to modify trainer permissions via PATCH
  const escalate = await fetch(`${BASE_URL}/api/admin/trainers`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: trainerALogin.cookie },
    body: JSON.stringify({ id: "64a1b2c3d4e5f67890123456", permissions: { viewStudents: true } }),
  });
  assert(escalate.status === 403, "Privilege escalation attempt on /api/admin/trainers returns 403 Forbidden");

  // =========================================================================
  // TEST H: Audit Log Security
  // =========================================================================
  console.log("\n--- [TEST H] Security Audit Log Confidentiality ---");
  // Admin can query audit logs
  const adminAudit = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
    headers: { Cookie: adminLogin.cookie },
  });
  assert(adminAudit.status === 200, "Administrator successfully accesses complete system audit trail (200 OK)");

  // Trainer is strictly blocked
  const trainerAudit = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
    headers: { Cookie: trainerALogin.cookie },
  });
  assert(trainerAudit.status === 403, "MANDATORY: Trainer query to /api/admin/audit-logs returns 403 Forbidden");

  // Trainer attempts to tamper/delete audit logs
  const delAudit = await fetch(`${BASE_URL}/api/admin/audit-logs`, {
    method: "DELETE",
    headers: { Cookie: trainerALogin.cookie },
  });
  assert(delAudit.status === 403 || delAudit.status === 405, "MANDATORY: Audit logs are immutable and reject DELETE requests");

  console.log("\n=================================================================");
  console.log(`TOTAL TESTS: ${passCount + failCount}`);
  console.log(`PASSED: ${passCount}`);
  console.log(`FAILED: ${failCount}`);
  console.log("=================================================================");

  await mongoose.disconnect();
  process.exit(failCount === 0 ? 0 : 1);
}

runTests().catch(async (err) => {
  console.error("Test execution fatal error:", err);
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  process.exit(1);
});
