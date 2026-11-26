import { NextRequest, NextResponse } from "next/server";

const origin = "http://127.0.0.1:3032";
const backend = "http://127.0.0.1:4042/pre-arrival/rooming";
const cookie = "n10_sandbox_session";
const cookieOptions = { httpOnly: true, sameSite: "strict", path: "/api/pre-arrival/rooming" } as const;
const tokenPattern = /^[A-Za-z0-9_-]{43}$/;

function json(value: unknown, status = 200) {
  return NextResponse.json(value, {
    status,
    headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
  });
}

async function handle(request: NextRequest) {
  const key = process.env.N10_SANDBOX_KEY;
  if (!key || !/^[A-Za-z0-9_-]{43,128}$/.test(key)
      || process.env.N10_SANDBOX_ENABLED !== "true" || request.headers.get("host") !== "127.0.0.1:3032") {
    return json({ error: "The rooming sandbox is unavailable." }, 404);
  }
  const { method } = request;
  if (method !== "GET" && request.headers.get("origin") !== origin) {
    return json({ error: "Open the rooming form on this website." }, 403);
  }
  const exchange = method === "POST";
  const logout = method === "DELETE";
  const session = request.cookies.get(cookie)?.value;
  if (!exchange && (!session || !tokenPattern.test(session))) {
    return json({ error: "Open a valid rooming invitation." }, 401);
  }
  let body: string | undefined;
  if (exchange || method === "PUT") {
    if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") {
      return json({ error: "Send JSON data." }, 415);
    }
    const reader = request.body?.getReader();
    const decoder = new TextDecoder("utf-8", { fatal: true });
    let size = 0;
    body = "";
    try {
      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 32 * 1024) {
          void reader.cancel();
          return json({ error: "The rooming list is too large." }, 413);
        }
        body += decoder.decode(value, { stream: true });
      }
      body += decoder.decode();
      JSON.parse(body);
    } catch {
      return json({ error: "Check the form data." }, 400);
    }
  }
  const id = request.nextUrl.searchParams.get("submission");
  if (id !== null && (method !== "GET" || !/^[a-f0-9]{32}$/.test(id))) {
    return json({ error: "The submission is unavailable." }, 404);
  }
  const path = exchange || logout ? "/session" : id ? `/submissions/${id}` : "";
  try {
    const response = await fetch(backend + path, {
      method,
      body,
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(10000),
      headers: {
        "X-API-Key": key,
        ...(!exchange && session ? { "X-Pre-Arrival-Session": session } : {}),
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      },
    });
    const data = await response.json();
    if (logout && response.ok) {
      const result = json({ signed_out: true });
      result.cookies.set(cookie, "", { ...cookieOptions, maxAge: 0 });
      return result;
    }
    if (!response.ok) {
      return json({ error: typeof data?.detail === "string" ? data.detail : "The rooming request failed." }, response.status);
    }
    if (exchange) {
      if (typeof data?.token !== "string" || !tokenPattern.test(data.token)) throw new Error();
      const maxAge = Math.floor((Date.parse(data.expires_at) - Date.now()) / 1000);
      if (!Number.isFinite(maxAge) || maxAge <= 0 || maxAge > 1200) throw new Error();
      const result = json({ signed_in: true });
      result.cookies.set(cookie, data.token, { ...cookieOptions, maxAge });
      return result;
    }
    return json(data);
  } catch {
    return json({ error: "The rooming service could not verify the result. Try again." }, 503);
  }
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const DELETE = handle;
