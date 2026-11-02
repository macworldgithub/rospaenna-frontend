const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("M01 Manage My Booking Release Control - Frontend Verification", async (t) => {
  await t.test("API route exists and enforces force-dynamic and Cache-Control: no-store", () => {
    const routePath = path.join(__dirname, "../app/api/mmb/status/route.ts");
    assert.ok(fs.existsSync(routePath), "app/api/mmb/status/route.ts must exist");
    const content = fs.readFileSync(routePath, "utf8");
    assert.ok(content.includes('bookingBackend("/mmb/status"'), "Must proxy to backend /mmb/status");
    assert.ok(content.includes("no-store"), "Must set Cache-Control: no-store");
    assert.ok(content.includes("force-dynamic"), "Must enforce dynamic evaluation");
  });

  await t.test("Manage booking page exists and suppresses guest lookup when MMB is disabled", () => {
    const pagePath = path.join(__dirname, "../app/manage-booking/page.tsx");
    assert.ok(fs.existsSync(pagePath), "app/manage-booking/page.tsx must exist");
    const content = fs.readFileSync(pagePath, "utf8");
    assert.ok(content.includes("/api/mmb/status"), "Must query MMB status endpoint");
    assert.ok(content.includes("Online self-service booking amendments are currently offline"), "Must display truthful disabled message");
    assert.ok(content.includes("reservations@rosapenna.ie"), "Must provide direct hotel reservations email");
    assert.ok(content.includes("+353 (0)74 91 55301"), "Must provide direct hotel reservations telephone");
    assert.ok(content.includes("golf@rosapenna.ie"), "Must provide direct golf pavilion email");
    assert.ok(content.includes("+353 (0)74 91 55000"), "Must provide direct golf pavilion telephone");
  });

  await t.test("Navbar maintains link suppression for disabled MMB portal", () => {
    const navbarPath = path.join(__dirname, "../components/Navbar.tsx");
    const content = fs.readFileSync(navbarPath, "utf8");
    // Confirm guest lookup link is suppressed from standard nav links while MMB is off
    assert.ok(!content.includes('href="/manage-booking"'), "Direct navbar link should be suppressed while MMB is disabled by default");
  });
});
