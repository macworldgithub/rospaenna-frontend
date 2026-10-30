import { NextRequest, NextResponse } from "next/server";
import { bookingBackend, bookingError } from "@/lib/bookingBackend";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const cleanId = id?.trim();

  if (!cleanId) {
    return NextResponse.json(
      { error: "Booking reference or intent ID is required." },
      { status: 400 }
    );
  }

  try {
    // If it looks like a booking reference (starts with RSP- or CONF-), query by-reference
    const endpoint = cleanId.startsWith("bki_")
      ? `/booking-intents/${encodeURIComponent(cleanId)}`
      : `/booking-intents/by-reference/${encodeURIComponent(cleanId)}`;

    const data = await bookingBackend(endpoint, undefined, {}, "GET");
    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store, max-age=0" },
    });
  } catch (err) {
    const { error, status } = bookingError(err);
    return NextResponse.json({ error }, { status });
  }
}
