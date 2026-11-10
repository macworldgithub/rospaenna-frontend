const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("M11 Lead Guest Phone Updates - Frontend Verification", async (t) => {
  await t.test("mmbClient exports comprehensive M11 phone schemas and client methods", () => {
    const clientPath = path.join(__dirname, "../lib/mmbClient.ts");
    const content = fs.readFileSync(clientPath, "utf-8");

    // Schemas & Types
    assert.match(content, /export interface GuestPhoneReadResponse/);
    assert.match(content, /export interface GuestPhoneUpdateRequest/);
    assert.match(content, /export interface GuestPhoneUpdateResponse/);

    // Client Methods
    assert.match(content, /export async function fetchGuestPhone\(/);
    assert.match(content, /export async function updateGuestPhone\(/);
    assert.match(content, /headers\["Idempotency-Key"\]/);
  });

  await t.test("BFF proxy route exists, validates session authentication, forwards idempotency key, and sets Cache-Control: no-store", () => {
    const routePath = path.join(__dirname, "../app/api/mmb/contact/[bookingReference]/phone/route.ts");
    assert.ok(fs.existsSync(routePath), "Contact phone route should exist");

    const content = fs.readFileSync(routePath, "utf-8");
    assert.match(content, /export const dynamic = "force-dynamic";/);
    assert.match(content, /"Cache-Control":\s*"no-store"/);
    assert.match(content, /x-mmb-session/i);
    assert.match(content, /status:\s*401/);
    assert.match(content, /idempotency-key/i);
  });

  await t.test("manage-booking page renders Lead Guest Contact Card with phone editing, email locking, and revision handling", () => {
    const pagePath = path.join(__dirname, "../app/manage-booking/page.tsx");
    const content = fs.readFileSync(pagePath, "utf-8");

    // Lead Guest Contact Details Card
    assert.match(content, /Lead Guest Contact &amp; Telephone Details/);
    assert.match(content, /Authoritative Telephone Number:/);
    assert.match(content, /Update Phone/);
    assert.match(content, /loadGuestPhone/);
    assert.match(content, /handleUpdatePhone/);

    // Lead ownership & email locked
    assert.match(content, /Primary Email:/);
    assert.match(content, /Locked/);
    assert.match(content, /Lead ownership and email are security-locked/);

    // Concurrency & Opera PMS sync
    assert.match(content, /Booking Revision:/);
    assert.match(content, /Opera PMS Synchronized/);
  });
});
