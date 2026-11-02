import { NextRequest, NextResponse } from "next/server";
import { bookingBackend, bookingError } from "@/lib/bookingBackend";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ref: string }> }
) {
  try {
    const { ref } = await params;
    if (!ref || ref.trim().length < 5) {
      return NextResponse.json(
        { error: "Invalid booking reference." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const sessionToken = req.headers.get("x-mmb-session") || req.headers.get("authorization")?.replace(/Bearer /i, "");
    if (!sessionToken) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in with your one-time verification code." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const cleanRef = encodeURIComponent(ref.trim().toUpperCase());
    const data = await bookingBackend(
      `/mmb/booking/${cleanRef}`,
      undefined,
      { "X-MMB-Session": sessionToken.trim() },
      "GET"
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
