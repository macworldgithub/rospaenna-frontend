import { NextRequest, NextResponse } from "next/server";
import { bookingBackend, bookingError } from "@/lib/bookingBackend";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ bookingReference: string }> }
) {
  try {
    const { bookingReference } = await params;
    if (!bookingReference) {
      return NextResponse.json(
        { error: "Booking reference is required." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const sessionToken = req.headers.get("x-mmb-session") || req.headers.get("authorization")?.replace(/Bearer /i, "");
    if (!sessionToken) {
      return NextResponse.json(
        { error: "Guest session token required. Please sign in via verification code." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const body = await req.json().catch(() => ({}));

    const data = await bookingBackend(
      `/mmb/occupants/${encodeURIComponent(bookingReference)}/review-for-amendment`,
      body,
      { "X-MMB-Session": sessionToken.trim() },
      "POST"
    );

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (err: unknown) {
    const { error, status } = bookingError(err);
    return NextResponse.json(
      { error },
      { status: status || 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
