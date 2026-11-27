/* eslint-disable @typescript-eslint/no-require-imports -- Isolated CommonJS test for a Next.js helper. */
// Tests the real lib/checkoutCapability.ts, compiled on the fly like the other route tests.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { test } = require("node:test");
const ts = require("typescript");

require.extensions[".ts"] = (module, file) => module._compile(
  ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText,
  file,
);
const cap = require(path.join(__dirname, "../lib/checkoutCapability.ts"));

const TOKEN = "T".repeat(43);
const requestWith = (cookie) => new Request("http://localhost:3000/x", cookie ? { headers: { Cookie: cookie } } : undefined);

test("getCheckoutToken accepts only a well-formed rp_checkout cookie", () => {
  assert.equal(cap.getCheckoutToken(requestWith(`rp_checkout=${TOKEN}`)), TOKEN);
  assert.equal(cap.getCheckoutToken(requestWith(`a=1; rp_checkout=${TOKEN}; b=2`)), TOKEN);
  for (const bad of [undefined, "", "rp_checkout=", `rp_checkout=${TOKEN}x`, "rp_checkout=short", `other=${TOKEN}`, `xrp_checkout=${TOKEN}`]) {
    assert.equal(cap.getCheckoutToken(requestWith(bad)), null, String(bad));
  }
});

test("ensureCheckoutToken reuses a valid cookie and makes a fresh 43-character token otherwise", () => {
  assert.deepEqual(cap.ensureCheckoutToken(requestWith(`rp_checkout=${TOKEN}`)), { token: TOKEN, isNew: false });
  const seen = new Set();
  for (let i = 0; i < 20; i += 1) {
    const { token, isNew } = cap.ensureCheckoutToken(requestWith("rp_checkout=bad"));
    assert.equal(isNew, true);
    assert.match(token, /^[A-Za-z0-9_-]{43}$/);
    seen.add(token);
  }
  assert.equal(seen.size, 20);
});

test("attachCheckoutCookie sets an HttpOnly, SameSite=Lax cookie for 7 days", () => {
  const { NextResponse } = require("next/server");
  const response = NextResponse.json({});
  cap.attachCheckoutCookie(response, TOKEN);
  const setCookie = response.headers.get("set-cookie");
  assert.match(setCookie, new RegExp(`rp_checkout=${TOKEN}`));
  assert.match(setCookie, /HttpOnly/i);
  assert.match(setCookie, /SameSite=lax/i);
  assert.match(setCookie, /Path=\//i);
  assert.match(setCookie, /Max-Age=604800/i);
});

test("checkoutNotFound is a no-store 404 that reveals nothing", async () => {
  const response = cap.checkoutNotFound();
  assert.equal(response.status, 404);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(await response.json(), { error: "Not found." });
});
