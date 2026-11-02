const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("M03 Booking Lookup and One-Time Security Code (OTP) - Frontend Verification", async (t) => {
  await t.test("Request OTP route exists, proxies to backend, and enforces Cache-Control: no-store", () => {
    const routePath = path.join(__dirname, "../app/api/mmb/auth/request-otp/route.ts");
    assert.ok(fs.existsSync(routePath), "app/api/mmb/auth/request-otp/route.ts must exist");
    const content = fs.readFileSync(routePath, "utf8");
    assert.ok(content.includes('bookingBackend('), "Must proxy to backend using bookingBackend");
    assert.ok(content.includes('"/mmb/auth/request-otp"'), "Must proxy to /mmb/auth/request-otp");
    assert.ok(content.includes("no-store"), "Must set Cache-Control: no-store");
    assert.ok(content.includes("force-dynamic"), "Must enforce dynamic evaluation");
    assert.ok(content.includes("booking_reference"), "Must validate booking reference");
    assert.ok(content.includes("last_name"), "Must validate last name");
  });

  await t.test("Verify OTP route exists, enforces 6-digit numeric pattern, and returns session", () => {
    const routePath = path.join(__dirname, "../app/api/mmb/auth/verify-otp/route.ts");
    assert.ok(fs.existsSync(routePath), "app/api/mmb/auth/verify-otp/route.ts must exist");
    const content = fs.readFileSync(routePath, "utf8");
    assert.ok(content.includes('bookingBackend('), "Must proxy to backend using bookingBackend");
    assert.ok(content.includes('"/mmb/auth/verify-otp"'), "Must proxy to /mmb/auth/verify-otp");
    assert.ok(content.includes("/^\\d{6}$/"), "Must enforce 6-digit numeric pattern");
    assert.ok(content.includes("no-store"), "Must set Cache-Control: no-store");
  });

  await t.test("Logout route exists and forwards session token", () => {
    const routePath = path.join(__dirname, "../app/api/mmb/auth/logout/route.ts");
    assert.ok(fs.existsSync(routePath), "app/api/mmb/auth/logout/route.ts must exist");
    const content = fs.readFileSync(routePath, "utf8");
    assert.ok(content.includes('"/mmb/auth/logout"'), "Must proxy to /mmb/auth/logout");
    assert.ok(content.includes("X-MMB-Session"), "Must forward session token");
    assert.ok(content.includes("no-store"), "Must set Cache-Control: no-store");
  });

  await t.test("Authenticated booking route exists and validates session token", () => {
    const routePath = path.join(__dirname, "../app/api/mmb/booking/[ref]/route.ts");
    assert.ok(fs.existsSync(routePath), "app/api/mmb/booking/[ref]/route.ts must exist");
    const content = fs.readFileSync(routePath, "utf8");
    assert.ok(content.includes('`/mmb/booking/${cleanRef}`'), "Must call backend with booking reference");
    assert.ok(content.includes("X-MMB-Session"), "Must pass session token");
    assert.ok(content.includes("401"), "Must return 401 when token is missing");
  });

  await t.test("Client library exports all authentication and booking fetch functions", () => {
    const clientPath = path.join(__dirname, "../lib/mmbClient.ts");
    assert.ok(fs.existsSync(clientPath), "lib/mmbClient.ts must exist");
    const content = fs.readFileSync(clientPath, "utf8");
    assert.ok(content.includes("export async function requestOtp"), "Must export requestOtp");
    assert.ok(content.includes("export async function verifyOtp"), "Must export verifyOtp");
    assert.ok(content.includes("export async function fetchAuthenticatedBooking"), "Must export fetchAuthenticatedBooking");
    assert.ok(content.includes("export async function logoutMmbSession"), "Must export logoutMmbSession");
  });
});
