const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("M10 Room Occupants, Sharing, and Moves - Frontend Verification", async (t) => {
  await t.test("mmbClient exports comprehensive M10 occupant schemas and client functions", () => {
    const clientPath = path.join(__dirname, "../lib/mmbClient.ts");
    const content = fs.readFileSync(clientPath, "utf-8");

    // Types & Schemas
    assert.match(content, /export interface OccupantDetail/);
    assert.match(content, /export interface SharingPreference/);
    assert.match(content, /export interface BookedRoomGroupSummary/);
    assert.match(content, /export interface OccupantRosterResponse/);
    assert.match(content, /export interface OccupantUpdateRequest/);
    assert.match(content, /export interface OccupantUpdateResponse/);

    // Client functions
    assert.match(content, /export async function fetchOccupantRoster\(/);
    assert.match(content, /export async function updateOccupantRoster\(/);
    assert.match(content, /export async function reviewOccupantsForAmendment\(/);
  });

  await t.test("BFF proxy routes exist, validate session authentication, and enforce Cache-Control: no-store", () => {
    const rosterRoutePath = path.join(__dirname, "../app/api/mmb/occupants/[bookingReference]/route.ts");
    const reviewRoutePath = path.join(__dirname, "../app/api/mmb/occupants/[bookingReference]/review-for-amendment/route.ts");

    assert.ok(fs.existsSync(rosterRoutePath), "Roster route should exist");
    assert.ok(fs.existsSync(reviewRoutePath), "Review for amendment route should exist");

    const rosterContent = fs.readFileSync(rosterRoutePath, "utf-8");
    assert.match(rosterContent, /export const dynamic = "force-dynamic";/);
    assert.match(rosterContent, /"Cache-Control":\s*"no-store"/);
    assert.match(rosterContent, /x-mmb-session/i);
    assert.match(rosterContent, /status:\s*401/);

    const reviewContent = fs.readFileSync(reviewRoutePath, "utf-8");
    assert.match(reviewContent, /export const dynamic = "force-dynamic";/);
    assert.match(reviewContent, /"Cache-Control":\s*"no-store"/);
    assert.match(reviewContent, /x-mmb-session/i);
  });

  await t.test("manage-booking page implements M10 occupant roster, bed preferences, room moves, and check-in notice", () => {
    const pagePath = path.join(__dirname, "../app/manage-booking/page.tsx");
    const content = fs.readFileSync(pagePath, "utf-8");

    // AC 2: Unassigned physical room notice
    assert.match(content, /Physical room numbers are hotel-allocated by front desk reception 2 days prior to arrival or upon check-in/);
    assert.match(content, /Room Assigned at Check-in/);

    // Bed Configuration Preferences
    assert.match(content, /Bed Configuration Preference:/);
    assert.match(content, /Twin Beds/);
    assert.match(content, /Double Bed/);

    // Occupant Move Controls
    assert.match(content, /Assigned Room:/);
    assert.match(content, /Save Rooming List/);
    assert.match(content, /loadOccupantRoster/);
  });
});
