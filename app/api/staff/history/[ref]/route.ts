import { NextRequest, NextResponse } from "next/server";
import { bookingBackend, bookingError } from "@/lib/bookingBackend";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ref: string }> }
) {
  try {
    const { ref } = await params;
    if (!ref || ref.trim().length < 5) {
      return NextResponse.json(
        { error: "Invalid booking reference." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const staffToken = req.headers.get("x-staff-token");
    if (!staffToken) {
      return NextResponse.json(
        { error: "Staff authorization token required." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const cleanRef = encodeURIComponent(ref.trim().toUpperCase());
    const data = await bookingBackend(
      `/staff/history/${cleanRef}`,
      undefined,
      { "X-Staff-Token": staffToken.trim() },
      "GET"
    );

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (err: unknown) {
    const { error, status } = bookingError(err);
    return NextResponse.json(
      { error },
      { status: status || 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
