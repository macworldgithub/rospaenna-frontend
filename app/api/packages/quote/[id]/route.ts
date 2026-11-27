import { NextRequest, NextResponse } from "next/server";
import { bookingBackend, bookingError } from "@/lib/bookingBackend";
import { CHECKOUT_HEADER, checkoutNotFound, getCheckoutToken } from "@/lib/checkoutCapability";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = getCheckoutToken(req);
  if (!token) return checkoutNotFound();

  const { id } = await params;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Missing quote ID." }, { status: 400 });
  }

  try {
    const data = await bookingBackend(`/packages/quote/${encodeURIComponent(id)}`, undefined, { [CHECKOUT_HEADER]: token }, "GET");
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const { error, status } = bookingError(err);
    return NextResponse.json({ error }, { status });
  }
}
