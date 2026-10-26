import { BookingBackendError } from "./bookingBackend";

const BASE_URL = "https://visitors.brsgolf.com";

interface CheckoutRequestState {
  retryAt: number;
  inFlight: boolean;
}

// Share the gate across route modules and development reloads in this process.
const runtime = globalThis as typeof globalThis & { rosapennaCheckoutRequestState?: CheckoutRequestState };
const requestState = runtime.rosapennaCheckoutRequestState ??= { retryAt: 0, inFlight: false };

export function assertCheckoutAvailable() {
  const remaining = Math.ceil((requestState.retryAt - Date.now()) / 1000);
  if (remaining > 0) {
    throw new BookingBackendError("BRS is limiting checkout requests. Please wait before trying again.", 429, remaining, "local_guard");
  }
  if (requestState.inFlight) {
    throw new BookingBackendError("A checkout request is already in progress. Please wait before trying again.", 429, 1, "local_guard");
  }
}

function defaultCooldownSeconds() {
  const value = Number(process.env.BRS_CHECKOUT_COOLDOWN_SECONDS ?? 300);
  return Number.isInteger(value) && value >= 30 && value <= 3600 ? value : 300;
}

export function requireCheckoutConfiguration() {
  const cookie = process.env.BRS_GOLF_COOKIE;
  const xsrfToken = process.env.BRS_GOLF_XSRF_TOKEN;
  if (!cookie?.trim() || !xsrfToken?.trim()) {
    const missing = [!cookie?.trim() && "BRS_GOLF_COOKIE", !xsrfToken?.trim() && "BRS_GOLF_XSRF_TOKEN"].filter(Boolean);
    console.error(`[BRS checkout] Missing server configuration: ${missing.join(", ")}`);
    throw new BookingBackendError(
      "Online checkout is not configured yet. Please contact Reservations for help with your booking.", 503,
      undefined, "configuration",
    );
  }
  if (!cookie.split(";").some((part) => /^\s*BRSVisitors\.Session=\S+\s*$/.test(part))) {
    console.error("[BRS checkout] BRS_GOLF_COOKIE must include the named BRSVisitors.Session cookie");
    throw new BookingBackendError(
      "The BRS checkout connection is incomplete. Please contact Reservations for help with your booking.", 503,
      undefined, "configuration",
    );
  }
  return { cookie, xsrfToken };
}

// Browsing uses the Python cache. This checkout bridge runs after live validation.
export async function prepareCheckout(payload: unknown) {
  return (await prepareCheckoutWithEvidence(payload)).data;
}

// The public response body stays unchanged; the server route uses only the
// observed status code to append a truthful action to the saved draft.
export async function prepareCheckoutWithEvidence(payload: unknown) {
  const { cookie, xsrfToken } = requireCheckoutConfiguration();
  assertCheckoutAvailable();
  requestState.inFlight = true;
  try {
    return await requestCheckout(payload, cookie, xsrfToken);
  } finally {
    requestState.inFlight = false;
  }
}

async function requestCheckout(payload: unknown, cookie: string, xsrfToken: string) {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}/api/checkout/prepare`, {
      method: "POST",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
        Referer: `${BASE_URL}/rosapenna`,
        Origin: BASE_URL,
        "X-Club-ID": "rosapenna",
        "X-Booking-Source": "ui",
        "X-Requested-With": "XMLHttpRequest",
        "X-XSRF-TOKEN": xsrfToken,
        Cookie: cookie,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    });
  } catch (error) {
    const timedOut = error instanceof Error && ["TimeoutError", "AbortError"].includes(error.name);
    console.warn(`[BRS checkout] Request ${timedOut ? "timed out" : "could not connect"}`);
    throw new BookingBackendError(
      timedOut ? "BRS checkout took too long to respond. Please try again shortly."
        : "Could not connect to BRS checkout. Please try again shortly.",
      timedOut ? 504 : 503,
      undefined, "upstream_unknown",
    );
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const code = typeof data?.code === "number" ? data.code : "unknown";
    console.warn(`[BRS checkout] Preparation returned HTTP ${response.status} (BRS code ${code})`);
    if (response.status === 429) {
      const retry = response.headers.get("Retry-After");
      const seconds = retry && /^\d+$/.test(retry) ? Number(retry)
        : retry ? Math.ceil((Date.parse(retry) - Date.now()) / 1000) : NaN;
      const retryAfterSeconds = Number.isFinite(seconds) && seconds > 0 && seconds <= 86400 ? seconds : defaultCooldownSeconds();
      requestState.retryAt = Date.now() + retryAfterSeconds * 1000;
      console.warn(`[BRS checkout] Pausing checkout requests for ${retryAfterSeconds}s (${Number.isFinite(seconds) && seconds > 0 && seconds <= 86400 ? "BRS Retry-After" : "local fallback; upstream retry time unknown"})`);
      throw new BookingBackendError(
        "BRS is limiting checkout requests. Please wait before trying again.", 429, retryAfterSeconds,
        "upstream_response", response.status,
      );
    }
    if ([401, 403, 419].includes(response.status)) {
      throw new BookingBackendError(
        "The BRS checkout connection needs to be renewed. Please contact Reservations for help with your booking.", 503,
        undefined, "upstream_response", response.status,
      );
    }
    if (code === 4) {
      throw new BookingBackendError(
        "BRS could not create the guest contact. Please check the guest details and try again.", 502,
        undefined, "upstream_response", response.status,
      );
    }
    throw new BookingBackendError(
      "BRS could not prepare this booking. Please select your tee time again.",
      response.status === 409 ? 409 : 502,
      undefined, "upstream_response", response.status,
    );
  }
  if (!data) {
    console.warn("[BRS checkout] Preparation returned an invalid JSON response");
    throw new BookingBackendError("BRS checkout returned an invalid response. Please try again shortly.", 502, undefined, "upstream_unknown");
  }
  return { data, statusCode: response.status };
}
