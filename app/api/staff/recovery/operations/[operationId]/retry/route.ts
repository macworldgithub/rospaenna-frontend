import { NextRequest, NextResponse } from "next/server";
import { bookingBackend, bookingError } from "@/lib/bookingBackend";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ operationId: string }> }
) {
  try {
    const { operationId } = await params;
    if (!operationId || operationId.trim().length < 3) {
      return NextResponse.json(
        { error: "Invalid operation ID." },
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

    const body = await req.json().catch(() => ({}));
    const cleanOpId = encodeURIComponent(operationId.trim());

    const data = await bookingBackend(
      `/staff/recovery/operations/${cleanOpId}/retry`,
      body,
      {
        "Content-Type": "application/json",
        "X-Staff-Token": staffToken.trim(),
      },
      "POST"
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
