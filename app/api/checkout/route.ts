import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { assertCheckoutAvailable, prepareCheckoutWithEvidence, requireCheckoutConfiguration } from "@/lib/brsGolfClient";
import { BookingBackendError, bookingBackend, bookingError } from "@/lib/bookingBackend";
import type { Course, GreenFee, TeeTime } from "@/types/teesheet";

interface CheckedQuote {
  valid: boolean;
  price: string;
  currency: string;
  teeTime: TeeTime;
  greenFee: GreenFee;
  course: Course;
}

interface BookingIntentRecord {
  booking_intent_id: string;
  stage: string;
  payment_state: string;
  reservation_state: string;
  revision: number;
  actions: Array<{ action: string; evidence?: { status_code?: number } }>;
}

function hasText(value: unknown, maxLength: number) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}

function isUuid(value: string | null): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function actionId(attemptId: string, action: string) {
  const hex = createHash("sha256").update(`${attemptId}:${action}`).digest("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

function canContinue(intent: BookingIntentRecord) {
  if (["draft", "quote_revalidation_failed", "quote_revalidation_unavailable", "quote_revalidated", "checkout_preparation_blocked"].includes(intent.stage)) {
    return true;
  }
  return intent.stage === "checkout_preparation_failed" &&
    intent.actions.at(-1)?.action === "checkout_preparation_failed" &&
    intent.actions.at(-1)?.evidence?.status_code === 429;
}

function bookingIntentStatus(intent: BookingIntentRecord) {
  return {
    bookingIntentId: intent.booking_intent_id,
    bookingIntentStage: intent.stage,
    paymentState: intent.payment_state,
    reservationState: intent.reservation_state,
    bookingIntentRetryable: canContinue(intent),
  };
}

export async function POST(req: NextRequest) {
  let intent: BookingIntentRecord | undefined;
  try {
    const payload = await req.json().catch(() => null);
    const idempotencyKey = req.headers.get("Idempotency-Key");
    const attemptId = req.headers.get("X-Checkout-Attempt-Key");
    const players = Object.keys(payload?.players || {}).length;
    if (!isUuid(idempotencyKey) || !isUuid(attemptId)) {
      return NextResponse.json({ error: "This booking session has expired. Please choose the tee time again." }, { status: 400 });
    }
    if (!payload || !/^\d{4}-\d{2}-\d{2}$/.test(payload.date || "") ||
        ![1, 3].includes(payload.course?.id) || !Number.isInteger(payload.teeTime?.id) ||
        !hasText(payload.teeTime?.time, 5) || !/^\d{2}:\d{2}$/.test(payload.teeTime.time) ||
        !Number.isInteger(payload.greenFee?.id) || !hasText(payload.greenFee?.num_holes, 40) ||
        !hasText(payload.greenFee?.package_name, 120) || players < 1 || players > 4 ||
        typeof payload.players !== "object" || Array.isArray(payload.players) ||
        !Object.keys(payload.players).every((key, index) => key === String(index + 1)) ||
        typeof payload.price !== "string" || !/^\d+(\.\d{1,2})?$/.test(payload.price) ||
        !/^[A-Z]{3}$/.test(payload.currency || "")) {
      return NextResponse.json({ error: "Please select a tee time and price again." }, { status: 400 });
    }
    const guestDetails = Object.values(payload.players);
    const validGuests = guestDetails.every((guest) => {
      if (!guest || typeof guest !== "object" || Array.isArray(guest)) return false;
      const fields = guest as Record<string, unknown>;
      return hasText(fields.first_name, 100) && hasText(fields.club, 160) && hasText(fields.handicap, 16);
    });
    const lead = payload.players["1"];
    if (!validGuests || !hasText(lead?.last_name, 100) || !hasText(lead?.country, 100) ||
        !hasText(lead?.email, 254) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email) ||
        !hasText(lead?.telephone, 40) || !/^[+\d\s().-]{6,40}$/.test(lead.telephone) ||
        lead.telephone.replace(/\D/g, "").length < 6) {
      return NextResponse.json({ error: "Please complete the required guest details, including a valid email and telephone number." }, { status: 400 });
    }
    if (payload.marketing?.terms !== true) {
      return NextResponse.json({ error: "Please accept the terms and conditions before continuing." }, { status: 400 });
    }

    // Preserve the existing safety gate: cooldown/configuration blocks happen
    // before a live revalidation or a BRS checkout request.
    requireCheckoutConfiguration();
    assertCheckoutAvailable();

    intent = await bookingBackend<BookingIntentRecord>("/booking-intents", {
      selection: {
        date: payload.date,
        course_id: payload.course.id,
        tee_time_id: payload.teeTime.id,
        green_fee_id: payload.greenFee.id,
        time: payload.teeTime.time,
        holes: payload.greenFee.num_holes,
        package_name: payload.greenFee.package_name,
        players,
        price: payload.price,
        currency: payload.currency,
      },
      lead_guest: {
        first_name: lead.first_name,
        last_name: lead.last_name,
        email: lead.email,
        telephone: lead.telephone,
      },
    }, { "Idempotency-Key": idempotencyKey });

    if (!canContinue(intent)) {
      return NextResponse.json({
        error: "This saved booking request already has a checkout outcome. Review its recorded status before trying again.",
        ...bookingIntentStatus(intent),
      }, { status: 409 });
    }

    const recordAction = async (action: string, evidence: Record<string, unknown> = {}) => {
      intent = await bookingBackend<BookingIntentRecord>(
        `/booking-intents/${intent!.booking_intent_id}/actions`,
        {
          action,
          action_id: actionId(attemptId, action),
          expected_revision: intent!.revision,
          ...evidence,
        },
      );
      return intent;
    };

    let checked: CheckedQuote;
    try {
      checked = await bookingBackend<CheckedQuote>("/teesheets/revalidate", {
        date: payload.date, course_id: payload.course.id,
        tee_time_id: payload.teeTime.id, green_fee_id: payload.greenFee.id,
        players, price: payload.price, currency: payload.currency,
      });
    } catch (error) {
      if (error instanceof BookingBackendError) {
        if (error.status === 409) {
          await recordAction("live_revalidation_failed", {
            status_code: 409, detail_code: "quote_or_availability_changed",
          });
        } else {
          await recordAction("live_revalidation_unavailable", {
            status_code: error.status, detail_code: "backend_unavailable",
          });
        }
      }
      throw error;
    }

    await recordAction("live_revalidation_passed", {
      quote: { price: checked.price, currency: checked.currency },
    });
    await recordAction("checkout_preparation_started");
    if (intent.stage !== "checkout_preparation_pending") {
      return NextResponse.json({
        error: "This saved booking request already has a checkout action recorded. Review its status before trying again.",
        ...bookingIntentStatus(intent),
      }, { status: 409 });
    }

    const checkoutPayload = { ...payload };
    delete checkoutPayload.currency;
    let preparation: Awaited<ReturnType<typeof prepareCheckoutWithEvidence>>;
    try {
      preparation = await prepareCheckoutWithEvidence({
        ...checkoutPayload,
        teeTime: { ...checked.teeTime, element_id: `package-${checked.greenFee.id}-${payload.date.replace(/-/g, "")}${checked.teeTime.time.replace(":", "")}` },
        greenFee: checked.greenFee, course: checked.course, price: checked.price,
        holes: checked.greenFee.num_holes || checked.teeTime.holes,
        packageDescription: checked.greenFee.package_description,
      });
    } catch (error) {
      if (error instanceof BookingBackendError) {
        if (error.origin === "upstream_response") {
          await recordAction("checkout_preparation_failed", {
            status_code: error.observedStatusCode ?? error.status,
            detail_code: "upstream_response_error",
          });
        } else if (error.origin === "local_guard") {
          await recordAction("checkout_preparation_blocked", {
            status_code: 429, detail_code: "local_cooldown",
          });
        } else if (error.origin === "configuration") {
          await recordAction("checkout_preparation_blocked", {
            status_code: 503, detail_code: "configuration_missing",
          });
        } else {
          await recordAction("checkout_preparation_outcome_unknown", {
            detail_code: "upstream_outcome_unknown",
          });
        }
      } else {
        await recordAction("checkout_preparation_outcome_unknown", {
          detail_code: "upstream_outcome_unknown",
        });
      }
      throw error;
    }

    // Keep this write outside the upstream-error handler: if MongoDB cannot
    // save the observed HTTP result, the durable record stays pending and must
    // be reconciled instead of being mislabeled as an unknown BRS response.
    await recordAction("checkout_preparation_response_received", { status_code: preparation.statusCode });
    const result = preparation.data && typeof preparation.data === "object" && !Array.isArray(preparation.data)
      ? preparation.data : { result: preparation.data };
    return NextResponse.json({
      ...result,
      ...bookingIntentStatus(intent),
    });
  } catch (err) {
    const { error, status, retryAfterSeconds } = bookingError(err);
    return NextResponse.json(
      {
        error,
        ...(intent ? bookingIntentStatus(intent) : {}),
      },
      { status, headers: retryAfterSeconds ? { "Retry-After": String(retryAfterSeconds) } : undefined },
    );
  }
}
