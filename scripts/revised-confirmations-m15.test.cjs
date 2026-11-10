const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("M15 Revised Confirmations and Pre-Arrival Reminders - Frontend Verification", async (t) => {
  await t.test("mmbClient exports comprehensive M15 reminder schemas and client methods", () => {
    const clientPath = path.join(__dirname, "../lib/mmbClient.ts");
    const content = fs.readFileSync(clientPath, "utf-8");

    // Schemas & Types
    assert.match(content, /export type ReminderType =/);
    assert.match(content, /"balance_due_first"/);
    assert.match(content, /"rooming_and_caddy"/);
    assert.match(content, /"concierge_check"/);
    assert.match(content, /"balance_due_final"/);

    assert.match(content, /export type ReminderStatus =/);
    assert.match(content, /"scheduled"/);
    assert.match(content, /"canceled_by_amendment"/);
    assert.match(content, /"suppressed"/);
    assert.match(content, /"dispatched"/);
    assert.match(content, /"failed"/);

    assert.match(content, /export interface ScheduledReminderItem/);
    assert.match(content, /export interface ScheduledReminderListResponse/);
    assert.match(content, /export interface RevisedConfirmationSendResponse/);

    // Client Methods
    assert.match(content, /export async function fetchBookingReminders\(/);
    assert.match(content, /export async function requestRevisedConfirmationSend\(/);
    assert.match(content, /export async function dispatchBookingReminder\(/);
    assert.match(content, /export function getRevisedPdfDownloadUrl\(/);

    // Dynamic URL check
    assert.match(content, /\/api\/mmb\/confirmations\/.*\/pdf/);
  });

  await t.test("BFF proxy routes exist, validate session auth, and enforce Cache-Control: no-store", () => {
    const pdfRoutePath = path.join(__dirname, "../app/api/mmb/confirmations/[ref]/pdf/route.ts");
    assert.ok(fs.existsSync(pdfRoutePath), "PDF itinerary BFF route should exist");
    const pdfContent = fs.readFileSync(pdfRoutePath, "utf-8");
    assert.match(pdfContent, /export const dynamic = "force-dynamic";/);
    assert.match(pdfContent, /"Cache-Control":\s*"no-store"/);
    assert.match(pdfContent, /"application\/pdf"/);
    assert.match(pdfContent, /status:\s*401/);

    const remindersRoutePath = path.join(__dirname, "../app/api/mmb/confirmations/[ref]/reminders/route.ts");
    assert.ok(fs.existsSync(remindersRoutePath), "Reminders listing BFF route should exist");
    const remindersContent = fs.readFileSync(remindersRoutePath, "utf-8");
    assert.match(remindersContent, /export const dynamic = "force-dynamic";/);
    assert.match(remindersContent, /"Cache-Control":\s*"no-store"/);
    assert.match(remindersContent, /status:\s*401/);

    const sendRoutePath = path.join(__dirname, "../app/api/mmb/confirmations/[ref]/send/route.ts");
    assert.ok(fs.existsSync(sendRoutePath), "Revised confirmation send BFF route should exist");
    const sendContent = fs.readFileSync(sendRoutePath, "utf-8");
    assert.match(sendContent, /export const dynamic = "force-dynamic";/);
    assert.match(sendContent, /"Cache-Control":\s*"no-store"/);
    assert.match(sendContent, /\["X-Idempotency-Key"\]\s*=\s*idempKey/);
    assert.match(sendContent, /status:\s*401/);

    const dispatchRoutePath = path.join(__dirname, "../app/api/mmb/confirmations/[ref]/reminders/[reminderId]/dispatch/route.ts");
    assert.ok(fs.existsSync(dispatchRoutePath), "Reminder manual dispatch BFF route should exist");
    const dispatchContent = fs.readFileSync(dispatchRoutePath, "utf-8");
    assert.match(dispatchContent, /export const dynamic = "force-dynamic";/);
    assert.match(dispatchContent, /"Cache-Control":\s*"no-store"/);
    assert.match(dispatchContent, /status:\s*401/);
  });

  await t.test("Manage booking dashboard displays unified 42-day policy, PDF download triggers, and reminder roster", () => {
    const pagePath = path.join(__dirname, "../app/manage-booking/page.tsx");
    const pageContent = fs.readFileSync(pagePath, "utf-8");

    // Unified 42-day balance due date text
    assert.match(pageContent, /Strictly 6 weeks \/ 42 days prior to arrival/);

    // Tab 1 header bar PDF download button
    assert.match(pageContent, /getRevisedPdfDownloadUrl\(bookingData\.booking_reference\)/);
    assert.match(pageContent, /Download PDF/);

    // Card 5: Pre-arrival communications & reminder schedule
    assert.match(pageContent, /Authoritative Communications &amp; Milestone Reminders/);
    assert.match(pageContent, /handleSendRevisedEmail/);
    assert.match(pageContent, /Send Revised Confirmation/);
    assert.match(pageContent, /balance_due_first/);
    assert.match(pageContent, /rooming_and_caddy/);
    assert.match(pageContent, /concierge_check/);
    assert.match(pageContent, /balance_due_final/);

    // Step 5 confirmed amendment PDF download link
    assert.match(pageContent, /Authoritative PDF itinerary regenerated for Revision/);
    assert.match(pageContent, /Download Revised PDF/);
  });
});
