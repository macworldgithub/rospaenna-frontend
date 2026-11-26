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
