const test = require('node:test');
const assert = require('node:assert/strict');
const { run, mappingRecords } = require('../js/revenuecat-compatible.js');

const request = {
  url: 'https://api.revenuecat.com/v1/subscribers/synthetic-user',
  headers: { Authorization: 'Bearer synthetic_public_sdk_key', 'User-Agent': '1Blocker/6.7' }
};
const original = {
  request_date: '2026-10-21T00:00:00Z', custom_root: 'preserved',
  subscriber: {
    original_app_user_id: 'synthetic-user', first_seen: '2020-01-01T00:00:00Z',
    entitlements: { unrelated: { product_identifier: 'other', marker: 'keep' }, premium: { product_identifier: 'real.annual', purchase_date: '2021-01-01T00:00:00Z', marker: 'keep' } },
    subscriptions: { 'real.annual': { purchase_date: '2021-01-01T00:00:00Z', transaction_id: 'synthetic-transaction', custom: 7 }, other: { marker: 'keep' } },
    non_subscriptions: { known_lifetime: [{ marker: 'keep' }] }, management_url: 'https://example.invalid/manage'
  }
};
const mapping = { product_entitlement_mapping: {
  monthly: { product_identifier: 'real.monthly', entitlements: ['premium'] },
  annual: { product_identifier: 'real.annual', entitlements: ['premium', 'extras'] }
} };
function execute(options = {}) {
  const results = [], lookups = [], events = [];
  const api = {
    now: () => new Date('2026-10-21T00:00:00Z'),
    get: (req, callback) => { lookups.push(req); callback(null, { status: 200 }, JSON.stringify(mapping)); },
    ...options.api
  };
  run(options.request || request,
    options.requestOnly ? undefined : options.response || { status: 200, body: JSON.stringify(original) },
    api, result => results.push(result), options.argument || '');
  return { results, lookups, events };
}

test('discovers real identifiers, preserves identity/unrelated data and prefers existing product', () => {
  const { results, lookups } = execute();
  assert.equal(results.length, 1);
  const output = JSON.parse(results[0].body);
  assert.equal(output.subscriber.original_app_user_id, original.subscriber.original_app_user_id);
  assert.equal(output.custom_root, original.custom_root);
  assert.deepEqual(output.subscriber.entitlements.unrelated, original.subscriber.entitlements.unrelated);
  assert.deepEqual(output.subscriber.subscriptions.other, original.subscriber.subscriptions.other);
  assert.deepEqual(output.subscriber.non_subscriptions, original.subscriber.non_subscriptions);
  assert.equal(output.subscriber.entitlements.premium.product_identifier, 'real.annual');
  assert.equal(output.subscriber.entitlements.premium.marker, 'keep');
  assert.equal(output.subscriber.subscriptions['real.annual'].transaction_id, 'synthetic-transaction');
  assert.equal(output.subscriber.subscriptions['real.annual'].custom, 7);
  assert.equal(output.subscriber.subscriptions['real.annual'].purchase_date, '2021-01-01T00:00:00Z');
  assert.equal(output.subscriber.entitlements.extras.product_identifier, 'real.annual');
  assert.equal(lookups[0].url, 'https://api.revenuecat.com/v1/product_entitlement_mapping');
  assert.deepEqual(Object.keys(lookups[0].headers).sort(), ['Authorization', 'X-Platform']);
});

test('header matching is case insensitive; backup lookup stays on the same provider host', () => {
  const { results, lookups } = execute({ request: { ...request, url: request.url.replace('api.revenuecat.com', 'api.rc-backup.com'), headers: { authorization: request.headers.Authorization } } });
  assert.equal(results.length, 1); assert.ok(results[0].body);
  assert.equal(lookups[0].url, 'https://api.rc-backup.com/v1/product_entitlement_mapping');
});

test('raw snake-case and explicitly supported camel-case mapping envelopes parse equivalently', () => {
  const camel = { productEntitlementMapping: { p: { productIdentifier: 'actual.product', entitlements: ['actual.entitlement'] } } };
  assert.deepEqual(mappingRecords(camel), [{ product: 'actual.product', entitlement: 'actual.entitlement' }]);
  assert.throws(() => mappingRecords({ ...mapping, ...camel }));
});

test('unexpected request methods pass through without lookups', () => {
  for (const method of ['DELETE', 'PATCH', 'POST']) {
    const output = execute({ request: { ...request, method } });
    assert.deepEqual(output.results, [{}]); assert.equal(output.lookups.length, 0);
  }
});

test('existing entitlement with product outside mapping is preserved', () => {
  const customer = JSON.parse(JSON.stringify(original));
  customer.subscriber.entitlements.premium.product_identifier = 'retired.product';
  const output = execute({ response: { status: 200, body: JSON.stringify(customer) } });
  assert.deepEqual(JSON.parse(output.results[0].body).subscriber.entitlements.premium,
    customer.subscriber.entitlements.premium);
});

