"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { PendingBooking } from "@/types/teesheet";
import { getItineraryPdfUrl } from "@/lib/communicationsClient";

const inputClass = "w-full bg-[#111111] border border-[#DBB155]/20 text-white p-2.5 rounded-sm outline-none focus:ring-1 focus:ring-[#DBB155] placeholder-gray-600 text-sm";
const selectClass = "w-full bg-[#111111] border border-[#DBB155]/20 text-white p-2.5 rounded-sm outline-none focus:ring-1 focus:ring-[#DBB155] text-sm appearance-none cursor-pointer";
const labelClass = "text-xs font-semibold text-gray-400";
const requiredClass = "text-[#DBB155]";

interface PlayerForm {
  firstName: string;
  lastName: string;
  country: string;
  email: string;
  telephone: string;
  mobile: string;
  handicap: string;
  club: string;
  cdh: string;
}

const emptyPlayer = (): PlayerForm => ({
  firstName: "",
  lastName: "",
  country: "",
  email: "",
  telephone: "",
  mobile: "",
  handicap: "",
  club: "",
  cdh: "",
});

interface BookingIntentStatus {
  id: string;
  reference?: string;
  stage: string;
  paymentState: string;
  reservationState: string;
  retryable: boolean;
  operaConfirmation?: string;
  leadGuestName?: string;
}

function readBookingIntentStatus(value: unknown): BookingIntentStatus | null {
  if (!value || typeof value !== "object") return null;
  const data = value as Record<string, unknown>;

  const stage = typeof data.bookingIntentStage === "string"
    ? data.bookingIntentStage
    : typeof data.stage === "string"
    ? data.stage
    : null;

  if (!stage) return null;

  const id = typeof data.bookingIntentId === "string"
    ? data.bookingIntentId
    : typeof data.booking_intent_id === "string"
    ? data.booking_intent_id
    : typeof data._id === "string"
    ? data._id
    : "";

  const reference = typeof data.bookingReference === "string"
    ? data.bookingReference
    : typeof data.booking_reference === "string"
    ? data.booking_reference
    : undefined;

  const paymentState = typeof data.paymentState === "string"
    ? data.paymentState
    : typeof data.payment_state === "string"
    ? data.payment_state
    : "unavailable";

  const reservationState = typeof data.reservationState === "string"
    ? data.reservationState
    : typeof data.reservation_state === "string"
    ? data.reservation_state
    : "unavailable";

  const links = data.links as Record<string, unknown> | undefined;
  const operaRes = links?.opera_reservation as Record<string, unknown> | undefined;
  const operaConfirmation = typeof operaRes?.confirmation_number === "string"
    ? operaRes.confirmation_number
    : undefined;

  const leadGuest = data.lead_guest as Record<string, unknown> | undefined;
  const leadGuestName = leadGuest
    ? `${leadGuest.first_name || ""} ${leadGuest.last_name || ""}`.trim()
    : undefined;

  const retryable = data.bookingIntentRetryable === true ||
    (typeof data.stage === "string" && ["draft", "quote_revalidated", "quote_revalidation_failed", "checkout_preparation_failed"].includes(data.stage));

  return {
    id,
    reference,
    stage,
    paymentState,
    reservationState,
    retryable,
    operaConfirmation,
    leadGuestName,
  };
}

function checkoutStageText(status: BookingIntentStatus) {
  const messages: Record<string, string> = {
    draft: "Draft created. Live price and availability have not been checked with the resort.",
    quote_revalidation_failed: "The live price or availability changed. Please choose a tee time again.",
    quote_revalidation_unavailable: "Live resort rates could not be checked. Please try again in a few moments.",
    quote_revalidated: "Live price and tee time availability were verified. Checkout preparation has not started.",
    checkout_preparation_pending: "The checkout request is waiting for a response from the BRS tee sheet.",
    checkout_preparation_response_received: "Vendor checkout prepared. Payment has not started and this is not a confirmed reservation.",
    checkout_preparation_failed: "The booking system could not prepare checkout.",
    checkout_preparation_blocked: "Checkout is temporarily paused due to rate limits. Please wait or contact Reservations.",
    recovery_required: "Processing was interrupted. Contact Reservations at +353 (0)74 91 55301 before you try again.",
    payment_pending: status.paymentState === "pending" ? "Payment link active; awaiting guest payment." : "Payment is not confirmed as pending.",
    payment_verified: status.paymentState === "deposit_paid" || status.paymentState === "fully_paid" ? "Deposit payment verified by payment provider." : "Payment is not verified.",
    vendor_write_pending: status.reservationState === "vendor_write_pending" || status.reservationState === "reserved" ? "Payment received. Reserving hotel room in Opera and golf round in BRS." : "Waiting for reservation confirmation.",
    confirmed: status.reservationState === "confirmed" ? "Confirmed and guaranteed. Hotel reservation and championship golf are secured." : "Reservation is not confirmed. Contact Reservations.",
    action_required: "This request requires assistance from Rosapenna Reservations.",
  };
  return messages[status.stage] || "The booking status is not available. Contact Reservations before you try again.";
}

