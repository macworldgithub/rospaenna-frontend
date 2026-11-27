import { NextRequest, NextResponse } from "next/server";
import { bookingBackend, bookingError } from "@/lib/bookingBackend";
import { CHECKOUT_HEADER, attachCheckoutCookie, ensureCheckoutToken } from "@/lib/checkoutCapability";
import { originFailure } from "@/lib/sameOrigin";

export async function POST(req: NextRequest) {
  if (originFailure(req)) {
    return NextResponse.json({ error: "Request origin not allowed." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const { token, isNew } = ensureCheckoutToken(req);
  try {
    const data = await bookingBackend("/packages/quote", body, { [CHECKOUT_HEADER]: token }, "POST");
    const response = NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
    if (isNew) attachCheckoutCookie(response, token);
    return response;
  } catch (err) {
    const { error, status } = bookingError(err);
    return NextResponse.json({ error }, { status });
  }
}
