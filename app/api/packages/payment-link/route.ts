import { NextRequest, NextResponse } from "next/server";
import { bookingBackend, bookingError } from "@/lib/bookingBackend";
import { CHECKOUT_HEADER, checkoutNotFound, getCheckoutToken } from "@/lib/checkoutCapability";
import { originFailure } from "@/lib/sameOrigin";

export async function POST(req: NextRequest) {
  if (originFailure(req)) {
    return NextResponse.json({ error: "Request origin not allowed." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }

  const token = getCheckoutToken(req);
  if (!token) return checkoutNotFound();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  try {
    const data = await bookingBackend("/packages/payment-link", body, { [CHECKOUT_HEADER]: token }, "POST");
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const { error, status } = bookingError(err);
    return NextResponse.json({ error }, { status });
  }
}
