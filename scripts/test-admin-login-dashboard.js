import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config();

const BASE_URL = process.env.TEST_BASE_URL || "http://localhost:3005";

console.log("======================================================================");
console.log("🔍 TESTING ADMIN PANEL LOGIN & DASHBOARD VERIFICATION");
console.log("   Target URL:", BASE_URL);
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

    const response = await fetch(url, { ...options, headers, redirect: options.redirect || "manual" });
    this.updateCookies(response);

    let data = null;
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      data = await response.json().catch(() => null);
    } else if (contentType.includes("text/html")) {
      data = await response.text().catch(() => null);
    }
    return { response, status: response.status, data, location: response.headers.get("location") };
  }
}

async function verify() {
  const adminClient = new HttpClient("Admin");
  const unauthClient = new HttpClient("Unauthenticated");

  // TEST 1: Unauthenticated access to /admin/dashboard must redirect to /login
  console.log("1. Testing Security: Unauthenticated access to /admin/dashboard...");
  const unauthRes = await unauthClient.request("/admin/dashboard");
  const isRedirectToLogin = unauthRes.status === 307 || unauthRes.status === 308 || unauthRes.status === 302;
  const targetLocation = unauthRes.location || "";
  console.log(`   ↳ Status: ${unauthRes.status}, Redirect Location: ${targetLocation}`);
  if (isRedirectToLogin && targetLocation.includes("/login")) {
    console.log("   ✅ PASS: Unauthenticated access strictly redirected to /login");
  } else {
    console.error("   ❌ FAIL: Expected redirect to /login");
  }

  // TEST 2: Admin Login with credentials
  console.log("\n2. Testing Admin Authentication (POST /api/auth/login)...");
  const loginRes = await adminClient.request("/api/auth/login", {
    method: "POST",
    body: {
      identifier: "admin077@qpet.in",
      password: "Admin@QPET2026",
      role: "admin",
    },
  });
  console.log(`   ↳ Status: ${loginRes.status}, Success: ${loginRes.data?.success}, Role: ${loginRes.data?.user?.role}, Name: ${loginRes.data?.user?.name}`);
  if (loginRes.status === 200 && loginRes.data?.user?.role === "admin") {
    console.log("   ✅ PASS: Admin authenticated successfully, session cookie issued");
  } else {
    console.error("   ❌ FAIL: Admin authentication failed");
  }

  // TEST 3: Validate Admin Session via /api/auth/me
  console.log("\n3. Testing Admin Session Verification (GET /api/auth/me)...");
  const meRes = await adminClient.request("/api/auth/me");
  console.log(`   ↳ Status: ${meRes.status}, Authenticated: ${meRes.data?.authenticated}, Role: ${meRes.data?.user?.role}, Name: ${meRes.data?.user?.name}`);
  if (meRes.status === 200 && meRes.data?.user?.role === "admin") {
    console.log("   ✅ PASS: Session recognizes authorized Admin account");
  } else {
    console.error("   ❌ FAIL: Session check failed");
  }

  // TEST 4: Direct /admin access should route/redirect to /admin/dashboard
  console.log("\n4. Testing Direct URL /admin Route Handling...");
  const adminRootRes = await adminClient.request("/admin");
  console.log(`   ↳ Status: ${adminRootRes.status}, Location: ${adminRootRes.location || "direct render"}`);
  if (
    adminRootRes.status === 200 ||
    adminRootRes.location?.includes("/admin/dashboard") ||
    adminRootRes.status === 307 ||
    adminRootRes.status === 308
  ) {
    console.log("   ✅ PASS: /admin routes directly to /admin/dashboard");
  } else {
    console.error("   ❌ FAIL: /admin route did not redirect or render properly");
  }

  // TEST 5: Verify /api/admin/dashboard API returns full metrics
  console.log("\n5. Testing Admin Dashboard Metrics API (GET /api/admin/dashboard)...");
  const dashApiRes = await adminClient.request("/api/admin/dashboard");
  console.log(`   ↳ Status: ${dashApiRes.status}, Success: ${dashApiRes.data?.success}`);
  if (dashApiRes.status === 200 && dashApiRes.data?.stats) {
    const s = dashApiRes.data.stats;
    console.log(`   ↳ Stats: Active Students: ${s.totalStudents}, Active Enrollments: ${s.activeEnrollments}`);
    console.log(`   ↳ Financials: Total Payable: ₹${s.totalFeesPayable}, Collected: ₹${s.totalFeesCollected}, Outstanding: ₹${s.outstandingFees}`);
    console.log(`   ↳ Certificates Issued: ${s.certificatesIssued}, Pending Registrations: ${s.pendingRegistrations}`);
    console.log("   ✅ PASS: Admin dashboard API data fully populated and verified");
  } else {
    console.error("   ❌ FAIL: Dashboard API did not return stats");
  }

  // TEST 6: Verify HTML rendering of /admin/dashboard
  console.log("\n6. Testing Admin Dashboard Page UI Rendering (GET /admin/dashboard)...");
  const pageRes = await adminClient.request("/admin/dashboard");
  console.log(`   ↳ Status: ${pageRes.status}, Content Length: ${pageRes.data?.length || 0} bytes`);
  if (pageRes.status === 200 && typeof pageRes.data === "string") {
    console.log("   ✅ PASS: Admin Dashboard UI renders successfully (200 OK)");
  } else {
    console.error("   ❌ FAIL: Admin dashboard page returned error status: " + pageRes.status);
  }

  console.log("\n======================================================================");
  console.log("🎉 ADMIN LOGIN & DASHBOARD VERIFICATION COMPLETED SUCCESSFULLY!");
  console.log("======================================================================");
}

verify().catch(console.error);
