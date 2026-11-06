const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("M09 Confirmed Amendment Commit - Frontend Verification", async (t) => {
  await t.test("mmbClient exports M09 commit schemas and client function", () => {
    const clientPath = path.join(__dirname, "../lib/mmbClient.ts");
    const content = fs.readFileSync(clientPath, "utf-8");

    // Types & Schemas
    assert.match(content, /export interface MmbAmendmentCommitRequest/);
    assert.match(content, /export interface MmbAmendmentCommitResponse/);
    assert.match(content, /booking_reference:\s*string/);
    assert.match(content, /offer_id:\s*string/);
    assert.match(content, /revalidation_id:\s*string/);
    assert.match(content, /idempotency_key:\s*string/);
    assert.match(content, /readback_verified:\s*boolean/);
    assert.match(content, /status:\s*"confirmed"\s*\|\s*"unconfirmed_reconciliation"/);

    // Client function
    assert.match(content, /export async function commitAmendment\(/);
    assert.match(content, /"\/api\/mmb\/amendments\/commit"/);
  });

  await t.test("BFF proxy route /api/mmb/amendments/commit exists and enforces session auth & no-store", () => {
    const routePath = path.join(__dirname, "../app/api/mmb/amendments/commit/route.ts");
    assert.ok(fs.existsSync(routePath), "Commit route should exist");

    const content = fs.readFileSync(routePath, "utf-8");
    assert.match(content, /export const dynamic = "force-dynamic";/);
    assert.match(content, /"Cache-Control":\s*"no-store"/);
    assert.match(content, /x-mmb-session/i);
    assert.match(content, /status:\s*401/);
    assert.match(content, /booking_reference/);
    assert.match(content, /offer_id/);
    assert.match(content, /revalidation_id/);
    assert.match(content, /idempotency_key/);
    assert.match(content, /bookingBackend\(\s*"\/mmb\/amendments\/commit"/);
  });

  await t.test("manage-booking page implements Step 5 Confirmed Amendment Commit UI and staff recovery", () => {
    const pagePath = path.join(__dirname, "../app/manage-booking/page.tsx");
    const content = fs.readFileSync(pagePath, "utf-8");

    // Step 5 Heading & Coordinated Write Badge
    assert.match(content, /Step 5: Confirmed Amendment Commit \(Ticket M09\)/);
    assert.match(content, /Final Coordinated Vendor Write/);

    // Handler & Commit Action Button
    assert.match(content, /handleCommitAmendment/);
    assert.match(content, /Confirm &amp; Commit Amendment/);

    // Confirmed state & Readbacks
    assert.match(content, /Amendment Confirmed &amp; Synchronized!/);
    assert.match(content, /Opera & BRS Verified/);

    // Unconfirmed Reconciliation Staff Recovery notice
    assert.match(content, /Unconfirmed Reconciliation - Staff Alerted/);
    assert.match(content, /\+353 \(0\)74 91 55000/);
    assert.match(content, /Your original reservation remains intact and confirmed/);
  });
});
