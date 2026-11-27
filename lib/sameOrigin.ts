export type OriginFailure = "missing" | "invalid" | "mismatch";

// Checks the Origin header against the Host header (or an exact expected origin).
// Returns null when the request is same-origin.
export function originFailure(req: Request, expectedOrigin?: string): OriginFailure | null {
  const origin = req.headers.get("origin");
  const host = req.headers.get("host");
  if (!origin || !host) return "missing";

  let originUrl: URL;
  let hostUrl: URL;
  try {
    originUrl = new URL(origin);
    hostUrl = new URL(`http://${host}`);
  } catch {
    return "invalid";
  }

  if (expectedOrigin) {
    return originUrl.origin === expectedOrigin && hostUrl.origin === expectedOrigin ? null : "mismatch";
  }
  return originUrl.host === hostUrl.host ? null : "mismatch";
}
