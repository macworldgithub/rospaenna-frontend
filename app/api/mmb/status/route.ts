import { NextResponse } from "next/server";
import { bookingBackend, bookingError } from "@/lib/bookingBackend";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const data = await bookingBackend("/mmb/status", undefined, {}, "GET");
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const { error, status } = bookingError(err);
    // If backend is unavailable or unconfigured, fail closed (enabled: false)
    return NextResponse.json(
      {
        enabled: false,
        message: "Manage My Booking is currently disabled.",
        error,
      },
      { status: status === 503 ? 200 : status }
    );
  }
}
