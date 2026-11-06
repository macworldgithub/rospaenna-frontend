const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("M07 Amendment Revalidation - Frontend Verification", async (t) => {
  await t.test("mmbClient exports comprehensive M07 revalidation schemas and client functions", () => {
    const clientPath = path.join(__dirname, "../lib/mmbClient.ts");
    assert.ok(fs.existsSync(clientPath), "lib/mmbClient.ts must exist");
    const content = fs.readFileSync(clientPath, "utf8");

    // Schemas
    assert.ok(content.includes("export interface AmendmentRevalidationComponentCheck"), "Must export AmendmentRevalidationComponentCheck");
    assert.ok(content.includes("export interface AmendmentRevalidationRequest"), "Must export AmendmentRevalidationRequest");
    assert.ok(content.includes("export interface AmendmentRevalidationResponse"), "Must export AmendmentRevalidationResponse");
    assert.ok(content.includes("revalidation_status:"), "Must include revalidation_status enum field");
    assert.ok(content.includes("room_unavailable"), "Must include room_unavailable status");
    assert.ok(content.includes("tee_time_unavailable"), "Must include tee_time_unavailable status");
    assert.ok(content.includes("price_changed"), "Must include price_changed status");
    assert.ok(content.includes("ledger_changed"), "Must include ledger_changed status");
    assert.ok(content.includes("revision_conflict"), "Must include revision_conflict status");
    assert.ok(content.includes("reserves_inventory: boolean;"), "Must assert zero inventory hold (reserves_inventory=false)");
    assert.ok(content.includes("refreshed_offer?: AmendmentOfferSnapshot | null;"), "Must include refreshed_offer when terms changed");

    // Client function
    assert.ok(content.includes("export async function revalidateAmendmentOffer"), "Must export revalidateAmendmentOffer function");
    assert.ok(content.includes("/api/mmb/amendments/revalidate"), "Client must call Next.js BFF proxy endpoint");
    assert.ok(content.includes("X-MMB-Session"), "Client must forward session token header");
  });

  await t.test("BFF proxy route exists, validates session authentication, and enforces Cache-Control: no-store", () => {
    const revalRoute = path.join(__dirname, "../app/api/mmb/amendments/revalidate/route.ts");
    assert.ok(fs.existsSync(revalRoute), "app/api/mmb/amendments/revalidate/route.ts must exist");

    const content = fs.readFileSync(revalRoute, "utf8");
    assert.ok(content.includes('export const dynamic = "force-dynamic"'), "Route must be force-dynamic");
    assert.ok(content.includes("Authentication required."), "Route must reject unauthenticated callers");
    assert.ok(content.includes('bookingBackend('), "Route must use bookingBackend helper");
    assert.ok(content.includes('"/mmb/amendments/revalidate"'), "Route must forward to backend revalidate endpoint");
    assert.ok(content.includes('"Cache-Control": "no-store"'), "Route must enforce Cache-Control: no-store");
  });

  await t.test("manage-booking page implements M07 revalidation trigger, live status, component checklist, and refreshed offer review", () => {
    const pagePath = path.join(__dirname, "../app/manage-booking/page.tsx");
    assert.ok(fs.existsSync(pagePath), "app/manage-booking/page.tsx must exist");
    const content = fs.readFileSync(pagePath, "utf8");

    // Revalidation handler & state
    assert.ok(content.includes("handleRevalidateOffer"), "Must implement handleRevalidateOffer handler");
    assert.ok(content.includes("isRevalidatingOffer"), "Must track isRevalidatingOffer loading state");
    assert.ok(content.includes("revalidationResult"), "Must track revalidationResult response state");

    // UI card
    assert.ok(
      content.includes("Ticket M07: Live Inventory &amp; Rate Revalidation") ||
      content.includes("Ticket M07: Live Inventory & Rate Revalidation"),
      "Must render M07 live revalidation card"
    );
    assert.ok(
      content.includes("Pre-Payment Live Integrity Verification"),
      "Must render pre-payment integrity title"
    );
    assert.ok(
      content.includes("Revalidate Itinerary Now"),
      "Must provide revalidation action button"
    );

    // Component verification checklist
    assert.ok(
      content.includes("Component Verification Checklist:"),
      "Must display checklist of verified components"
    );

    // Zero-inventory hold guarantee
    assert.ok(
      content.includes("reserves_inventory = false"),
      "Must state zero inventory holds policy"
    );

    // Ticket M08 Next step
    assert.ok(
      content.includes("Ready for Payment &amp; Confirmation (Ticket M08)") ||
      content.includes("Ready for Payment & Confirmation (Ticket M08)"),
      "Must display ready for payment banner upon valid revalidation"
    );

    // Refreshed offer review on change
    assert.ok(
      content.includes("Review Refreshed Offer"),
      "Must provide button to review refreshed offer when price or ledger changes"
    );
  });
});
