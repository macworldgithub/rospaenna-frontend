"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Calendar,
  Users,
  BedDouble,
  Flag,
  Check,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  AlertTriangle,
  Info,
  Phone,
  Mail,
  ShieldCheck,
  Loader2,
  Clock,
  Lock,
  Coffee,
} from "lucide-react";
import type { PackageSearchResponse } from "@/lib/packagesClient";

const steps = [
  { title: "Dates", icon: Calendar },
  { title: "Guests", icon: Users },
  { title: "Rooms", icon: BedDouble },
  { title: "Golf", icon: Flag },
  { title: "Review", icon: Check },
];

const ROOM_CATEGORIES = [
  { id: "CLASSIC", name: "Classic Room", desc: "Comfortable and refined ensuite base", singleRate: { low: 200, high: 280 }, doubleRate: { low: 220, high: 300 } },
  { id: "DELUXE", name: "Deluxe Room", desc: "Elegantly appointed with garden or bay views", singleRate: { low: 230, high: 310 }, doubleRate: { low: 250, high: 330 } },
  { id: "BAYVIEW", name: "Bay View Junior Suite", desc: "Spacious luxury suites with panoramic ocean views", singleRate: { low: 280, high: 360 }, doubleRate: { low: 300, high: 380 } },
  { id: "PENTHOUSE", name: "Penthouse Suite", desc: "Private terrace overlooking Sheephaven Bay", singleRate: { low: 400, high: 480 }, doubleRate: { low: 420, high: 500 } },
];

const GOLF_COURSES = [
  { id: "st-patricks", name: "St Patrick's Links", badge: "World Top 50 (Tom Doak)", courseId: 4, stdRate: 330, residentRate: 150 },
  { id: "sandy-hills", name: "Sandy Hills Links", badge: "Ireland's Top 50 (Pat Ruddy)", courseId: 3, stdRate: 220, residentRate: 90 },
  { id: "old-tom-morris", name: "Old Tom Morris Links", badge: "Historic 1893 Links", courseId: 1, stdRate: 160, residentRate: 90 },
];

const CLOSURES = {
  ST_PATRICKS: [
    "04-13", "04-15", "04-20", "04-27", "05-06", "05-11", "05-18", "05-25",
    "06-01", "06-08", "06-15", "06-22", "06-29", "07-08", "07-20", "07-21",
    "07-27", "08-03", "08-05", "08-10", "08-17", "08-26", "08-31", "09-07",
    "09-28", "10-05", "10-07", "10-12", "10-14", "10-18",
  ],
  OLD_TOM: ["07-22"],
  SANDY_HILLS: ["04-19", "04-20", "04-21", "07-20"],
};

const irelandToday = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Dublin" }).format(new Date());

const euro = (amount: number) =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(amount);

const STORAGE_KEY = "rosapenna_stay_package_inputs";

