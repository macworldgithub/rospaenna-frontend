import { NextRequest, NextResponse } from "next/server";
import { bookingBackend, bookingError } from "@/lib/bookingBackend";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ bookingReference: string; requestId: string }> }
) {
  try {
    const { bookingReference, requestId } = await params;
    if (!bookingReference || !requestId) {
      return NextResponse.json(
        { error: "Booking reference and request ID are required." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const staffToken = req.headers.get("x-staff-token");
    if (!staffToken) {
      return NextResponse.json(
        { error: "Staff authorization token required." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const data = await bookingBackend(
      `/staff/requests/${encodeURIComponent(bookingReference)}/${encodeURIComponent(requestId)}`,
      undefined,
      { "X-Staff-Token": staffToken.trim() },
      "GET"
    );

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (err: unknown) {
    const { error, status } = bookingError(err);
    return NextResponse.json(
      { error },
      { status: status || 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bookingReference: string; requestId: string }> }
) {
  try {
    const { bookingReference, requestId } = await params;
    if (!bookingReference || !requestId) {
      return NextResponse.json(
        { error: "Booking reference and request ID are required." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const staffToken = req.headers.get("x-staff-token");
    if (!staffToken) {
      return NextResponse.json(
        { error: "Staff authorization token required." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const idempotencyKey = req.headers.get("idempotency-key");
    if (!idempotencyKey || idempotencyKey.trim().length < 8) {
      return NextResponse.json(
        { error: "A valid Idempotency-Key header (min 8 chars) is required." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json(
        { error: "Valid JSON payload is required." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const data = await bookingBackend(
      `/staff/requests/${encodeURIComponent(bookingReference)}/${encodeURIComponent(requestId)}/transition`,
      body,
      {
        "X-Staff-Token": staffToken.trim(),
        "Idempotency-Key": idempotencyKey.trim(),
      },
      "POST"
    );

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (err: unknown) {
    const { error, status } = bookingError(err);
    return NextResponse.json(
      { error },
      { status: status || 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
