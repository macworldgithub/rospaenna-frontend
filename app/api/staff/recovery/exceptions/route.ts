import { NextRequest, NextResponse } from "next/server";
import { bookingBackend, bookingError } from "@/lib/bookingBackend";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const staffToken = req.headers.get("x-staff-token");
    if (!staffToken) {
      return NextResponse.json(
        { error: "Staff authorization token required." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const { searchParams } = new URL(req.url);
    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : "";

    const data = await bookingBackend(
      `/staff/recovery/exceptions${queryStr}`,
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
