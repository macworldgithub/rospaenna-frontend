import { NextRequest, NextResponse } from "next/server";
import { bookingBackend, bookingError } from "@/lib/bookingBackend";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  if (typeof body === "object" && body !== null && (body as { template?: string }).template === "booking_confirmation") {
    return NextResponse.json(
      { error: "Booking confirmation delivery via this route is disabled. Please use authorized booking operations." },
      { status: 403, headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const data = await bookingBackend("/communications/send", body, {}, "POST");
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const { error, status } = bookingError(err);
    return NextResponse.json({ error }, { status });
  }
}
