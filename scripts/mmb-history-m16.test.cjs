const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("M16 Action History and Recovery View - Frontend Verification", async (t) => {
  await t.test("mmbClient exports comprehensive M16 timeline schemas and client methods", () => {
    const clientPath = path.join(__dirname, "../lib/mmbClient.ts");
    const content = fs.readFileSync(clientPath, "utf-8");

    // Schemas & Types
    assert.match(content, /export type TimelineEventCategory =/);
    assert.match(content, /"booking"/);
    assert.match(content, /"amendment"/);
    assert.match(content, /"request"/);
    assert.match(content, /"payment"/);
    assert.match(content, /"notification"/);
    assert.match(content, /"exception"/);

    assert.match(content, /export interface TimelineEvent/);
    assert.match(content, /event_id:\s*string/);
    assert.match(content, /timestamp:\s*string/);
    assert.match(content, /category:\s*TimelineEventCategory/);
    assert.match(content, /actor_label:\s*string/);
    assert.match(content, /booking_revision:\s*number/);
    assert.match(content, /is_exception:\s*boolean/);

    assert.match(content, /export interface GuestActionHistoryResponse/);
    assert.match(content, /export interface StaffActionHistoryResponse/);
    assert.match(content, /export interface RecoveryExceptionItem/);
    assert.match(content, /export interface StaffRecoveryExceptionsListResponse/);
    assert.match(content, /export interface StaffRecoveryRetryRequest/);
    assert.match(content, /export interface StaffRecoveryRetryResponse/);

    // Client Methods
    assert.match(content, /export async function fetchGuestHistory\(/);
    assert.match(content, /export async function fetchStaffHistory\(/);
    assert.match(content, /export async function fetchRecoveryExceptions\(/);
    assert.match(content, /export async function retryRecoveryOperation\(/);
  });

  await t.test("BFF proxy routes exist, validate session/staff auth, and enforce Cache-Control: no-store", () => {
    // 1. Guest history route
    const guestHistoryPath = path.join(__dirname, "../app/api/mmb/history/[ref]/route.ts");
    assert.ok(fs.existsSync(guestHistoryPath), "Guest history BFF route should exist");
    const guestHistoryContent = fs.readFileSync(guestHistoryPath, "utf-8");
    assert.match(guestHistoryContent, /export const dynamic = "force-dynamic";/);
    assert.match(guestHistoryContent, /"Cache-Control":\s*"no-store"/);
    assert.match(guestHistoryContent, /status:\s*401/);
    assert.match(guestHistoryContent, /\/mmb\/history\/\${cleanRef}/);

    // 2. Staff history route
    const staffHistoryPath = path.join(__dirname, "../app/api/staff/history/[ref]/route.ts");
    assert.ok(fs.existsSync(staffHistoryPath), "Staff history BFF route should exist");
    const staffHistoryContent = fs.readFileSync(staffHistoryPath, "utf-8");
    assert.match(staffHistoryContent, /export const dynamic = "force-dynamic";/);
    assert.match(staffHistoryContent, /"Cache-Control":\s*"no-store"/);
    assert.match(staffHistoryContent, /status:\s*401/);
    assert.match(staffHistoryContent, /\/staff\/history\/\${cleanRef}/);

    // 3. Staff recovery exceptions route
    const exceptionsPath = path.join(__dirname, "../app/api/staff/recovery/exceptions/route.ts");
    assert.ok(fs.existsSync(exceptionsPath), "Staff exceptions BFF route should exist");
    const exceptionsContent = fs.readFileSync(exceptionsPath, "utf-8");
    assert.match(exceptionsContent, /export const dynamic = "force-dynamic";/);
    assert.match(exceptionsContent, /"Cache-Control":\s*"no-store"/);
    assert.match(exceptionsContent, /status:\s*401/);
    assert.match(exceptionsContent, /\/staff\/recovery\/exceptions/);

    // 4. Staff recovery retry route
    const retryPath = path.join(__dirname, "../app/api/staff/recovery/operations/[operationId]/retry/route.ts");
    assert.ok(fs.existsSync(retryPath), "Staff recovery retry BFF route should exist");
    const retryContent = fs.readFileSync(retryPath, "utf-8");
    assert.match(retryContent, /export const dynamic = "force-dynamic";/);
    assert.match(retryContent, /"Cache-Control":\s*"no-store"/);
    assert.match(retryContent, /status:\s*401/);
    assert.match(retryContent, /\/staff\/recovery\/operations\/\${cleanOpId}\/retry/);
  });

  await t.test("Manage booking UI integrates Action History tab, protection notices, and Staff Recovery console", () => {
    const pagePath = path.join(__dirname, "../app/manage-booking/page.tsx");
    const pageContent = fs.readFileSync(pagePath, "utf-8");

    // Tab navigation includes Tab 5
    assert.match(pageContent, /5\. Action History &amp; Recovery/);

    // Timeline view and reassuring protection banner
    assert.match(pageContent, /Booking Action History &amp; Protection Timeline/);
    assert.match(pageContent, /Original Booking Protected/);
    assert.match(pageContent, /Your confirmed reservation remains intact/);

    // Staff recovery console
    assert.match(pageContent, /Staff Operations &amp; Recovery Console/);
    assert.match(pageContent, /handleLoadStaffExceptions/);
    assert.match(pageContent, /handleRetryOperation/);
    assert.match(pageContent, /Execute Safe Recovery Retry/);
  });
});
