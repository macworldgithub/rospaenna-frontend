const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("M13 Special and Cancellation Requests - Frontend Verification", async (t) => {
  await t.test("mmbClient exports comprehensive M13 request schemas and client methods", () => {
    const clientPath = path.join(__dirname, "../lib/mmbClient.ts");
    const content = fs.readFileSync(clientPath, "utf-8");

    // Schemas & Types
    assert.match(content, /export type SpecialRequestCategory =/);
    assert.match(content, /export type RequestType = "special_request" \| "cancellation_request";/);
    assert.match(content, /export type RequestReviewStatus =/);
    assert.match(content, /"pending_review"/);
    assert.match(content, /export interface GuestSpecialRequestCreate/);
    assert.match(content, /export interface GuestSpecialRequestItem/);
    assert.match(content, /export interface GuestSpecialRequestResponse/);
    assert.match(content, /export interface GuestRequestsListResponse/);

    // Client Methods
    assert.match(content, /export async function fetchGuestRequests\(/);
    assert.match(content, /export async function submitGuestSpecialRequest\(/);
    assert.match(content, /headers\["Idempotency-Key"\]/);
  });

  await t.test("BFF proxy route exists, validates session, forwards idempotency key, and sets Cache-Control: no-store", () => {
    const routePath = path.join(__dirname, "../app/api/mmb/requests/[bookingReference]/route.ts");
    assert.ok(fs.existsSync(routePath), "Special/cancellation requests BFF route should exist");

    const content = fs.readFileSync(routePath, "utf-8");
    assert.match(content, /export const dynamic = "force-dynamic";/);
    assert.match(content, /"Cache-Control":\s*"no-store"/);
    assert.match(content, /x-mmb-session/i);
    assert.match(content, /status:\s*401/);
    assert.match(content, /idempotency-key/i);
    assert.match(content, /export async function GET/);
    assert.match(content, /export async function POST/);
  });

  await t.test("manage-booking page renders Special & Cancellation Requests Form, policy notice, and history cards", () => {
    const pagePath = path.join(__dirname, "../app/manage-booking/page.tsx");
    const content = fs.readFileSync(pagePath, "utf-8");

    // Tab 4 interactive UI
    assert.match(content, /Tab 4: Special and Cancellation Requests \(Ticket M13\)/);
    assert.match(content, /Special Request \/ Assistance/);
    assert.match(content, /Cancellation Request/);
    assert.match(content, /Cancellation Policy Notice:/);
    assert.match(content, /Cancellation requests are reviewed manually by hotel staff/);
    assert.match(content, /does <strong>not<\/strong> release your rooms or issue refunds automatically/);

    // Form inputs and history
    assert.match(content, /Desired Dates \(if proposing shift\):/);
    assert.match(content, /Desired Room Preference:/);
    assert.match(content, /Desired Golf Notes:/);
    assert.match(content, /Details of Request \/ Notes for Staff \(Min 5 characters\):/);
    assert.match(content, /Your Submitted Requests/);
    assert.match(content, /pending staff review/);
    assert.match(content, /item\.status\.replace\("_", " "\)/);
  });
});
