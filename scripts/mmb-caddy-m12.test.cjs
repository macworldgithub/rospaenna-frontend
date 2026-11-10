const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("M12 Per-Round Caddy Request Updates - Frontend Verification", async (t) => {
  await t.test("mmbClient exports comprehensive M12 caddy schemas and client methods", () => {
    const clientPath = path.join(__dirname, "../lib/mmbClient.ts");
    const content = fs.readFileSync(clientPath, "utf-8");

    // Schemas & Types
    assert.match(content, /export type CaddyCategory = "caddie" \| "forecaddie";/);
    assert.match(content, /export interface CaddyBagPreference/);
    assert.match(content, /export interface RoundCaddySummary/);
    assert.match(content, /export interface BookingCaddyRosterResponse/);
    assert.match(content, /export interface RoundCaddyUpdateRequest/);
    assert.match(content, /export interface RoundCaddyUpdateResponse/);

    // Client Methods
    assert.match(content, /export async function fetchBookingCaddyRoster\(/);
    assert.match(content, /export async function updateRoundCaddyRequest\(/);
    assert.match(content, /headers\["Idempotency-Key"\]/);
  });

  await t.test("BFF proxy routes exist, validate session authentication, forward idempotency key, and set Cache-Control: no-store", () => {
    const rosterRoutePath = path.join(__dirname, "../app/api/mmb/caddy/[bookingReference]/route.ts");
    assert.ok(fs.existsSync(rosterRoutePath), "Caddy roster route should exist");

    const rosterContent = fs.readFileSync(rosterRoutePath, "utf-8");
    assert.match(rosterContent, /export const dynamic = "force-dynamic";/);
    assert.match(rosterContent, /"Cache-Control":\s*"no-store"/);
    assert.match(rosterContent, /x-mmb-session/i);
    assert.match(rosterContent, /status:\s*401/);

    const updateRoutePath = path.join(__dirname, "../app/api/mmb/caddy/[bookingReference]/rounds/[roundId]/route.ts");
    assert.ok(fs.existsSync(updateRoutePath), "Round caddy update route should exist");

    const updateContent = fs.readFileSync(updateRoutePath, "utf-8");
    assert.match(updateContent, /export const dynamic = "force-dynamic";/);
    assert.match(updateContent, /"Cache-Control":\s*"no-store"/);
    assert.match(updateContent, /x-mmb-session/i);
    assert.match(updateContent, /status:\s*401/);
    assert.match(updateContent, /idempotency-key/i);
  });

  await t.test("manage-booking page renders Per-Round Caddy Request Management Card with zero online payment and day fee notice", () => {
    const pagePath = path.join(__dirname, "../app/manage-booking/page.tsx");
    const content = fs.readFileSync(pagePath, "utf-8");

    // Per-Round Caddy Card
    assert.match(content, /Per-Round Caddy Request Management \(Ticket M12\)/);
    assert.match(content, /€0\.00 Online Charge/);
    assert.match(content, /€90 \/ bag at Golf Pavilion/);
    assert.match(content, /loadCaddyRoster/);
    assert.match(content, /handleUpdateRoundCaddy/);

    // Form inputs: count, tier, notes, fee estimate
    assert.match(content, /Caddies Requested \(Max/);
    assert.match(content, /Caddy Tier:/);
    assert.match(content, /Walking Caddie \(Individual Bag\)/);
    assert.match(content, /Forecaddie \(Group Assistance\)/);
    assert.match(content, /Notes for Caddie Master/);
    assert.match(content, /Estimated Day Fee:/);
  });
});
