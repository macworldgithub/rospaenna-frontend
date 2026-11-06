import { NextRequest, NextResponse } from "next/server";
import { bookingBackend, bookingError } from "@/lib/bookingBackend";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    const { paymentId } = await params;
    if (!paymentId || paymentId.trim().length < 5) {
      return NextResponse.json(
        { error: "A valid payment_id is required." },
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
      `/mmb/amendments/settlement/payment/${encodeURIComponent(paymentId)}`,
      undefined,
      { "X-MMB-Session": sessionToken.trim() },
      "GET"
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
