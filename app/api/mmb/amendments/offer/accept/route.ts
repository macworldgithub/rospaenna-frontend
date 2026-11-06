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

    const { offer_id, booking_reference, terms_version, accepted_terms } = body as {
      offer_id?: string;
      booking_reference?: string;
      terms_version?: string;
      accepted_terms?: boolean;
    };

    if (!offer_id || !booking_reference || !terms_version || accepted_terms === undefined) {
      return NextResponse.json(
        { error: "offer_id, booking_reference, terms_version, and accepted_terms are required." },
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
      "/mmb/amendments/offer/accept",
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