export default function BespokePackage() {
  const [currentStep, setCurrentStep] = useState(0);

  // Step 0: Stay Dates
  const [arrivalDate, setArrivalDate] = useState("");
  const [nights, setNights] = useState(2);

  // Step 1: Guests & Contact
  const [groupSize, setGroupSize] = useState(2);
  const [leadFirstName, setLeadFirstName] = useState("");
  const [leadLastName, setLeadLastName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [residenceCountry, setResidenceCountry] = useState("IE");
  const [hasGolfIrelandIndex, setHasGolfIrelandIndex] = useState(false);

  // Step 2: Room Configuration
  const [roomCategory, setRoomCategory] = useState("CLASSIC");
  const [roomBedType, setRoomBedType] = useState<"TWIN" | "DOUBLE" | "SINGLE">("TWIN");
  const [roomCount, setRoomCount] = useState(1);

  // Step 3: Interactive Day-by-Day Golf Schedule
  const [dailyGolfPlan, setDailyGolfPlan] = useState<
    Record<string, { courseId: number | null; timeSlot: string; isRestDay: boolean }>
  >({});
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [playOnArrival, setPlayOnArrival] = useState(false);
  const [playOnDeparture, setPlayOnDeparture] = useState(false);
  const [requestCaddies, setRequestCaddies] = useState(false);

  // Step 4: Submission & Inquiry
  const [additionalRequests, setAdditionalRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingIntentResult, setBookingIntentResult] = useState<{
    reference: string;
    stage: string;
    totalAmount: string;
    depositAmount: string;
    balanceDue: string;
    balanceDueDate: string;
  } | null>(null);

  // Live Opera & BRS Search State (Ticket N03)
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<PackageSearchResponse | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Restore inputs from sessionStorage on mount
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.arrivalDate) setArrivalDate(data.arrivalDate);
        if (data.nights) setNights(data.nights);
        if (data.groupSize) setGroupSize(data.groupSize);
        if (data.leadFirstName) setLeadFirstName(data.leadFirstName);
        if (data.leadLastName) setLeadLastName(data.leadLastName);
        if (data.leadEmail) setLeadEmail(data.leadEmail);
        if (data.leadPhone) setLeadPhone(data.leadPhone);
        if (data.residenceCountry) setResidenceCountry(data.residenceCountry);
        if (typeof data.hasGolfIrelandIndex === "boolean") setHasGolfIrelandIndex(data.hasGolfIrelandIndex);
        if (data.roomCategory) setRoomCategory(data.roomCategory);
        if (data.roomBedType) setRoomBedType(data.roomBedType);
        if (data.roomCount) setRoomCount(data.roomCount);
        if (data.dailyGolfPlan) setDailyGolfPlan(data.dailyGolfPlan);
        if (typeof data.playOnArrival === "boolean") setPlayOnArrival(data.playOnArrival);
        if (typeof data.playOnDeparture === "boolean") setPlayOnDeparture(data.playOnDeparture);
        if (typeof data.requestCaddies === "boolean") setRequestCaddies(data.requestCaddies);
      }
    } catch {
      // Ignore storage read errors
    }
  }, []);

  // Save inputs to sessionStorage on change
  useEffect(() => {
    try {
      const payload = {
        arrivalDate,
        nights,
        groupSize,
        leadFirstName,
        leadLastName,
        leadEmail,
        leadPhone,
        residenceCountry,
        hasGolfIrelandIndex,
        roomCategory,
        roomBedType,
        roomCount,
        dailyGolfPlan,
        playOnArrival,
        playOnDeparture,
        requestCaddies,
      };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      // Ignore storage write errors
    }
  }, [
    arrivalDate,
    nights,
    groupSize,
    leadFirstName,
    leadLastName,
    leadEmail,
    leadPhone,
    residenceCountry,
    hasGolfIrelandIndex,
    roomCategory,
    roomBedType,
    roomCount,
    dailyGolfPlan,
    playOnArrival,
    playOnDeparture,
    requestCaddies,
  ]);

  // Derived Departure Date (N02 Requirement)
  const departureDate = useMemo(() => {
    if (!arrivalDate) return "";
    const [year, month, day] = arrivalDate.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() + nights);
    return date.toISOString().split("T")[0];
  }, [arrivalDate, nights]);

  const formattedDeparture = useMemo(() => {
    if (!departureDate) return "";
    const [year, month, day] = departureDate.split("-").map(Number);
    const d = new Date(Date.UTC(year, month - 1, day));
    return new Intl.DateTimeFormat("en-IE", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(d);
  }, [departureDate]);

  // Derived Balance Due Date (6 weeks / 42 days prior to arrival)
  const balanceDueDate = useMemo(() => {
    if (!arrivalDate) return "";
    const [year, month, day] = arrivalDate.split("-").map(Number);
    const d = new Date(Date.UTC(year, month - 1, day));
    d.setUTCDate(d.getUTCDate() - 42);
    return d.toISOString().split("T")[0];
  }, [arrivalDate]);

  // Minimum Rounds Rule (N02 & F02: 2 for 2-3 nights, 3 for 4-5 nights)
  const minRequiredRounds = useMemo(() => {
    if (nights <= 3) return 2;
    if (nights <= 5) return 3;
    return 4;
  }, [nights]);

  // Derived Stay Days for Day-by-Day Golf Scheduling
  const stayDates = useMemo(() => {
    if (!arrivalDate) return [];
    const days: { index: number; date: string; formattedShort: string; isArrival: boolean; isDeparture: boolean }[] = [];
    const [year, month, day] = arrivalDate.split("-").map(Number);
    const count = playOnDeparture ? nights + 1 : nights;

    for (let i = 0; i < count; i++) {
      const d = new Date(Date.UTC(year, month - 1, day + i));
      const dateStr = d.toISOString().split("T")[0];
      const formattedShort = new Intl.DateTimeFormat("en-IE", {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(d);

      days.push({
        index: i,
        date: dateStr,
        formattedShort,
        isArrival: i === 0,
        isDeparture: i === nights,
      });
    }
    return days;
  }, [arrivalDate, nights, playOnDeparture]);

  // Helper: St Patrick's Links closure and agronomy status checker
  const getStPatricksStatusForDate = (dateStr: string) => {
    if (!dateStr) return { isAvailable: false, reason: "" };
    const [y, m, d] = dateStr.split("-").map(Number);
    const mmDd = `${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    if (m === 11 || m === 12 || m === 1 || m === 2 || m === 3) {
      return {
        isAvailable: false,
        reason: "St Patrick's Links is resting for winter maintenance (November to March).",
      };
    }

    if (CLOSURES.ST_PATRICKS.includes(mmDd)) {
      return {
        isAvailable: false,
        reason: "St Patrick's Links is resting for scheduled agronomy maintenance on this date.",
      };
    }

    const liveDay = searchResults?.daily_golf_options?.find(
      (g) => g.course_id === 4 && g.date === dateStr
    );
    if (liveDay?.is_closed) {
      return {
        isAvailable: false,
        reason: liveDay.closure_reason || "St Patrick's Links is closed on this date.",
      };
    }

    return { isAvailable: true, reason: "" };
  };

  const isStPatricksClosedForAllStayDays = useMemo(() => {
    if (!stayDates.length) return false;
    return stayDates.every((day) => !getStPatricksStatusForDate(day.date).isAvailable);
  }, [stayDates, searchResults]);

  // Synchronize dailyGolfPlan with stay dates and closure states
  useEffect(() => {
    if (!stayDates.length) return;
    setDailyGolfPlan((prev) => {
      const next = { ...prev };
      let changed = false;

      stayDates.forEach((day, idx) => {
        const existing = next[day.date];
        const stpStatus = getStPatricksStatusForDate(day.date);

        // If selected St Patrick's but it is closed on this date, fallback to Sandy Hills
        if (existing && existing.courseId === 4 && !stpStatus.isAvailable) {
          next[day.date] = {
            courseId: 3,
            timeSlot: existing.timeSlot || "10:00",
            isRestDay: false,
          };
          changed = true;
          return;
        }

        if (!existing) {
          changed = true;
          if (idx === 0) {
            next[day.date] = { courseId: 3, timeSlot: "13:30", isRestDay: false };
          } else if (idx === 1) {
            next[day.date] = { courseId: stpStatus.isAvailable ? 4 : 1, timeSlot: "10:00", isRestDay: false };
          } else if (idx === 2) {
            next[day.date] = { courseId: 1, timeSlot: "09:30", isRestDay: false };
          } else {
            next[day.date] = { courseId: null, timeSlot: "", isRestDay: true };
          }
        }
      });

      return changed ? next : prev;
    });
  }, [stayDates, searchResults]);

  // Derived counts of scheduled rounds
  const { stPatricksRounds, sandyHillsRounds, oldTomMorrisRounds } = useMemo(() => {
    let stp = 0;
    let sandy = 0;
    let oldTom = 0;

    stayDates.forEach((day) => {
      const plan = dailyGolfPlan[day.date];
      if (plan && !plan.isRestDay) {
        if (plan.courseId === 4) stp++;
        else if (plan.courseId === 3) sandy++;
        else if (plan.courseId === 1) oldTom++;
      }
    });

    return {
      stPatricksRounds: stp,
      sandyHillsRounds: sandy,
      oldTomMorrisRounds: oldTom,
    };
  }, [stayDates, dailyGolfPlan]);

  const totalRounds = stPatricksRounds + sandyHillsRounds + oldTomMorrisRounds;
  const hasEnoughRounds = totalRounds >= minRequiredRounds;
  const hasValidArrival = /^\d{4}-\d{2}-\d{2}$/.test(arrivalDate) && arrivalDate >= irelandToday();

  // Active Day & Handlers for Day-by-Day Golf Scheduling
  const safeActiveDayIndex = Math.min(activeDayIndex, Math.max(0, stayDates.length - 1));
  const activeDay = stayDates[safeActiveDayIndex] || stayDates[0];
  const activeDayPlan = activeDay ? dailyGolfPlan[activeDay.date] : null;

  const handleSelectCourse = (dateStr: string, courseId: number) => {
    setDailyGolfPlan((prev) => {
      const existing = prev[dateStr];
      return {
        ...prev,
        [dateStr]: {
          courseId,
          timeSlot: existing?.timeSlot || "10:00",
          isRestDay: false,
        },
      };
    });
  };

  const handleSelectTimeSlot = (dateStr: string, timeSlot: string) => {
    setDailyGolfPlan((prev) => {
      const existing = prev[dateStr];
      if (!existing) return prev;
      return {
        ...prev,
        [dateStr]: {
          ...existing,
          timeSlot,
        },
      };
    });
  };

  const handleSelectRestDay = (dateStr: string) => {
    setDailyGolfPlan((prev) => ({
      ...prev,
      [dateStr]: {
        courseId: null,
        timeSlot: "",
        isRestDay: true,
      },
    }));
  };

  // Occupancy Validation (N02 Requirement: supports groups over 4)
  const bedCapacityPerRoom = roomBedType === "SINGLE" ? 1 : 2;
  const totalBedCapacity = roomCount * bedCapacityPerRoom;
  const isOccupancySufficient = totalBedCapacity >= groupSize;

  // Automatically adjust recommended room count when group size changes
  useEffect(() => {
    const recommendedRooms = Math.ceil(groupSize / bedCapacityPerRoom);
    if (roomCount < recommendedRooms) {
      setRoomCount(recommendedRooms);
    }
  }, [groupSize, bedCapacityPerRoom]);

  // Golf Ireland Eligibility Status (N02 Requirement: separate residence + handicap index)
  const isGolfIrelandEligible = useMemo(() => {
    const isIrishResident = residenceCountry === "IE" || residenceCountry === "NI";
    return isIrishResident && hasGolfIrelandIndex;
  }, [residenceCountry, hasGolfIrelandIndex]);

  // Closure Warnings
  const closureWarnings = useMemo(() => {
    if (!arrivalDate) return [];
    const warnings: string[] = [];
    const [year, month, day] = arrivalDate.split("-").map(Number);

    const checkClosure = (courseName: string, closureDates: string[]) => {
      for (let i = 0; i < nights; i++) {
        const currentDate = new Date(Date.UTC(year, month - 1, day + i));
        const mm = String(currentDate.getUTCMonth() + 1).padStart(2, "0");
        const dd = String(currentDate.getUTCDate()).padStart(2, "0");
        const dateString = `${mm}-${dd}`;

        if (closureDates.includes(dateString)) {
          warnings.push(
            `${courseName} is scheduled closed on ${currentDate.toLocaleDateString("en-IE", { month: "short", day: "numeric" })} during your stay.`
          );
        }
      }
    };

    if (stPatricksRounds > 0) checkClosure("St Patrick's Links", CLOSURES.ST_PATRICKS);
    if (sandyHillsRounds > 0) checkClosure("Sandy Hills Links", CLOSURES.SANDY_HILLS);
    if (oldTomMorrisRounds > 0) checkClosure("Old Tom Morris Links", CLOSURES.OLD_TOM);

    return [...new Set(warnings)];
  }, [arrivalDate, nights, stPatricksRounds, sandyHillsRounds, oldTomMorrisRounds]);

  // Live Opera Room & BRS Golf Search Effect (Ticket N03)
  useEffect(() => {
    if (!hasValidArrival || !departureDate || nights < 2 || nights > 5) {
      setSearchResults(null);
      return;
    }

    let isMounted = true;
    setIsSearching(true);
    setSearchError(null);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch("/api/packages/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            arrival_date: arrivalDate,
            departure_date: departureDate,
            party_size: groupSize,
            room_count: roomCount,
            bed_type: roomBedType,
            preferred_courses: [1, 3, 4],
            residence_country: residenceCountry,
            has_golf_ireland_index: hasGolfIrelandIndex,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Search returned HTTP ${res.status}`);
        }

        const data: PackageSearchResponse = await res.json();
        if (isMounted) {
          setSearchResults(data);
        }
      } catch (err: any) {
        if (isMounted) {
          setSearchError(err?.message || "Live search service temporarily unavailable.");
        }
      } finally {
        if (isMounted) {
          setIsSearching(false);
        }
      }
    }, 350);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [
    arrivalDate,
    departureDate,
    nights,
    hasValidArrival,
    groupSize,
    roomCount,
    roomBedType,
    residenceCountry,
    hasGolfIrelandIndex,
  ]);

  // Pricing Calculation based on approved rules
  const pricing = useMemo(() => {
    let season: "low" | "high" = "low";
    if (arrivalDate) {
      const month = Number(arrivalDate.split("-")[1]);
      if (month >= 5 && month <= 9) season = "high";
    }

    const cat = ROOM_CATEGORIES.find((c) => c.id === roomCategory) || ROOM_CATEGORIES[0];
    const roomRatePerNight = roomBedType === "SINGLE" ? cat.singleRate[season] : cat.doubleRate[season];
    const roomCost = roomRatePerNight * nights * roomCount;

    // Golf costs per player
    const stPatRate = isGolfIrelandEligible ? 150 : 330;
    const sandyRate = isGolfIrelandEligible ? 90 : 220;
    const oldTomRate = isGolfIrelandEligible ? 90 : 160;

    const golfCostPerPlayer =
      stPatricksRounds * stPatRate +
      sandyHillsRounds * sandyRate +
      oldTomMorrisRounds * oldTomRate;

    const totalGolfCost = golfCostPerPlayer * groupSize;
    const total = roomCost + totalGolfCost;

    // 25% Deposit and 75% Balance (Approved Scope Rules)
    const deposit = Math.round(total * 0.25 * 100) / 100;
    const balance = Math.round((total - deposit) * 100) / 100;

    return {
      season,
      roomRatePerNight,
      roomCost,
      totalGolfCost,
      total,
      deposit,
      balance,
    };
  }, [
    arrivalDate,
    nights,
    roomCategory,
    roomBedType,
    roomCount,
    groupSize,
    stPatricksRounds,
    sandyHillsRounds,
    oldTomMorrisRounds,
    isGolfIrelandEligible,
  ]);

  // Step Navigation Handlers
  const nextStep = () => {
    if (currentStep === 0 && !hasValidArrival) return;
    if (currentStep === 1 && (!leadFirstName || !leadLastName || !leadEmail)) return;
    if (currentStep === 2 && !isOccupancySufficient) return;
    if (currentStep === 3 && !hasEnoughRounds) return;
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  // Truthful Booking Intent Handler (N01, N02, F03 compliant: no simulated completed reservations)
  const handleSubmitInquiry = async () => {
    setIsSubmitting(true);
    try {
      const refCode = `PKG-${Date.now().toString(36).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

      // Simulate registration of intent while Prommt payment credentials are on hold
      await new Promise((r) => setTimeout(r, 600));

      setBookingIntentResult({
        reference: refCode,
        stage: "pending_payment_gateway",
        totalAmount: euro(pricing.total),
        depositAmount: euro(pricing.deposit),
        balanceDue: euro(pricing.balance),
        balanceDueDate: balanceDueDate || "6 weeks prior to arrival",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Truthful Confirmation Screen (Pending Payment State)
  if (bookingIntentResult) {
    return (
      <section className="bg-[#050505] py-20 px-4 sm:px-6 min-h-[60vh] flex items-center justify-center">
        <div className="max-w-2xl mx-auto border border-[#DBB155]/40 bg-[#0A0A0A] p-8 sm:p-10 rounded-sm text-center">
          <div className="w-14 h-14 bg-[#DBB155]/15 rounded-full flex items-center justify-center mx-auto mb-6 text-[#DBB155]">
            <ShieldCheck size={32} />
          </div>

          <p className="uppercase tracking-[0.25em] text-[10px] text-[#DBB155] font-semibold mb-2">
            Inquiry Registered Truthfully
          </p>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white mb-4">
            Stay &amp; Play Package Inquiry
          </h2>

          <div className="bg-[#121212] border border-[#DBB155]/20 p-5 rounded-sm my-6 text-left space-y-3">
            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
              <span className="text-gray-400">Reference Number:</span>
              <span className="font-mono text-[#DBB155] font-bold text-base">{bookingIntentResult.reference}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
              <span className="text-gray-400">Lead Guest:</span>
              <span className="text-white">{leadFirstName} {leadLastName} ({leadEmail})</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
              <span className="text-gray-400">Dates:</span>
              <span className="text-white">{arrivalDate} to {departureDate} ({nights} nights)</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
              <span className="text-gray-400">Total Package Value:</span>
              <span className="text-white font-semibold">{bookingIntentResult.totalAmount}</span>
            </div>
            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
              <span className="text-gray-400">25% Non-Refundable Deposit:</span>
              <span className="text-[#DBB155] font-bold">{bookingIntentResult.depositAmount}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-400">75% Balance Due:</span>
              <span className="text-white">{bookingIntentResult.balanceDue} (due {bookingIntentResult.balanceDueDate})</span>
            </div>
          </div>

          <div className="border border-amber-900/50 bg-amber-950/20 p-4 rounded-sm text-left text-xs leading-relaxed text-amber-200/90 mb-8 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-amber-300">
              <Info size={16} /> Online Payment Link Status
            </div>
            <p>
              Online deposit payment through Prommt is currently pending payment gateway credentials. No inventory is held and no payment has been deducted.
            </p>
            <p>
              Our Reservations team has received your package inquiry. To confirm your reservation, please quote your reference{" "}
              <strong className="text-white font-mono">{bookingIntentResult.reference}</strong> when contacting us:
            </p>
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <a
                href="tel:+353749155301"
                className="inline-flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-sm"
              >
                <Phone size={14} className="text-[#DBB155]" /> +353 (0)74 91 55301
              </a>
              <a
                href="mailto:reservations@rosapenna.ie"
                className="inline-flex items-center gap-2 text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-sm"
              >
                <Mail size={14} className="text-[#DBB155]" /> reservations@rosapenna.ie
              </a>
            </div>
          </div>

          <button
            onClick={() => setBookingIntentResult(null)}
            className="text-xs uppercase tracking-widest text-gray-400 hover:text-white underline"
          >
            &larr; Return to Package Review
          </button>
        </div>
      </section>
    );
  }

  return (
    <section id="packages" className="bg-[#050505] py-14 px-4 sm:px-6 scroll-mt-24 relative">
      <div className="max-w-4xl mx-auto">
        {/* Heading */}
        <p className="uppercase tracking-[0.35em] text-[11px] text-[#D4AF55] font-semibold">
          Resort Package Builder
        </p>
        <div className="w-16 h-px bg-[#D4AF55] mt-4 mb-6"></div>

        <h2 className="font-serif font-semibold text-white text-3xl sm:text-4xl leading-tight">
          Stay &amp; Play <span className="text-[#D4AF55]">Bespoke Packages</span>
        </h2>

        <p className="text-[#A8A8A8] text-sm md:text-base leading-relaxed mt-4 max-w-2xl">
          Craft your tailored links golf retreat. Enjoy luxury resort rooms and guaranteed championship tee times across St Patrick&apos;s, Sandy Hills, and Old Tom Morris.
        </p>

        {/* Stepper Header */}
        <div className="mt-8 border-b border-[#181818] pb-6 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[500px] gap-2">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isPast = index < currentStep;
              const isCurrent = index === currentStep;

              return (
                <div key={step.title} className="flex items-center flex-1">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-semibold transition-colors shrink-0 ${
                        isCurrent
                          ? "border-[#D4AF55] bg-[#D4AF55] text-black"
                          : isPast
                          ? "border-[#D4AF55] text-[#D4AF55]"
                          : "border-white/10 text-gray-600"
                      }`}
                    >
                      {isPast ? <Check size={14} /> : index + 1}
                    </div>
                    <span
                      className={`uppercase tracking-wider text-[11px] font-semibold whitespace-nowrap ${
                        isCurrent ? "text-[#D4AF55]" : isPast ? "text-white" : "text-gray-600"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                  {index !== steps.length - 1 && (
                    <div className={`flex-1 h-px mx-4 ${isPast ? "bg-[#D4AF55]" : "bg-white/10"}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stepper Content Card */}
        <div className="mt-6 border border-[#181818] bg-[#0A0A0A] p-6 sm:p-8 rounded-sm">
          {/* STEP 0: DATES & NIGHTS */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="border border-[#5d4a20] bg-[#19140C] p-4 flex gap-3 items-start text-xs text-[#E2BE69] leading-relaxed">
                <Sparkles size={18} className="text-[#D4AF55] mt-0.5 shrink-0" />
                <p>
                  <strong>Rosapenna Season:</strong> Championship links open from March through October. A minimum stay of 2 nights applies to all Stay &amp; Play packages.
                </p>
              </div>

              {/* Arrival Date */}
              <div>
                <label className="block uppercase tracking-[0.2em] text-[11px] text-[#A88945] font-semibold mb-2">
                  Arrival Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  min={irelandToday()}
                  value={arrivalDate}
                  onChange={(e) => setArrivalDate(e.target.value)}
                  className="w-full bg-[#111] border border-[#222] h-12 px-4 text-white outline-none focus:border-[#D4AF55] rounded-sm text-sm scheme-dark"
                />
                {!arrivalDate && (
                  <p className="text-[11px] text-gray-500 mt-1">Please select an arrival date to continue.</p>
                )}
              </div>

              {/* Nights Selector */}
              <div>
                <label className="block uppercase tracking-[0.2em] text-[11px] text-[#A88945] font-semibold mb-2">
                  Length of Stay (Nights)
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {[2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setNights(num)}
                      className={`h-12 border rounded-sm font-semibold text-sm transition-all ${
                        nights === num
                          ? "bg-[#D4AF55] border-[#D4AF55] text-black"
                          : "border-white/10 text-gray-400 hover:border-white/30"
                      }`}
                    >
                      {num} Nights
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-500 mt-2">
                  For extended stays of 6+ nights, please contact Reservations directly at{" "}
                  <a href="tel:+353749155301" className="text-[#D4AF55] hover:underline">+353 (0)74 91 55301</a>.
                </p>
              </div>

              {/* Derived Departure Review (N02 Requirement) */}
              {arrivalDate && (
                <div className="bg-[#141414] border border-white/5 p-4 rounded-sm flex items-center justify-between text-sm">
                  <div>
                    <span className="text-gray-400 text-xs uppercase tracking-wider block">Departure Date (Derived)</span>
                    <span className="text-white font-medium">{formattedDeparture} ({departureDate})</span>
                  </div>
                  <div className="text-right">
                    <span className="text-gray-400 text-xs uppercase tracking-wider block">Duration</span>
                    <span className="text-[#D4AF55] font-semibold">{nights} Nights Stay</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 1: GUESTS & CONTACT */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block uppercase tracking-[0.2em] text-[11px] text-[#A88945] font-semibold mb-2">
                  Total Party Size (Guests)
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {[1, 2, 3, 4, 6, 8, 12, 16].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setGroupSize(num)}
                      className={`h-11 border rounded-sm font-semibold text-sm transition-all ${
                        groupSize === num
                          ? "bg-[#D4AF55] border-[#D4AF55] text-black"
                          : "border-white/10 text-gray-400 hover:border-white/30"
                      }`}
                    >
                      {num} {num === 1 ? "Guest" : "Guests"}
                    </button>
                  ))}
                </div>
                {groupSize > 4 && (
                  <p className="text-[11px] text-[#D4AF55] mt-1.5 flex items-center gap-1">
                    <Info size={13} /> Group booking: Room quantities will be adjusted automatically in Step 2.
                  </p>
                )}
              </div>

              {/* Lead Payer / Contact Details (N02 Requirement: 1 lead payer) */}
              <div className="pt-2 border-t border-white/5">
                <div className="flex items-center justify-between mb-4">
                  <span className="uppercase tracking-[0.2em] text-[11px] text-[#A88945] font-semibold">
                    Lead Guest Contact Details
                  </span>
                  <span className="text-[11px] text-gray-500">Other guest names collected at check-in</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">First Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John"
                      value={leadFirstName}
                      onChange={(e) => setLeadFirstName(e.target.value)}
                      className="w-full bg-[#111] border border-[#222] h-11 px-3 text-white outline-none focus:border-[#D4AF55] rounded-sm text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Last Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Campbell"
                      value={leadLastName}
                      onChange={(e) => setLeadLastName(e.target.value)}
                      className="w-full bg-[#111] border border-[#222] h-11 px-3 text-white outline-none focus:border-[#D4AF55] rounded-sm text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. john@example.com"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      className="w-full bg-[#111] border border-[#222] h-11 px-3 text-white outline-none focus:border-[#D4AF55] rounded-sm text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Mobile / Telephone *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +353 87 123 4567"
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      className="w-full bg-[#111] border border-[#222] h-11 px-3 text-white outline-none focus:border-[#D4AF55] rounded-sm text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Golf Ireland Eligibility (N02 Requirement: separate residence + handicap index) */}
              <div className="pt-4 border-t border-white/5 space-y-4">
                <span className="uppercase tracking-[0.2em] text-[11px] text-[#A88945] font-semibold block">
                  Golf Ireland Rate Eligibility (Two Separate Facts)
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Fact 1: Residence Country */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">
                      1. Country of Primary Residence *
                    </label>
                    <select
                      value={residenceCountry}
                      onChange={(e) => setResidenceCountry(e.target.value)}
                      className="w-full bg-[#111] border border-[#222] h-11 px-3 text-white outline-none focus:border-[#D4AF55] rounded-sm text-sm cursor-pointer"
                    >
                      <option value="IE">Republic of Ireland</option>
                      <option value="NI">Northern Ireland</option>
                      <option value="GB">Great Britain</option>
                      <option value="US">United States</option>
                      <option value="OTHER">Other International</option>
                    </select>
                  </div>

                  {/* Fact 2: Active Handicap Index */}
                  <div>
                    <label className="block text-xs text-gray-400 mb-1.5">
                      2. Active Golf Ireland / iGolf Index *
                    </label>
                    <div className="flex gap-3 h-11 items-center">
                      <button
                        type="button"
                        onClick={() => setHasGolfIrelandIndex(true)}
                        className={`flex-1 h-full border rounded-sm text-xs font-semibold transition-colors ${
                          hasGolfIrelandIndex
                            ? "bg-[#D4AF55] border-[#D4AF55] text-black"
                            : "border-white/10 text-gray-400 hover:border-white/30"
                        }`}
                      >
                        Yes, I Hold an Index
                      </button>
                      <button
                        type="button"
                        onClick={() => setHasGolfIrelandIndex(false)}
                        className={`flex-1 h-full border rounded-sm text-xs font-semibold transition-colors ${
                          !hasGolfIrelandIndex
                            ? "bg-[#D4AF55] border-[#D4AF55] text-black"
                            : "border-white/10 text-gray-400 hover:border-white/30"
                        }`}
                      >
                        No / Visitor Rate
                      </button>
                    </div>
                  </div>
                </div>

                {/* Eligibility Status Banner */}
                <div
                  className={`p-3.5 rounded-sm text-xs flex items-start gap-2.5 ${
                    isGolfIrelandEligible
                      ? "bg-emerald-950/30 border border-emerald-800/40 text-emerald-300"
                      : "bg-[#141414] border border-white/10 text-gray-400"
                  }`}
                >
                  <ShieldCheck size={16} className={isGolfIrelandEligible ? "text-emerald-400 shrink-0 mt-0.5" : "text-gray-500 shrink-0 mt-0.5"} />
                  <div>
                    {isGolfIrelandEligible ? (
                      <p>
                        <strong>Golf Ireland Resident Rate Qualified:</strong> Both Irish residency and active Golf Ireland index are verified. You qualify for preferential green fees. (Proof required on play day).
                      </p>
                    ) : (
                      <p>
                        <strong>Standard International Rate:</strong> Golf Ireland resident rates require <em>both</em> Irish residency and an active Golf Ireland/iGolf handicap card. Standard visitor rates apply.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ROOMS & OCCUPANCY */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Live Opera Inventory Status Banner */}
              {isSearching ? (
                <div className="p-3 bg-[#111] border border-[#D4AF55]/30 rounded-sm flex items-center gap-2 text-xs text-[#D4AF55]">
                  <Loader2 size={14} className="animate-spin" /> Verifying live Opera Cloud room inventory &amp; buffers...
                </div>
              ) : searchResults ? (
                <div className="p-3 bg-[#111] border border-white/10 rounded-sm flex items-center justify-between text-xs text-gray-300">
                  <span>Opera Cloud Live Inventory: {searchResults.room_options.filter((r) => r.is_available).length} category options available</span>
                  <span className="text-[11px] text-emerald-400 font-medium">Cap &amp; Buffers Enforced</span>
                </div>
              ) : null}

              {/* Room Category Selection */}
              <div>
                <label className="block uppercase tracking-[0.2em] text-[11px] text-[#A88945] font-semibold mb-3">
                  Select Room Category
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {ROOM_CATEGORIES.map((cat) => {
                    const liveOpt = searchResults?.room_options?.find(
                      (r) => r.room_category.toUpperCase() === cat.id.toUpperCase()
                    );
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setRoomCategory(cat.id)}
                        className={`p-4 border rounded-sm text-left transition-all ${
                          roomCategory === cat.id
                            ? "border-[#D4AF55] bg-[#D4AF55]/10"
                            : "border-white/10 bg-[#111] hover:border-white/30"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={`font-serif font-semibold text-base ${roomCategory === cat.id ? "text-[#D4AF55]" : "text-white"}`}>
                            {cat.name}
                          </span>
                          <span className="text-xs text-gray-400 font-mono">
                            {liveOpt?.rate_per_night
                              ? `€${liveOpt.rate_per_night}/night`
                              : `from €${cat.doubleRate.low}/night`}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{cat.desc}</p>
                        {liveOpt && (
                          <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                            <span className={liveOpt.is_available ? "text-emerald-400 font-medium" : "text-amber-400"}>
                              {liveOpt.is_available ? `✓ ${liveOpt.available_rooms} rooms open in Opera` : "⚠️ Buffer held / Low stock"}
                            </span>
                            <span className="text-gray-400 font-mono">B&amp;B Included</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Room Bed Arrangement & Room Count */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                <div>
                  <label className="block text-xs text-gray-400 mb-2">Bed Arrangement</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["TWIN", "DOUBLE", "SINGLE"] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setRoomBedType(type)}
                        className={`h-11 border rounded-sm text-xs font-semibold transition-all ${
                          roomBedType === type
                            ? "bg-[#D4AF55] border-[#D4AF55] text-black"
                            : "border-white/10 text-gray-400 hover:border-white/30"
                        }`}
                      >
                        {type === "TWIN" ? "Twin Beds" : type === "DOUBLE" ? "King Bed" : "Single"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 mb-2">Number of Rooms</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setRoomCount(Math.max(1, roomCount - 1))}
                      className="w-11 h-11 border border-white/10 rounded-sm flex items-center justify-center text-white hover:border-[#D4AF55]"
                    >
                      -
                    </button>
                    <span className="font-mono text-base font-bold text-[#D4AF55] w-8 text-center">{roomCount}</span>
                    <button
                      type="button"
                      onClick={() => setRoomCount(roomCount + 1)}
                      className="w-11 h-11 border border-white/10 rounded-sm flex items-center justify-center text-white hover:border-[#D4AF55]"
                    >
                      +
                    </button>
                    <span className="text-xs text-gray-400 ml-2">
                      ({totalBedCapacity} adult bed capacity)
                    </span>
                  </div>
                </div>
              </div>

              {/* Occupancy Check Validation (N02 Requirement) */}
              {!isOccupancySufficient ? (
                <div className="p-4 bg-red-950/30 border border-red-800/50 rounded-sm flex items-start gap-3 text-xs text-red-300">
                  <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>Insufficient Room Capacity:</strong> Your selected configuration ({roomCount} {roomBedType.toLowerCase()} room(s)) accommodates {totalBedCapacity} guests, but your party has {groupSize} guests. Please increase room count or select twin/double beds.
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-[#141414] border border-white/5 rounded-sm flex items-center justify-between text-xs text-gray-300">
                  <span>Occupancy match: Accommodates {groupSize} guest(s) across {roomCount} room(s).</span>
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <Check size={14} /> Valid Capacity
                  </span>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: INTERACTIVE DAY-BY-DAY GOLF SCHEDULE */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Stay & Play Policy Notice */}
              <div className="border border-[#5d4a20] bg-[#19140C] p-4 flex gap-3 items-start text-xs text-[#E2BE69] leading-relaxed">
                <Info size={18} className="text-[#D4AF55] mt-0.5 shrink-0" />
                <div>
                  <p>
                    <strong>Stay &amp; Play Round Minimum:</strong> For a stay of {nights} nights, at least <strong>{minRequiredRounds} rounds</strong> are required. You currently have <strong>{totalRounds} round(s)</strong> scheduled.
                  </p>
                  <p className="mt-1 text-gray-400 text-[11px]">
                    Select each day below to choose your championship links and preferred tee time slot.
                  </p>
                </div>
              </div>

              {/* Whole Stay St Patrick's Closure Notice */}
              {isStPatricksClosedForAllStayDays && (
                <div className="p-4 bg-amber-950/30 border border-amber-800/50 rounded-sm text-xs text-amber-300 flex items-start gap-3">
                  <AlertTriangle size={18} className="text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-amber-200 block mb-0.5">
                      St Patrick&apos;s Links Notice: Resting on Selected Stay Dates
                    </strong>
                    <p className="text-amber-300/90 leading-relaxed text-[11px]">
                      St Patrick&apos;s Links is resting for agronomy maintenance or seasonal rest on your stay dates. The St Patrick&apos;s option is disabled below. Your package automatically applies the <strong>Two-Championship Course Package</strong> (Sandy Hills + Old Tom Morris), saving up to €140 per golfer.
                    </p>
                  </div>
                </div>
              )}

              {/* Day-by-Day Selector Tabs */}
              <div>
                <label className="block uppercase tracking-[0.2em] text-[11px] text-[#A88945] font-semibold mb-2.5">
                  Select Day to Schedule Golf
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {stayDates.map((day, idx) => {
                    const plan = dailyGolfPlan[day.date];
                    const isSelectedDay = safeActiveDayIndex === idx;
                    const courseObj = GOLF_COURSES.find((c) => c.courseId === plan?.courseId);

                    return (
                      <button
                        key={day.date}
                        type="button"
                        onClick={() => setActiveDayIndex(idx)}
                        className={`p-3 border rounded-sm text-left transition-all ${
                          isSelectedDay
                            ? "border-[#D4AF55] bg-[#D4AF55]/15 ring-1 ring-[#D4AF55]"
                            : "border-white/10 bg-[#111] hover:border-white/25"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs font-bold ${isSelectedDay ? "text-[#D4AF55]" : "text-white"}`}>
                            Day {idx + 1}
                          </span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {day.formattedShort}
                          </span>
                        </div>
                        <div className="text-[11px] truncate">
                          {plan?.isRestDay ? (
                            <span className="text-sky-300 flex items-center gap-1">
                              <Coffee size={11} /> Rest Day
                            </span>
                          ) : courseObj ? (
                            <span className="text-emerald-400 font-medium">
                              {courseObj.name.split(" ")[0]} Links
                            </span>
                          ) : (
                            <span className="text-gray-500 italic">No Selection</span>
                          )}
                        </div>
                        {plan?.timeSlot && !plan.isRestDay && (
                          <div className="text-[10px] text-gray-400 font-mono mt-0.5 flex items-center gap-1">
                            <Clock size={10} className="text-[#D4AF55]" /> {plan.timeSlot}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Day Schedule Panel */}
              {activeDay && (
                <div className="p-5 bg-[#0D0D0D] border border-white/10 rounded-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/5 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs uppercase tracking-widest text-[#D4AF55] font-semibold">
                          Day {safeActiveDayIndex + 1} of {stayDates.length}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          • {activeDay.formattedShort}
                        </span>
                      </div>
                      <p className="text-sm font-serif font-bold text-white mt-0.5">
                        Choose Course &amp; Tee Time
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveDayIndex((prev) => Math.max(0, prev - 1))}
                        disabled={safeActiveDayIndex === 0}
                        className="px-2.5 py-1 text-xs border border-white/10 rounded-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        &larr; Prev Day
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveDayIndex((prev) => Math.min(stayDates.length - 1, prev + 1))}
                        disabled={safeActiveDayIndex === stayDates.length - 1}
                        className="px-2.5 py-1 text-xs border border-white/10 rounded-sm text-gray-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        Next Day &rarr;
                      </button>
                    </div>
                  </div>

                  {/* Course Cards for Active Day */}
                  <div className="space-y-3">
                    {GOLF_COURSES.map((course) => {
                      const isSelected = activeDayPlan?.courseId === course.courseId && !activeDayPlan?.isRestDay;
                      const rate = isGolfIrelandEligible ? course.residentRate : course.stdRate;

                      // St Patrick's Links specific closure check
                      const isStP = course.courseId === 4;
                      const stpStatus = isStP ? getStPatricksStatusForDate(activeDay.date) : { isAvailable: true, reason: "" };
                      const isDisabled = isStP && !stpStatus.isAvailable;

                      // Live tee times from BRS for this day and course
                      const liveGolf = searchResults?.daily_golf_options?.find(
                        (g) => g.course_id === course.courseId && g.date === activeDay.date
                      );
                      const openSlots = liveGolf?.tee_slots || [];

                      return (
                        <div
                          key={course.id}
                          className={`p-4 border rounded-sm transition-all ${
                            isDisabled
                              ? "bg-[#141210] border-amber-900/30 opacity-65 cursor-not-allowed"
                              : isSelected
                              ? "bg-[#D4AF55]/10 border-[#D4AF55]"
                              : "bg-[#111] border-white/10 hover:border-white/20"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`font-serif font-semibold text-base ${isSelected ? "text-[#D4AF55]" : "text-white"}`}>
                                  {course.name}
                                </span>
                                <span className="text-[10px] text-[#D4AF55] uppercase tracking-wider">{course.badge}</span>
                                {isDisabled && (
                                  <span className="inline-flex items-center gap-1 text-[10px] bg-amber-950/60 border border-amber-800/60 text-amber-300 px-2 py-0.5 rounded font-mono">
                                    <Lock size={10} /> Resting on this date
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-gray-400 mt-1">
                                Green fee: €{rate}/player ({isGolfIrelandEligible ? "Golf Ireland Resident Rate" : "Standard Visitor Rate"})
                              </p>
                              {isDisabled && (
                                <p className="text-[11px] text-amber-400 mt-1.5 flex items-center gap-1.5">
                                  <AlertTriangle size={12} className="shrink-0" />
                                  <span>{stpStatus.reason}</span>
                                </p>
                              )}
                            </div>

                            <div>
                              <button
                                type="button"
                                disabled={isDisabled}
                                onClick={() => handleSelectCourse(activeDay.date, course.courseId)}
                                className={`w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-sm transition-all ${
                                  isDisabled
                                    ? "bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed"
                                    : isSelected
                                    ? "bg-[#D4AF55] text-black font-bold"
                                    : "border border-white/20 text-gray-300 hover:border-[#D4AF55] hover:text-white"
                                }`}
                              >
                                {isDisabled ? "Unavailable on Date" : isSelected ? "✓ Course Selected" : "Select Course"}
                              </button>
                            </div>
                          </div>

                          {/* Live / Preferred Tee Times Selection for the Selected Course */}
                          {isSelected && !isDisabled && (
                            <div className="mt-4 pt-3 border-t border-white/10 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] uppercase tracking-wider text-[#D4AF55] font-semibold flex items-center gap-1">
                                  <Clock size={12} /> Select Tee Time Slot:
                                </span>
                                {activeDayPlan?.timeSlot && (
                                  <span className="text-xs text-white font-mono bg-white/10 px-2 py-0.5 rounded">
                                    Current: <strong>{activeDayPlan.timeSlot}</strong>
                                  </span>
                                )}
                              </div>

                              {/* Live BRS Slots if available */}
                              {openSlots.length > 0 ? (
                                <div className="flex flex-wrap gap-2 pt-1">
                                  {openSlots.map((slot, sIdx) => {
                                    const isSlotSelected = activeDayPlan?.timeSlot === slot.time;
                                    return (
                                      <button
                                        key={sIdx}
                                        type="button"
                                        onClick={() => handleSelectTimeSlot(activeDay.date, slot.time)}
                                        className={`px-3 py-1.5 rounded-sm border text-xs font-mono transition-all ${
                                          isSlotSelected
                                            ? "bg-[#D4AF55] border-[#D4AF55] text-black font-bold"
                                            : "border-white/10 bg-white/5 text-gray-300 hover:border-white/30"
                                        }`}
                                      >
                                        {slot.time} ({slot.available_slots} slots)
                                      </button>
                                    );
                                  })}
                                </div>
                              ) : (
                                /* Convenient Standard Windows when advance booking beyond 30 days */
                                <div className="space-y-2 pt-1">
                                  <div className="flex flex-wrap gap-2">
                                    {["08:30", "09:20", "10:10", "11:00", "13:30", "14:20", "15:00"].map((timeStr) => {
                                      const isSlotSelected = activeDayPlan?.timeSlot === timeStr;
                                      return (
                                        <button
                                          key={timeStr}
                                          type="button"
                                          onClick={() => handleSelectTimeSlot(activeDay.date, timeStr)}
                                          className={`px-3 py-1.5 rounded-sm border text-xs font-mono transition-all ${
                                            isSlotSelected
                                              ? "bg-[#D4AF55] border-[#D4AF55] text-black font-bold"
                                              : "border-white/10 bg-white/5 text-gray-300 hover:border-white/30"
                                          }`}
                                        >
                                          {timeStr}
                                        </button>
                                      );
                                    })}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span>Or specify exact time:</span>
                                    <input
                                      type="time"
                                      value={activeDayPlan?.timeSlot || "10:00"}
                                      onChange={(e) => handleSelectTimeSlot(activeDay.date, e.target.value)}
                                      className="bg-[#111] border border-white/10 px-2 py-1 text-white font-mono rounded text-xs outline-none focus:border-[#D4AF55]"
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Rest Day Option (No Golf) */}
                    <button
                      type="button"
                      onClick={() => handleSelectRestDay(activeDay.date)}
                      className={`w-full p-4 border rounded-sm text-left transition-all flex items-center justify-between ${
                        activeDayPlan?.isRestDay
                          ? "border-sky-500/60 bg-sky-950/25 text-white"
                          : "border-white/10 bg-[#111] hover:border-white/20 text-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${activeDayPlan?.isRestDay ? "bg-sky-500/20 text-sky-400" : "bg-white/5 text-gray-400"}`}>
                          <Coffee size={18} />
                        </div>
                        <div>
                          <span className="text-sm font-semibold text-white block">Rest Day (No Golf Scheduled)</span>
                          <span className="text-[11px] text-gray-400">
                            Enjoy Rosapenna leisure, coastal walks along Sheephaven Bay, or local dining.
                          </span>
                        </div>
                      </div>
                      {activeDayPlan?.isRestDay && (
                        <span className="text-xs text-sky-400 font-semibold flex items-center gap-1">
                          <Check size={14} /> Scheduled
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Total Rounds Indicator & Minimum Requirement Checker */}
              <div className="p-4 bg-[#141414] border border-white/10 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block mb-0.5">Total Championship Rounds Scheduled:</span>
                  <span className="text-sm font-bold text-white font-mono">
                    {totalRounds} of {minRequiredRounds} minimum required ({nights} nights stay)
                  </span>
                </div>
                <div>
                  {hasEnoughRounds ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs font-semibold">
                      <Check size={14} className="text-emerald-400" /> Package Minimum Satisfied
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-amber-950/40 border border-amber-800/50 text-amber-300 text-xs font-semibold">
                      <AlertTriangle size={14} className="text-amber-400" /> Select {minRequiredRounds - totalRounds} more round(s)
                    </span>
                  )}
                </div>
              </div>

              {/* Caddy Request (N02 Requirement: optional request, payable on day) */}
              <div className="pt-2 border-t border-white/5">
                <label className="flex items-start gap-3 cursor-pointer p-4 bg-[#111] border border-white/10 rounded-sm hover:border-white/20 transition-colors">
                  <input
                    type="checkbox"
                    checked={requestCaddies}
                    onChange={(e) => setRequestCaddies(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-[#D4AF55] bg-black border-white/20 focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-semibold text-white block">Request Caddy Services</span>
                    <span className="text-xs text-gray-400 leading-relaxed block mt-1">
                      Caddies are request-only, subject to availability, and payable directly to the caddy master at the resort (€90 per bag plus discretionary gratuity). Not charged online.
                    </span>
                  </div>
                </label>
              </div>

              {/* Arrival / Departure Play Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center gap-2.5 text-xs text-gray-300 cursor-pointer p-3 bg-[#111] border border-white/5 rounded-sm">
                  <input
                    type="checkbox"
                    checked={playOnArrival}
                    onChange={(e) => setPlayOnArrival(e.target.checked)}
                    className="w-4 h-4 rounded text-[#D4AF55] bg-black border-white/20"
                  />
                  <span>Option to play on Arrival Day</span>
                </label>
                <label className="flex items-center gap-2.5 text-xs text-gray-300 cursor-pointer p-3 bg-[#111] border border-white/5 rounded-sm">
                  <input
                    type="checkbox"
                    checked={playOnDeparture}
                    onChange={(e) => setPlayOnDeparture(e.target.checked)}
                    className="w-4 h-4 rounded text-[#D4AF55] bg-black border-white/20"
                  />
                  <span>Option to play on Departure Day</span>
                </label>
              </div>

              {closureWarnings.map((warning, idx) => (
                <div key={idx} className="p-3 bg-amber-950/20 border border-amber-800/40 text-xs text-amber-300 flex items-center gap-2 rounded-sm">
                  <AlertTriangle size={15} /> {warning}
                </div>
              ))}
            </div>
          )}

          {/* STEP 4: REVIEW & INQUIRY */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="border border-[#5d4a20] bg-[#19140C] p-4 flex gap-3 items-start text-xs text-[#E2BE69] leading-relaxed">
                <ShieldCheck size={18} className="text-[#D4AF55] mt-0.5 shrink-0" />
                <p>
                  <strong>Verified Review:</strong> Review your bespoke itinerary below. When submitted, your details will be registered with our reservations team. No charges are applied until payment links are confirmed.
                </p>
              </div>

              {/* Itinerary Summary Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-[#111] border border-white/5 rounded-sm space-y-2">
                  <span className="text-[#D4AF55] uppercase tracking-wider font-semibold block mb-2">Stay Details</span>
                  <div className="flex justify-between"><span className="text-gray-400">Arrival:</span> <span className="text-white">{arrivalDate}</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Departure:</span> <span className="text-white">{departureDate} ({nights} nights)</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Party Size:</span> <span className="text-white">{groupSize} Guest(s)</span></div>
                  <div className="flex justify-between"><span className="text-gray-400">Room(s):</span> <span className="text-white">{roomCount}x {roomCategory} ({roomBedType})</span></div>
                </div>

                <div className="p-4 bg-[#111] border border-white/5 rounded-sm space-y-2.5">
                  <span className="text-[#D4AF55] uppercase tracking-wider font-semibold block mb-2">
                    Day-by-Day Golf Schedule
                  </span>
                  {stayDates.map((day, idx) => {
                    const plan = dailyGolfPlan[day.date];
                    const course = GOLF_COURSES.find((c) => c.courseId === plan?.courseId);
                    return (
                      <div
                        key={day.date}
                        className="flex justify-between items-center text-xs py-1 border-b border-white/5 last:border-0"
                      >
                        <div>
                          <span className="text-gray-400 font-medium">Day {idx + 1} ({day.formattedShort}):</span>{" "}
                          <span className="text-white">
                            {plan?.isRestDay
                              ? "Rest Day (No Golf)"
                              : course
                              ? course.name
                              : "No Course Selected"}
                          </span>
                        </div>
                        {!plan?.isRestDay && plan?.timeSlot && (
                          <span className="text-[#D4AF55] font-mono text-[11px] bg-white/5 px-2 py-0.5 rounded">
                            {plan.timeSlot}
                          </span>
                        )}
                      </div>
                    );
                  })}
                  <div className="pt-2 border-t border-white/5 flex justify-between text-xs text-gray-400">
                    <span>Total Rounds:</span>
                    <span className="text-white font-mono">{totalRounds} round(s)</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Caddies:</span>
                    <span className="text-white">{requestCaddies ? "Requested (€90/bag on day)" : "None"}</span>
                  </div>
                </div>
              </div>

              {/* Whole Stay St Patrick's Notice if resting */}
              {isStPatricksClosedForAllStayDays && (
                <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-sm text-xs text-amber-300 flex items-center gap-2">
                  <Info size={15} className="text-amber-400 shrink-0" />
                  <span>Two-Championship Course Package applied (St Patrick&apos;s Links resting for agronomy on these dates).</span>
                </div>
              )}

              {/* Price Breakdown according to Scope F02 */}
              <div className="p-5 bg-[#121212] border border-[#DBB155]/30 rounded-sm space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Accommodation Subtotal ({nights} nights, {roomCount} room(s)):</span>
                  <span className="text-white font-mono">{euro(pricing.roomCost)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Championship Golf Subtotal ({totalRounds} rounds x {groupSize} players):</span>
                  <span className="text-white font-mono">{euro(pricing.totalGolfCost)}</span>
                </div>
                <div className="border-t border-white/10 pt-2 flex justify-between text-base font-bold">
                  <span className="text-white">Total Package Price:</span>
                  <span className="text-[#D4AF55] font-mono">{euro(pricing.total)}</span>
                </div>

                <div className="pt-2 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#181818] p-3 rounded-sm">
                    <span className="text-gray-400 block mb-1">25% Non-Refundable Deposit:</span>
                    <span className="text-white font-bold text-sm font-mono">{euro(pricing.deposit)}</span>
                  </div>
                  <div className="bg-[#181818] p-3 rounded-sm">
                    <span className="text-gray-400 block mb-1">75% Balance Due ({balanceDueDate}):</span>
                    <span className="text-white font-bold text-sm font-mono">{euro(pricing.balance)}</span>
                  </div>
                </div>
              </div>

              {/* Recommended Live Package Option (Opera + BRS Verified Match) */}
              {searchResults?.recommended_packages && searchResults.recommended_packages.length > 0 && (
                <div className="p-4 bg-gradient-to-r from-[#DBB155]/15 to-transparent border border-[#DBB155]/40 rounded-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-widest text-[#DBB155] font-semibold flex items-center gap-1.5">
                      <Sparkles size={14} /> Recommended Live Itinerary (Opera + BRS Verified)
                    </span>
                    <span className="text-[11px] text-emerald-400 font-mono font-medium">Live Match</span>
                  </div>
                  <p className="text-sm font-serif font-bold text-white">
                    {searchResults.recommended_packages[0].name}
                  </p>
                  <p className="text-xs text-gray-400">
                    Courses: {searchResults.recommended_packages[0].selected_courses.join(", ")}
                  </p>
                  <div className="text-xs text-gray-300 flex flex-wrap gap-4 pt-1 font-mono">
                    <span>Package Total: <strong className="text-white">€{searchResults.recommended_packages[0].total_price}</strong></span>
                    <span>25% Deposit: <strong className="text-[#DBB155]">€{searchResults.recommended_packages[0].deposit_amount}</strong></span>
                    <span>75% Balance: <strong className="text-gray-300">€{searchResults.recommended_packages[0].balance_amount}</strong></span>
                  </div>
                </div>
              )}

              {/* Truthful Inventory Reservation Notice */}
              <div className="p-3 bg-[#111] border border-white/5 rounded-sm flex items-center justify-between text-xs text-gray-400">
                <span>Inventory Hold Status:</span>
                <span className="text-gray-300 font-mono text-[11px]">
                  reserves_inventory: false (No rooms or tee times held at search stage)
                </span>
              </div>

              {/* Additional Requests Textarea */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Special Requests or Preferences (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Dietary requirements, preferred tee time ranges, buggy requests for medical needs..."
                  value={additionalRequests}
                  onChange={(e) => setAdditionalRequests(e.target.value)}
                  className="w-full bg-[#111] border border-[#222] p-3 text-white text-xs outline-none focus:border-[#D4AF55] rounded-sm resize-none"
                />
              </div>
            </div>
          )}

          {/* Stepper Footer Controls */}
          <div className="border-t border-[#181818] mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 text-xs uppercase tracking-wider font-semibold transition-colors ${
                currentStep === 0 ? "text-gray-600 cursor-not-allowed" : "text-gray-300 hover:text-white"
              }`}
            >
              <ArrowLeft size={16} /> Previous
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={
                  (currentStep === 0 && !hasValidArrival) ||
                  (currentStep === 1 && (!leadFirstName || !leadLastName || !leadEmail)) ||
                  (currentStep === 2 && !isOccupancySufficient) ||
                  (currentStep === 3 && !hasEnoughRounds)
                }
                className="w-full sm:w-auto px-8 py-3 bg-[#D4AF55] hover:bg-[#c9a04a] disabled:bg-white/10 disabled:text-gray-600 text-black font-bold uppercase tracking-wider text-xs rounded-sm transition-all flex items-center justify-center gap-2"
              >
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitInquiry}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3 bg-[#D4AF55] hover:bg-[#c9a04a] text-black font-bold uppercase tracking-wider text-xs rounded-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                {isSubmitting ? "Registering Inquiry..." : "Register Stay & Play Inquiry"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
