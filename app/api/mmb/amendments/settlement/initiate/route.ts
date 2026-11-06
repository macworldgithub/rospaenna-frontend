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

    const { booking_reference, offer_id, revalidation_id } = body as {
      booking_reference?: string;
      offer_id?: string;
      revalidation_id?: string;
    };

    if (!booking_reference || typeof booking_reference !== "string" || booking_reference.trim().length < 5) {
      return NextResponse.json(
        { error: "A valid booking reference is required." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!offer_id || typeof offer_id !== "string" || offer_id.trim().length < 5) {
      return NextResponse.json(
        { error: "A valid offer_id is required." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    if (!revalidation_id || typeof revalidation_id !== "string" || revalidation_id.trim().length < 5) {
      return NextResponse.json(
        { error: "A valid revalidation_id is required. Offer must be revalidated first." },
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
      "/mmb/amendments/settlement/initiate",
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
      { error, success: false },
      { status: status || 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
