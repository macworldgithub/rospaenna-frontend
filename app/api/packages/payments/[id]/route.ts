import { NextRequest, NextResponse } from "next/server";
import { bookingBackend, bookingError } from "@/lib/bookingBackend";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Missing payment ID." }, { status: 400 });
  }

  try {
    const data = await bookingBackend<{ status: string }>(`/packages/payments/${encodeURIComponent(id)}`, undefined, {}, "GET");
    return NextResponse.json({ status: data.status }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const { error, status } = bookingError(err);
    return NextResponse.json({ error }, { status });
  }
}
