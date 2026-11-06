const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

test("M08 Amendment Payment and Credit Handling - Frontend Verification", async (t) => {
  await t.test("mmbClient exports comprehensive M08 payment schemas and client functions", () => {
    const clientPath = path.join(__dirname, "../lib/mmbClient.ts");
    assert.ok(fs.existsSync(clientPath), "lib/mmbClient.ts must exist");
    const content = fs.readFileSync(clientPath, "utf8");

    // Schemas
    assert.ok(content.includes("export type AmendmentPaymentActionType"), "Must export AmendmentPaymentActionType");
    assert.ok(content.includes("payment_required"), "Must include payment_required action type");
    assert.ok(content.includes("zero_due"), "Must include zero_due action type");
    assert.ok(content.includes("credit_generated"), "Must include credit_generated action type");
    assert.ok(content.includes("export type AmendmentSettlementStatus"), "Must export AmendmentSettlementStatus");
    assert.ok(content.includes("payment_link_created"), "Must include payment_link_created status");
    assert.ok(content.includes("zero_due_authorized"), "Must include zero_due_authorized status");
    assert.ok(content.includes("credit_recorded"), "Must include credit_recorded status");
    assert.ok(content.includes("paid_unconfirmed"), "Must include paid_unconfirmed status");
    assert.ok(content.includes("export interface AmendmentPaymentInitiateRequest"), "Must export AmendmentPaymentInitiateRequest");
    assert.ok(content.includes("export interface AmendmentPaymentInitiateResponse"), "Must export AmendmentPaymentInitiateResponse");
    assert.ok(content.includes("reserves_inventory: boolean;"), "Must assert zero inventory hold (reserves_inventory=false)");

    // Client functions
    assert.ok(content.includes("export async function initiateAmendmentSettlement"), "Must export initiateAmendmentSettlement function");
    assert.ok(content.includes("/api/mmb/amendments/settlement/initiate"), "Client must call Next.js BFF initiate endpoint");
    assert.ok(content.includes("export async function getAmendmentPaymentStatus"), "Must export getAmendmentPaymentStatus function");
    assert.ok(content.includes("/api/mmb/amendments/settlement/payment/"), "Client must call Next.js BFF payment endpoint");
    assert.ok(content.includes("X-MMB-Session"), "Client must forward session token header");
  });

  await t.test("BFF proxy routes exist, validate session authentication, and enforce Cache-Control: no-store", () => {
    const initiateRoute = path.join(__dirname, "../app/api/mmb/amendments/settlement/initiate/route.ts");
    assert.ok(fs.existsSync(initiateRoute), "app/api/mmb/amendments/settlement/initiate/route.ts must exist");
    const initContent = fs.readFileSync(initiateRoute, "utf8");
    assert.ok(initContent.includes('export const dynamic = "force-dynamic"'), "Initiate route must be force-dynamic");
    assert.ok(initContent.includes("Authentication required."), "Initiate route must reject unauthenticated callers");
    assert.ok(initContent.includes('bookingBackend('), "Initiate route must use bookingBackend helper");
    assert.ok(initContent.includes('"/mmb/amendments/settlement/initiate"'), "Initiate route must forward to backend settlement initiate endpoint");
    assert.ok(initContent.includes('"Cache-Control": "no-store"'), "Initiate route must enforce Cache-Control: no-store");

    const paymentRoute = path.join(__dirname, "../app/api/mmb/amendments/settlement/payment/[paymentId]/route.ts");
    assert.ok(fs.existsSync(paymentRoute), "app/api/mmb/amendments/settlement/payment/[paymentId]/route.ts must exist");
    const payContent = fs.readFileSync(paymentRoute, "utf8");
    assert.ok(payContent.includes('export const dynamic = "force-dynamic"'), "Payment status route must be force-dynamic");
    assert.ok(payContent.includes("Authentication required."), "Payment status route must reject unauthenticated callers");
    assert.ok(payContent.includes('bookingBackend('), "Payment status route must use bookingBackend helper");
    assert.ok(payContent.includes("/mmb/amendments/settlement/payment/"), "Payment status route must forward to backend endpoint");
    assert.ok(payContent.includes('"Cache-Control": "no-store"'), "Payment status route must enforce Cache-Control: no-store");
  });

  await t.test("manage-booking page implements M08 settlement trigger, financial position, and status handling", () => {
    const pagePath = path.join(__dirname, "../app/manage-booking/page.tsx");
    assert.ok(fs.existsSync(pagePath), "app/manage-booking/page.tsx must exist");
    const content = fs.readFileSync(pagePath, "utf8");

    // Settlement state & handler
    assert.ok(content.includes("handleInitiateSettlement"), "Must implement handleInitiateSettlement handler");
    assert.ok(content.includes("isInitiatingSettlement"), "Must track isInitiatingSettlement loading state");
    assert.ok(content.includes("settlementResult"), "Must track settlementResult response state");

    // UI card
    assert.ok(
      content.includes("Step 4: Ready for Payment &amp; Confirmation (Ticket M08)") ||
      content.includes("Step 4: Ready for Payment & Confirmation (Ticket M08)"),
      "Must render Ticket M08 Step 4 card"
    );

    // Financial position breakdown
    assert.ok(content.includes("Additional Deposit Due"), "Must display additional deposit due");
    assert.ok(content.includes("Resort Credit Generated"), "Must display resort credit generated");
    assert.ok(content.includes("Settlement Expiry"), "Must display 7 days settlement expiry");

    // Zero inventory holds guarantee
    assert.ok(
      content.includes("Zero inventory holds are placed until payment is verified"),
      "Must display zero inventory hold notice"
    );

    // Prommt Scoped Payment Link
    assert.ok(
      content.includes("Prommt Payment Gateway Link Ready"),
      "Must display Prommt payment gateway link card when payment required"
    );

    // Paid-but-unconfirmed recovery banner
    assert.ok(
      content.includes("Paid-but-Unconfirmed Recovery"),
      "Must render recovery banner for paid-but-unconfirmed state"
    );
  });
});
