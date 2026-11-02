import { NextRequest, NextResponse } from "next/server";
import { bookingBackend, bookingError } from "@/lib/bookingBackend";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const sessionToken = req.headers.get("x-mmb-session") || req.headers.get("authorization")?.replace(/Bearer /i, "");
    if (!sessionToken) {
      return NextResponse.json(
        { error: "No session token provided." },
        { status: 400, headers: { "Cache-Control": "no-store" } }
      );
    }

    const data = await bookingBackend(
      "/mmb/auth/logout",
      {},
      { "X-MMB-Session": sessionToken.trim() },
      "POST"
    );

    const safeData = data && typeof data === "object" ? (data as Record<string, unknown>) : {};
    return NextResponse.json(
      { success: true, ...safeData },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    const { error, status } = bookingError(err);
    return NextResponse.json(
      { success: false, error },
      { status: status || 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
