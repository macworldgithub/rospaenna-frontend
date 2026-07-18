import { NextRequest, NextResponse } from "next/server";
import { prepareCheckout } from "@/lib/brsGolfClient";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const data = await prepareCheckout(payload);
    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error" },
      { status: 502 }
    );
  }
}