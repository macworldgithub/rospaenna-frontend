import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";

// Browser-held capability that proves the guest owns a quote or payment.
// The token is HttpOnly and is never sent to client JavaScript, URLs, logs or JSON bodies.
export const CHECKOUT_COOKIE = "rp_checkout";
export const CHECKOUT_HEADER = "X-Checkout-Capability";
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // matches the 7-day payment link lifetime

// Reads the Cookie header, so it works for NextRequest and for a plain Request.
export function getCheckoutToken(req: Request): string | null {
  const match = new RegExp(`(?:^|;\\s*)${CHECKOUT_COOKIE}=([^;]*)`).exec(req.headers.get("cookie") ?? "");
  const value = match?.[1];
  return value && TOKEN_PATTERN.test(value) ? value : null;
}

export function ensureCheckoutToken(req: Request): { token: string; isNew: boolean } {
  const existing = getCheckoutToken(req);
  if (existing) return { token: existing, isNew: false };
  return { token: randomBytes(32).toString("base64url"), isNew: true };
}

export function attachCheckoutCookie(response: NextResponse, token: string) {
  response.cookies.set(CHECKOUT_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
    secure: process.env.NODE_ENV === "production",
  });
}

export function checkoutNotFound() {
  return NextResponse.json({ error: "Not found." }, { status: 404, headers: { "Cache-Control": "no-store" } });
}
