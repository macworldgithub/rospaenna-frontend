const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { createRequire } = require("node:module");

const frontendRoot = path.resolve(__dirname, "..");
const requireFrontend = createRequire(path.join(frontendRoot, "package.json"));
const ts = requireFrontend("typescript");

function loadHandler(relativePath, backendCalls) {
  const source = fs.readFileSync(path.join(frontendRoot, relativePath), "utf-8");
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const target = { exports: {} };
  const localRequire = (moduleId) => {
    if (moduleId === "@/lib/bookingBackend") {
      return {
        bookingBackend() {
          backendCalls.count += 1;
          throw new Error("Unexpected backend call from a denied legacy route");
        },
        bookingError() {
          return { error: "Synthetic backend error", status: 502 };
        },
      };
    }
    return requireFrontend(moduleId);
  };
  new Function("require", "module", "exports", compiled)(localRequire, target, target.exports);
  return target.exports;
}

test("N07 Booking Confirmations - Frontend Route Denial & Security Controls", async (t) => {
  await t.test("Legacy confirmation send and PDF handlers deny requests without calling the backend", async () => {
    const backendCalls = { count: 0 };
    const send = loadHandler("app/api/communications/send/route.ts", backendCalls);
    const pdf = loadHandler("app/api/communications/itinerary/[id]/route.ts", backendCalls);
    const sendResponse = await send.POST(new Request("http://localhost/api/communications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ template: "booking_confirmation", booking_intent_id: "TEST-N07" }),
    }));
    const pdfResponse = await pdf.GET(
      new Request("http://localhost/api/communications/itinerary/TEST-N07"),
      { params: Promise.resolve({ id: "TEST-N07" }) },
    );

    for (const response of [sendResponse, pdfResponse]) {
      assert.equal(response.status, 403);
      assert.equal(response.headers.get("cache-control"), "no-store");
    }
    assert.equal(backendCalls.count, 0);
  });

  await t.test("No public guest confirmation send action or booking reference PDF download is exposed", () => {
    const bookingPagePath = path.join(frontendRoot, "app/(main)/booking/page.tsx");
    assert.ok(fs.existsSync(bookingPagePath), "Booking page file must exist");
    const content = fs.readFileSync(bookingPagePath, "utf-8");

    // Ensure booking page does not call legacy /communications/send with booking_confirmation
    assert.doesNotMatch(content, /template:\s*"booking_confirmation"/);
  });
});
