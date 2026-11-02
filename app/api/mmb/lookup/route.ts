import { NextRequest, NextResponse } from "next/server";
import { bookingBackend, bookingError } from "@/lib/bookingBackend";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request payload." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const { booking_reference, last_name } = body as {
      booking_reference?: string;
      last_name?: string;
    };

    if (!booking_reference || typeof booking_reference !== "string" || booking_reference.trim().length < 5) {
      return NextResponse.json(
        { error: "Please enter a valid booking reference." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!last_name || typeof last_name !== "string" || last_name.trim().length < 1) {
      return NextResponse.json(
        { error: "Please enter the lead guest surname." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const data = await bookingBackend(
      "/mmb/lookup",
      {
        booking_reference: booking_reference.trim().toUpperCase(),
        last_name: last_name.trim(),
      },
      {},
      "POST"
    );

    return NextResponse.json(
      { success: true, booking: data },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    const { error, status } = bookingError(err);
    return NextResponse.json(
      { success: false, error },
      { status: status || 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
