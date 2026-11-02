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

    const { booking_reference, code } = body as {
      booking_reference?: string;
      code?: string;
    };

    if (!booking_reference || typeof booking_reference !== "string" || booking_reference.trim().length < 5) {
      return NextResponse.json(
        { error: "Please enter a valid booking reference." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!code || typeof code !== "string" || !/^\d{6}$/.test(code.trim())) {
      return NextResponse.json(
        { error: "Please enter a valid 6-digit numeric verification code." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const data = await bookingBackend(
      "/mmb/auth/verify-otp",
      {
        booking_reference: booking_reference.trim().toUpperCase(),
        code: code.trim(),
      },
      {},
      "POST"
    );

    return NextResponse.json(
      { success: true, session: data },
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
