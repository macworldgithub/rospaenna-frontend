/* eslint-disable @typescript-eslint/no-require-imports -- This isolated CommonJS test loads TypeScript helpers through a local module hook. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test, beforeEach, afterEach } = require('node:test');
const ts = require('typescript');

// Execute the server helpers in an isolated Node test process; no network calls.
const compile = source => ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
require.extensions['.ts'] = (module, file) => module._compile(compile(fs.readFileSync(file, 'utf8')), file);
const clientPath = path.join(__dirname, '../lib/brsGolfClient.ts');
const bridge = require('../lib/bookingBackend.ts');
const originals = { fetch: global.fetch, now: Date.now, warn: console.warn, error: console.error };
let client, now, calls, logs;

beforeEach(() => {
  delete global.rosapennaCheckoutRequestState;
  delete require.cache[require.resolve(clientPath)];
  process.env.BRS_GOLF_COOKIE = 'BRSVisitors.Session=fixture-session';
  process.env.BRS_GOLF_XSRF_TOKEN = 'fixture-xsrf';
  delete process.env.BRS_CHECKOUT_COOLDOWN_SECONDS;
  now = 1800000000000;
  Date.now = () => now;
  calls = 0;
  logs = [];
  console.warn = console.error = (...args) => logs.push(args.join(' '));
  global.fetch = async () => {
    calls++;
    return new Response('{"bookingId":"fixture-reference"}', { status: 200 });
  };
  client = require(clientPath);
});

afterEach(() => {
  global.fetch = originals.fetch;
  Date.now = originals.now;
  console.warn = originals.warn;
  console.error = originals.error;
  delete global.rosapennaCheckoutRequestState;
});

test('BRS Retry-After blocks repeat requests until the deadline, then permits one', async () => {
  global.fetch = async () => {
    calls++;
    return new Response('{}', { status: 429, headers: { 'Retry-After': '120' } });
  };
  await assert.rejects(client.prepareCheckout({}), error => error.status === 429 && error.retryAfterSeconds === 120);
  now += 30000;
  await assert.rejects(client.prepareCheckout({}), error => error.status === 429 && error.retryAfterSeconds === 90);
  assert.equal(calls, 1);
  now += 90001;
  global.fetch = async () => { calls++; return new Response('{"bookingId":"fixture-reference"}'); };
  assert.equal((await client.prepareCheckout({})).bookingId, 'fixture-reference');
  assert.equal(calls, 2);
});

test('missing retry guidance uses a local pause that survives module reloads', async () => {
  global.fetch = async () => { calls++; return new Response('{}', { status: 429 }); };
  await assert.rejects(client.prepareCheckout({}), error => error.retryAfterSeconds === 300);
  delete require.cache[require.resolve(clientPath)];
  const reloaded = require(clientPath);
  await assert.rejects(reloaded.prepareCheckout({}), error => error.status === 429 && error.retryAfterSeconds === 300);
  assert.equal(calls, 1);
  assert.ok(logs.some(line => line.includes('upstream retry time unknown')));
  assert.ok(logs.every(line => !line.includes('fixture-session') && !line.includes('fixture-xsrf')));
});

test('a configured pause is bounded and an HTTP-date Retry-After is respected', async () => {
  process.env.BRS_CHECKOUT_COOLDOWN_SECONDS = '1';
  global.fetch = async () => { calls++; return new Response('{}', { status: 429 }); };
  await assert.rejects(client.prepareCheckout({}), error => error.retryAfterSeconds === 300);
  now += 300001;
  global.fetch = async () => {
    calls++;
    return new Response('{}', { status: 429, headers: { 'Retry-After': new Date(now + 90000).toUTCString() } });
  };
  await assert.rejects(client.prepareCheckout({}), error => error.retryAfterSeconds >= 89 && error.retryAfterSeconds <= 90);
  assert.equal(calls, 2);
});

test('concurrent preparation is rejected locally and the gate releases after completion or failure', async () => {
  let finish;
  global.fetch = () => { calls++; return new Promise(resolve => { finish = resolve; }); };
  const first = client.prepareCheckout({});
  await assert.rejects(client.prepareCheckout({}), error => error.status === 429 && error.retryAfterSeconds === 1);
  assert.equal(calls, 1);
  finish(new Response('{"bookingId":"fixture-reference"}'));
  await first;
  global.fetch = async () => { calls++; throw new TypeError('fixture network failure'); };
  await assert.rejects(client.prepareCheckout({}), error => error.status === 503);
  global.fetch = async () => { calls++; return new Response('{"bookingId":"fixture-reference"}'); };
  await client.prepareCheckout({});
  assert.equal(calls, 3);
});

test('the checkout route returns a local cooldown before backend revalidation or vendor preparation', async () => {
  global.fetch = async () => { calls++; return new Response('{}', { status: 429, headers: { 'Retry-After': '180' } }); };
  await assert.rejects(client.prepareCheckout({}));
  let backendCalls = 0;
  const routeModule = { exports: {} };
  const dependencies = {
    'node:crypto': require('node:crypto'),
    'next/server': { NextResponse: { json: (body, options) => ({ body, ...options }) } },
    '@/lib/brsGolfClient': client,
    '@/lib/bookingBackend': { ...bridge, bookingBackend: async () => { backendCalls++; throw new Error('Unexpected backend call'); } },
  };
  new Function('require', 'module', 'exports', compile(fs.readFileSync(path.join(__dirname, '../app/api/checkout/route.ts'), 'utf8')))(
    name => { assert.ok(dependencies[name]); return dependencies[name]; }, routeModule, routeModule.exports,
  );
  const payload = { date: '2026-10-23', course: { id: 1 }, teeTime: { id: 101, time: '10:00' },
    greenFee: { id: 7, num_holes: '18', package_name: 'Standard Visitor' },
    price: '200.00', currency: 'EUR', marketing: { terms: true }, players: { '1': {
      first_name: 'Test', last_name: 'Guest', country: 'England', email: 'test@example.com',
      telephone: '+441632960000', club: 'Test', handicap: '18',
    } } };
  const response = await routeModule.exports.POST({
    headers: { get: name => name === 'Idempotency-Key'
      ? '11111111-1111-4111-8111-111111111111'
      : name === 'X-Checkout-Attempt-Key' ? '22222222-2222-4222-8222-222222222222' : null },
    json: async () => payload,
  });
  assert.equal(response.status, 429);
  assert.equal(response.headers['Retry-After'], '180');
  assert.equal(backendCalls, 0);
  assert.equal(calls, 1);
});

function loadCheckoutRoute({ preparation, initialStage = 'draft' } = {}) {
  const routeModule = { exports: {} };
  const actions = [];
  const backendCalls = [];
  let intent = {
    booking_intent_id: 'bki_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    stage: initialStage,
    revision: initialStage === 'draft' ? 1 : 3,
    actions: initialStage === 'checkout_preparation_pending'
      ? [{ action: 'checkout_preparation_started' }] : [],
  };
  const checked = {
    valid: true, price: '200.00', currency: 'EUR',
    teeTime: { id: 101, time: '10:00', holes: '18' },
    greenFee: { id: 7, num_holes: 18, package_description: 'Synthetic rate' },
    course: { id: 1, facilities_id: 5797, name: 'Old Tom Morris Links' },
  };
  const mockBackend = async (path, body, headers) => {
    backendCalls.push({ path, body, headers });
    if (path === '/booking-intents') return intent;
    if (path === '/teesheets/revalidate') return checked;
    if (path.endsWith('/actions')) {
      actions.push(body);
      const stages = {
        live_revalidation_passed: 'quote_revalidated',
        checkout_preparation_started: 'checkout_preparation_pending',
        checkout_preparation_response_received: 'checkout_preparation_response_received',
        checkout_preparation_failed: 'checkout_preparation_failed',
        checkout_preparation_blocked: 'checkout_preparation_blocked',
        checkout_preparation_outcome_unknown: 'recovery_required',
      };
      intent = {
        ...intent, stage: stages[body.action] || intent.stage,
        revision: intent.revision + 1,
        actions: [...intent.actions, { action: body.action, evidence: { status_code: body.status_code } }],
      };
      return intent;
    }
    throw new Error(`Unexpected backend path ${path}`);
  };
  const deps = {
    'node:crypto': require('node:crypto'),
    'next/server': { NextResponse: { json: (body, options = {}) => ({ body, ...options }) } },
    '@/lib/brsGolfClient': {
      assertCheckoutAvailable: () => {},
      requireCheckoutConfiguration: () => {},
      prepareCheckoutWithEvidence: preparation || (async () => ({ data: { fixture: true }, statusCode: 200 })),
    },
    '@/lib/bookingBackend': { ...bridge, bookingBackend: mockBackend },
  };
  new Function('require', 'module', 'exports', compile(fs.readFileSync(path.join(__dirname, '../app/api/checkout/route.ts'), 'utf8')))(
    name => { assert.ok(deps[name], `Missing route dependency ${name}`); return deps[name]; }, routeModule, routeModule.exports,
  );
  const payload = { date: '2026-10-23', course: { id: 1 }, teeTime: { id: 101, time: '10:00' },
    greenFee: { id: 7, num_holes: '18', package_name: 'Standard Visitor' },
    price: '200.00', currency: 'EUR', marketing: { terms: true }, players: { '1': {
      first_name: 'Synthetic', last_name: 'Guest', country: 'Ireland', email: 'synthetic@example.test',
      telephone: '+441632960000', club: 'Test Club', handicap: '18',
    } } };
  const req = { headers: { get: name => name === 'Idempotency-Key'
    ? '33333333-3333-4333-8333-333333333333'
    : name === 'X-Checkout-Attempt-Key' ? '44444444-4444-4444-8444-444444444444' : null },
    json: async () => payload };
  return { route: routeModule.exports, req, backendCalls, actions, getIntent: () => intent };
}

test('checkout creates an idempotent draft, records quote evidence, and stores the preparation response stage', async () => {
  const fixture = loadCheckoutRoute();
  const response = await fixture.route.POST(fixture.req);
  assert.equal(response.status, undefined);
  assert.equal(response.body.bookingIntentId, 'bki_aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
  assert.equal(response.body.bookingIntentStage, 'checkout_preparation_response_received');
  assert.equal(fixture.backendCalls[0].path, '/booking-intents');
  assert.equal(fixture.backendCalls[0].headers['Idempotency-Key'], '33333333-3333-4333-8333-333333333333');
  assert.equal(fixture.backendCalls[0].body.lead_guest.email, 'synthetic@example.test');
  assert.equal('card_details' in fixture.backendCalls[0].body, false);
  assert.deepEqual(fixture.actions.map(action => action.action), [
    'live_revalidation_passed', 'checkout_preparation_started', 'checkout_preparation_response_received',
  ]);
  assert.equal(fixture.actions[0].quote.price, '200.00');
});

test('a BRS 429 is recorded as a failed preparation response without claiming payment or reservation', async () => {
  const fixture = loadCheckoutRoute({ preparation: async () => {
    throw new bridge.BookingBackendError('Rate limited', 429, 120, 'upstream_response');
  } });
  const response = await fixture.route.POST(fixture.req);
  assert.equal(response.status, 429);
  assert.equal(response.headers['Retry-After'], '120');
  assert.equal(response.body.bookingIntentStage, 'checkout_preparation_failed');
  assert.equal(fixture.actions.at(-1).action, 'checkout_preparation_failed');
  assert.equal(fixture.actions.at(-1).status_code, 429);
  assert.equal(fixture.getIntent().stage, 'checkout_preparation_failed');
});

test('a checkout timeout is recorded as recovery required instead of a failure or confirmation', async () => {
  const fixture = loadCheckoutRoute({ preparation: async () => {
    throw new bridge.BookingBackendError('Request outcome unknown', 504, undefined, 'upstream_unknown');
  } });
  const response = await fixture.route.POST(fixture.req);
  assert.equal(response.status, 504);
  assert.equal(response.body.bookingIntentStage, 'recovery_required');
  assert.equal(fixture.actions.at(-1).action, 'checkout_preparation_outcome_unknown');
  assert.equal(fixture.actions.at(-1).status_code, undefined);
  assert.equal(fixture.getIntent().stage, 'recovery_required');
});

test('a repeated request with an in-progress draft does not prepare checkout again', async () => {
  const fixture = loadCheckoutRoute({ initialStage: 'checkout_preparation_pending' });
  const response = await fixture.route.POST(fixture.req);
  assert.equal(response.status, 409);
  assert.equal(response.body.bookingIntentStage, 'checkout_preparation_pending');
  assert.deepEqual(fixture.backendCalls.map(call => call.path), ['/booking-intents']);
});
