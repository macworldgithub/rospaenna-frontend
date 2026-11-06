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

    const { booking_reference, option_id, proposed_stay } = body as {
      booking_reference?: string;
      option_id?: string;
      proposed_stay?: unknown;
    };

    if (!booking_reference || typeof booking_reference !== "string" || booking_reference.trim().length < 5) {
      return NextResponse.json(
        { error: "A valid booking reference is required." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!option_id || !proposed_stay) {
      return NextResponse.json(
        { error: "option_id and proposed_stay are required to generate an offer snapshot." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const sessionToken =
      req.headers.get("x-mmb-session") ||
      req.headers.get("authorization")?.replace(/Bearer /i, "");

    if (!sessionToken) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in with your verified guest session." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const data = await bookingBackend(
      "/mmb/amendments/offer",
      body,
      { "X-MMB-Session": sessionToken.trim() },
      "POST"
    );

    return NextResponse.json(
      { success: true, data },
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
