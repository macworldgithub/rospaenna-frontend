import { NextRequest, NextResponse } from "next/server";
import { bookingBackend, bookingError } from "@/lib/bookingBackend";

const headers = { "Cache-Control": "no-store" };

export async function POST(req: NextRequest) {
  if (process.env.BOOKING_STAFF_BRS_PREVIEW_ENABLED !== "true") {
    return NextResponse.json({ error: "Staff preview is disabled." }, { status: 404, headers });
  }
  if (req.headers.get("origin") !== req.nextUrl.origin) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403, headers });
  }
  const token = req.headers.get("x-staff-token")?.trim();
  if (!token) {
    return NextResponse.json({ error: "Staff authorization token required." }, { status: 401, headers });
  }
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid preview details." }, { status: 400, headers });
  }
  try {
    const data = await bookingBackend("/staff/brs-preview", body, { "X-Staff-Token": token }, "POST");
    return NextResponse.json(data, { headers });
  } catch (err) {
    const { error, status } = bookingError(err);
    return NextResponse.json({ error }, { status, headers });
  }
}
