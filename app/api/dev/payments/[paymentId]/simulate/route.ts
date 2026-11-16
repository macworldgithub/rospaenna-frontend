import { NextRequest, NextResponse } from "next/server";
import { bookingBackend, bookingError } from "@/lib/bookingBackend";

const ALLOWED_SCENARIOS = new Set([
  "success",
  "failure",
  "cancellation",
  "pending",
  "expired",
  "delayed_success",
  "timeout",
]);

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ paymentId: string }> }
) {
  // Only the explicit application development and test profiles may simulate.
  const env = process.env.BOOKING_ENVIRONMENT || process.env.NODE_ENV;
  if (env !== "development" && env !== "test") {
    return NextResponse.json(
      { error: "Simulation endpoints are disabled in production." },
      { status: 404 }
    );
  }

  // CSRF / Origin verification: same host, or an explicit loopback alias on the same port.
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) {
    return NextResponse.json(
      { error: "Forbidden: missing Origin or Host header." },
      { status: 403 }
    );
  }
  try {
    const originUrl = new URL(origin);
    const hostUrl = new URL(`http://${host}`);
    const loopback = new Set(["localhost", "127.0.0.1", "::1"]);
    const sameHost = originUrl.host === hostUrl.host;
    const bothLoopback =
      loopback.has(originUrl.hostname) &&
      loopback.has(hostUrl.hostname) &&
      originUrl.port === hostUrl.port;
    if (!sameHost && !bothLoopback) {
      return NextResponse.json(
        { error: "Forbidden: Origin does not match Host." },
        { status: 403 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Invalid Origin header." }, { status: 400 });
  }

  const { paymentId } = await context.params;
  if (!paymentId) {
    return NextResponse.json({ error: "Payment ID is required." }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const scenario = typeof body?.scenario === "string" ? body.scenario : "";
  if (!ALLOWED_SCENARIOS.has(scenario)) {
    return NextResponse.json(
      { error: `Invalid scenario '${scenario}'. Must be one of: ${Array.from(ALLOWED_SCENARIOS).join(", ")}` },
      { status: 400 }
    );
  }

  const commandId = typeof body.command_id === "string" ? body.command_id : undefined;

  try {
    const data = await bookingBackend(
      `/dev/payments/${encodeURIComponent(paymentId)}/simulate`,
      { scenario, command_id: commandId },
      {},
      "POST"
    );
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    const { error, status } = bookingError(err);
    return NextResponse.json({ error }, { status });
  }
}
