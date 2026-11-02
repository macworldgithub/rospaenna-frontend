const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("M02 Online and Offline Booking Linkage - Frontend Verification", async (t) => {
  await t.test("Lookup API route exists and enforces force-dynamic and Cache-Control: no-store", () => {
    const routePath = path.join(__dirname, "../app/api/mmb/lookup/route.ts");
    assert.ok(fs.existsSync(routePath), "app/api/mmb/lookup/route.ts must exist");
    const content = fs.readFileSync(routePath, "utf8");
    assert.ok(content.includes('bookingBackend('), "Must proxy to backend using bookingBackend");
    assert.ok(content.includes('"/mmb/lookup"'), "Must proxy to backend /mmb/lookup");
    assert.ok(content.includes("no-store"), "Must set Cache-Control: no-store");
    assert.ok(content.includes("force-dynamic"), "Must enforce dynamic evaluation");
  });

  await t.test("Lookup route validates input parameters", () => {
    const routePath = path.join(__dirname, "../app/api/mmb/lookup/route.ts");
    const content = fs.readFileSync(routePath, "utf8");
    assert.ok(content.includes("booking_reference"), "Must validate booking reference");
    assert.ok(content.includes("last_name"), "Must validate last name");
    assert.ok(content.includes("toUpperCase()"), "Must normalize booking reference");
  });
});
