import { NextRequest, NextResponse } from "next/server";
import { bookingBackend, bookingError } from "@/lib/bookingBackend";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  try {
    const data = await bookingBackend("/rooms/reservations", body, {}, "POST");
    return NextResponse.json(data, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const { error, status } = bookingError(err);
    return NextResponse.json({ error }, { status });
  }
}

export async function PUT(req: NextRequest) {
  let body: { reservation_id?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const reservationId = body?.reservation_id;
  if (!reservationId || typeof reservationId !== "string") {
    return NextResponse.json({ error: "A valid reservation_id is required." }, { status: 400 });
  }

  try {
    const data = await bookingBackend(`/rooms/reservations/${encodeURIComponent(reservationId)}`, body, {}, "PUT");
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const { error, status } = bookingError(err);
    return NextResponse.json({ error }, { status });
  }
}
