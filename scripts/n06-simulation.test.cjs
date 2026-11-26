/* eslint-disable @typescript-eslint/no-require-imports -- Isolated CommonJS test for Next.js route handlers. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test, beforeEach, afterEach } = require('node:test');
const ts = require('typescript');

const rootDir = path.resolve(__dirname, '..');
const compile = (source) => {
  const text = source.replace(/(?:from|require\()\s*["']@\/([^"']+)["']/g, (match, p1) => {
    const resolved = path.resolve(rootDir, p1).replace(/\\/g, '/');
    return match.startsWith('require') ? `require("${resolved}")` : `from "${resolved}"`;
  });
  return ts.transpileModule(text, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
};

require.extensions['.ts'] = (module, file) => module._compile(compile(fs.readFileSync(file, 'utf8')), file);

const simulateRoutePath = path.join(__dirname, '../app/api/dev/payments/[paymentId]/simulate/route.ts');
const callbackRoutePath = path.join(__dirname, '../app/api/packages/payment-callback/route.ts');

const originalFetch = global.fetch;
const originalEnv = {
  NODE_ENV: process.env.NODE_ENV,
  BOOKING_DEV_TEST_ORIGIN: process.env.BOOKING_DEV_TEST_ORIGIN,
  BOOKING_ENVIRONMENT: process.env.BOOKING_ENVIRONMENT,
  BOOKING_BACKEND_URL: process.env.BOOKING_BACKEND_URL,
  BOOKING_API_KEY: process.env.BOOKING_API_KEY,
};

const loadRoute = (routePath) => {
  delete require.cache[require.resolve(routePath)];
  return require(routePath);
};

beforeEach(() => {
  process.env.NODE_ENV = 'development';
  process.env.BOOKING_DEV_TEST_ORIGIN = 'http://localhost:3030';
  process.env.BOOKING_BACKEND_URL = 'http://127.0.0.1:4040';
  process.env.BOOKING_API_KEY = 'test-api-key';
  process.env.BOOKING_ENVIRONMENT = 'development';
});

afterEach(() => {
  global.fetch = originalFetch;
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
});

test('simulation route is absent in production', async () => {
  process.env.BOOKING_ENVIRONMENT = 'production';
  const route = loadRoute(simulateRoutePath);
  const req = new Request('http://localhost:3030/api/dev/payments/pay_sim_1/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Host: 'localhost:3030', Origin: 'http://localhost:3030' },
    body: JSON.stringify({ scenario: 'success' }),
  });
  const res = await route.POST(req, { params: Promise.resolve({ paymentId: 'pay_sim_1' }) });
  assert.equal(res.status, 404);
  const data = await res.json();
  assert.match(data.error, /disabled in production/i);
});

test('simulation route is absent in staging', async () => {
  process.env.BOOKING_ENVIRONMENT = 'staging';
  const route = loadRoute(simulateRoutePath);
  const req = new Request('http://localhost:3030/api/dev/payments/pay_sim_1/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Host: 'localhost:3030', Origin: 'http://localhost:3030' },
    body: JSON.stringify({ scenario: 'success' }),
  });
  const res = await route.POST(req, { params: Promise.resolve({ paymentId: 'pay_sim_1' }) });
  assert.equal(res.status, 404);
});

test('simulation route rejects malformed JSON before forwarding', async () => {
  let forwarded = false;
  global.fetch = async () => { forwarded = true; throw new Error('unexpected request'); };
  const route = loadRoute(simulateRoutePath);
  const req = new Request('http://localhost:3030/api/dev/payments/pay_sim_1/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Host: 'localhost:3030', Origin: 'http://localhost:3030' },
    body: '{',
  });
  const res = await route.POST(req, { params: Promise.resolve({ paymentId: 'pay_sim_1' }) });
  assert.equal(res.status, 400);
  assert.equal(forwarded, false);
});

test('simulation route rejects a mismatched Origin', async () => {
  const route = loadRoute(simulateRoutePath);
  const req = new Request('http://localhost:3030/api/dev/payments/pay_sim_1/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Host: 'localhost:3030', Origin: 'https://evil.example' },
    body: JSON.stringify({ scenario: 'success' }),
  });
  const res = await route.POST(req, { params: Promise.resolve({ paymentId: 'pay_sim_1' }) });
  assert.equal(res.status, 403);
});

test('simulation route rejects a scenario that is not allowlisted', async () => {
  const route = loadRoute(simulateRoutePath);
  const req = new Request('http://localhost:3030/api/dev/payments/pay_sim_1/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Host: 'localhost:3030', Origin: 'http://localhost:3030' },
    body: JSON.stringify({ scenario: 'refund_everything' }),
  });
  const res = await route.POST(req, { params: Promise.resolve({ paymentId: 'pay_sim_1' }) });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.match(data.error, /invalid scenario/i);
});

test('simulation route forwards only the allowlisted facts and the server API key', async () => {
  let requestedUrl = '';
  let requestedBody = '';
  let requestedHeaders = {};
  global.fetch = async (url, options) => {
    requestedUrl = String(url);
    requestedBody = options.body;
    requestedHeaders = options.headers;
    return new Response(JSON.stringify({
      status: 'success',
      payment_status: 'verified_paid',
      evidence_source: 'simulation',
      is_test: true,
      commit_result: { status: 'confirmed', stage: 'completed' },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  const route = loadRoute(simulateRoutePath);
  const req = new Request('http://localhost:3030/api/dev/payments/pay_sim_1/simulate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Host: 'localhost:3030', Origin: 'http://localhost:3030' },
    body: JSON.stringify({ scenario: 'success', amount: '1.00', payment_verified: true }),
  });
  const res = await route.POST(req, { params: Promise.resolve({ paymentId: 'pay_sim_1' }) });
  assert.equal(res.status, 200);
  assert.equal(requestedUrl, 'http://127.0.0.1:4040/dev/payments/pay_sim_1/simulate');
  assert.equal(requestedHeaders['X-API-Key'], 'test-api-key');
  assert.deepEqual(JSON.parse(requestedBody), { scenario: 'success' });
  const data = await res.json();
  assert.equal(data.commit_result.status, 'confirmed');
  assert.equal(res.headers.get('cache-control'), 'no-store');
});

test('payment callback rejects unsigned browser payloads', async () => {
  let fetched = false;
  global.fetch = async () => {
    fetched = true;
    return new Response('{}', { status: 200 });
  };
  const route = loadRoute(callbackRoutePath);
  const req = new Request('http://localhost:3030/api/packages/payment-callback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Host: 'localhost:3030', Origin: 'http://localhost:3030' },
    body: JSON.stringify({ payment_id: 'pay_legacy_1', status: 'paid', amount: '195.00' }),
  });
  const res = await route.POST(req);
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.match(data.error, /signature is required/i);
  assert.equal(fetched, false);
});
