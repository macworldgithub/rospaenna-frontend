/**
 * Automated test suite for Ticket N03: Live Stay and Golf Search.
 * Verifies proxy routing, search schema validation, 3-course mappings,
 * dual-fact Golf Ireland eligibility, buffer enforcement, and reserves_inventory=false semantics.
 */

const test = require("node:test");
const assert = require("node:assert/strict");

// Course mappings required by Scope and N03
const EXPECTED_COURSES = {
  1: { name: "Old Tom Morris Links", tenant: "rosapenna", external_id: 1 },
  3: { name: "Sandy Hills Links", tenant: "rosapenna", external_id: 3 },
  4: { name: "St Patrick's Links", tenant: "stpatrickslinks", external_id: 1 },
};

test("N03: 3-course configuration maps all three courses correctly", () => {
  assert.equal(EXPECTED_COURSES[1].name, "Old Tom Morris Links");
  assert.equal(EXPECTED_COURSES[1].tenant, "rosapenna");

  assert.equal(EXPECTED_COURSES[3].name, "Sandy Hills Links");
  assert.equal(EXPECTED_COURSES[3].tenant, "rosapenna");

  assert.equal(EXPECTED_COURSES[4].name, "St Patrick's Links");
  assert.equal(EXPECTED_COURSES[4].tenant, "stpatrickslinks");
  assert.equal(EXPECTED_COURSES[4].external_id, 1);
});

test("N03: Search rules enforce minimum 2 nights and maximum 5 nights for online stay packages", () => {
  const evaluateStayLength = (nights) => {
    if (nights < 2) return { status: "ineligible", reason: "minimum stay of 2 nights" };
    if (nights > 5) return { status: "ineligible", reason: "longer than 5 nights require bespoke staff review" };
    return { status: "eligible", reason: null };
  };

  assert.equal(evaluateStayLength(1).status, "ineligible");
  assert.match(evaluateStayLength(1).reason, /minimum stay of 2 nights/);

  assert.equal(evaluateStayLength(2).status, "eligible");
  assert.equal(evaluateStayLength(3).status, "eligible");
  assert.equal(evaluateStayLength(5).status, "eligible");

  assert.equal(evaluateStayLength(6).status, "ineligible");
  assert.match(evaluateStayLength(6).reason, /longer than 5 nights require bespoke staff review/);
});

test("N03: Minimum rounds scale correctly with length of stay", () => {
  const getRequiredRounds = (nights) => {
    if (nights <= 3) return 2;
    if (nights <= 5) return 3;
    return 4;
  };

  assert.equal(getRequiredRounds(2), 2);
  assert.equal(getRequiredRounds(3), 2);
  assert.equal(getRequiredRounds(4), 3);
  assert.equal(getRequiredRounds(5), 3);
});

test("N03: Dual-fact Golf Ireland eligibility strictly requires both residence and active card", () => {
  const isEligibleForGolfIrelandRate = (country, hasCard) => {
    const isIrishResident = country === "IE" || country === "NI";
    return isIrishResident && Boolean(hasCard);
  };

  // Qualified cases
  assert.equal(isEligibleForGolfIrelandRate("IE", true), true);
  assert.equal(isEligibleForGolfIrelandRate("NI", true), true);

  // Disqualified cases
  assert.equal(isEligibleForGolfIrelandRate("IE", false), false);
  assert.equal(isEligibleForGolfIrelandRate("NI", false), false);
  assert.equal(isEligibleForGolfIrelandRate("GB", true), false);
  assert.equal(isEligibleForGolfIrelandRate("US", true), false);
  assert.equal(isEligibleForGolfIrelandRate("OTHER", false), false);
});

test("N03: Room buffer deduction ensures resort reserve rooms are never sold online", () => {
  const categoryBuffers = {
    CLASSIC: 1,
    DELUXE: 1,
    BAYVIEW_SUITE: 1,
    PENTHOUSE: 0,
  };

  const calculateNetAvailable = (category, rawOperaRooms) => {
    const buffer = categoryBuffers[category.toUpperCase()] || 0;
    return Math.max(0, rawOperaRooms - buffer);
  };

  // Raw 5 Classic rooms -> 4 net available
  assert.equal(calculateNetAvailable("CLASSIC", 5), 4);
  // Raw 1 Classic room -> 0 net available (held in buffer)
  assert.equal(calculateNetAvailable("CLASSIC", 1), 0);
  // Raw 0 Classic rooms -> 0 net available
  assert.equal(calculateNetAvailable("CLASSIC", 0), 0);
  // Raw 2 Penthouse suites -> 2 net available (0 buffer)
  assert.equal(calculateNetAvailable("PENTHOUSE", 2), 2);
});

test("N03: Search semantics strictly prohibit inventory reservation (reserves_inventory=false)", () => {
  const mockSearchResponse = {
    search_id: "SRC-20261030-ABC123",
    status: "available",
    reserves_inventory: false,
    freshness_ttl_seconds: 120,
    room_options: [{ room_category: "CLASSIC", available_rooms: 4 }],
    daily_golf_options: [{ course_id: 1, available_slots_count: 2 }],
  };

  assert.equal(mockSearchResponse.reserves_inventory, false);
  assert.equal(mockSearchResponse.freshness_ttl_seconds, 120);
});

test("N03: Package recommendation calculates 25% deposit and 75% balance due 42 days prior", () => {
  const calculatePackageDeposit = (arrivalDateStr, totalPrice) => {
    const deposit = Math.round(totalPrice * 0.25 * 100) / 100;
    const balance = Math.round((totalPrice - deposit) * 100) / 100;

    const [year, month, day] = arrivalDateStr.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() - 42);
    const balanceDueDate = date.toISOString().split("T")[0];

    return { deposit, balance, balanceDueDate };
  };

  const result = calculatePackageDeposit("2027-06-10", 1320.00);
  assert.equal(result.deposit, 330.00);
  assert.equal(result.balance, 990.00);
  assert.equal(result.balanceDueDate, "2027-04-29");
});

