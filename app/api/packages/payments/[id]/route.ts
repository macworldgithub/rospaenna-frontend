import { NextRequest, NextResponse } from "next/server";
import { bookingBackend, bookingError } from "@/lib/bookingBackend";
import type { PackagePaymentStatus } from "@/lib/packagesClient";

const headers = { "Cache-Control": "no-store" };

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (typeof id !== "string" || !/^[A-Za-z0-9_-]{1,100}$/.test(id)) {
    return NextResponse.json({ error: "Invalid payment ID." }, { status: 400, headers });
  }

  try {
    const data = await bookingBackend<PackagePaymentStatus>(`/packages/payments/${encodeURIComponent(id)}`, undefined, {}, "GET");
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
  if (process.env.BOOKING_LOCAL_PROMMT_TEST !== "1") {
    return GET(req, context);
  }

  const { id } = await context.params;
  if (typeof id !== "string" || !/^[A-Za-z0-9_-]{1,100}$/.test(id)) {
    return NextResponse.json({ error: "Invalid payment ID." }, { status: 400, headers });
  }

  const paymentPath = `/packages/payments/${encodeURIComponent(id)}`;
  try {
    const data = await bookingBackend<PackagePaymentStatus>(paymentPath, undefined, {}, "GET");
    if (data.booking_status === "confirmed" || data.booking_status === "needs_review") {
      return NextResponse.json({ status: data.status, booking_status: data.booking_status }, { headers });
    }
    await bookingBackend(`${paymentPath}/reconcile-test`, undefined, {}, "POST");
  } catch (err) {
    const { error, status } = bookingError(err);
    if (status !== 409) return NextResponse.json({ error }, { status, headers });
  }

  return GET(req, context);
}
