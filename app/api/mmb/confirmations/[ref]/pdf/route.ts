import { NextRequest, NextResponse } from "next/server";
import { bookingError } from "@/lib/bookingBackend";

export const dynamic = "force-dynamic";

const BACKEND_URL = process.env.BOOKING_BACKEND_URL || "http://127.0.0.1:8000";

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

    const sessionToken =
      req.headers.get("x-mmb-session") ||
      req.headers.get("authorization")?.replace(/Bearer /i, "");
    if (!sessionToken) {
      return NextResponse.json(
        { error: "Authentication required. Please sign in with your one-time verification code." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const cleanRef = encodeURIComponent(ref.trim().toUpperCase());
    const res = await fetch(`${BACKEND_URL}/mmb/confirmations/${cleanRef}/pdf`, {
      method: "GET",
      headers: {
        "X-MMB-Session": sessionToken.trim(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: errJson.detail || errJson.error || "Failed to download revised PDF." },
        { status: res.status, headers: { "Cache-Control": "no-store" } }
      );
    }

    const pdfBuffer = await res.arrayBuffer();
    const contentDisposition =
      res.headers.get("Content-Disposition") ||
      `attachment; filename="Rosapenna-Revised-Itinerary-${ref}.pdf"`;

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDisposition,
        "Content-Length": pdfBuffer.byteLength.toString(),
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err) {
    const { error, status } = bookingError(err);
    return NextResponse.json(
      { success: false, error },
      { status: status || 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
