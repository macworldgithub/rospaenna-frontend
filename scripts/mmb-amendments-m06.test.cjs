const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("M06 Amendment Cost and Terms Review - Frontend Verification", async (t) => {
  await t.test("mmbClient exports comprehensive M06 amendment offer schemas and client functions", () => {
    const clientPath = path.join(__dirname, "../lib/mmbClient.ts");
    assert.ok(fs.existsSync(clientPath), "lib/mmbClient.ts must exist");
    const content = fs.readFileSync(clientPath, "utf8");

    // Schemas
    assert.ok(content.includes("export interface AmendmentOfferCreateRequest"), "Must export AmendmentOfferCreateRequest");
    assert.ok(content.includes("export interface AmendmentOfferAcceptRequest"), "Must export AmendmentOfferAcceptRequest");
    assert.ok(content.includes("export interface AmendmentOfferSnapshot"), "Must export AmendmentOfferSnapshot");
    assert.ok(content.includes("booking_revision: number;"), "Must track booking revision number (AC 5)");
    assert.ok(content.includes("balance_due_date: string;"), "Must track balance due date (AC 1)");
    assert.ok(content.includes("credit_amount: string;"), "Must track credit amount (AC 1)");
    assert.ok(content.includes("amount_due_now: string;"), "Must track amount due now (AC 1)");
    assert.ok(content.includes("requires_occupant_review: boolean;"), "Must flag occupant review requirement (AC 7)");
    assert.ok(content.includes("occupant_review_acknowledged: boolean;"), "Must track occupant review acknowledgment (AC 7)");
    assert.ok(content.includes("terms_version: string;"), "Must track versioned terms (AC 4)");
    assert.ok(content.includes("reserves_inventory: boolean;"), "Must assert zero inventory hold (AC 6)");

    // Client functions
    assert.ok(content.includes("export async function createAmendmentOffer"), "Must export createAmendmentOffer function");
    assert.ok(content.includes("export async function getAmendmentOffer"), "Must export getAmendmentOffer function");
    assert.ok(content.includes("export async function acceptAmendmentOffer"), "Must export acceptAmendmentOffer function");
    assert.ok(content.includes("/api/mmb/amendments/offer"), "Client must call Next.js BFF proxy endpoint");
    assert.ok(content.includes("X-MMB-Session"), "Client must forward session token header");
  });

  await t.test("BFF proxy routes exist, validate session authentication, and enforce Cache-Control: no-store", () => {
    const offerRoute = path.join(__dirname, "../app/api/mmb/amendments/offer/route.ts");
    const idRoute = path.join(__dirname, "../app/api/mmb/amendments/offer/[id]/route.ts");
    const acceptRoute = path.join(__dirname, "../app/api/mmb/amendments/offer/accept/route.ts");

    assert.ok(fs.existsSync(offerRoute), "app/api/mmb/amendments/offer/route.ts must exist");
    assert.ok(fs.existsSync(idRoute), "app/api/mmb/amendments/offer/[id]/route.ts must exist");
    assert.ok(fs.existsSync(acceptRoute), "app/api/mmb/amendments/offer/accept/route.ts must exist");

    for (const p of [offerRoute, idRoute, acceptRoute]) {
      const content = fs.readFileSync(p, "utf8");
      assert.ok(content.includes('export const dynamic = "force-dynamic"'), `${p} must be force-dynamic`);
      assert.ok(content.includes("Authentication required."), `${p} must reject unauthenticated callers`);
      assert.ok(content.includes('bookingBackend('), `${p} must use bookingBackend helper`);
      assert.ok(content.includes('"Cache-Control": "no-store"'), `${p} must enforce Cache-Control: no-store`);
    }
  });

  await t.test("manage-booking page implements M06 cost review, side-by-side comparison, occupant review gate, and terms acceptance", () => {
    const pagePath = path.join(__dirname, "../app/manage-booking/page.tsx");
    assert.ok(fs.existsSync(pagePath), "app/manage-booking/page.tsx must exist");
    const content = fs.readFileSync(pagePath, "utf8");

    // Review trigger button
    assert.ok(content.includes("handleReviewOffer"), "Must implement handleReviewOffer handler");
    assert.ok(content.includes("Review Offer &amp; Terms") || content.includes("Review Offer & Terms"), "Must have Review Offer & Terms button");

    // Review card presence
    assert.ok(content.includes("Ticket M06: Amendment Cost &amp; Terms Review") || content.includes("Ticket M06: Amendment Cost & Terms Review"), "Must render M06 review card");

    // Side-by-side itinerary comparison (AC 1)
    assert.ok(content.includes("Authoritative Confirmed Itinerary"), "Must display confirmed itinerary column");
    assert.ok(content.includes("Proposed Amendment Itinerary"), "Must display proposed amendment itinerary column");

    // Financial Position breakdown (AC 1, AC 2)
    assert.ok(content.includes("Original Package"), "Must display original package total");
    assert.ok(content.includes("New Package Total"), "Must display new package total");
    assert.ok(content.includes("Deposit Already Paid"), "Must display deposit already paid from F11 ledger");
    assert.ok(content.includes("Revised Balance Due"), "Must display revised balance due");
    assert.ok(content.includes("Balance Due Date"), "Must display 42-day balance due date");
    assert.ok(content.includes("Strictly 6 weeks / 42 days prior"), "Must explain 42-day balance rule");
    assert.ok(content.includes("Amount Due Now"), "Must display amount due now");
    assert.ok(content.includes("Resulting Credit"), "Must display resulting credit");
    assert.ok(content.includes("Approved Amendment Fee"), "Must display approved amendment fee");

    // AC 6: Zero-risk review notice
    assert.ok(
      content.includes("Zero-Risk Review: Reviewing this amendment offer does not place room inventory holds"),
      "Must display zero inventory hold notice (AC 6)"
    );

    // AC 7: Occupant review gate
    assert.ok(content.includes("Occupant &amp; Room Sharing Review Required (AC 7)") || content.includes("Occupant & Room Sharing Review Required (AC 7)"), "Must render occupant review gate when required");
    assert.ok(content.includes("occupantReviewCheckbox"), "Must bind occupant review checkbox");

    // AC 4: Terms acceptance
    assert.ok(content.includes("Terms &amp; Conditions Consent") || content.includes("Terms & Conditions Consent"), "Must render terms acceptance section");
    assert.ok(content.includes("acceptedTermsCheckbox"), "Must bind terms acceptance checkbox");
    assert.ok(content.includes("Accept Amendment Terms"), "Must have Accept Amendment Terms action");

    // Success confirmation
    assert.ok(content.includes("Amendment Offer Accepted Successfully!"), "Must render acceptance confirmation banner");
  });
});
