const BASE_URL = "http://localhost:4000";

async function runTests() {
  console.log("=== ROLE-BASED LOGIN & DASHBOARD VERIFICATION TESTS ===");

  let passed = 0;
  let failed = 0;

  // Helper to extract qpet_session cookie using getSetCookie
  function getSessionCookie(res) {
    const cookies = res.headers.getSetCookie ? res.headers.getSetCookie() : [];
    const sessionCookie = cookies.find(c => c.startsWith("qpet_session="));
    return sessionCookie ? sessionCookie.split(";")[0] : null;
  }

  // 1. TEST: Invalid Credentials should FAIL
  try {
    console.log("\n[Test 1] Testing Invalid Credentials (Wrong Password)...");
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: "admin077@qpet.in",
        password: "WrongPassword123!",
      }),
    });
    const data = await res.json();
    if (res.status === 401 && !data.success) {
      console.log("✅ PASS: Correctly rejected invalid credentials with 401:", data.error);
      passed++;
    } else {
      console.error("❌ FAIL: Expected 401 for wrong password, got:", res.status, data);
      failed++;
    }
  } catch (err) {
    console.error("❌ ERROR in Test 1:", err.message);
    failed++;
  }

  // 2. TEST: Super Admin Login & Dashboard Access
  let adminCookie = null;
  try {
    console.log("\n[Test 2] Testing Super Admin Login (admin077@qpet.in)...");
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: "admin077@qpet.in",
        password: "Admin@QPET2026",
      }),
    });
    const data = await res.json();
    adminCookie = getSessionCookie(res);

    if (res.status === 200 && data.success && data.redirectUrl === "/admin/dashboard" && data.user.role === "admin") {
      console.log("✅ PASS: Admin authenticated successfully. Target URL:", data.redirectUrl);
      passed++;
    } else {
      console.error("❌ FAIL: Admin login failed or wrong redirectUrl:", res.status, data);
      failed++;
    }

    // Verify Admin Dashboard API
    if (adminCookie) {
      console.log("Testing Admin Dashboard API with admin session...");
      const dashRes = await fetch(`${BASE_URL}/api/admin/dashboard`, {
        headers: { Cookie: adminCookie },
      });
      const dashData = await dashRes.json();
      if (dashRes.status === 200 && (dashData.stats || dashData.metrics || dashData.success !== false)) {
        console.log("✅ PASS: Admin Dashboard API returned 200 OK!");
        passed++;
      } else {
        console.error("❌ FAIL: Admin Dashboard API failed:", dashRes.status, dashData);
        failed++;
      }
    }
  } catch (err) {
    console.error("❌ ERROR in Test 2:", err.message);
    failed++;
  }

  // 3. TEST: Trainer Login & Dashboard Access
  let trainerCookie = null;
  try {
    console.log("\n[Test 3] Testing Trainer Login (roshni.bajpai@qpet.in)...");
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: "roshni.bajpai@qpet.in",
        password: "123456",
      }),
    });
    const data = await res.json();
    trainerCookie = getSessionCookie(res);

    if (res.status === 200 && data.success && data.redirectUrl === "/trainer/dashboard" && data.user.role === "trainer") {
      console.log("✅ PASS: Trainer authenticated successfully. Target URL:", data.redirectUrl);
      passed++;
    } else {
      console.error("❌ FAIL: Trainer login failed or wrong redirectUrl:", res.status, data);
      failed++;
    }

    // Verify Trainer Dashboard API
    if (trainerCookie) {
      console.log("Testing Trainer Dashboard API with trainer session...");
      const dashRes = await fetch(`${BASE_URL}/api/trainer/dashboard`, {
        headers: { Cookie: trainerCookie },
      });
      const dashData = await dashRes.json();
      if (dashRes.status === 200) {
        console.log("✅ PASS: Trainer Dashboard API returned 200 OK!");
        passed++;
      } else {
        console.error("❌ FAIL: Trainer Dashboard API failed:", dashRes.status, dashData);
        failed++;
      }
    }
  } catch (err) {
    console.error("❌ ERROR in Test 3:", err.message);
    failed++;
  }

  // 4. TEST: Student Login & Dashboard Access (9876543277 / Student@123)
  let studentCookie = null;
  try {
    console.log("\n[Test 4] Testing Student Login (9876543277 / Student@123)...");
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        identifier: "9876543277",
        password: "Student@123",
      }),
    });
    const data = await res.json();
    studentCookie = getSessionCookie(res);

    if (res.status === 200 && data.success && data.redirectUrl === "/student/dashboard" && data.user.role === "student") {
      console.log("✅ PASS: Student authenticated successfully. Target URL:", data.redirectUrl);
      passed++;
    } else {
      console.error("❌ FAIL: Student login failed:", res.status, data);
      failed++;
    }

    // Verify Student Dashboard API
    if (studentCookie) {
      console.log("Testing Student Dashboard API with student session...");
      const dashRes = await fetch(`${BASE_URL}/api/student/dashboard`, {
        headers: { Cookie: studentCookie },
      });
      const dashData = await dashRes.json();
      if (dashRes.status === 200) {
        console.log("✅ PASS: Student Dashboard API returned 200 OK!");
        passed++;
      } else {
        console.error("❌ FAIL: Student Dashboard API failed:", dashRes.status, dashData);
        failed++;
      }
    }
  } catch (err) {
    console.error("❌ ERROR in Test 4:", err.message);
    failed++;
  }

  // 5. TEST: Cross-Role Security Boundary (Trainer attempting Admin API)
  if (trainerCookie) {
    try {
      console.log("\n[Test 5] Security Check: Trainer attempting to access Admin API (/api/admin/dashboard)...");
      const res = await fetch(`${BASE_URL}/api/admin/dashboard`, {
        headers: { Cookie: trainerCookie },
      });
      if (res.status === 403 || res.status === 401) {
        console.log(`✅ PASS: Blocked! Access denied with HTTP ${res.status}`);
        passed++;
      } else {
        console.error("❌ SECURITY LEAK: Trainer was NOT blocked from admin API! Status:", res.status);
        failed++;
      }
    } catch (err) {
      console.error("❌ ERROR in Test 5:", err.message);
      failed++;
    }
  }

  // 6. TEST: Cross-Role Security Boundary (Trainer attempting Admin Settings API)
  if (trainerCookie) {
    try {
      console.log("\n[Test 6] Security Check: Trainer attempting to access Admin Trainers API (/api/admin/trainers)...");
      const res = await fetch(`${BASE_URL}/api/admin/trainers`, {
        headers: { Cookie: trainerCookie },
      });
      if (res.status === 403 || res.status === 401) {
        console.log(`✅ PASS: Blocked! Access denied with HTTP ${res.status}`);
        passed++;
      } else {
        console.error("❌ SECURITY LEAK: Trainer was NOT blocked from admin trainers API! Status:", res.status);
        failed++;
      }
    } catch (err) {
      console.error("❌ ERROR in Test 6:", err.message);
      failed++;
    }
  }

  // 7. TEST: Cross-Role Security Boundary (Student attempting Admin or Trainer API)
  if (studentCookie) {
    try {
      console.log("\n[Test 7] Security Check: Student attempting to access Admin API (/api/admin/dashboard)...");
      const res = await fetch(`${BASE_URL}/api/admin/dashboard`, {
        headers: { Cookie: studentCookie },
      });
      if (res.status === 403 || res.status === 401) {
        console.log(`✅ PASS: Blocked! Access denied with HTTP ${res.status}`);
        passed++;
      } else {
        console.error("❌ SECURITY LEAK: Student was NOT blocked from admin API! Status:", res.status);
        failed++;
      }
    } catch (err) {
      console.error("❌ ERROR in Test 7:", err.message);
      failed++;
    }

    try {
      console.log("Security Check: Student attempting to access Trainer API (/api/trainer/dashboard)...");
      const res = await fetch(`${BASE_URL}/api/trainer/dashboard`, {
        headers: { Cookie: studentCookie },
      });
      if (res.status === 403 || res.status === 401) {
        console.log(`✅ PASS: Blocked! Access denied with HTTP ${res.status}`);
        passed++;
      } else {
        console.error("❌ SECURITY LEAK: Student was NOT blocked from trainer API! Status:", res.status);
        failed++;
      }
    } catch (err) {
      console.error("❌ ERROR in Test 7 (trainer API check):", err.message);
      failed++;
    }
  }

  console.log(`\n========================================`);
  console.log(`ALL VERIFICATION TESTS COMPLETE!`);
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`========================================\n`);
}

runTests();
