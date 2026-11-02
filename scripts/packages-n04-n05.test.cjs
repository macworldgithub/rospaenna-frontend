/**
 * Automated test suite for Ticket N04 and Ticket N05:
 * N04: Priced itinerary and terms review
 * N05: Deposit payment and unpaid-link lifecycle
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

// -------------------------------------------------------------
// TICKET N04 TESTS: PRICED ITINERARY & TERMS REVIEW
// -------------------------------------------------------------

test("N04: Quote freshness TTL is exactly 120 seconds", () => {
  const quoteCreated = new Date("2026-11-02T10:00:00Z");
  const ttlSeconds = 120;
  const quoteExpires = new Date(quoteCreated.getTime() + ttlSeconds * 1000);

  assert.equal(quoteExpires.toISOString(), "2026-11-02T10:02:00.000Z");

  const isExpired = (now, expiresAt) => new Date(now) > new Date(expiresAt);

  assert.equal(isExpired("2026-11-02T10:01:00Z", quoteExpires), false);
  assert.equal(isExpired("2026-11-02T10:02:01Z", quoteExpires), true);
});

test("N04: Dual-fact rate basis assigns Golf Ireland vs Standard Visitor rates truthfully", () => {
  const getRateBasis = (residenceCountry, hasGolfIrelandIndex) => {
    const isResident = residenceCountry === "IE" || residenceCountry === "NI";
    const isEligible = isResident && Boolean(hasGolfIrelandIndex);
    return {
      isEligible,
      rateBasis: isEligible ? "Golf Ireland Resident Rate" : "Standard Visitor Rate",
      stPatricksRate: isEligible ? "150.00" : "330.00",
      sandyHillsRate: isEligible ? "90.00" : "220.00",
      oldTomRate: isEligible ? "90.00" : "160.00",
    };
  };

  // Irish resident with Golf Ireland index
  const ieResidentWithCard = getRateBasis("IE", true);
  assert.equal(ieResidentWithCard.isEligible, true);
  assert.equal(ieResidentWithCard.rateBasis, "Golf Ireland Resident Rate");
  assert.equal(ieResidentWithCard.stPatricksRate, "150.00");

  // Northern Irish resident with index
  const niResidentWithCard = getRateBasis("NI", true);
  assert.equal(niResidentWithCard.isEligible, true);
  assert.equal(niResidentWithCard.rateBasis, "Golf Ireland Resident Rate");

  // Irish resident without index (Visitor rate applies)
  const ieResidentNoCard = getRateBasis("IE", false);
  assert.equal(ieResidentNoCard.isEligible, false);
  assert.equal(ieResidentNoCard.rateBasis, "Standard Visitor Rate");
  assert.equal(ieResidentNoCard.stPatricksRate, "330.00");

  // US visitor with index (Visitor rate applies)
  const usVisitorWithCard = getRateBasis("US", true);
  assert.equal(usVisitorWithCard.isEligible, false);
  assert.equal(usVisitorWithCard.rateBasis, "Standard Visitor Rate");
  assert.equal(usVisitorWithCard.stPatricksRate, "330.00");
});

test("N04: Mandatory terms acceptance is strictly required before payment link generation", () => {
  const validateTermsAcceptance = (request) => {
    if (!request.accepted_terms) {
      throw new Error("Terms and conditions must be explicitly accepted to create a payment link");
    }
    return true;
  };

  assert.throws(
    () => validateTermsAcceptance({ quote_id: "qt_123", accepted_terms: false }),
    /Terms and conditions must be explicitly accepted/
  );

  assert.equal(
    validateTermsAcceptance({ quote_id: "qt_123", accepted_terms: true }),
    true
  );
});

test("N04: Balance due date is strictly 6 weeks (42 days) prior to arrival", () => {
  const calculateBalanceDueDate = (arrivalDateStr) => {
    const d = new Date(arrivalDateStr + "T00:00:00Z");
    d.setUTCDate(d.getUTCDate() - 42);
    return d.toISOString().split("T")[0];
  };

  assert.equal(calculateBalanceDueDate("2027-06-15"), "2027-05-04");
  assert.equal(calculateBalanceDueDate("2027-05-01"), "2027-03-20");
});

// -------------------------------------------------------------
// TICKET N05 TESTS: DEPOSIT PAYMENT & UNPAID LINK LIFECYCLE
// -------------------------------------------------------------

test("N05: Payment link lifecycle enforces 7-day expiry and 5-day reminder", () => {
  const createPaymentLifecycle = (createdAtDate) => {
    const expiresAt = new Date(createdAtDate.getTime() + 7 * 86400 * 1000);
    const reminderAt = new Date(createdAtDate.getTime() + 5 * 86400 * 1000);
    return {
      created_at: createdAtDate.toISOString(),
      expires_at: expiresAt.toISOString(),
      reminder_at: reminderAt.toISOString(),
      reserves_inventory: false,
    };
  };

  const now = new Date("2026-11-02T12:00:00Z");
  const lifecycle = createPaymentLifecycle(now);

  assert.equal(lifecycle.expires_at, "2026-11-09T12:00:00.000Z");
  assert.equal(lifecycle.reminder_at, "2026-11-07T12:00:00.000Z");
  assert.equal(lifecycle.reserves_inventory, false);
});

test("N05: Payment webhook verifies HMAC-SHA256 signature with constant-time comparison", () => {
  const secret = "rosapenna-dev-webhook-secret-key";
  const paymentId = "pay_test123";
  const transactionId = "txn_456";
  const status = "paid";
  const amount = "330.00";
  const timestamp = Math.floor(Date.now() / 1000);

  const payload = `${paymentId}:${transactionId}:${status}:${amount}:${timestamp}`;
  const validSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");

  const verifySignature = (sigToTest) => {
    const computed = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    if (sigToTest.length !== computed.length) return false;
    return crypto.timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(sigToTest, "hex"));
  };

  assert.equal(verifySignature(validSignature), true);

  const tamperedSignature = crypto.createHmac("sha256", "wrong-secret").update(payload).digest("hex");
  assert.equal(verifySignature(tamperedSignature), false);
});

test("N05: Webhook timestamp replay protection rejects payloads skewed > 300 seconds", () => {
  const isTimestampAcceptable = (hookTimestamp, currentTimestamp) => {
    return Math.abs(currentTimestamp - hookTimestamp) <= 300;
  };

  const now = 1793500000;
  assert.equal(isTimestampAcceptable(now, now), true);
  assert.equal(isTimestampAcceptable(now - 120, now), true);
  assert.equal(isTimestampAcceptable(now + 120, now), true);

  // Expired / skewed beyond 5 minutes
  assert.equal(isTimestampAcceptable(now - 301, now), false);
  assert.equal(isTimestampAcceptable(now + 301, now), false);
});

test("N05: Payment callback transitions to verified_paid and operates idempotently", () => {
  const paymentRecord = {
    payment_id: "pay_idem123",
    status: "unpaid",
    amount: "330.00",
  };

  const processCallback = (record, newStatus, txnId) => {
    if (record.status === "verified_paid" && newStatus === "paid") {
      return { status: "already_processed", record };
    }
    if (newStatus === "paid") {
      record.status = "verified_paid";
      record.transaction_id = txnId;
      return { status: "updated", record };
    }
    return { status: "unhandled", record };
  };

  // First callback
  const firstResult = processCallback(paymentRecord, "paid", "txn-001");
  assert.equal(firstResult.status, "updated");
  assert.equal(paymentRecord.status, "verified_paid");
  assert.equal(paymentRecord.transaction_id, "txn-001");

  // Duplicate callback (idempotent)
  const duplicateResult = processCallback(paymentRecord, "paid", "txn-001");
  assert.equal(duplicateResult.status, "already_processed");
  assert.equal(paymentRecord.status, "verified_paid");
});
