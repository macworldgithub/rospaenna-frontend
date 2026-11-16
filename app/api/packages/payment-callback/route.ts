import { NextRequest, NextResponse } from "next/server";
import { bookingBackend, bookingError } from "@/lib/bookingBackend";

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  // Require provider_signature. Reject unsigned payloads per Ticket N06 security boundary.
  if (!body.provider_signature || typeof body.provider_signature !== "string") {
    return NextResponse.json(
      { error: "Provider signature is required. Unsigned callbacks are rejected." },
      { status: 400 }
    );
  }

  try {
    const data = await bookingBackend("/packages/payment-callback", body, {}, "POST");
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const { error, status } = bookingError(err);
    return NextResponse.json({ error }, { status });
  }
}
