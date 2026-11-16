import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id || id.trim().length === 0) {
    return NextResponse.json(
      { error: "Booking reference or intent ID is required." },
      { status: 400, headers: { "Cache-Control": "no-store" } }
    );
  }

  // Deny unscoped legacy itinerary PDF download under Ticket N07 security policy
  return NextResponse.json(
    { error: "Unscoped itinerary PDF download via this route is disabled. Authorized booking or guest session is required." },
    { status: 403, headers: { "Cache-Control": "no-store" } }
  );
}
