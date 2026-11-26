import { bookingBackend } from "@/lib/bookingBackend";

export const dynamic = "force-dynamic";

function testOrigin() {
  return process.env.NODE_ENV === "development"
    && /^http:\/\/127\.0\.0\.1:\d+$/.test(process.env.BOOKING_BACKEND_URL ?? "")
    ? process.env.BOOKING_DEV_TEST_ORIGIN : undefined;
}

function escape(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]!);
}

function page(details = "", status = 200) {
  return new Response(`<!doctype html><html lang="en"><meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Stay &amp; Play booking test</title>
    <body style="font:1rem system-ui;max-width:42rem;margin:3rem auto;padding:0 1rem">
    <h1>Stay &amp; Play booking test</h1>
    <p><strong>Simulation.</strong> No money moves. Hotel and golf records are local test records.</p>
    ${details}
    <form method="post">
      <label>Golf course <select name="course">
        <option value="3">Sandy Hills</option><option value="1">Old Tom Morris</option>
      </select></label>
      <button type="submit">Simulate deposit and create test booking</button>
    </form></body></html>`, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'",
    },
  });
}

export function GET(request: Request) {
  const origin = testOrigin();
  return origin && request.headers.get("host") === new URL(origin).host ? page() : new Response(null, { status: 404 });
}

export async function POST(request: Request) {
  const origin = testOrigin();
  if (!origin || request.headers.get("host") !== new URL(origin).host) return new Response(null, { status: 404 });
  if (request.headers.get("origin") !== origin) return new Response(null, { status: 403 });
  const form = await request.formData().catch(() => null);
  const course = form?.get("course");
  if (course !== "1" && course !== "3") return page("<p>Choose a test course.</p>", 400);

  const arrival = new Date();
  arrival.setUTCDate(arrival.getUTCDate() + 7);
  while (arrival.getUTCDay() !== 1) arrival.setUTCDate(arrival.getUTCDate() + 1);
  const day = (offset: number) => new Date(arrival.getTime() + offset * 86400000).toISOString().slice(0, 10);
  try {
    const quote = await bookingBackend<{ quote_id: string; status: string; errors: string[] }>("/packages/quote", {
      arrival_date: day(0), departure_date: day(2), rooms: [{ room_category: "CLASSIC", adults: 1 }],
      golf_rounds: [0, 1].map((offset) => ({ course_id: Number(course), date: day(offset), time: "10:00", players: 1 })),
    });
    if (quote.status !== "available") return page(`<p>Test quote unavailable. ${escape(quote.errors.join(" "))}</p>`, 409);
    const payment = await bookingBackend<{ payment_id: string; evidence_source: string; is_test: boolean }>("/packages/payment-link", {
      quote_id: quote.quote_id, lead_first_name: "Test", lead_last_name: "Guest",
      lead_email: "booking-test@example.invalid", lead_phone: "+353000000000", accepted_terms: true,
    });
    if (!payment.is_test || payment.evidence_source !== "simulation") throw new Error("Unexpected payment mode");
    const result = await bookingBackend<{
      payment_status: string;
      commit_result?: { status: string; operation_id: string; booking_reference: string; readback_verified: boolean; message: string };
    }>(`/dev/payments/${encodeURIComponent(payment.payment_id)}/simulate`, { scenario: "success" });
    const commit = result.commit_result;
    if (result.payment_status !== "verified_paid" || commit?.status !== "confirmed" || !commit.readback_verified) {
      return page(`<p>Test booking did not confirm. ${escape(commit?.message ?? "Check the backend log.")}</p>`, 409);
    }
    const { readback_evidence: evidence } = await bookingBackend<{ readback_evidence: {
      opera_reservation_id: string; opera_confirmation_number: string;
      opera_verified: boolean; brs_verified: boolean; brs_booking_ids: string[];
    } }>(`/operations/bookings/${encodeURIComponent(commit.operation_id)}`);
    if (!evidence.opera_verified || !evidence.brs_verified || evidence.brs_booking_ids.length !== 2) {
      return page("<p>The test payment passed, but the hotel and golf results could not both be verified.</p>", 409);
    }
    return page(`<section><h2>Test booking confirmed</h2><p>Simulated deposit accepted.</p>
      <p>Booking reference: <strong>${escape(commit.booking_reference)}</strong></p>
      <p>Local OPERA reservation: ${escape(evidence.opera_reservation_id)}</p>
      <p>Local OPERA confirmation: ${escape(evidence.opera_confirmation_number)}</p>
      <p>Local BRS bookings at ${course === "3" ? "Sandy Hills" : "Old Tom Morris"}:</p>
      <ul>${evidence.brs_booking_ids.map((id, offset) => `<li>${day(offset)} at 10:00 — ${escape(id)}</li>`).join("")}</ul></section>`);
  } catch {
    return page("<p>Could not verify the test booking. Check the backend log before running it again.</p>", 502);
  }
}
