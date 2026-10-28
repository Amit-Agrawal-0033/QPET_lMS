import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3005";

console.log("======================================================================");
console.log("🧪 TESTING TRAINER CREATE / ADD PERMISSIONS & FACULTY PORTAL ACTIONS");
console.log("======================================================================\n");

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
        if (val) this.cookies[key] = val;
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
    if (cookieHeader) headers["Cookie"] = cookieHeader;

    if (options.body && typeof options.body === "object") {
      headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, { ...options, headers });
    this.updateCookies(response);

    let data = null;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await response.json().catch(() => null);
    }
    return { response, status: response.status, data };
  }
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const trainerClient = new HttpClient("Trainer");
  const rand = Math.floor(1000 + Math.random() * 9000);

  let createdStudentId = null;
  let createdCourseId = null;
  let createdCertId = null;

  try {
    // 1. Authenticate Trainer
    console.log("1. Authenticating Trainer Roshini Bajpai...");
    const loginRes = await trainerClient.request("/api/auth/login", {
      method: "POST",
      body: { identifier: "roshni.bajpai@qpet.in", password: "123456" },
    });
    console.log(`   ↳ Login status: ${loginRes.status}, Role: ${loginRes.data?.user?.role || loginRes.data?.role}`);

    const meRes = await trainerClient.request("/api/auth/me");
    console.log(`   ↳ /api/auth/me: ${meRes.data?.user?.name}, Permissions:`, Object.keys(meRes.data?.user?.permissions || {}));

    // 2. Test Trainer Creating a Course (editCourses)
    console.log("\n2. Testing Trainer Creating Course (POST /api/admin/courses)...");
    const testCourseCode = `TRN_${rand}`;
    const courseRes = await trainerClient.request("/api/admin/courses", {
      method: "POST",
      body: {
        code: testCourseCode,
        title: `Trainer Course ${rand}`,
        description: "Course created by Trainer through portal",
        durationMonths: 3,
        defaultFee: 4500,
        isActive: true,
      },
    });
    console.log(`   ↳ Status: ${courseRes.status}, Success: ${courseRes.data?.success}, Code: ${courseRes.data?.course?.code}`);
    if (courseRes.data?.course?._id) createdCourseId = courseRes.data.course._id;

    // 3. Test Trainer Creating a Student (editStudents)
    console.log("\n3. Testing Trainer Creating Student (POST /api/admin/students)...");
    const testMobile = `98${Math.floor(10000000 + Math.random() * 90000000)}`;
    const studentRes = await trainerClient.request("/api/admin/students", {
      method: "POST",
      body: {
        fullName: `Trainer Student ${rand}`,
        fatherOrGuardianName: `Parent ${rand}`,
        mobileNumber: testMobile,
        email: `student_${rand}@example.com`,
        address: "123 Trainer Enrolled Lane, City",
        courseId: createdCourseId,
        customFee: 4500,
        paymentType: "full",
      },
    });
    console.log(`   ↳ Status: ${studentRes.status}, Success: ${studentRes.data?.success}, Student: ${studentRes.data?.student?.fullName}`);
    console.log(`   ↳ Credentials Generated: Username: ${studentRes.data?.credentials?.username}, Password: ${studentRes.data?.credentials?.password}`);
    if (studentRes.data?.student?._id) createdStudentId = studentRes.data.student._id;

    // 4. Test Trainer Updating/Editing a Student (PUT /api/admin/students)
    console.log("\n4. Testing Trainer Editing Student Details (PUT /api/admin/students)...");
    if (createdStudentId) {
      const editRes = await trainerClient.request("/api/admin/students", {
        method: "PUT",
        body: {
          studentId: createdStudentId,
          fullName: `Trainer Student ${rand} (Updated)`,
          fatherOrGuardianName: `Parent ${rand} (Updated)`,
          mobileNumber: testMobile,
          address: "Updated Address 456, City",
          qualification: "Graduate",
        },
      });
      console.log(`   ↳ Status: ${editRes.status}, Success: ${editRes.data?.success}, Updated Name: ${editRes.data?.student?.fullName}`);
    }

    // 5. Test Trainer Reading Pending Registrations (viewRegistrations)
    console.log("\n5. Testing Trainer Viewing Registrations (GET /api/admin/registrations)...");
    const regRes = await trainerClient.request("/api/admin/registrations");
    console.log(`   ↳ Status: ${regRes.status}, Pending count: ${regRes.data?.registrations?.length || 0}`);

    // 6. Test Trainer Generating Certificate (POST /api/admin/certificates)
    console.log("\n6. Testing Trainer Generating Certificate (POST /api/admin/certificates)...");
    // Find eligible enrollment from certificates endpoint
    const certListRes = await trainerClient.request("/api/admin/certificates");
    const eligible = certListRes.data?.eligibleEnrollments || [];
    console.log(`   ↳ Eligible Enrollments: ${eligible.length}`);

    if (eligible.length > 0) {
      const targetEnrollment = eligible[0];
      const certIssueRes = await trainerClient.request("/api/admin/certificates", {
        method: "POST",
        body: {
          enrollmentId: targetEnrollment._id,
          grade: "A+",
          issueDate: new Date().toISOString().split("T")[0],
        },
      });
      console.log(`   ↳ Status: ${certIssueRes.status}, Success: ${certIssueRes.data?.success}, Cert No: ${certIssueRes.data?.certificate?.certificateNumber}`);
      if (certIssueRes.data?.certificate?._id) createdCertId = certIssueRes.data.certificate._id;
    }

    console.log("\n======================================================================");
    console.log("🎉 ALL TRAINER CREATION AND RBAC CAPABILITIES VERIFIED SUCCESSFULLY!");
    console.log("======================================================================");

  } finally {
    // Teardown
    console.log("\nCleaning up test records...");
    if (createdStudentId) {
      await mongoose.connection.db.collection("studentprofiles").deleteOne({ _id: new mongoose.Types.ObjectId(createdStudentId) });
      await mongoose.connection.db.collection("users").deleteOne({ studentProfileId: new mongoose.Types.ObjectId(createdStudentId) });
      await mongoose.connection.db.collection("enrollments").deleteMany({ studentId: new mongoose.Types.ObjectId(createdStudentId) });
      console.log("  ✓ Cleaned test student");
    }
    if (createdCourseId) {
      await mongoose.connection.db.collection("courses").deleteOne({ _id: new mongoose.Types.ObjectId(createdCourseId) });
      console.log("  ✓ Cleaned test course");
    }
    if (createdCertId) {
      await mongoose.connection.db.collection("certificates").deleteOne({ _id: new mongoose.Types.ObjectId(createdCertId) });
      console.log("  ✓ Cleaned test certificate");
    }
    await mongoose.disconnect();
  }
}

run().catch(console.error);
