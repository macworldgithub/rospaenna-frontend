const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("M04 Confirmed Booking Dashboard - Frontend Verification", async (t) => {
  await t.test("mmbClient exports enriched MmbBookingSummary schema matching M04 criteria", () => {
    const clientPath = path.join(__dirname, "../lib/mmbClient.ts");
    assert.ok(fs.existsSync(clientPath), "lib/mmbClient.ts must exist");
    const content = fs.readFileSync(clientPath, "utf8");

    // AC 2: Authoritative Stay, Golf, and Payment models
    assert.ok(content.includes("assigned_room_number?: string | null;"), "Must support optional assigned room number");
    assert.ok(content.includes("occupant_names?: string[];"), "Must support occupant names list");
    assert.ok(content.includes("caddy_request_status?: string | null;"), "Must support caddy request state");
    assert.ok(content.includes("balance_due_date?: string | null;"), "Must support balance due date");
    assert.ok(content.includes("ledger_verified?: boolean;"), "Must indicate F11 ledger verification");

    // AC 3: Pending requests held separately
    assert.ok(content.includes("pending_requests?: Array<{"), "Must include pending requests structure");
    assert.ok(content.includes('"pending_review" | "under_review" | "approved" | "declined"'), "Must validate pending request statuses");

    // AC 5: Sources health and freshness
    assert.ok(content.includes("sources_health?: Record<"), "Must include sources health mapping");
    assert.ok(content.includes("data_freshness_timestamp?: string;"), "Must include data freshness timestamp");
  });

  await t.test("manage-booking page enforces unauthenticated gate and authoritative dashboard view", () => {
    const pagePath = path.join(__dirname, "../app/manage-booking/page.tsx");
    assert.ok(fs.existsSync(pagePath), "app/manage-booking/page.tsx must exist");
    const content = fs.readFileSync(pagePath, "utf8");

    // Gate & authentication check
    assert.ok(content.includes("!verified || !bookingData"), "Must require verified authentication to view confirmed itinerary");
    assert.ok(content.includes("Authentication Required"), "Must show Authentication Required when not verified");

    // Freshness & refresh action
    assert.ok(content.includes("handleRefreshBooking"), "Must provide refresh itinerary handler");
    assert.ok(content.includes("Refresh Itinerary"), "Must show Refresh Itinerary button");
    assert.ok(content.includes("data_freshness_timestamp"), "Must display data freshness timestamp");

    // AC 6: Room allocation policy
    assert.ok(content.includes("Assigned upon check-in"), "Must display 'Assigned upon check-in' when room unassigned");
    assert.ok(content.includes("* Allocated by hotel reception"), "Must clarify physical room is allocated at reception");

    // AC 2 & AC 4: Payment ledger verification
    assert.ok(content.includes("F11 Ledger"), "Must display F11 Ledger attribution");
    assert.ok(content.includes("balance_due_date"), "Must display balance due date");
    assert.ok(content.includes("Ledger Reconciled"), "Must display ledger reconciled status");

    // AC 3: Pending requests separation
    assert.ok(content.includes("Pending Requests &amp; Amendment Inquiries"), "Must have separate Pending Requests section");
    assert.ok(
      content.includes("Pending requests are held separately and do not alter confirmed"),
      "Must state that pending requests do not modify confirmed itinerary until approved"
    );

    // AC 5: Source health alerts
    assert.ok(content.includes("sources_health"), "Must handle sources health");
    assert.ok(content.includes("+353 (0)74 91 55301"), "Must provide reservations contact for degraded sources");
  });
});
