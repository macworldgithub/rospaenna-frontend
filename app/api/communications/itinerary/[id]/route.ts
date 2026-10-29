import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id || id.trim().length === 0) {
    return NextResponse.json({ error: "Booking reference or intent ID is required." }, { status: 400 });
  }

  const baseUrl = process.env.BOOKING_BACKEND_URL || "http://127.0.0.1:4040";
  const apiKey = process.env.BOOKING_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "The booking service is not configured yet." },
      { status: 503 }
    );
  }

  try {
    const backendRes = await fetch(
      `${baseUrl.replace(/\/$/, "")}/communications/itinerary/${encodeURIComponent(id)}/pdf`,
      {
        method: "GET",
        headers: {
          "X-API-Key": apiKey,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!backendRes.ok) {
      if (backendRes.status === 404) {
        return NextResponse.json({ error: "Booking record was not found." }, { status: 404 });
      }
      return NextResponse.json(
        { error: "Failed to generate itinerary PDF." },
        { status: backendRes.status }
      );
    }

    const pdfBuffer = await backendRes.arrayBuffer();
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Rosapenna-Itinerary-${encodeURIComponent(id)}.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "The booking service is temporarily unavailable." },
      { status: 503 }
    );
  }
}