test('request phase actually removes all ETag casings without disturbing Authorization', () => {
  const req = { ...request, headers: { ...request.headers, 'X-RevenueCat-ETag': 'one', 'x-revenuecat-etag': 'two', Other: 'keep' } };
  const { results, lookups } = execute({ request: req, requestOnly: true });
  assert.equal(results.length, 1); assert.equal(lookups.length, 0);
  assert.equal(results[0].headers.Other, 'keep'); assert.equal(results[0].headers.Authorization, request.headers.Authorization);
  assert.equal(Object.keys(results[0].headers).filter(k => /etag/i.test(k)).length, 0);
  assert.equal(req.headers['X-RevenueCat-ETag'], 'one', 'input headers are not mutated');
});

test('app-scoped mode passes unrelated app traffic without a lookup or response edit', () => {
  const { results, lookups } = execute({ argument: 'ua=ScannerPro%7CPillow' });
  assert.deepEqual(results, [{}]); assert.equal(lookups.length, 0);
  assert.ok(execute({ argument: 'ua=1Blocker%7CBlockerX' }).results[0].body);
});

for (const signature of ['X-Signature', 'x-revenuecat-signature']) {
  test('signed responses are not modified: ' + signature, () => {
    const { results, lookups } = execute({ response: { status: 200, body: JSON.stringify(original), headers: { [signature]: 'synthetic-signature' } } });
    assert.deepEqual(results, [{}]); assert.equal(lookups.length, 0);
  });
}

for (const body of ['', '{broken', 'null', '{}', '{"subscriber":null}', '{"subscriber":{}}']) {
  test('invalid customer passes through: ' + body, () => {
    const { results, lookups } = execute({ response: { status: 200, body } });
    assert.deepEqual(results, [{}]); assert.equal(lookups.length, 0);
  });
}

test('unsupported hosts, paths, protocols, status, missing auth and CRLF auth never trigger a lookup', () => {
  for (const req of [
    { ...request, url: request.url.replace('revenuecat.com', 'revenuecat.com.evil.invalid') },
    { ...request, url: request.url.replace('https:', 'http:') },
    { ...request, url: 'https://api.revenuecat.com/v1/other' },
    { ...request, headers: {} },
    { ...request, headers: { Authorization: 'Bearer test\r\nInjected: yes' } }
  ]) { const result = execute({ request: req }); assert.deepEqual(result.results, [{}]); assert.equal(result.lookups.length, 0); }
  for (const status of [304, 401, 503]) {
    const result = execute({ response: { status, body: JSON.stringify(original) } });
    assert.deepEqual(result.results, [{}]); assert.equal(result.lookups.length, 0);
  }
});

for (const lookupResult of [
  [new Error('offline'), undefined, undefined], [null, { status: 401 }, '{}'],
  [null, { status: 200 }, '{bad'], [null, { status: 200 }, '{}'],
  [null, { status: 200 }, '{"product_entitlement_mapping":{}}'],
  [null, { status: 200 }, '{"product_entitlement_mapping":{"p":{"product_identifier":"__proto__","entitlements":["premium"]}}}']
]) {
  test('lookup failure or invalid mapping completes once without editing the customer', () => {
    const { results } = execute({ api: { get: (_, callback) => { callback(...lookupResult); callback(...lookupResult); } } });
    assert.deepEqual(results, [{}]); assert.equal({}.premium, undefined);
  });
}

test('timeout wins over a late response, with exactly one completion', () => {
  let timeout, callback; const results = [];
  run(request, { status: 200, body: JSON.stringify(original) }, {
    get: (_, cb) => { callback = cb; }, setTimeout: cb => { timeout = cb; return 1; }, clearTimeout() {}
  }, value => results.push(value));
  timeout(); callback(null, { status: 200 }, JSON.stringify(mapping)); timeout();
  assert.deepEqual(results, [{}]);
});

test('a throwing HTTP client passes through once', () => {
  const { results } = execute({ api: { get() { throw new Error('HTTP client unavailable'); } } });
  assert.deepEqual(results, [{}]);
});

test('app selectors do not accidentally match a different app sharing a name fragment', () => {
  const result = execute({ argument: 'ua=Grow', request: { ...request, headers: { ...request.headers, 'User-Agent': 'GrowingOtherApp/1.0' } } });
  assert.deepEqual(result.results, [{}]); assert.equal(result.lookups.length, 0);
});

test('Android base plans are skipped rather than converted into App Store product IDs', () => {
  assert.deepEqual(mappingRecords({ product_entitlement_mapping: {
    'subscription:base-plan': { product_identifier: 'subscription', base_plan_id: 'base-plan', entitlements: ['android-only'] },
    'ios-product': { product_identifier: 'actual.ios.product', entitlements: ['ios-premium'] }
  } }), [{ product: 'actual.ios.product', entitlement: 'ios-premium' }]);
});
