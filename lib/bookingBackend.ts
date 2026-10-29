export class BookingBackendError extends Error {
  constructor(
    message: string,
    public status: number,
    public retryAfterSeconds?: number,
    public origin: "backend" | "configuration" | "local_guard" | "upstream_response" | "upstream_unknown" = "backend",
    public observedStatusCode?: number,
  ) {
    super(message);
  }
}

// Called only by server routes. Never expose the backend API key to the browser.
export async function bookingBackend<T>(
  path: string,
  body?: unknown,
  extraHeaders: Record<string, string> = {},
  method?: "GET" | "POST" | "PUT" | "DELETE"
): Promise<T> {
  const baseUrl = process.env.BOOKING_BACKEND_URL || "http://127.0.0.1:4040";
  const key = process.env.BOOKING_API_KEY;
  if (!key) throw new BookingBackendError("The booking service is not configured yet.", 503, undefined, "configuration");
  let response: Response;
  const httpMethod = method ?? (body === undefined ? "GET" : "POST");
  try {
    response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
      method: httpMethod,
      headers: {
        ...extraHeaders,
        "X-API-Key": key,
        ...(body === undefined ? {} : { "Content-Type": "application/json" }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(body === undefined ? 10000 : 75000),
    });
  } catch {
    throw new BookingBackendError("The booking service is temporarily unavailable. Please try again.", 503);
  }
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    const message = typeof result?.detail === "string" ? result.detail
      : typeof result?.reason === "string" ? result.reason
      : "Could not check the latest tee times. Please try again.";
    throw new BookingBackendError(message, response.status);
  }
  if (!result) throw new BookingBackendError("The booking service returned an invalid response.", 502);
  return result as T;
}

export function bookingError(error: unknown) {
  return {
    error: error instanceof BookingBackendError ? error.message : "The booking service is temporarily unavailable.",
    status: error instanceof BookingBackendError ? error.status : 502,
    retryAfterSeconds: error instanceof BookingBackendError ? error.retryAfterSeconds : undefined,
    origin: error instanceof BookingBackendError ? error.origin : "backend",
  };
}
