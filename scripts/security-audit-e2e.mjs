import http from "http";
import https from "https";
import mongoose from "mongoose";

const BASE_URL = "http://localhost:4000";

function makeRequest({ method = "GET", path, headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const postData = body ? (typeof body === "string" ? body : JSON.stringify(body)) : null;

    const reqHeaders = { ...headers };
    if (postData) {
      if (!reqHeaders["Content-Type"]) reqHeaders["Content-Type"] = "application/json";
      reqHeaders["Content-Length"] = Buffer.byteLength(postData);
    }

    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: reqHeaders,
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        let json = null;
        try {
          json = JSON.parse(data);
        } catch {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: json,
          raw: data,
        });
      });
    });

    req.on("error", reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTestSuite() {
  console.log("\n================================================================================");
  console.log("       QPET LMS: COMPREHENSIVE SECURITY, AUTH & RBAC AUDIT SUITE");
  console.log("================================================================================\n");

  const results = [];

  function record(category, testName, passed, details = "") {
    results.push({ category, testName, passed, details });
    const status = passed ? "\x1b[32m[PASS]\x1b[0m" : "\x1b[31m[FAIL]\x1b[0m";
    console.log(`${status} ${category} > ${testName}`);
    if (details) console.log(`       \x1b[90m${details}\x1b[0m`);
  }

  // Clear any existing rate-limit lockouts in DB before testing
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/qpet_lms";
    await mongoose.connect(mongoUri);
    await mongoose.connection.collection("loginattempts").deleteMany({});
  } catch (e) {
    console.log("Note: Could not reset rate limits in DB:", e.message);
  }

  // ---------------------------------------------------------------------------
  // SECTION A: AUTHENTICATION TESTS
  // ---------------------------------------------------------------------------
  console.log("\n--- SECTION A: Authentication Tests ---");

  // A1: Admin login with alias "admin"
  let resA1 = await makeRequest({
    method: "POST",
    path: "/api/auth/login",
    body: { identifier: "admin", password: "Admin@QPET2026", role: "admin" },
  });
  let adminCookie = resA1.headers["set-cookie"]?.[0] || "";
  record(
    "Auth",
    "Admin login with alias 'admin' on Admin Portal",
    resA1.statusCode === 200 && resA1.data?.user?.role === "admin" && resA1.data?.redirectUrl === "/admin/dashboard",
    `Status: ${resA1.statusCode}, Redirect: ${resA1.data?.redirectUrl}`
  );

  // A2: Admin login with "admin077@qpet.in"
  let resA2 = await makeRequest({
    method: "POST",
    path: "/api/auth/login",
    body: { identifier: "admin077@qpet.in", password: "Admin@QPET2026", role: "admin" },
  });
  record(
    "Auth",
    "Admin login with full email 'admin077@qpet.in' on Admin Portal",
    resA2.statusCode === 200 && resA2.data?.user?.role === "admin",
    `Status: ${resA2.statusCode}, Role: ${resA2.data?.user?.role}`
  );

  // A3: Trainer login with "roshni.bajpai@qpet.in"
  let resA3 = await makeRequest({
    method: "POST",
    path: "/api/auth/login",
    body: { identifier: "roshni.bajpai@qpet.in", password: "123456", role: "trainer" },
  });
  let trainerCookie = resA3.headers["set-cookie"]?.[0] || "";
  record(
    "Auth",
    "Trainer login on Trainer Portal",
    resA3.statusCode === 200 && resA3.data?.user?.role === "trainer" && resA3.data?.redirectUrl === "/trainer/dashboard",
    `Status: ${resA3.statusCode}, Redirect: ${resA3.data?.redirectUrl}`
  );

  // A4: Student login with "7347861212"
  let resA4 = await makeRequest({
    method: "POST",
    path: "/api/auth/login",
    body: { identifier: "7347861212", password: "QPET@1212", role: "student" },
  });
  let studentCookie = resA4.headers["set-cookie"]?.[0] || "";
  record(
    "Auth",
    "Student login on Student Portal",
    resA4.statusCode === 200 && resA4.data?.user?.role === "student" && resA4.data?.redirectUrl === "/student/dashboard",
    `Status: ${resA4.statusCode}, Redirect: ${resA4.data?.redirectUrl}`
  );

  // A5: Incorrect password
  let resA5 = await makeRequest({
    method: "POST",
    path: "/api/auth/login",
    body: { identifier: "admin", password: "wrongpassword123", role: "admin" },
  });
  record(
    "Auth",
    "Incorrect password rejection",
    resA5.statusCode === 401 && resA5.data?.error?.includes("Incorrect password"),
    `Status: ${resA5.statusCode}, Error: ${resA5.data?.error}`
  );

  // A6: Non-existent user
  let resA6 = await makeRequest({
    method: "POST",
    path: "/api/auth/login",
    body: { identifier: "nonexistentuser9999", password: "somePassword123", role: "admin" },
  });
  record(
    "Auth",
    "Non-existent user rejection",
    resA6.statusCode === 401 && resA6.data?.error?.includes("Invalid credentials"),
    `Status: ${resA6.statusCode}, Error: ${resA6.data?.error}`
  );

  // A7: Empty credentials validation
  let resA7 = await makeRequest({
    method: "POST",
    path: "/api/auth/login",
    body: { identifier: "", password: "", role: "admin" },
  });
  record(
    "Auth",
    "Empty credentials rejected with 400",
    resA7.statusCode === 400,
    `Status: ${resA7.statusCode}, Error: ${resA7.data?.error}`
  );

  // A8: Logout purges session
  let resA8 = await makeRequest({
    method: "POST",
    path: "/api/auth/logout",
    headers: { Cookie: adminCookie },
  });
  let setCookieHeader = resA8.headers["set-cookie"]?.[0] || "";
  record(
    "Auth",
    "Logout purges session cookie (Max-Age=0)",
    resA8.statusCode === 200 && (setCookieHeader.includes("Max-Age=0") || setCookieHeader.includes("Expires=")),
    `Status: ${resA8.statusCode}, Set-Cookie: ${setCookieHeader}`
  );

  // ---------------------------------------------------------------------------
  // SECTION B: CROSS-PORTAL AUTHENTICATION LOCKS
  // ---------------------------------------------------------------------------
  console.log("\n--- SECTION B: Cross-Portal Security Locks ---");

  // B1: Trainer attempting Admin Portal
  let resB1 = await makeRequest({
    method: "POST",
    path: "/api/auth/login",
    body: { identifier: "roshni.bajpai@qpet.in", password: "123456", role: "admin" },
  });
  record(
    "CrossPortal",
    "Trainer credentials in Admin Portal (BLOCKED 403)",
    resB1.statusCode === 403 && resB1.data?.error === "Access Denied: This is the Admin Portal. Your account has TRAINER role. Please switch to Trainer Portal.",
    `Error: "${resB1.data?.error}"`
  );

  // B2: Trainer credentials in Student Portal
  let resB2 = await makeRequest({
    method: "POST",
    path: "/api/auth/login",
    body: { identifier: "roshni.bajpai@qpet.in", password: "123456", role: "student" },
  });
  record(
    "CrossPortal",
    "Trainer credentials in Student Portal (BLOCKED 403)",
    resB2.statusCode === 403,
    `Error: "${resB2.data?.error}"`
  );

  // B3: Admin attempting Trainer Portal
  let resB3 = await makeRequest({
    method: "POST",
    path: "/api/auth/login",
    body: { identifier: "admin", password: "Admin@QPET2026", role: "trainer" },
  });
  record(
    "CrossPortal",
    "Admin credentials in Trainer Portal (BLOCKED 403)",
    resB3.statusCode === 403 && resB3.data?.error === "Access Denied: This is the Trainer Portal. Your account has ADMIN role. Please switch to Admin Portal.",
    `Error: "${resB3.data?.error}"`
  );

  // B4: Admin credentials in Student Portal
  let resB4 = await makeRequest({
    method: "POST",
    path: "/api/auth/login",
    body: { identifier: "admin", password: "Admin@QPET2026", role: "student" },
  });
  record(
    "CrossPortal",
    "Admin credentials in Student Portal (BLOCKED 403)",
    resB4.statusCode === 403,
    `Error: "${resB4.data?.error}"`
  );

  // B5: Student attempting Admin Portal
  let resB5 = await makeRequest({
    method: "POST",
    path: "/api/auth/login",
    body: { identifier: "7347861212", password: "QPET@1212", role: "admin" },
  });
  record(
    "CrossPortal",
    "Student credentials in Admin Portal (BLOCKED 403)",
    resB5.statusCode === 403 && resB5.data?.error === "Access Denied: Your account does not have permission to access this portal.",
    `Error: "${resB5.data?.error}"`
  );

  // B6: Student attempting Trainer Portal
  let resB6 = await makeRequest({
    method: "POST",
    path: "/api/auth/login",
    body: { identifier: "7347861212", password: "QPET@1212", role: "trainer" },
  });
  record(
    "CrossPortal",
    "Student credentials in Trainer Portal (BLOCKED 403)",
    resB6.statusCode === 403 && resB6.data?.error === "Access Denied: Your account does not have permission to access this portal.",
    `Error: "${resB6.data?.error}"`
  );

  // ---------------------------------------------------------------------------
  // SECTION C: ROUTE & URL PROTECTION (Middleware & Server Guards)
  // ---------------------------------------------------------------------------
  console.log("\n--- SECTION C: URL & Route Protection ---");

  // C1: Unauthenticated request to /admin/dashboard
  let resC1 = await makeRequest({ path: "/admin/dashboard" });
  record(
    "RouteGuard",
    "Unauthenticated request to /admin/dashboard (Redirected to /login)",
    resC1.statusCode === 307 || resC1.statusCode === 308 || resC1.statusCode === 302,
    `Status: ${resC1.statusCode}, Location: ${resC1.headers["location"]}`
  );

  // C2: Unauthenticated request to /trainer/dashboard
  let resC2 = await makeRequest({ path: "/trainer/dashboard" });
  record(
    "RouteGuard",
    "Unauthenticated request to /trainer/dashboard (Redirected to /login)",
    resC2.statusCode === 307 || resC2.statusCode === 308 || resC2.statusCode === 302,
    `Status: ${resC2.statusCode}, Location: ${resC2.headers["location"]}`
  );

  // C3: Unauthenticated request to /student/dashboard
  let resC3 = await makeRequest({ path: "/student/dashboard" });
  record(
    "RouteGuard",
    "Unauthenticated request to /student/dashboard (Redirected to /login)",
    resC3.statusCode === 307 || resC3.statusCode === 308 || resC3.statusCode === 302,
    `Status: ${resC3.statusCode}, Location: ${resC3.headers["location"]}`
  );

  // C4: Trainer session attempting /admin/dashboard
  let resC4 = await makeRequest({
    path: "/admin/dashboard",
    headers: { Cookie: trainerCookie },
  });
  record(
    "RouteGuard",
    "Trainer session hitting /admin/dashboard (Bounced to /trainer/dashboard)",
    (resC4.statusCode === 307 || resC4.statusCode === 308 || resC4.statusCode === 302) && resC4.headers["location"]?.includes("/trainer/dashboard"),
    `Status: ${resC4.statusCode}, Destination: ${resC4.headers["location"]}`
  );

  // C5: Student session attempting /admin/dashboard
  let resC5 = await makeRequest({
    path: "/admin/dashboard",
    headers: { Cookie: studentCookie },
  });
  record(
    "RouteGuard",
    "Student session hitting /admin/dashboard (Bounced to /student/dashboard)",
    (resC5.statusCode === 307 || resC5.statusCode === 308 || resC5.statusCode === 302) && resC5.headers["location"]?.includes("/student/dashboard"),
    `Status: ${resC5.statusCode}, Destination: ${resC5.headers["location"]}`
  );

  // C6: Student session attempting /trainer/dashboard
  let resC6 = await makeRequest({
    path: "/trainer/dashboard",
    headers: { Cookie: studentCookie },
  });
  record(
    "RouteGuard",
    "Student session hitting /trainer/dashboard (Bounced to /student/dashboard)",
    (resC6.statusCode === 307 || resC6.statusCode === 308 || resC6.statusCode === 302) && resC6.headers["location"]?.includes("/student/dashboard"),
    `Status: ${resC6.statusCode}, Destination: ${resC6.headers["location"]}`
  );

  // ---------------------------------------------------------------------------
  // SECTION D: API AUTHORIZATION & TRAINER DELETE PREVENTION
  // ---------------------------------------------------------------------------
  console.log("\n--- SECTION D: API Security & Trainer DELETE Blocking ---");

  // D1: Unauthenticated API request to /api/admin/audit-logs
  let resD1 = await makeRequest({ path: "/api/admin/audit-logs" });
  record(
    "ApiAuth",
    "Unauthenticated request to /api/admin/audit-logs (BLOCKED 401)",
    resD1.statusCode === 401,
    `Status: ${resD1.statusCode}`
  );

  // D2: Trainer requesting Admin Audit Logs API
  let resD2 = await makeRequest({
    path: "/api/admin/audit-logs",
    headers: { Cookie: trainerCookie },
  });
  record(
    "ApiAuth",
    "Trainer requesting /api/admin/audit-logs (BLOCKED 403)",
    resD2.statusCode === 403,
    `Status: ${resD2.statusCode}`
  );

  // D3: Trainer requesting Admin Trainer Management API
  let resD3 = await makeRequest({
    path: "/api/admin/trainers",
    headers: { Cookie: trainerCookie },
  });
  record(
    "ApiAuth",
    "Trainer requesting /api/admin/trainers (BLOCKED 403)",
    resD3.statusCode === 403,
    `Status: ${resD3.statusCode}`
  );

  // D4: Student requesting Admin Students API
  let resD4 = await makeRequest({
    path: "/api/admin/students",
    headers: { Cookie: studentCookie },
  });
  record(
    "ApiAuth",
    "Student requesting /api/admin/students (BLOCKED 403)",
    resD4.statusCode === 403,
    `Status: ${resD4.statusCode}`
  );

  // D5: Student requesting Trainer Dashboard API
  let resD5 = await makeRequest({
    path: "/api/trainer/dashboard",
    headers: { Cookie: studentCookie },
  });
  record(
    "ApiAuth",
    "Student requesting /api/trainer/dashboard (BLOCKED 403)",
    resD5.statusCode === 403,
    `Status: ${resD5.statusCode}`
  );

  // D6: Trainer attempting DELETE request on /api/admin/students
  let resD6 = await makeRequest({
    method: "DELETE",
    path: "/api/admin/students?id=6ad8991d511ce1426211a586",
    headers: { Cookie: trainerCookie },
  });
  record(
    "TrainerDeleteLock",
    "Trainer attempting DELETE on /api/admin/students (BLOCKED 403)",
    resD6.statusCode === 403,
    `Status: ${resD6.statusCode}, Error: ${resD6.data?.error}`
  );

  // D7: Trainer attempting DELETE request on /api/admin/courses
  let resD7 = await makeRequest({
    method: "DELETE",
    path: "/api/admin/courses?id=6ad8991d511ce1426211a586",
    headers: { Cookie: trainerCookie },
  });
  record(
    "TrainerDeleteLock",
    "Trainer attempting DELETE on /api/admin/courses (BLOCKED 403)",
    resD7.statusCode === 403,
    `Status: ${resD7.statusCode}, Error: ${resD7.data?.error}`
  );

  // D8: Trainer attempting DELETE request on /api/admin/certificates
  let resD8 = await makeRequest({
    method: "DELETE",
    path: "/api/admin/certificates?id=6ad8991d511ce1426211a586",
    headers: { Cookie: trainerCookie },
  });
  record(
    "TrainerDeleteLock",
    "Trainer attempting DELETE on /api/admin/certificates (BLOCKED 403)",
    resD8.statusCode === 403,
    `Status: ${resD8.statusCode}, Error: ${resD8.data?.error}`
  );

  // D9: Trainer attempting DELETE request on /api/admin/enrollments
  let resD9 = await makeRequest({
    method: "DELETE",
    path: "/api/admin/enrollments?id=6ad8991d511ce1426211a586",
    headers: { Cookie: trainerCookie },
  });
  record(
    "TrainerDeleteLock",
    "Trainer attempting DELETE on /api/admin/enrollments (BLOCKED 403)",
    resD9.statusCode === 403,
    `Status: ${resD9.statusCode}, Error: ${resD9.data?.error}`
  );

  // ---------------------------------------------------------------------------
  // SECTION E: ATTACK RESILIENCE & SECURITY DEFENSES
  // ---------------------------------------------------------------------------
  console.log("\n--- SECTION E: Attack Resilience & Injection Defenses ---");

  // E1: NoSQL Injection via Object in identifier
  let resE1 = await makeRequest({
    method: "POST",
    path: "/api/auth/login",
    body: { identifier: { $gt: "" }, password: "password", role: "admin" },
  });
  record(
    "AttackDefense",
    "NoSQL Injection attempt in identifier (BLOCKED 400)",
    resE1.statusCode === 400,
    `Status: ${resE1.statusCode}, Error: ${resE1.data?.error}`
  );

  // E2: NoSQL Injection via Object in password
  let resE2 = await makeRequest({
    method: "POST",
    path: "/api/auth/login",
    body: { identifier: "admin", password: { $ne: null }, role: "admin" },
  });
  record(
    "AttackDefense",
    "NoSQL Injection attempt in password (BLOCKED 400)",
    resE2.statusCode === 400,
    `Status: ${resE2.statusCode}, Error: ${resE2.data?.error}`
  );

  // E3: Security Response Headers Present
  let resE3 = await makeRequest({ path: "/" });
  let h = resE3.headers;
  let hasSecurityHeaders =
    h["x-frame-options"] === "SAMEORIGIN" &&
    h["x-content-type-options"] === "nosniff" &&
    h["referrer-policy"] === "strict-origin-when-cross-origin";
  record(
    "Headers",
    "Security Headers Present (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)",
    hasSecurityHeaders,
    `X-Frame: ${h["x-frame-options"]}, X-Content-Type: ${h["x-content-type-options"]}`
  );

  // E4: Rate Limiting: Trigger 5 consecutive failed logins on an IP/user
  console.log("\nTesting Rate Limiting / Brute Force Protection (5 rapid failures)...");
  for (let i = 0; i < 5; i++) {
    await makeRequest({
      method: "POST",
      path: "/api/auth/login",
      body: { identifier: "ratelimit_test_user@example.com", password: "badpassword", role: "student" },
    });
  }
  let resRateLimit = await makeRequest({
    method: "POST",
    path: "/api/auth/login",
    body: { identifier: "ratelimit_test_user@example.com", password: "badpassword", role: "student" },
  });
  record(
    "RateLimit",
    "Brute force lockout triggered after 5 failures (HTTP 429)",
    resRateLimit.statusCode === 429,
    `Status: ${resRateLimit.statusCode}, Message: "${resRateLimit.data?.error}"`
  );

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log("\n================================================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = total - passed;
  console.log(`TOTAL TESTS: ${total} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log(`OVERALL STATUS: ${failed === 0 ? "\x1b[32m100% SECURE & AUDITED (ALL PASSED)\x1b[0m" : "\x1b[31mFAILURES DETECTED\x1b[0m"}`);
  console.log("================================================================================\n");

  process.exit(failed === 0 ? 0 : 1);
}

runTestSuite().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});