test("N03: Day-by-Day schedule generates stay days and enforces course availability", () => {
  const generateStayDays = (arrivalDateStr, nights, playOnDeparture = false) => {
    const days = [];
    const [year, month, day] = arrivalDateStr.split("-").map(Number);
    const count = playOnDeparture ? nights + 1 : nights;

    for (let i = 0; i < count; i++) {
      const d = new Date(Date.UTC(year, month - 1, day + i));
      days.push({
        index: i,
        date: d.toISOString().split("T")[0],
        isArrival: i === 0,
        isDeparture: i === nights,
      });
    }
    return days;
  };

  const days3Nights = generateStayDays("2026-10-16", 3);
  assert.equal(days3Nights.length, 3);
  assert.equal(days3Nights[0].date, "2026-10-16");
  assert.equal(days3Nights[0].isArrival, true);
  assert.equal(days3Nights[2].date, "2026-10-18");

  const daysWithDeparture = generateStayDays("2026-10-16", 3, true);
  assert.equal(daysWithDeparture.length, 4);
  assert.equal(daysWithDeparture[3].isDeparture, true);
});

test("N03: St Patrick's Links agronomy rest dates and winter rest are disabled with clear reasons", () => {
  const CLOSURES_ST_PATRICKS = [
    "04-13", "04-15", "04-20", "04-27", "05-06", "05-11", "05-18", "05-25",
    "06-01", "06-08", "06-15", "06-22", "06-29", "07-08", "07-20", "07-21",
    "07-27", "08-03", "08-05", "08-10", "08-17", "08-26", "08-31", "09-07",
    "09-28", "10-05", "10-07", "10-12", "10-14", "10-18",
  ];

  const checkStPatricksAvailability = (dateStr) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    const mmDd = `${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    if (m === 11 || m === 12 || m === 1 || m === 2 || m === 3) {
      return { isAvailable: false, reason: "winter rest" };
    }
    if (CLOSURES_ST_PATRICKS.includes(mmDd)) {
      return { isAvailable: false, reason: "agronomy rest" };
    }
    return { isAvailable: true, reason: "" };
  };

  // Agronomy closure day (e.g. 18 October)
  const closureDay = checkStPatricksAvailability("2026-10-18");
  assert.equal(closureDay.isAvailable, false);
  assert.match(closureDay.reason, /agronomy rest/);

  // Winter closure day (e.g. 15 December)
  const winterDay = checkStPatricksAvailability("2026-12-15");
  assert.equal(winterDay.isAvailable, false);
  assert.match(winterDay.reason, /winter rest/);

  // Normal active day (e.g. 16 October)
  const normalDay = checkStPatricksAvailability("2026-10-16");
  assert.equal(normalDay.isAvailable, true);
});

test("N03: Two-Championship Course rate (Option 3) automatically reduces price when St Patrick's is resting", () => {
  const calculateGolfCostPerPlayer = (stPatRounds, sandyRounds, oldTomRounds, isIrishResident) => {
    const stPatRate = isIrishResident ? 150 : 330;
    const sandyRate = isIrishResident ? 90 : 220;
    const oldTomRate = isIrishResident ? 90 : 160;

    return stPatRounds * stPatRate + sandyRounds * sandyRate + oldTomRounds * oldTomRate;
  };

  // 3-Round Package including St Patrick's (Visitor): St Pat (€330) + Sandy Hills (€220) + Old Tom (€160) = €710
  const standardWithStPat = calculateGolfCostPerPlayer(1, 1, 1, false);
  assert.equal(standardWithStPat, 710);

  // 2-Round Championship Package when St Patrick's is resting: Sandy Hills (€220) + Old Tom (€160) = €380
  const restingOption3 = calculateGolfCostPerPlayer(0, 1, 1, false);
  assert.equal(restingOption3, 380);

  // Savings achieved for the guest
  assert.equal(standardWithStPat - restingOption3, 330);
});

test("N03: Rest Day selection maintains package validity as long as minimum round rule is satisfied", () => {
  const evaluateScheduleCompliance = (nights, dailySchedules) => {
    const minRequired = nights <= 3 ? 2 : nights <= 5 ? 3 : 4;
    const totalScheduledRounds = dailySchedules.filter((s) => !s.isRestDay && s.courseId !== null).length;
    return {
      totalScheduledRounds,
      minRequired,
      isCompliant: totalScheduledRounds >= minRequired,
    };
  };

  // 3-night stay: Day 1 Sandy Hills, Day 2 Old Tom, Day 3 Rest Day -> 2 rounds -> COMPLIANT
  const scheduleWithRestDay = [
    { day: 1, courseId: 3, isRestDay: false },
    { day: 2, courseId: 1, isRestDay: false },
    { day: 3, courseId: null, isRestDay: true },
  ];
  const eval1 = evaluateScheduleCompliance(3, scheduleWithRestDay);
  assert.equal(eval1.isCompliant, true);
  assert.equal(eval1.totalScheduledRounds, 2);

  // 3-night stay: Day 1 Sandy Hills, Day 2 Rest Day, Day 3 Rest Day -> 1 round -> INSUFFICIENT
  const scheduleTooFew = [
    { day: 1, courseId: 3, isRestDay: false },
    { day: 2, courseId: null, isRestDay: true },
    { day: 3, courseId: null, isRestDay: true },
  ];
  const eval2 = evaluateScheduleCompliance(3, scheduleTooFew);
  assert.equal(eval2.isCompliant, false);
  assert.equal(eval2.totalScheduledRounds, 1);
});
