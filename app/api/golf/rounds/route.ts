import { NextRequest, NextResponse } from "next/server";
import { bookingBackend, bookingError } from "@/lib/bookingBackend";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const idempotencyKey = req.headers.get("Idempotency-Key") || undefined;
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }

  try {
    const data = await bookingBackend("/golf/rounds", body, headers, "POST");
    return NextResponse.json(data, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const { error, status } = bookingError(err);
    return NextResponse.json({ error }, { status });
  }
}

export async function PUT(req: NextRequest) {
  let body: { round_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const roundId = body?.round_id;
  if (!roundId || typeof roundId !== "string") {
    return NextResponse.json({ error: "A valid round_id is required." }, { status: 400 });
  }

  const idempotencyKey = req.headers.get("Idempotency-Key") || undefined;
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }

  try {
    const data = await bookingBackend(
      `/golf/rounds/${encodeURIComponent(roundId)}`,
      body,
      headers,
      "PUT"
    );
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const { error, status } = bookingError(err);
    return NextResponse.json({ error }, { status });
  }
}

export async function DELETE(req: NextRequest) {
  let body: { round_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const roundId = body?.round_id;
  if (!roundId || typeof roundId !== "string") {
    return NextResponse.json({ error: "A valid round_id is required." }, { status: 400 });
  }

  const idempotencyKey = req.headers.get("Idempotency-Key") || undefined;
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }

  try {
    const data = await bookingBackend(
      `/golf/rounds/${encodeURIComponent(roundId)}`,
      body,
      headers,
      "DELETE"
    );
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const { error, status } = bookingError(err);
    return NextResponse.json({ error }, { status });
  }
}
