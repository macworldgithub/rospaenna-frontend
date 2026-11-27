/* eslint-disable @typescript-eslint/no-require-imports -- This isolated CommonJS test loads TypeScript helpers through a local module hook. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test, beforeEach, afterEach } = require('node:test');
const ts = require('typescript');

const rootDir = path.resolve(__dirname, '..');
const compile = (source, filename) => {
  let text = source.replace(/(?:from|require\()\s*["']@\/([^"']+)["']/g, (match, p1) => {
    const resolved = path.resolve(rootDir, p1).replace(/\\/g, '/');
    return match.startsWith('require') ? `require("${resolved}")` : `from "${resolved}"`;
  });
  return ts.transpileModule(text, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
};

require.extensions['.ts'] = (module, file) => module._compile(compile(fs.readFileSync(file, 'utf8'), file), file);

const routePath = path.join(__dirname, '../app/api/booking-intents/[id]/route.ts');
const originals = { fetch: global.fetch };
let route;

beforeEach(() => {
  delete require.cache[require.resolve(routePath)];
  process.env.BOOKING_BACKEND_URL = 'http://127.0.0.1:4040';
  process.env.BOOKING_API_KEY = 'test-api-key';
  route = require(routePath);
});

afterEach(() => {
  global.fetch = originals.fetch;
});

test('GET /api/booking-intents/[id] rejects empty id with 400', async () => {
  const req = new Request('http://localhost:3000/api/booking-intents/%20');
  const res = await route.GET(req, { params: Promise.resolve({ id: '   ' }) });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.match(data.error, /required/i);
});

test('GET /api/booking-intents/[id] routes bki_ to /booking-intents/{id}', async () => {
  let requestedUrl = '';
  let requestedHeaders = {};
  global.fetch = async (url, options) => {
    requestedUrl = String(url);
    requestedHeaders = options.headers;
    return new Response(JSON.stringify({
      booking_intent_id: 'bki_1234567890abcdef1234567890abcdef',
      stage: 'quote_revalidated',
      payment_state: 'not_started',
      reservation_state: 'not_confirmed',
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  const req = new Request('http://localhost:3000/api/booking-intents/bki_1234567890abcdef1234567890abcdef');
  const res = await route.GET(req, { params: Promise.resolve({ id: 'bki_1234567890abcdef1234567890abcdef' }) });
  assert.equal(res.status, 200);
  assert.equal(requestedUrl, 'http://127.0.0.1:4040/booking-intents/bki_1234567890abcdef1234567890abcdef');
  assert.equal(requestedHeaders['X-API-Key'], 'test-api-key');
  const data = await res.json();
  assert.equal(data.stage, 'quote_revalidated');
  assert.equal(data.payment_state, 'not_started');
  assert.equal(data.reservation_state, 'not_confirmed');
});

test('GET /api/booking-intents/[id] routes reference code to /booking-intents/by-reference/{ref}', async () => {
  let requestedUrl = '';
  global.fetch = async (url) => {
    requestedUrl = String(url);
    return new Response(JSON.stringify({
      booking_intent_id: 'bki_abc',
      booking_reference: 'RSP-20270610-XYZ123',
      stage: 'confirmed',
      payment_state: 'deposit_paid',
      reservation_state: 'confirmed',
      links: {
        opera_reservation: {
          confirmation_number: 'CONF-99001',
          reservation_id: 'RES-7788',
        },
      },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  const req = new Request('http://localhost:3000/api/booking-intents/RSP-20270610-XYZ123');
  const res = await route.GET(req, { params: Promise.resolve({ id: 'RSP-20270610-XYZ123' }) });
  assert.equal(res.status, 200);
  assert.equal(requestedUrl, 'http://127.0.0.1:4040/booking-intents/by-reference/RSP-20270610-XYZ123');
  const data = await res.json();
  assert.equal(data.stage, 'confirmed');
  assert.equal(data.reservation_state, 'confirmed');
  assert.equal(data.links.opera_reservation.confirmation_number, 'CONF-99001');
});

test('GET /api/booking-intents/[id] forwards 404 when booking is not found', async () => {
  global.fetch = async () => new Response(JSON.stringify({ detail: 'Booking record was not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });

  const req = new Request('http://localhost:3000/api/booking-intents/RSP-UNKNOWN');
  const res = await route.GET(req, { params: Promise.resolve({ id: 'RSP-UNKNOWN' }) });
  assert.equal(res.status, 404);
  const data = await res.json();
  assert.equal(data.error, 'Booking record was not found');
});

test('payment status forwards only payment and booking states', async () => {
  const paymentStatusRoute = require('../app/api/packages/payments/[id]/route.ts');
  global.fetch = async (url, options) => {
    assert.equal(String(url), 'http://127.0.0.1:4040/packages/payments/pay_fixture');
    assert.equal(options.cache, 'no-store');
    assert.equal(options.headers['X-Checkout-Capability'], 'B'.repeat(43));
    return Response.json({
      status: 'verified_paid',
      booking_status: 'needs_review',
      guest_email: 'guest@example.invalid',
      vendor_reference: 'private-fixture',
    });
  };

  const req = new Request('http://localhost:3000/api/packages/payments/pay_fixture', { headers: { Cookie: 'rp_checkout=' + 'B'.repeat(43) } });
  const response = await paymentStatusRoute.GET(req, { params: Promise.resolve({ id: 'pay_fixture' }) });
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await response.json(), {
    status: 'verified_paid',
    booking_status: 'needs_review',
  });
});

test('payment status rejects an invalid reference before contacting the backend', async () => {
  const paymentStatusRoute = require('../app/api/packages/payments/[id]/route.ts');
  global.fetch = async () => assert.fail('No backend request expected');
  const req = new Request('http://localhost:3000/api/packages/payments/invalid', { headers: { Cookie: 'rp_checkout=' + 'B'.repeat(43) } });
  const response = await paymentStatusRoute.GET(req, { params: Promise.resolve({ id: '../invalid' }) });
  assert.equal(response.status, 400);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('payment status answers 404 without a valid checkout cookie and never contacts the backend', async () => {
  const paymentStatusRoute = require('../app/api/packages/payments/[id]/route.ts');
  global.fetch = async () => assert.fail('No backend request expected');
  for (const cookie of [undefined, 'rp_checkout=short', 'other=' + 'B'.repeat(43)]) {
    const req = new Request('http://localhost:3000/api/packages/payments/pay_fixture', cookie ? { headers: { Cookie: cookie } } : undefined);
    const response = await paymentStatusRoute.GET(req, { params: Promise.resolve({ id: 'pay_fixture' }) });
    assert.equal(response.status, 404);
  }
});
