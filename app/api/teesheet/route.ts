import { NextRequest, NextResponse } from "next/server";
import { bookingBackend, bookingError } from "@/lib/bookingBackend";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const courseId = searchParams.get("course_id");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !courseId || !["1", "3", "4"].includes(courseId)) {
    return NextResponse.json({ error: "A valid date and supported course are required." }, { status: 400 });
  }

  try {
    const data = await bookingBackend(`/teesheets?date=${date}&course_id=${courseId}`);
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const { error, status } = bookingError(err);
    return NextResponse.json(
      { error }, { status }
    );
  }
}