function paymentStatusText(state: string) {
  const messages: Record<string, string> = {
    not_started: "Not started",
    pending: "Pending payment",
    deposit_paid: "Deposit verified",
    fully_paid: "Fully paid",
    failed: "Not completed",
  };
  return messages[state] || "Not available";
}

function reservationStatusText(state: string) {
  const messages: Record<string, string> = {
    not_confirmed: "Not confirmed",
    reserved: "Hotel room held, awaiting confirmation",
    vendor_write_pending: "Waiting for the reservation system",
    confirmed: "Confirmed by Opera and BRS",
    recovery_required: "Action needed from Reservations",
    action_required: "Action needed from Reservations",
  };
  return messages[state] || "Not available";
}

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [booking, setBooking] = useState<PendingBooking | null>(null);
  const players = booking?.players ?? 1;
  const price = booking ? new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: booking.currency,
  }).format(Number(booking.price)) : "—";

  const [player1, setPlayer1] = useState<PlayerForm>(emptyPlayer());
  const [otherPlayers, setOtherPlayers] = useState<PlayerForm[]>(
    Array.from({ length: 3 }, emptyPlayer)
  );
  const [specialRequirements, setSpecialRequirements] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [marketing, setMarketing] = useState({ email: false, sms: false, post: false, telephone: false });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingIntentStatus, setBookingIntentStatus] = useState<BookingIntentStatus | null>(null);

  // Restore session booking data safely
  useEffect(() => {
    const raw = sessionStorage.getItem("pendingBooking");
    if (raw) {
      try {
        const saved = JSON.parse(raw) as PendingBooking;
        if (!saved.currency || !/^[A-Z]{3}$/.test(saved.currency) ||
            !Number.isInteger(saved.players) || saved.players < 1 || saved.players > 4 ||
            !Number.isFinite(Number(saved.price))) throw new Error("Invalid saved booking");
        const restored = { ...saved, bookingIntentKey: saved.bookingIntentKey || crypto.randomUUID() };
        setBooking(restored);
        sessionStorage.setItem("pendingBooking", JSON.stringify(restored));
      } catch {
        setBooking(null);
      }
    }
  }, []);

  // Check URL query parameters for authoritative booking reference (ignore spoofed payment_status/success params)
  useEffect(() => {
    const ref = searchParams.get("ref") || searchParams.get("booking_reference");
    const intentId = searchParams.get("intent_id") || searchParams.get("booking_intent_id");
    const lookupKey = ref || intentId;

    if (lookupKey) {
      void fetch(`/api/booking-intents/${encodeURIComponent(lookupKey)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            const status = readBookingIntentStatus(data);
            if (status) {
              setBookingIntentStatus(status);
            }
          }
        })
        .catch(() => {
          // If query fails, do not invent false status
        });
    }
  }, [searchParams]);

  const updateOtherPlayer = (idx: number, field: keyof PlayerForm, value: string) => {
    setOtherPlayers((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handlePrepareCheckout = async () => {
    if (!booking) {
      setSubmitError("Booking session expired — please select a tee time again.");
      return;
    }
    if (!acceptedTerms) {
      setSubmitError("Please accept the terms and conditions.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const playersPayload: Record<string, unknown> = {
      "1": {
        first_name: player1.firstName,
        last_name: player1.lastName,
        type: "Visitor",
        club: player1.club,
        handicap: player1.handicap,
        cdh: player1.cdh || null,
        email: player1.email,
        telephone: player1.telephone,
        mobile: player1.mobile || player1.telephone,
        country: player1.country,
        address_line_1: null,
        address_line_2: null,
        city: null,
        county: null,
        postcode: null,
        notes: specialRequirements ? specialRequirements.slice(0, 500) : null,
        has_buggy: false,
      },
    };

    for (let i = 0; i < players - 1; i++) {
      const p = otherPlayers[i];
      playersPayload[String(i + 2)] = {
        first_name: p.firstName,
        last_name: p.lastName,
        type: "Visitor",
        club: p.club,
        handicap: p.handicap,
        cdh: p.cdh || null,
        email: null,
        telephone: null,
        mobile: null,
        country: null,
        address_line_1: null,
        address_line_2: null,
        city: null,
        county: null,
        postcode: null,
        notes: null,
        has_buggy: false,
      };
    }

    const payload = {
      marketing: { terms: acceptedTerms, ...marketing },
      teeTime: {
        ...booking.teeTime,
        element_id: `package-${booking.greenFee.id}-${booking.date.replace(/-/g, "")}${booking.teeTime.time.replace(":", "")}`,
      },
      course: {
        id: booking.course.id,
        facilities_id: booking.course.facilities_id,
        name: booking.course.name,
        playing_time: booking.course.playing_time,
        colour: booking.course.colour,
      },
      players: playersPayload,
      date: booking.date,
      bookingType: "Package",
      price: booking.price,
      currency: booking.currency,
      holes: booking.teeTime.holes || "18",
      greenFee: booking.greenFee,
      openCompetition: {},
      bookingCreatedResponse: null,
      packageDescription: booking.greenFee.package_description,
      setGoogleConversionTrackingResponse: null,
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": booking.bookingIntentKey,
          "X-Checkout-Attempt-Key": crypto.randomUUID(),
        },
        body: JSON.stringify(payload),
      });
      const data: unknown = await res.json().catch(() => null);
      const savedStatus = readBookingIntentStatus(data);
      if (savedStatus) setBookingIntentStatus(savedStatus);
      const errorMessage = data && typeof data === "object" && "error" in data &&
        typeof data.error === "string" ? data.error : "Booking request failed";
      if (!res.ok) throw new Error(errorMessage);
      if (!savedStatus) {
        throw new Error("The saved booking status was not returned. Contact Reservations before you try again.");
      }
    } catch (err) {
      // Safe guest inputs are preserved in state
      setSubmitError(err instanceof Error ? err.message : "Booking request failed");
    } finally {
      setSubmitting(false);
    }
  };

  const termsCheckbox = (
    <div className={`mt-8 ${players === 1 ? 'mb-4' : ''}`}>
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          required
          checked={acceptedTerms}
          onChange={(e) => setAcceptedTerms(e.target.checked)}
          className="w-4 h-4 mt-0.5 border-gray-600 rounded accent-[#DBB155]"
        />
        <span className="text-[11px] text-gray-400 font-bold leading-tight">
          I have read and I accept the <a href="#" className="text-[#DBB155] hover:underline">Privacy Policy</a> and Visitor <a href="#" className="text-[#DBB155] hover:underline">Terms and Conditions</a>
        </span>
      </label>
    </div>
  );

  const bookingDate = booking?.date
    ? new Date(booking.date + "T00:00:00").toLocaleDateString("en-IE", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    : "—";

  const isConfirmed = bookingIntentStatus?.reservationState === "confirmed";

  return (
    <form className="flex-1 flex flex-col gap-10" onSubmit={(event) => {
      event.preventDefault();
      void handlePrepareCheckout();
    }}>

      {/* Truthful live booking status banner */}
      <div role="status" aria-live="polite" className="text-center text-gray-300 text-sm border border-[#DBB155]/20 p-4">
        <p>
          {!booking
            ? "Tee time: not selected."
            : isConfirmed
            ? "Tee time: confirmed by the reservation system."
            : "Tee time: selected, not confirmed."}
        </p>
        <p className="mt-2 text-gray-400">
          Checkout: {bookingIntentStatus ? checkoutStageText(bookingIntentStatus) : "not requested."}
        </p>
        <p className="mt-2 text-gray-400">
          Payment: {bookingIntentStatus ? paymentStatusText(bookingIntentStatus.paymentState) : "not started."} · Reservation: {bookingIntentStatus ? reservationStatusText(bookingIntentStatus.reservationState) : "not confirmed."}
        </p>
        <p className="mt-2 text-gray-400">
          {isConfirmed
            ? "Confirmation email and PDF itinerary: available."
            : "Confirmation email and PDF itinerary: unavailable until booking is confirmed."}
        </p>
        <p className="mt-2 text-gray-400">
          Continuing checks the current BRS price and availability, then requests checkout preparation. This page does not store card numbers.
        </p>
        {!booking && (
          <Link href="/tee-times" className="mt-3 inline-block text-[#DBB155] underline">
            Choose a tee time
          </Link>
        )}
      </div>

      {/* Authoritative backend response notification */}
      {bookingIntentStatus && (
        <div
          role="status"
          aria-live="polite"
          className={`border p-5 text-gray-200 ${
            isConfirmed ? "border-green-600/50 bg-[#0f1f14]" : "border-[#DBB155]/30 bg-[#111]"
          }`}
        >
          <h2 className={`font-semibold ${isConfirmed ? "text-green-400" : "text-[#DBB155]"}`}>
            {isConfirmed ? "Booking Confirmed & Guaranteed" : "Latest status from the booking service"}
          </h2>
          <p className="mt-2 text-sm leading-6">{checkoutStageText(bookingIntentStatus)}</p>
          <p className="mt-2 text-sm">
            Payment: <span className="font-semibold text-white">{paymentStatusText(bookingIntentStatus.paymentState)}</span> ·{" "}
            Reservation: <span className="font-semibold text-white">{reservationStatusText(bookingIntentStatus.reservationState)}</span>
          </p>
          {bookingIntentStatus.reference && (
            <p className="mt-2 text-sm">
              Booking reference: <span className="text-[#DBB155] font-mono font-semibold">{bookingIntentStatus.reference}</span>
            </p>
          )}
          {bookingIntentStatus.operaConfirmation && (
            <p className="mt-1 text-sm">
              Hotel confirmation: <span className="text-[#DBB155] font-mono font-semibold">{bookingIntentStatus.operaConfirmation}</span>
            </p>
          )}

          {isConfirmed ? (
            <div className="mt-4 flex flex-wrap gap-4">
              <a
                href={getItineraryPdfUrl(bookingIntentStatus.id || bookingIntentStatus.reference || "")}
                download
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#DBB155] text-black font-semibold text-xs tracking-wider uppercase rounded hover:bg-[#c7a042] transition-colors"
              >
                Download Official PDF Itinerary
              </a>
            </div>
          ) : (
            <p className="mt-2 text-sm text-gray-400">
              Confirmation email and PDF: unavailable until booking is confirmed.
            </p>
          )}

          <p className="mt-3 text-sm text-gray-400">
            For help, contact Hotel Reservations at{" "}
            <a className="text-[#DBB155] underline" href="mailto:reservations@rosapenna.ie">
              reservations@rosapenna.ie
            </a>{" "}
            or +353 (0)74 91 55301.
          </p>
        </div>
      )}

      {/* Guest contact fields */}
      <div className="flex flex-col gap-8">
        <h2 className="text-[#DBB155] font-bold tracking-wide uppercase">Personal Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          <div className="flex flex-col gap-4">
            <h3 className="text-[#DBB155]/70 font-bold text-xs tracking-wide uppercase mb-2">Your Details</h3>

            <div className="flex flex-col gap-1">
              <label htmlFor="guest-first-name" className={labelClass}>First Name<span className={requiredClass}>*</span></label>
              <input
                id="guest-first-name"
                type="text"
                required
                maxLength={100}
                className={inputClass}
                value={player1.firstName}
                onChange={(e) => setPlayer1({ ...player1, firstName: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="guest-last-name" className={labelClass}>Last Name<span className={requiredClass}>*</span></label>
              <input
                id="guest-last-name"
                type="text"
                required
                maxLength={100}
                className={inputClass}
                value={player1.lastName}
                onChange={(e) => setPlayer1({ ...player1, lastName: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="guest-country" className={labelClass}>Country<span className={requiredClass}>*</span></label>
              <select
                id="guest-country"
                required
                className={selectClass}
                value={player1.country}
                onChange={(e) => setPlayer1({ ...player1, country: e.target.value })}
              >
                <option value="">Select one</option>
                <option value="Ireland">Ireland</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="United States">United States</option>
                <option value="Argentina">Argentina</option>
                <option value="Austria">Austria</option>
                <option value="Bahrain">Bahrain</option>
                <option value="Barbados">Barbados</option>
                <option value="Belgium">Belgium</option>
                <option value="Canada">Canada</option>
                <option value="China">China</option>
                <option value="Denmark">Denmark</option>
                <option value="England">England</option>
                <option value="Finland">Finland</option>
                <option value="France">France</option>
                <option value="Germany">Germany</option>
                <option value="Iceland">Iceland</option>
                <option value="India">India</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="guest-email" className={labelClass}>Email<span className={requiredClass}>*</span></label>
              <input
                id="guest-email"
                type="email"
                required
                maxLength={254}
                className={inputClass}
                value={player1.email}
                onChange={(e) => setPlayer1({ ...player1, email: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="guest-telephone" className={labelClass}>Telephone<span className={requiredClass}>*</span></label>
              <input
                id="guest-telephone"
                type="tel"
                required
                maxLength={40}
                className={inputClass}
                value={player1.telephone}
                onChange={(e) => setPlayer1({ ...player1, telephone: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>Mobile</label>
              <input
                type="tel"
                className={inputClass}
                value={player1.mobile}
                onChange={(e) => setPlayer1({ ...player1, mobile: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="guest-handicap" className={labelClass}>Handicap<span className={requiredClass}>*</span></label>
              <input
                id="guest-handicap"
                type="text"
                required
                maxLength={16}
                className={inputClass}
                value={player1.handicap}
                onChange={(e) => setPlayer1({ ...player1, handicap: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="guest-club" className={labelClass}>Club<span className={requiredClass}>*</span></label>
              <input
                id="guest-club"
                type="text"
                required
                maxLength={160}
                className={inputClass}
                value={player1.club}
                onChange={(e) => setPlayer1({ ...player1, club: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className={labelClass}>CDH Number</label>
              <input
                type="text"
                className={inputClass}
                value={player1.cdh}
                onChange={(e) => setPlayer1({ ...player1, cdh: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1 mt-2">
              <label className={labelClass}>Please provide details of any special requirements</label>
              <textarea
                rows={4}
                className={`${inputClass} resize-none`}
                placeholder="Dietary, room preference, accessibility, or other special requests..."
                value={specialRequirements}
                onChange={(e) => setSpecialRequirements(e.target.value)}
              />
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <p className="text-[11px] font-bold text-gray-400">
                I agree to receive information, newsletters, promotions and offers from Rosapenna Golf Resort.
              </p>
              <div className="flex flex-wrap gap-4">
                {(["email", "sms", "post", "telephone"] as const).map((key) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={marketing[key]}
                      onChange={(e) => setMarketing({ ...marketing, [key]: e.target.checked })}
                      className="w-4 h-4 border-gray-600 rounded accent-[#DBB155]"
                    />
                    <span className="text-[11px] text-gray-400 font-bold capitalize">{key}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-10">
            {[2, 3, 4].map((num) =>
              players >= num ? (
                <div key={num} className="flex flex-col gap-4">
                  <h3 className="text-[#DBB155]/70 font-bold text-xs tracking-wide uppercase mb-2">
                    Player {num === 2 ? "Two" : num === 3 ? "Three" : "Four"} Details
                  </h3>

                  <div className="flex flex-col gap-1">
                    <label className={labelClass}>Name<span className={requiredClass}>*</span></label>
                    <input
                      type="text"
                      className={inputClass}
                      required
                      maxLength={100}
                      value={otherPlayers[num - 2].firstName}
                      onChange={(e) => updateOtherPlayer(num - 2, "firstName", e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className={labelClass}>Handicap<span className={requiredClass}>*</span></label>
                    <input
                      type="text"
                      className={inputClass}
                      required
                      maxLength={16}
                      value={otherPlayers[num - 2].handicap}
                      onChange={(e) => updateOtherPlayer(num - 2, "handicap", e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className={labelClass}>Club<span className={requiredClass}>*</span></label>
                    <input
                      type="text"
                      className={inputClass}
                      required
                      maxLength={160}
                      value={otherPlayers[num - 2].club}
                      onChange={(e) => updateOtherPlayer(num - 2, "club", e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className={labelClass}>CDH Number</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={otherPlayers[num - 2].cdh}
                      onChange={(e) => updateOtherPlayer(num - 2, "cdh", e.target.value)}
                    />
                  </div>
                </div>
              ) : null
            )}

            {players > 1 && termsCheckbox}
          </div>
        </div>
      </div>

      <div className="h-px bg-[#DBB155]/20 w-full my-2"></div>

      {/* Booking Details Display */}
      <div className="flex flex-col gap-6">
        <h2 className="text-[#DBB155] font-bold tracking-wide uppercase">Booking Details</h2>

        <div className="flex flex-col text-[13px]">
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-[200px] bg-[#111111] p-3 font-semibold text-gray-300 border-b border-[#DBB155]/10">Booking Type</div>
            <div className="flex-1 p-3 text-gray-400 border-b border-[#DBB155]/5">Golf Package</div>
          </div>
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-[200px] bg-[#111111] p-3 font-semibold text-gray-300 border-b border-[#DBB155]/10">Displayed tee time price</div>
            <div className="flex-1 p-3 text-gray-400 border-b border-[#DBB155]/5">{price}</div>
          </div>
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-[200px] bg-[#111111] p-3 font-semibold text-gray-300 border-b border-[#DBB155]/10">Booking Date/Time</div>
            <div className="flex-1 p-3 text-gray-400 border-b border-[#DBB155]/5">
              {booking ? `${booking.teeTime.time} ${bookingDate}` : "—"}
            </div>
          </div>
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-[200px] bg-[#111111] p-3 font-semibold text-gray-300 border-b border-[#DBB155]/10">Course</div>
            <div className="flex-1 p-3 text-gray-400 border-b border-[#DBB155]/5">{booking?.course.name ?? "—"}</div>
          </div>
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-[200px] bg-[#111111] p-3 font-semibold text-gray-300 border-b border-[#DBB155]/10">Holes</div>
            <div className="flex-1 p-3 text-gray-400 border-b border-[#DBB155]/5">{booking?.teeTime.holes || "18"}</div>
          </div>
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-[200px] bg-[#111111] p-3 font-semibold text-gray-300 border-b border-[#DBB155]/10">Number of Players</div>
            <div className="flex-1 p-3 text-gray-400 border-b border-[#DBB155]/5">{players}</div>
          </div>
        </div>
      </div>

      {players === 1 && termsCheckbox}

      <div className="h-px bg-[#DBB155]/20 w-full my-2"></div>

      {/* Checkout section */}
      <div className="flex flex-col gap-6">
        <h2 className="text-[#DBB155] font-bold tracking-wide uppercase">Checkout</h2>
        <p className="max-w-[600px] text-gray-400 text-sm leading-6">
          This site does not collect credit card details. When you continue, your tee time and live rate will be checked with the resort. If prepared, you will receive payment and reservation details.
        </p>

        {submitError && (
          <div role="alert" className="text-[#d9534f] text-sm max-w-[400px]">
            {submitError}
            <Link href="/tee-times" className="block mt-2 text-[#DBB155] underline">
              Choose a tee time again
            </Link>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row justify-start items-center gap-4 mt-6 mb-12">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="w-full sm:w-auto px-8 sm:px-12 py-3 border border-[#d9534f] text-[#d9534f] hover:bg-[#d9534f] hover:text-white transition-colors font-bold text-xs tracking-widest uppercase rounded-[3px]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || Boolean(bookingIntentStatus && !bookingIntentStatus.retryable) || !booking}
            className="w-full sm:w-auto px-8 sm:px-24 py-3 bg-[#DBB155] hover:bg-[#c9a04a] disabled:bg-[#DBB155]/40 transition-colors text-black font-bold text-xs tracking-widest uppercase rounded-[3px]"
          >
            {submitting
              ? "Checking with BRS..."
              : bookingIntentStatus && !bookingIntentStatus.retryable
              ? "Review status before retrying"
              : bookingIntentStatus
              ? "Retry price and checkout check"
              : "Check price and prepare checkout"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default function Booking() {
  return (
    <div className="max-w-[1400px] mx-auto px-6 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <Suspense fallback={<div className="flex-1 flex justify-center py-20 text-gray-400">Loading...</div>}>
          <BookingForm />
        </Suspense>
        <Sidebar />
      </div>
    </div>
  );
}
