import { NextRequest, NextResponse } from "next/server";
import { bookingBackend, bookingError } from "@/lib/bookingBackend";
import { CHECKOUT_HEADER, checkoutNotFound, getCheckoutToken } from "@/lib/checkoutCapability";
import type { PackagePaymentStatus } from "@/lib/packagesClient";
import { originFailure } from "@/lib/sameOrigin";

const headers = { "Cache-Control": "no-store" };

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const token = getCheckoutToken(req);
  if (!token) return checkoutNotFound();

  const { id } = await params;
  if (typeof id !== "string" || !/^[A-Za-z0-9_-]{1,100}$/.test(id)) {
    return NextResponse.json({ error: "Invalid payment ID." }, { status: 400, headers });
  }

  try {
    const data = await bookingBackend<PackagePaymentStatus>(`/packages/payments/${encodeURIComponent(id)}`, undefined, { [CHECKOUT_HEADER]: token }, "GET");
    return NextResponse.json(
      { status: data.status, booking_status: data.booking_status },
      { headers },
    );
  } catch (err) {
    const { error, status } = bookingError(err);
    return NextResponse.json({ error }, { status, headers });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (originFailure(req)) {
    return NextResponse.json({ error: "Request origin not allowed." }, { status: 403, headers });
  }
  if (process.env.BOOKING_LOCAL_PROMMT_TEST !== "1") {
    return GET(req, context);
  }

  const token = getCheckoutToken(req);
  if (!token) return checkoutNotFound();

  const { id } = await context.params;
  if (typeof id !== "string" || !/^[A-Za-z0-9_-]{1,100}$/.test(id)) {
    return NextResponse.json({ error: "Invalid payment ID." }, { status: 400, headers });
  }

  const paymentPath = `/packages/payments/${encodeURIComponent(id)}`;
  const capability = { [CHECKOUT_HEADER]: token };
  try {
    const data = await bookingBackend<PackagePaymentStatus>(paymentPath, undefined, capability, "GET");
    if (data.booking_status === "confirmed" || data.booking_status === "needs_review") {
      return NextResponse.json({ status: data.status, booking_status: data.booking_status }, { headers });
    }
    await bookingBackend(`${paymentPath}/reconcile-test`, undefined, capability, "POST");
  } catch (err) {
    const { error, status } = bookingError(err);
    if (status !== 409) return NextResponse.json({ error }, { status, headers });
  }

  return GET(req, context);
}
