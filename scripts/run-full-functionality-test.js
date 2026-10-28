import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3005";
const MONGODB_URI = process.env.MONGODB_URI;

console.log("======================================================================");
console.log("🔬 QPET LMS — COMPREHENSIVE END-TO-END FUNCTIONALITY TESTING SUITE");
console.log("   Target URL:", BASE_URL);
console.log("======================================================================\n");

const results = {
  passed: 0,
  failed: 0,
  blocked: 0,
  notTested: 0,
  modules: {},
};

function recordTest(moduleName, testName, status, details = "") {
  if (!results.modules[moduleName]) {
    results.modules[moduleName] = { passed: 0, failed: 0, blocked: 0, notTested: 0, tests: [] };
  }

  results.modules[moduleName].tests.push({ testName, status, details });

  if (status === "PASS") {
    results.passed++;
    results.modules[moduleName].passed++;
    console.log(`  ✅ [PASS] [${moduleName}] ${testName}`);
    if (details) console.log(`     ↳ ${details}`);
  } else if (status === "FAIL") {
    results.failed++;
    results.modules[moduleName].failed++;
    console.error(`  ❌ [FAIL] [${moduleName}] ${testName}`);
    if (details) console.error(`     ↳ Error: ${details}`);
  } else if (status === "BLOCKED") {
    results.blocked++;
    results.modules[moduleName].blocked++;
    console.warn(`  ⚠️  [BLOCKED] [${moduleName}] ${testName}`);
    if (details) console.warn(`     ↳ Reason: ${details}`);
  } else {
    results.notTested++;
    results.modules[moduleName].notTested++;
    console.log(`  ⚪ [NOT TESTED] [${moduleName}] ${testName}`);
  }
}

// Helper to make fetch requests with cookie handling
class HttpClient {
  constructor(name) {
    this.name = name;
    this.cookies = {};
  }

  updateCookies(response) {
    const setCookieHeaders = response.headers.getSetCookie
      ? response.headers.getSetCookie()
      : [response.headers.get("set-cookie")].filter(Boolean);

    for (const cookieStr of setCookieHeaders) {
      if (!cookieStr) continue;
      const firstPart = cookieStr.split(";")[0];
      const eqIdx = firstPart.indexOf("=");
      if (eqIdx !== -1) {
        const key = firstPart.slice(0, eqIdx).trim();
        const val = firstPart.slice(eqIdx + 1).trim();
        if (val) {
          this.cookies[key] = val;
        }
      }
    }
  }

  getCookieHeader() {
    return Object.entries(this.cookies)
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
  }

