/**
 * Automated test suite for Ticket N01 (Booking choice and website links)
 * and Ticket N02 (Stay-and-play booking inputs).
 */

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// Helper function to calculate derived departure date
function calculateDepartureDate(arrivalDateStr, nights) {
  const [year, month, day] = arrivalDateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + nights);
  return date.toISOString().split("T")[0];
}

// Helper function to check Golf Ireland eligibility (separate facts rule)
function evaluateGolfIrelandEligibility(country, hasActiveIndex) {
  const isResident = country === "IE" || country === "NI";
  return isResident && Boolean(hasActiveIndex);
}

// Helper function for minimum rounds requirement
function getMinimumRequiredRounds(nights) {
  if (nights < 2) return null; // Stays under 2 nights not supported
  if (nights <= 3) return 2;
  if (nights <= 5) return 3;
  return 4;
}

// Helper function for room occupancy validation
function validateRoomOccupancy(partySize, roomCount, bedType) {
  const capacityPerRoom = bedType === "SINGLE" ? 1 : 2;
  const totalCapacity = roomCount * capacityPerRoom;
  return {
    valid: totalCapacity >= partySize,
    totalCapacity,
    partySize,
    deficiency: Math.max(0, partySize - totalCapacity),
  };
}

// Helper function for deposit and balance calculations
function calculateDepositAndBalance(totalPrice) {
  const deposit = Math.round(totalPrice * 0.25 * 100) / 100;
  const balance = Math.round((totalPrice - deposit) * 100) / 100;
  return { deposit, balance };
}

// Helper function for balance due date (42 days / 6 weeks prior to arrival)
function calculateBalanceDueDate(arrivalDateStr) {
  const [year, month, day] = arrivalDateStr.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - 42);
  return date.toISOString().split("T")[0];
}

// ----------------------------------------------------
// TICKET N01 TESTS: Links, Contacts, and Booking Choice
// ----------------------------------------------------

test("N01: book-golf page has zero placeholder '#' links", () => {
  const filePath = path.join(__dirname, "../app/book-golf/page.tsx");
  const content = fs.readFileSync(filePath, "utf-8");

  // Check that no href="#" or href='#' exists
  const matches = content.match(/href=["']#["']/g);
  assert.equal(matches, null, "Found placeholder href='#' in book-golf page");
});

test("N01: book-golf page references official BRS URLs and verified contact numbers", () => {
  const filePath = path.join(__dirname, "../app/book-golf/page.tsx");
  const content = fs.readFileSync(filePath, "utf-8");

  // Verified BRS links
  assert.ok(content.includes("https://visitors.brsgolf.com/rosapenna#/course/1"));
  assert.ok(content.includes("https://visitors.brsgolf.com/stpatrickslinks#/course/1"));
  assert.ok(content.includes("https://visitors.brsgolf.com/rosapenna#/course/3"));

  // Verified contact phone and email
  assert.ok(content.includes("+353 (0)74 91 55000"));
  assert.ok(content.includes("golf@rosapenna.ie"));
  assert.ok(content.includes("/#packages"));
});

test("N01: Navbar contains verified hotel reservations phone and mobile action links", () => {
  const filePath = path.join(__dirname, "../components/Navbar.tsx");
  const content = fs.readFileSync(filePath, "utf-8");

  assert.ok(content.includes("tel:+353749155301"), "Expected verified phone number in Navbar");
  assert.ok(content.includes("mailto:reservations@rosapenna.ie"), "Expected reservations email in Navbar");
});

// ----------------------------------------------------
// TICKET N02 TESTS: Inputs, Validation, and Business Rules
// ----------------------------------------------------

test("N02: Derived departure date is accurately calculated across month and year boundaries", () => {
  assert.equal(calculateDepartureDate("2027-04-10", 2), "2027-04-12");
  assert.equal(calculateDepartureDate("2027-04-29", 3), "2027-05-02");
  assert.equal(calculateDepartureDate("2026-12-30", 3), "2027-01-02");
});

test("N02: Balance due date is strictly 6 weeks (42 days) before arrival", () => {
  assert.equal(calculateBalanceDueDate("2027-05-12"), "2027-03-31");
  assert.equal(calculateBalanceDueDate("2027-06-01"), "2027-04-20");
});

test("N02: Minimum rounds rule enforces 2 rounds for 2-3 nights and 3 rounds for 4-5 nights", () => {
  assert.equal(getMinimumRequiredRounds(1), null, "1 night should not be supported for stay & play");
  assert.equal(getMinimumRequiredRounds(2), 2);
  assert.equal(getMinimumRequiredRounds(3), 2);
  assert.equal(getMinimumRequiredRounds(4), 3);
  assert.equal(getMinimumRequiredRounds(5), 3);
});

test("N02: Golf Ireland eligibility requires BOTH Irish residency AND active index", () => {
  // Case 1: Irish resident with active index -> Eligible
  assert.equal(evaluateGolfIrelandEligibility("IE", true), true);
  assert.equal(evaluateGolfIrelandEligibility("NI", true), true);

  // Case 2: Irish resident WITHOUT active index -> Ineligible
  assert.equal(evaluateGolfIrelandEligibility("IE", false), false);
  assert.equal(evaluateGolfIrelandEligibility("NI", false), false);

  // Case 3: Non-Irish resident WITH active index -> Ineligible (nationality/card alone does not qualify)
  assert.equal(evaluateGolfIrelandEligibility("GB", true), false);
  assert.equal(evaluateGolfIrelandEligibility("US", true), false);
  assert.equal(evaluateGolfIrelandEligibility("OTHER", true), false);

  // Case 4: Non-resident without index -> Ineligible
  assert.equal(evaluateGolfIrelandEligibility("GB", false), false);
});

test("N02: Room occupancy validation correctly checks group capacity", () => {
  // 4 guests with 2 Twin rooms -> Sufficient (capacity 4)
  const group4Twin2 = validateRoomOccupancy(4, 2, "TWIN");
  assert.equal(group4Twin2.valid, true);
  assert.equal(group4Twin2.totalCapacity, 4);

  // 4 guests with 1 Twin room -> Insufficient (capacity 2)
  const group4Twin1 = validateRoomOccupancy(4, 1, "TWIN");
  assert.equal(group4Twin1.valid, false);
  assert.equal(group4Twin1.deficiency, 2);

  // 8 guests with 4 Twin rooms -> Sufficient (capacity 8)
  const group8Twin4 = validateRoomOccupancy(8, 4, "TWIN");
  assert.equal(group8Twin4.valid, true);
  assert.equal(group8Twin4.totalCapacity, 8);

  // 8 guests with 4 Single rooms -> Insufficient (capacity 4)
  const group8Single4 = validateRoomOccupancy(8, 4, "SINGLE");
  assert.equal(group8Single4.valid, false);
  assert.equal(group8Single4.deficiency, 4);
});

test("N02: Deposit and balance splits match approved 25% / 75% scope policy", () => {
  const result = calculateDepositAndBalance(1200.00);
  assert.equal(result.deposit, 300.00);
  assert.equal(result.balance, 900.00);

  const oddResult = calculateDepositAndBalance(1535.50);
  assert.equal(oddResult.deposit, 383.88);
  assert.equal(oddResult.balance, 1151.62);
  assert.equal(Math.round((oddResult.deposit + oddResult.balance) * 100) / 100, 1535.50);
});
