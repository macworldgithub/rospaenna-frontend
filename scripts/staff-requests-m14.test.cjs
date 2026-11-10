const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("M14 Staff Request Outcomes - Frontend Verification", async (t) => {
  await t.test("mmbClient exports comprehensive M14 staff request schemas and client methods", () => {
    const clientPath = path.join(__dirname, "../lib/mmbClient.ts");
    const content = fs.readFileSync(clientPath, "utf-8");

    // Schemas & Types
    assert.match(content, /export type StaffRequestOutcomeStatus =/);
    assert.match(content, /"needs_information"/);
    assert.match(content, /"rejected"/);
    assert.match(content, /"approved_awaiting_implementation"/);
    assert.match(content, /"completed"/);
    assert.match(content, /export type StaffRequestExecutionType =/);
    assert.match(content, /export interface StaffRequestHistoryEntry/);
    assert.match(content, /export interface StaffRequestItem/);
    assert.match(content, /export interface StaffRequestTransitionCreate/);
    assert.match(content, /export interface StaffRequestTransitionResponse/);
    assert.match(content, /export interface StaffRequestListResponse/);

    // Client Methods
    assert.match(content, /export async function fetchStaffRequests\(/);
    assert.match(content, /export async function transitionStaffRequest\(/);
    assert.match(content, /export async function retryStaffRequestNotification\(/);
    assert.match(content, /"X-Staff-Token":\s*staffToken/i);
    assert.match(content, /"Idempotency-Key":\s*key/i);
  });

  await t.test("BFF proxy routes exist, validate staff token, forward idempotency key, and set Cache-Control: no-store", () => {
    const listRoutePath = path.join(__dirname, "../app/api/staff/requests/route.ts");
    assert.ok(fs.existsSync(listRoutePath), "Staff requests listing BFF route should exist");

    const listContent = fs.readFileSync(listRoutePath, "utf-8");
    assert.match(listContent, /export const dynamic = "force-dynamic";/);
    assert.match(listContent, /"Cache-Control":\s*"no-store"/);
    assert.match(listContent, /x-staff-token/i);
    assert.match(listContent, /status:\s*401/);

    const detailRoutePath = path.join(__dirname, "../app/api/staff/requests/[bookingReference]/[requestId]/route.ts");
    assert.ok(fs.existsSync(detailRoutePath), "Staff request detail/transition BFF route should exist");

    const detailContent = fs.readFileSync(detailRoutePath, "utf-8");
    assert.match(detailContent, /export const dynamic = "force-dynamic";/);
    assert.match(detailContent, /"Cache-Control":\s*"no-store"/);
    assert.match(detailContent, /x-staff-token/i);
    assert.match(detailContent, /idempotency-key/i);
    assert.match(detailContent, /export async function GET/);
    assert.match(detailContent, /export async function POST/);

    const retryRoutePath = path.join(__dirname, "../app/api/staff/requests/[bookingReference]/[requestId]/retry/route.ts");
    assert.ok(fs.existsSync(retryRoutePath), "Staff request retry notification route should exist");

    const retryContent = fs.readFileSync(retryRoutePath, "utf-8");
    assert.match(retryContent, /export const dynamic = "force-dynamic";/);
    assert.match(retryContent, /"Cache-Control":\s*"no-store"/);
    assert.match(retryContent, /x-staff-token/i);
    assert.match(retryContent, /retry-notification/);
  });

  await t.test("manage-booking page renders M14 status badges and staff resolution notes", () => {
    const pagePath = path.join(__dirname, "../app/manage-booking/page.tsx");
    const content = fs.readFileSync(pagePath, "utf-8");

    // Status badges
    assert.match(content, /Approved \(Queued for Implementation\)/);
    assert.match(content, /Information Needed/);
    assert.match(content, /Staff Resolution Note:/);
    assert.match(content, /bg-sky-950/);
    assert.match(content, /bg-amber-950/);
    assert.match(content, /bg-emerald-950/);
    assert.match(content, /bg-red-950/);
  });
});