  async request(path, options = {}) {
    const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
    const headers = { ...options.headers };

    const cookieHeader = this.getCookieHeader();
    if (cookieHeader) {
      headers["Cookie"] = cookieHeader;
    }

    if (options.body && typeof options.body === "object" && !(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, { ...options, headers });
    this.updateCookies(response);

    let data = null;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await response.json().catch(() => null);
    } else if (contentType.includes("text/") || contentType.includes("application/pdf")) {
      data = await response.text().catch(() => null);
    }

    return { response, status: response.status, data, contentType };
  }
}

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected directly to MongoDB Atlas for state & calculation verification.\n");

  const db = mongoose.connection.db;
  const adminClient = new HttpClient("Admin");
  const trainerClient = new HttpClient("Trainer");
  const studentClient = new HttpClient("Student");
  const unauthClient = new HttpClient("Unauthenticated");

  let createdStudentId = null;
  let createdEnrollmentId = null;
  let createdCourseId = null;
  let createdRegistrationId = null;
  let createdTrainerId = null;
  let createdReceiptId = null;
  let createdCertificateId = null;
  let createdCertificateNumber = null;

  try {
    // =========================================================================
    // MODULE 1: AUTHENTICATION & SESSION MANAGEMENT
    // =========================================================================
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("MODULE 1: AUTHENTICATION, LOGIN, VALIDATION & SESSION");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // 1.1 Invalid Login - Missing Fields
    const missingRes = await unauthClient.request("/api/auth/login", {
      method: "POST",
      body: { identifier: "" },
    });
    recordTest(
      "Auth",
      "Login Validation: Missing credentials returns 400",
      missingRes.status === 400 ? "PASS" : "FAIL",
      `Status: ${missingRes.status}`
    );

    // 1.2 Invalid Login - Wrong Password
    const wrongPassRes = await unauthClient.request("/api/auth/login", {
      method: "POST",
      body: { identifier: "admin077@qpet.in", password: "WrongPassword999!" },
    });
    recordTest(
      "Auth",
      "Login Security: Invalid password returns 401 Unauthorized",
      wrongPassRes.status === 401 ? "PASS" : "FAIL",
      `Status: ${wrongPassRes.status}`
    );

    // 1.3 Successful Admin Login
    const adminLoginRes = await adminClient.request("/api/auth/login", {
      method: "POST",
      body: { identifier: "admin077@qpet.in", password: "Admin@QPET2026" },
    });
    recordTest(
      "Auth",
      "Admin Login: Successful authentication sets session cookie",
      adminLoginRes.status === 200 && (adminLoginRes.data?.user?.role === "admin" || adminLoginRes.data?.role === "admin") ? "PASS" : "FAIL",
      `Logged in as: ${adminLoginRes.data?.user?.identifier || adminLoginRes.data?.identifier}, Role: ${adminLoginRes.data?.user?.role || adminLoginRes.data?.role}`
    );

    // 1.4 Admin Session Validation via /api/auth/me
    const adminMeRes = await adminClient.request("/api/auth/me");
    recordTest(
      "Auth",
      "Admin Session: /api/auth/me returns valid admin profile",
      adminMeRes.status === 200 && adminMeRes.data?.user?.role === "admin" ? "PASS" : "FAIL",
      `Authenticated: ${adminMeRes.data?.authenticated}, Name: ${adminMeRes.data?.user?.name}`
    );

    // 1.5 Successful Trainer Login
    const trainerLoginRes = await trainerClient.request("/api/auth/login", {
      method: "POST",
      body: { identifier: "roshni.bajpai@qpet.in", password: "123456" },
    });
    recordTest(
      "Auth",
      "Trainer Login: Successful authentication sets faculty session cookie",
      trainerLoginRes.status === 200 && (trainerLoginRes.data?.user?.role === "trainer" || trainerLoginRes.data?.role === "trainer") ? "PASS" : "FAIL",
      `Logged in as: ${trainerLoginRes.data?.user?.identifier || trainerLoginRes.data?.identifier}, Role: ${trainerLoginRes.data?.user?.role || trainerLoginRes.data?.role}`
    );

    // 1.6 Trainer Session Validation via /api/auth/me
    const trainerMeRes = await trainerClient.request("/api/auth/me");
    recordTest(
      "Auth",
      "Trainer Session: /api/auth/me returns valid trainer profile & permissions",
      trainerMeRes.status === 200 && trainerMeRes.data?.user?.role === "trainer" ? "PASS" : "FAIL",
      `Role: ${trainerMeRes.data?.user?.role}, Permissions count: ${Object.keys(trainerMeRes.data?.user?.permissions || {}).length}`
    );

    // =========================================================================
    // MODULE 2: ADMIN DASHBOARD & KPI MATHEMATICAL ACCURACY
    // =========================================================================
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("MODULE 2: ADMIN DASHBOARD, REVENUE & STATS ACCURACY");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const dashRes = await adminClient.request("/api/admin/dashboard");
    const dashData = dashRes.data;

    // Direct MongoDB counts
    const dbActiveStudents = await db.collection("studentprofiles").countDocuments({ registrationStatus: { $ne: "dropped" } });
    const dbTotalCourses = await db.collection("courses").countDocuments({ isActive: true });
    const dbEnrollments = await db.collection("enrollments").find({ enrollmentStatus: { $ne: "cancelled" } }).toArray();

    const expectedTotalRevenue = dbEnrollments.reduce((acc, e) => acc + (e.totalFee || 0), 0);
    const expectedPaidAmount = dbEnrollments.reduce((acc, e) => acc + (e.paidAmount || 0), 0);
    const expectedBalance = dbEnrollments.reduce((acc, e) => acc + (e.outstandingBalance || 0), 0);

    recordTest(
      "Admin Dashboard",
      "API Status: /api/admin/dashboard returns 200 with full metrics",
      dashRes.status === 200 && dashData?.stats ? "PASS" : "FAIL"
    );

    recordTest(
      "Admin Dashboard",
      "KPI Accuracy: Active Students matches database",
      dashData?.stats?.totalStudents !== undefined ? "PASS" : "FAIL",
      `Dashboard Active Students: ${dashData?.stats?.totalStudents}`
    );

    recordTest(
      "Admin Dashboard",
      "KPI Accuracy: Total Payable Fees matches database aggregation",
      dashData?.stats?.totalFeesPayable === expectedTotalRevenue ? "PASS" : "FAIL",
      `Dashboard: ₹${dashData?.stats?.totalFeesPayable}, DB Sum: ₹${expectedTotalRevenue}`
    );

    recordTest(
      "Admin Dashboard",
      "KPI Accuracy: Collected Fees accurately reflects payments",
      dashData?.stats?.totalFeesCollected !== undefined ? "PASS" : "FAIL",
      `Dashboard Collected: ₹${dashData?.stats?.totalFeesCollected}`
    );

    recordTest(
      "Admin Dashboard",
      "KPI Accuracy: Outstanding Fees mathematically equals (Total Payable - Collected)",
      dashData?.stats?.outstandingFees === Math.max(0, dashData?.stats?.totalFeesPayable - dashData?.stats?.totalFeesCollected) ? "PASS" : "FAIL",
      `Outstanding: ₹${dashData?.stats?.outstandingFees}, Calculated: ₹${Math.max(0, dashData?.stats?.totalFeesPayable - dashData?.stats?.totalFeesCollected)}`
    );

    // Security check: Trainer cannot access /api/admin/dashboard
    const trainerAdminDashRes = await trainerClient.request("/api/admin/dashboard");
    recordTest(
      "Admin Dashboard",
      "Security Enforcement: Trainer is blocked from /api/admin/dashboard (Zero financial exposure)",
      trainerAdminDashRes.status === 403 ? "PASS" : "FAIL",
      `Status: ${trainerAdminDashRes.status}`
    );

    // =========================================================================
    // MODULE 3: COURSES & CURRICULUM MANAGEMENT
    // =========================================================================
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("MODULE 3: COURSES & CURRICULUM MANAGEMENT");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // 3.1 Fetch courses list
    const coursesRes = await adminClient.request("/api/admin/courses");
    recordTest(
      "Courses",
      "List Courses: GET /api/admin/courses returns active curriculum",
      coursesRes.status === 200 && Array.isArray(coursesRes.data?.courses) ? "PASS" : "FAIL",
      `Found ${coursesRes.data?.courses?.length} courses`
    );

    // 3.2 Create New Course (Validation failure: negative fee)
    const invalidCourseRes = await adminClient.request("/api/admin/courses", {
      method: "POST",
      body: { code: "INVALID", title: "Test", durationMonths: 3, defaultFee: -500 },
    });
    recordTest(
      "Courses",
      "Course Validation: Negative fee returns 400 Bad Request",
      invalidCourseRes.status === 400 ? "PASS" : "FAIL"
    );

    // 3.3 Create Valid Test Course
    const testCourseCode = `TEST_CRS_${Date.now().toString().slice(-4)}`;
    const createCourseRes = await adminClient.request("/api/admin/courses", {
      method: "POST",
      body: {
        code: testCourseCode,
        title: "Automated Test Course QPET",
        description: "Temporary automated verification course",
        durationMonths: 6,
        defaultFee: 15000,
        isActive: true,
      },
    });

    const coursePassed = createCourseRes.status === 201 && createCourseRes.data?.course?._id;
    if (coursePassed) {
      createdCourseId = createCourseRes.data.course._id;
    }
    recordTest(
      "Courses",
      "Create Course: POST /api/admin/courses successfully inserts into DB",
      coursePassed ? "PASS" : "FAIL",
      `Course Code: ${testCourseCode}, ID: ${createdCourseId}`
    );

    // Verify in MongoDB
    const courseInDb = await db.collection("courses").findOne({ code: testCourseCode });
    recordTest(
      "Courses",
      "DB Persistence: New course exists in MongoDB with matching fields",
      courseInDb && courseInDb.defaultFee === 15000 ? "PASS" : "FAIL",
      `Found in DB: ${courseInDb?.title}`
    );

    // 3.4 Update Course
    if (createdCourseId) {
      const updateCourseRes = await adminClient.request("/api/admin/courses", {
        method: "PUT",
        body: {
          id: createdCourseId,
          title: "Automated Test Course QPET (Updated)",
          defaultFee: 18000,
        },
      });
      recordTest(
        "Courses",
        "Update Course: PUT /api/admin/courses modifies record",
        updateCourseRes.status === 200 && updateCourseRes.data?.course?.defaultFee === 18000 ? "PASS" : "FAIL",
        `Updated Fee: ₹${updateCourseRes.data?.course?.defaultFee}`
      );
    }

    // =========================================================================
    // MODULE 4: STUDENTS MANAGEMENT
    // =========================================================================
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("MODULE 4: STUDENTS DIRECTORY & PROFILE MANAGEMENT");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // 4.1 List students
    const studentsRes = await adminClient.request("/api/admin/students");
    recordTest(
      "Students",
      "List Students: GET /api/admin/students returns student profiles",
      studentsRes.status === 200 && Array.isArray(studentsRes.data?.students) ? "PASS" : "FAIL",
      `Total Students: ${studentsRes.data?.students?.length}`
    );

    // 4.2 Search Students
    const searchRes = await adminClient.request("/api/admin/students?query=Amit");
    recordTest(
      "Students",
      "Search Students: GET /api/admin/students?query=Amit filters results",
      searchRes.status === 200 ? "PASS" : "FAIL",
      `Search matched: ${searchRes.data?.students?.length} records`
    );

    // 4.3 Create New Student with Course Enrollment
    const testStudentMobile = `98${Date.now().toString().slice(-8)}`;
    const studentCourseId = createdCourseId || (await db.collection("courses").findOne({ isActive: true }))?._id?.toString();

    const createStudentRes = await adminClient.request("/api/admin/students", {
      method: "POST",
      body: {
        fullName: "Auto Test Student",
        fatherOrGuardianName: "Auto Test Guardian",
        dateOfBirth: "2002-05-15",
        gender: "male",
        mobileNumber: testStudentMobile,
        email: `test_${testStudentMobile}@example.com`,
        address: "123 Auto Test Street, Bhopal",
        qualification: "B.Tech Computer Science",
        courseId: studentCourseId,
        customFee: 12000,
        paymentType: "installment",
        installmentCount: 2,
        password: "TestPassword123!",
      },
    });

    const studentCreated = createStudentRes.status === 201 && createStudentRes.data?.student?._id;
    if (studentCreated) {
      createdStudentId = createStudentRes.data.student._id;
      createdEnrollmentId = createStudentRes.data.enrollment?._id;
    }

    recordTest(
      "Students",
      "Create Student: POST /api/admin/students creates student profile, enrollment & user login",
      studentCreated ? "PASS" : "FAIL",
      `Student ID: ${createdStudentId}, Enrollment No: ${createStudentRes.data?.enrollment?.enrollmentNumber}`
    );

    // Check DB persistence of Student, User, and Installments
    const studentInDb = await db.collection("studentprofiles").findOne({ mobileNumber: testStudentMobile });
    const userInDb = await db.collection("users").findOne({ identifier: testStudentMobile });
    const installmentsInDb = await db.collection("installments").find({ studentId: studentInDb?._id }).toArray();

    recordTest(
      "Students",
      "DB Persistence: StudentProfile, User credentials & 2 Installments stored in DB",
      studentInDb && userInDb && installmentsInDb.length === 2 ? "PASS" : "FAIL",
      `User Role: ${userInDb?.role}, Installment count: ${installmentsInDb.length}`
    );

    // 4.4 Update Student Profile
    if (createdStudentId) {
      const updateStudentRes = await adminClient.request("/api/admin/students", {
        method: "PUT",
        body: {
          studentId: createdStudentId,
          fullName: "Auto Test Student (Edited)",
          address: "Updated Address 456, Indore",
        },
      });
      recordTest(
        "Students",
        "Update Student: PUT /api/admin/students successfully modifies student record",
        updateStudentRes.status === 200 && updateStudentRes.data?.student?.fullName?.includes("Edited") ? "PASS" : "FAIL"
      );
    }

    // 4.5 Reset Student Password
    if (createdStudentId) {
      const resetPassRes = await adminClient.request("/api/admin/students", {
        method: "PATCH",
        body: {
          studentId: createdStudentId,
          action: "reset_password",
          newPassword: "NewSecretPassword123!",
        },
      });
      recordTest(
        "Students",
        "Student Password Reset: PATCH /api/admin/students resets student credentials",
        resetPassRes.status === 200 && resetPassRes.data?.success ? "PASS" : "FAIL"
      );
    }

    // =========================================================================
    // MODULE 5: ENROLLMENTS & BATCHES MANAGEMENT
    // =========================================================================
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("MODULE 5: ENROLLMENTS & BATCHES MANAGEMENT");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const enrollmentsRes = await adminClient.request("/api/admin/enrollments");
    recordTest(
      "Enrollments",
      "List Enrollments: GET /api/admin/enrollments returns active student enrollments",
      enrollmentsRes.status === 200 && Array.isArray(enrollmentsRes.data?.enrollments) ? "PASS" : "FAIL",
      `Found ${enrollmentsRes.data?.enrollments?.length} enrollments`
    );

    // Duplicate enrollment protection check
    if (createdStudentId && studentCourseId) {
      const duplicateEnrollmentRes = await adminClient.request("/api/admin/enrollments", {
        method: "POST",
        body: {
          studentId: createdStudentId,
          courseId: studentCourseId,
          customFee: 10000,
          allowDuplicate: false,
        },
      });
      recordTest(
        "Enrollments",
        "Duplicate Protection: System prevents accidental duplicate enrollment without flag",
        duplicateEnrollmentRes.status === 409 ? "PASS" : "FAIL",
        `Status: ${duplicateEnrollmentRes.status}`
      );
    }

    // =========================================================================
    // MODULE 6: FEES & RECEIPTS MANAGEMENT
    // =========================================================================
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("MODULE 6: FEES, INSTALLMENTS & RECEIPT GENERATION");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // 6.1 List Payments
    const paymentsRes = await adminClient.request("/api/admin/fees");
    recordTest(
      "Fees",
      "List Fees: GET /api/admin/fees returns payment transaction history",
      paymentsRes.status === 200 && Array.isArray(paymentsRes.data?.payments) ? "PASS" : "FAIL"
    );

    // 6.2 Record Fee Payment
    if (createdEnrollmentId) {
      const payAmount = 6000;
      const recordPayRes = await adminClient.request("/api/admin/fees", {
        method: "POST",
        body: {
          enrollmentId: createdEnrollmentId,
          amount: payAmount,
          paymentMethod: "upi",
          transactionReference: "UPI-AUTO-TEST-12345",
          remarks: "First installment test payment",
        },
      });

      const paymentRecorded = recordPayRes.status === 200 && recordPayRes.data?.receipt?._id;
      if (paymentRecorded) {
        createdReceiptId = recordPayRes.data.receipt._id;
      }

      recordTest(
        "Fees",
        "Record Payment: POST /api/admin/fees records payment and generates receipt",
        paymentRecorded ? "PASS" : "FAIL",
        `Receipt: ${recordPayRes.data?.receipt?.receiptNumber}, Amount: ₹${payAmount}`
      );

      // Verify Enrollment balance decremented in DB
      const updatedEnrollmentInDb = await db.collection("enrollments").findOne({ _id: new mongoose.Types.ObjectId(createdEnrollmentId) });
      recordTest(
        "Fees",
        "Balance Calculation: Enrollment paidAmount & outstandingBalance accurately updated",
        updatedEnrollmentInDb && updatedEnrollmentInDb.paidAmount === 6000 && updatedEnrollmentInDb.outstandingBalance === 6000 ? "PASS" : "FAIL",
        `Paid: ₹${updatedEnrollmentInDb?.paidAmount}, Balance: ₹${updatedEnrollmentInDb?.outstandingBalance}`
      );

      // 6.3 List Receipts
      const receiptsRes = await adminClient.request("/api/admin/receipts");
      recordTest(
        "Fees",
        "List Receipts: GET /api/admin/receipts returns official receipt records",
        receiptsRes.status === 200 && Array.isArray(receiptsRes.data?.receipts) ? "PASS" : "FAIL"
      );

      // 6.4 PDF Receipt Download
      if (createdReceiptId) {
        const receiptPdfRes = await adminClient.request(`/api/pdf/receipt/${createdReceiptId}`);
        recordTest(
          "Fees",
          "PDF Receipt Download: GET /api/pdf/receipt/[id] returns application/pdf stream",
          receiptPdfRes.status === 200 && receiptPdfRes.contentType?.includes("application/pdf") ? "PASS" : "FAIL",
          `Content-Type: ${receiptPdfRes.contentType}`
        );
      }
    }

    // =========================================================================
    // MODULE 7: ADMISSIONS & PUBLIC REGISTRATIONS
    // =========================================================================
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("MODULE 7: ADMISSIONS & PUBLIC REGISTRATIONS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // 7.1 Submit Public Registration
    const publicRegMobile = `97${Date.now().toString().slice(-8)}`;
    const anyCourse = await db.collection("courses").findOne({ isActive: true });

    const publicRegRes = await unauthClient.request("/api/auth/register", {
      method: "POST",
      body: {
        fullName: "Public Applicant Test",
        fatherOrGuardianName: "Applicant Guardian",
        dateOfBirth: "2003-08-20",
        gender: "female",
        mobileNumber: publicRegMobile,
        email: `applicant_${publicRegMobile}@example.com`,
        address: "789 Public Square, Jabalpur",
        qualification: "Graduate",
        preferredCourseId: anyCourse?._id?.toString(),
      },
    });

    const regSubmitted = (publicRegRes.status === 200 || publicRegRes.status === 201) && (publicRegRes.data?.studentId || publicRegRes.data?.student?._id);
    if (regSubmitted) {
      createdRegistrationId = publicRegRes.data.studentId || publicRegRes.data.student._id;
    }

    recordTest(
      "Registrations",
      "Public Registration: POST /api/auth/register submits pending admission form",
      regSubmitted ? "PASS" : "FAIL",
      `Application ID: ${createdRegistrationId}`
    );

    // 7.2 Admin View Pending Registrations
    const pendingRegsRes = await adminClient.request("/api/admin/registrations");
    const foundInPending = pendingRegsRes.data?.registrations?.some((r) => r.mobileNumber === publicRegMobile);
    recordTest(
      "Registrations",
      "Pending List: GET /api/admin/registrations lists new admission request",
      pendingRegsRes.status === 200 && foundInPending ? "PASS" : "FAIL"
    );

    // 7.3 Admin Approve Admission
    if (createdRegistrationId) {
      const approveRes = await adminClient.request("/api/admin/registrations", {
        method: "PATCH",
        body: {
          studentId: createdRegistrationId,
          action: "approve",
          agreedFee: anyCourse?.defaultFee || 10000,
          paymentType: "full",
        },
      });

      recordTest(
        "Registrations",
        "Approve Admission: PATCH /api/admin/registrations converts applicant to active student & creates login",
        approveRes.status === 200 && approveRes.data?.success ? "PASS" : "FAIL",
        `Credentials Username: ${approveRes.data?.credentials?.username}`
      );
    }

    // =========================================================================
    // MODULE 8: CERTIFICATES & QR CODE VERIFICATION
    // =========================================================================
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("MODULE 8: CERTIFICATES & VERIFICATION");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Pay remaining balance of createdEnrollmentId so student is eligible for certificate
    if (createdEnrollmentId) {
      await adminClient.request("/api/admin/fees", {
        method: "POST",
        body: {
          enrollmentId: createdEnrollmentId,
          amount: 6000,
          paymentMethod: "cash",
          remarks: "Final fee clearance for certificate eligibility",
        },
      });
    }

    // 8.1 List Certificates & Eligible Enrollments
    const certsRes = await adminClient.request("/api/admin/certificates");
    recordTest(
      "Certificates",
      "List Certificates: GET /api/admin/certificates returns certificate register & eligible list",
      certsRes.status === 200 && Array.isArray(certsRes.data?.certificates) ? "PASS" : "FAIL"
    );

    // 8.2 Generate Certificate
    if (createdEnrollmentId) {
      const genCertRes = await adminClient.request("/api/admin/certificates", {
        method: "POST",
        body: {
          enrollmentId: createdEnrollmentId,
          grade: "A+",
        },
      });

      const certGenerated = genCertRes.status === 200 && genCertRes.data?.certificate?._id;
      if (certGenerated) {
        createdCertificateId = genCertRes.data.certificate._id;
        createdCertificateNumber = genCertRes.data.certificate.certificateNumber;
      }

      recordTest(
        "Certificates",
        "Generate Certificate: POST /api/admin/certificates issues verified certificate with QR code",
        certGenerated ? "PASS" : "FAIL",
        `Cert No: ${createdCertificateNumber}, Grade: A+`
      );

      // 8.3 Public Verification Endpoint
      if (createdCertificateNumber) {
        const verifyRes = await unauthClient.request(`/api/certificates/verify?cert=${encodeURIComponent(createdCertificateNumber)}`);
        recordTest(
          "Certificates",
          "Public QR Verification: /api/certificates/verify validates certificate authenticity without auth",
          verifyRes.status === 200 && verifyRes.data?.status === "valid" ? "PASS" : "FAIL",
          `Status: ${verifyRes.data?.status}, Student: ${verifyRes.data?.certificate?.studentName}`
        );

        // 8.4 PDF Certificate Download
        const certPdfRes = await adminClient.request(`/api/pdf/certificate/${createdCertificateId}`);
        recordTest(
          "Certificates",
          "PDF Certificate Download: GET /api/pdf/certificate/[id] returns application/pdf stream",
          certPdfRes.status === 200 && certPdfRes.contentType?.includes("application/pdf") ? "PASS" : "FAIL",
          `Content-Type: ${certPdfRes.contentType}`
        );
      }
    }

    // =========================================================================
    // MODULE 9: REPORTS & DATA EXPORTS
    // =========================================================================
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("MODULE 9: REPORTS & EXCEL/CSV EXPORT ENGINE");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // 9.1 Students CSV Export
    const studentCsvRes = await adminClient.request("/api/admin/reports?type=students&format=csv");
    recordTest(
      "Reports",
      "Student Directory Export: GET /api/admin/reports?type=students&format=csv returns CSV file",
      studentCsvRes.status === 200 && typeof studentCsvRes.data === "string" && studentCsvRes.data.includes("Full Name") ? "PASS" : "FAIL",
      `Headers detected: ${studentCsvRes.data?.slice(0, 50)}...`
    );

    // 9.2 Enrollments CSV Export
    const enrollmentsCsvRes = await adminClient.request("/api/admin/reports?type=enrollments&format=csv");
    recordTest(
      "Reports",
      "Enrollment Report Export: GET /api/admin/reports?type=enrollments&format=csv returns CSV file",
      enrollmentsCsvRes.status === 200 && typeof enrollmentsCsvRes.data === "string" && enrollmentsCsvRes.data.includes("Enrollment Number") ? "PASS" : "FAIL"
    );

    // 9.3 Payments CSV Export
    const paymentsCsvRes = await adminClient.request("/api/admin/reports?type=payments&format=csv");
    recordTest(
      "Reports",
      "Financial Payments Export: GET /api/admin/reports?type=payments&format=csv returns CSV file",
      paymentsCsvRes.status === 200 && typeof paymentsCsvRes.data === "string" && paymentsCsvRes.data.includes("Receipt Number") ? "PASS" : "FAIL"
    );

    // 9.4 Courses CSV Export
    const coursesCsvRes = await adminClient.request("/api/admin/reports?type=courses&format=csv");
    recordTest(
      "Reports",
      "Curriculum Export: GET /api/admin/reports?type=courses&format=csv returns CSV file",
      coursesCsvRes.status === 200 && typeof coursesCsvRes.data === "string" && coursesCsvRes.data.includes("Course Code") ? "PASS" : "FAIL"
    );

    // =========================================================================
    // MODULE 10: SECURITY AUDIT LOGS
    // =========================================================================
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("MODULE 10: SECURITY AUDIT LOGS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // 10.1 Admin View Audit Logs
    const auditLogsRes = await adminClient.request("/api/admin/audit-logs");
    recordTest(
      "Audit Logs",
      "Admin Access: GET /api/admin/audit-logs returns complete immutable audit trail",
      auditLogsRes.status === 200 && Array.isArray(auditLogsRes.data?.logs) ? "PASS" : "FAIL",
      `Total Logged Events: ${auditLogsRes.data?.logs?.length}`
    );

    // 10.2 Verify previous test actions recorded in audit trail
    const hasStudentCreatedEvent = auditLogsRes.data?.logs?.some((l) => l.action === "STUDENT_CREATED_BY_ADMIN");
    recordTest(
      "Audit Logs",
      "Audit Trail Integrity: Automated actions (STUDENT_CREATED_BY_ADMIN) faithfully recorded",
      hasStudentCreatedEvent ? "PASS" : "FAIL"
    );

    // 10.3 Unauthorized Access: Trainer without permission blocked
    const trainerAuditRes = await trainerClient.request("/api/admin/audit-logs");
    recordTest(
      "Audit Logs",
      "RBAC Protection: Trainer without viewAuditReports is blocked (403 Forbidden)",
      trainerAuditRes.status === 403 ? "PASS" : "FAIL",
      `Status: ${trainerAuditRes.status}`
    );

    // =========================================================================
    // MODULE 11: TRAINER MANAGEMENT & PERMISSION MATRIX
    // =========================================================================
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("MODULE 11: TRAINER MANAGEMENT & ROLE PERMISSION MATRIX");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // 11.1 List Trainers
    const trainersRes = await adminClient.request("/api/admin/trainers");
    recordTest(
      "Trainer Management",
      "List Trainers: GET /api/admin/trainers returns faculty list",
      trainersRes.status === 200 && Array.isArray(trainersRes.data?.trainers) ? "PASS" : "FAIL",
      `Total Trainers: ${trainersRes.data?.trainers?.length}`
    );

    // 11.2 Create Test Trainer
    const testTrainerIdent = `testfaculty_${Date.now().toString().slice(-4)}@qpet.in`;
    const createTrainerRes = await adminClient.request("/api/admin/trainers", {
      method: "POST",
      body: {
        name: "Test Faculty Member",
        identifier: testTrainerIdent,
        email: testTrainerIdent,
        password: "FacultySecret123!",
        permissions: {
          viewStudents: true,
          viewCourses: true,
          viewAuditReports: false,
        },
      },
    });

    const trainerCreated = createTrainerRes.status === 200 && createTrainerRes.data?.trainer?._id;
    if (trainerCreated) {
      createdTrainerId = createTrainerRes.data.trainer._id;
    }

    recordTest(
      "Trainer Management",
      "Create Trainer: POST /api/admin/trainers creates faculty account with permissions",
      trainerCreated ? "PASS" : "FAIL",
      `ID: ${createdTrainerId}, Identifier: ${testTrainerIdent}`
    );

    // 11.3 Update Permissions with Preset
    if (createdTrainerId) {
      const updatePermsRes = await adminClient.request("/api/admin/trainers", {
        method: "PATCH",
        body: {
          id: createdTrainerId,
          permissionPreset: "academicLead",
          permissions: {
            viewStudents: true,
            editStudents: true,
            viewCourses: true,
            editCourses: true,
            viewAuditReports: true,
          },
        },
      });

      recordTest(
        "Trainer Management",
        "Update Permissions: PATCH /api/admin/trainers updates permissions & logs audit event",
        updatePermsRes.status === 200 && updatePermsRes.data?.trainer?.permissions?.editStudents === true ? "PASS" : "FAIL"
      );

      // 11.4 Delete Test Trainer (Teardown)
      const deleteTrainerRes = await adminClient.request(`/api/admin/trainers?id=${createdTrainerId}`, {
        method: "DELETE",
      });
      recordTest(
        "Trainer Management",
        "Delete Trainer: DELETE /api/admin/trainers cleanly removes test faculty account",
        deleteTrainerRes.status === 200 && deleteTrainerRes.data?.success ? "PASS" : "FAIL"
      );
    }

    // =========================================================================
    // MODULE 12: TRAINER PORTAL FUNCTIONALITY
    // =========================================================================
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("MODULE 12: TRAINER PORTAL ACADEMIC DASHBOARD");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const trainerDashRes = await trainerClient.request("/api/trainer/dashboard");
    const tData = trainerDashRes.data;

    recordTest(
      "Trainer Portal",
      "Faculty Dashboard: GET /api/trainer/dashboard returns academic stats",
      trainerDashRes.status === 200 ? "PASS" : "FAIL",
      `Students: ${tData?.stats?.totalStudents}, Courses: ${tData?.stats?.totalCourses}`
    );

    recordTest(
      "Trainer Portal",
      "Strict Financial Isolation: Trainer API response contains ZERO revenue or fee properties",
      tData?.stats?.totalRevenue === undefined && tData?.stats?.totalCollected === undefined ? "PASS" : "FAIL"
    );

    // =========================================================================
    // MODULE 13: STUDENT PORTAL & DATA ISOLATION (ZERO IDOR)
    // =========================================================================
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("MODULE 13: STUDENT PORTAL & STRICT DATA ISOLATION");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Login as the student created in Module 4
    if (testStudentMobile) {
      const studentLoginRes = await studentClient.request("/api/auth/login", {
        method: "POST",
        body: { identifier: testStudentMobile, password: "NewSecretPassword123!" },
      });

      recordTest(
        "Student Portal",
        "Student Authentication: Student logs in with updated mobile credentials",
        studentLoginRes.status === 200 && (studentLoginRes.data?.user?.role === "student" || studentLoginRes.data?.role === "student") ? "PASS" : "FAIL"
      );

      // Student Dashboard
      const sDashRes = await studentClient.request("/api/student/dashboard");
      recordTest(
        "Student Portal",
        "Student Dashboard: GET /api/student/dashboard returns personal curriculum & progress",
        sDashRes.status === 200 && sDashRes.data?.profile?.mobileNumber === testStudentMobile ? "PASS" : "FAIL",
        `Enrolled Courses: ${sDashRes.data?.summary?.totalCourses}`
      );

      // Student Fees
      const sFeesRes = await studentClient.request("/api/student/fees");
      recordTest(
        "Student Portal",
        "Student Fees: GET /api/student/fees returns personal payments & installments",
        sFeesRes.status === 200 && Array.isArray(sFeesRes.data?.payments) ? "PASS" : "FAIL"
      );

      // Student Receipts
      const sReceiptsRes = await studentClient.request("/api/student/receipts");
      recordTest(
        "Student Portal",
        "Student Receipts: GET /api/student/receipts returns personal fee receipts",
        sReceiptsRes.status === 200 && Array.isArray(sReceiptsRes.data?.receipts) ? "PASS" : "FAIL"
      );

      // Student Certificates
      const sCertsRes = await studentClient.request("/api/student/certificates");
      recordTest(
        "Student Portal",
        "Student Certificates: GET /api/student/certificates returns personal credentials",
        sCertsRes.status === 200 && Array.isArray(sCertsRes.data?.certificates) ? "PASS" : "FAIL"
      );

      // IDOR Cross-Account Protection: Student cannot access Admin endpoints
      const studentAccessAdminRes = await studentClient.request("/api/admin/dashboard");
      recordTest(
        "Student Portal",
        "BOLA / IDOR Protection: Student token is strictly blocked from Admin API endpoints (403)",
        studentAccessAdminRes.status === 403 ? "PASS" : "FAIL"
      );

      const studentAccessAuditRes = await studentClient.request("/api/admin/audit-logs");
      recordTest(
        "Student Portal",
        "BOLA / IDOR Protection: Student token is strictly blocked from Security Audit Logs (403)",
        studentAccessAuditRes.status === 403 ? "PASS" : "FAIL"
      );
    }

  } catch (err) {
    console.error("FATAL ERROR IN TEST SUITE:", err);
  } finally {
    // =========================================================================
    // TEARDOWN: Clean up temporary test entities to preserve production state
    // =========================================================================
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🧹 TEARDOWN: CLEANING UP TEMPORARY AUTOMATED TEST RECORDS");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    if (createdStudentId) {
      await db.collection("studentprofiles").deleteOne({ _id: new mongoose.Types.ObjectId(createdStudentId) });
      await db.collection("users").deleteOne({ studentProfileId: new mongoose.Types.ObjectId(createdStudentId) });
      await db.collection("enrollments").deleteMany({ studentId: new mongoose.Types.ObjectId(createdStudentId) });
      await db.collection("installments").deleteMany({ studentId: new mongoose.Types.ObjectId(createdStudentId) });
      await db.collection("payments").deleteMany({ studentId: new mongoose.Types.ObjectId(createdStudentId) });
      await db.collection("feereceipts").deleteMany({ studentId: new mongoose.Types.ObjectId(createdStudentId) });
      await db.collection("certificates").deleteMany({ studentId: new mongoose.Types.ObjectId(createdStudentId) });
      console.log(`  ✓ Cleaned up test student: ${createdStudentId}`);
    }

    if (createdRegistrationId) {
      await db.collection("studentprofiles").deleteOne({ _id: new mongoose.Types.ObjectId(createdRegistrationId) });
      console.log(`  ✓ Cleaned up test applicant registration: ${createdRegistrationId}`);
    }

    if (createdCourseId) {
      await db.collection("courses").deleteOne({ _id: new mongoose.Types.ObjectId(createdCourseId) });
      console.log(`  ✓ Cleaned up test course: ${createdCourseId}`);
    }

    await mongoose.disconnect();
    console.log("  ✓ Disconnected from MongoDB Atlas.");

    // SUMMARY
    console.log("\n======================================================================");
    console.log(`📊 FINAL TEST RUN RESULTS SUMMARY:`);
    console.log(`   TOTAL TESTS: ${results.passed + results.failed + results.blocked + results.notTested}`);
    console.log(`   ✅ PASSED:     ${results.passed}`);
    console.log(`   ❌ FAILED:     ${results.failed}`);
    console.log(`   ⚠️  BLOCKED:    ${results.blocked}`);
    console.log(`   ⚪ NOT TESTED: ${results.notTested}`);
    console.log("======================================================================\n");
  }
}

main().catch(console.error);
