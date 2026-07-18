import { NextRequest, NextResponse } from "next/server";
import { fetchTeesheet } from "@/lib/brsGolfClient";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const courseId = searchParams.get("course_id");

  if (!date || !courseId) {
    return NextResponse.json({ error: "date and course_id are required" }, { status: 400 });
  }

  try {
    const data = await fetchTeesheet(date, parseInt(courseId, 10));
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}