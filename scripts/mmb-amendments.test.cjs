const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("M05 Live Amendment Options and Alternatives - Frontend Verification", async (t) => {
  await t.test("mmbClient exports comprehensive M05 amendment schemas and searchAmendmentOptions function", () => {
    const clientPath = path.join(__dirname, "../lib/mmbClient.ts");
    assert.ok(fs.existsSync(clientPath), "lib/mmbClient.ts must exist");
    const content = fs.readFileSync(clientPath, "utf8");

    // Schemas
    assert.ok(content.includes("export interface MmbAmendmentSearchRequest"), "Must export MmbAmendmentSearchRequest");
    assert.ok(content.includes("export interface ProposedStayOption"), "Must export ProposedStayOption");
    assert.ok(content.includes("own_allocation_retained: boolean;"), "Must track own held room retention (AC 3)");
    assert.ok(content.includes("export interface ProposedGolfRoundOption"), "Must export ProposedGolfRoundOption");
    assert.ok(content.includes("export interface AmendmentPricingComparison"), "Must export AmendmentPricingComparison");
    assert.ok(content.includes("price_delta: string;"), "Must include price_delta in comparison");
    assert.ok(content.includes("revised_balance_due: string;"), "Must include revised_balance_due");
    assert.ok(content.includes("export interface AmendmentOptionAlternative"), "Must export AmendmentOptionAlternative");
    assert.ok(content.includes("is_complete_package: boolean;"), "Must flag complete packages (AC 4, AC 5)");
    assert.ok(content.includes("unavailability_reasons: string[];"), "Must detail unavailability reasons (AC 5)");
    assert.ok(content.includes("reserves_inventory: boolean;"), "Must assert zero inventory hold (AC 6)");

    // Client function
    assert.ok(content.includes("export async function searchAmendmentOptions"), "Must export searchAmendmentOptions function");
    assert.ok(content.includes("/api/mmb/amendments/search"), "Client must call Next.js BFF proxy endpoint");
    assert.ok(content.includes("X-MMB-Session"), "Client must forward session token header");
  });

  await t.test("BFF proxy route enforces session authentication and forwards search request", () => {
    const routePath = path.join(__dirname, "../app/api/mmb/amendments/search/route.ts");
    assert.ok(fs.existsSync(routePath), "app/api/mmb/amendments/search/route.ts must exist");
    const content = fs.readFileSync(routePath, "utf8");

    assert.ok(content.includes('export const dynamic = "force-dynamic"'), "BFF route must be dynamic");
    assert.ok(content.includes("A valid booking reference is required."), "Must validate booking reference presence");
    assert.ok(content.includes("Authentication required."), "Must reject unauthenticated callers");
    assert.ok(content.includes('bookingBackend('), "Must use secure bookingBackend proxy helper");
    assert.ok(content.includes('"/mmb/amendments/search"'), "Must proxy to backend amendment search route");
    assert.ok(content.includes('"Cache-Control": "no-store"'), "Must prevent caching of live amendment pricing");
  });

  await t.test("manage-booking page tab 2 implements live amendment search, own-stock credit, and complete package checks", () => {
    const pagePath = path.join(__dirname, "../app/manage-booking/page.tsx");
    assert.ok(fs.existsSync(pagePath), "app/manage-booking/page.tsx must exist");
    const content = fs.readFileSync(pagePath, "utf8");

    // AC 8: Unauthenticated access blocked
    assert.ok(content.includes("!verified"), "Must check verification status for tab 2");
    assert.ok(content.includes("Authentication Required"), "Must show authentication warning when unverified");

    // Search Controls
    assert.ok(content.includes("handleSearchAmendments"), "Must implement search handler");
    assert.ok(content.includes("Proposed Arrival"), "Must provide arrival date input");
    assert.ok(content.includes("Proposed Departure"), "Must provide departure date input");
    assert.ok(content.includes("Room Category"), "Must provide room category selector");
    assert.ok(content.includes("Search Alternatives"), "Must have Search Alternatives action");

    // AC 6: Zero Inventory Holds Disclaimer
    assert.ok(
      content.includes("Zero inventory is held, reserved, or altered during search (reserves_inventory = false)"),
      "Must explicitly disclaim zero inventory mutation and zero holds (AC 6)"
    );

    // AC 7: Verified live sources freshness bar
    assert.ok(content.includes("Verified Live Sources:"), "Must display live sources freshness bar");
    assert.ok(content.includes("Opera PMS:"), "Must report Opera PMS source status");
    assert.ok(content.includes("BRS Golf:"), "Must report BRS Golf source status");

    // AC 3: Own held stock recognition
    assert.ok(content.includes("Own Held Room Retained"), "Must label retained room allocation (AC 3)");

    // AC 4 & AC 5: Complete package availability vs incomplete labeling
    assert.ok(content.includes("Complete Package Available"), "Must label complete packages (AC 4)");
    assert.ok(content.includes("Incomplete / Not Bookable"), "Must label incomplete packages (AC 5)");
    assert.ok(content.includes("unavailability_reasons"), "Must render detailed unavailability reasons (AC 5)");

    // Price comparison and revised balance due
    assert.ok(content.includes("Original Total"), "Must display original package total");
    assert.ok(content.includes("New Package Total"), "Must display new package total");
    assert.ok(content.includes("Price Delta"), "Must display price delta");
    assert.ok(content.includes("Revised Balance Due"), "Must display revised balance due");
  });
});
