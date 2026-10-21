const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { rewrite } = require('../js/spotify-compatible.js');

// Independent fixture builder and reader; no Spotify API calls or account data.
function scalar(value) {
  const parts = [];
  do { const byte = value % 128; value = Math.floor(value / 128); parts.push(byte + (value ? 128 : 0)); } while (value);
  return Buffer.from(parts);
}
function msg(tag, value) { return Buffer.concat([scalar(tag * 8 + 2), scalar(value.length), value]); }
function num(tag, value) { return Buffer.concat([scalar(tag * 8), scalar(value)]); }
function entry(key, value, extra = Buffer.alloc(0)) {
  return msg(1, Buffer.concat([msg(1, Buffer.from(key)), msg(2, value), extra]));
}
function parse(bytes) {
  let p = 0;
  function read() { let value = 0, scale = 1; while (true) { const n = bytes[p++]; value += (n & 127) * scale; if (!(n & 128)) return value; scale *= 128; } }
  const out = [];
  while (p < bytes.length) {
    const tag = read(), type = tag % 8;
    if (type === 0) out.push({ id: tag / 8 | 0, value: read() });
    else if (type === 2) { const len = read(), value = bytes.subarray(p, p + len); p += len; out.push({ id: tag / 8 | 0, value }); }
    else throw new Error('Fixture reader supports scalar/length fields only');
  }
  return out;
}
const request = { url: 'https://spclient.wg.spotify.com/user-customization-service/v1/customize', method: 'POST' };
const unknown = num(127, 73);
const quality = entry('audio-quality', msg(4, Buffer.from('original-quality')));
const offline = entry('offline', num(2, 0));
function fixture(bootstrap = false) {
  const map = Buffer.concat([entry('ads', Buffer.concat([num(2, 1), num(91, 9)]), num(81, 11)), quality, offline, unknown]);
  const ucs = Buffer.concat([msg(3, map), unknown]);
  const customize = Buffer.concat([msg(1, ucs), unknown]);
  return bootstrap ? Buffer.concat([msg(2, msg(1, msg(1, customize))), unknown]) : customize;
}
function unwrap(bytes, path) { for (const id of path) bytes = parse(bytes).find(f => f.id === id).value; return bytes; }

for (const bootstrap of [false, true]) {
  test((bootstrap ? 'bootstrap' : 'customize') + ': preserves unknown fields and real quality/offline bytes', () => {
    const req = bootstrap ? { ...request, url: 'https://ap-spclient.spotify.com:443/bootstrap/v1/bootstrap?test=1' } : request;
    const output = Buffer.from(rewrite(req, { status: 200, body: fixture(bootstrap) }).body);
    assert.ok(output.subarray(-unknown.length).equals(unknown));
    const customize = bootstrap ? unwrap(output, [2, 1, 1]) : output;
    assert.ok(customize.subarray(-unknown.length).equals(unknown));
    const ucs = unwrap(customize, [1]);
    assert.ok(ucs.subarray(-unknown.length).equals(unknown));
    const map = unwrap(ucs, [3]);
    assert.ok(map.includes(unknown), 'unknown fields on the attribute-map envelope must survive');
    assert.ok(map.includes(quality)); assert.ok(map.includes(offline));
    assert.ok(map.includes(num(81, 11))); assert.ok(map.includes(num(91, 9)));
    const attributes = new Map(parse(map).filter(f => f.id === 1).map(f => {
      const parts = parse(f.value); return [parts.find(f => f.id === 1).value.toString(), parts.find(f => f.id === 2).value];
    }));
    assert.equal(parse(attributes.get('ads')).find(f => f.id === 2).value, 0);
    assert.equal(parse(attributes.get('type')).find(f => f.id === 4).value.toString(), 'premium');
  });
}

test('unknown 64-bit scalar values and fixed-width wire fields survive untouched', () => {
  const bytes = Buffer.concat([fixture(), Buffer.from([0xa0, 0x06, ...Array(9).fill(255), 1]), Buffer.from([0xa9, 0x06, 1,2,3,4,5,6,7,8]), Buffer.from([0xb5,0x06,1,2,3,4])]);
  const originalTail = bytes.subarray(fixture().length);
  assert.ok(Buffer.from(rewrite(request, { status: 200, body: bytes }).body).subarray(-originalTail.length).equals(originalTail));
});

test('nonzero-offset binary views exclude surrounding bytes', () => {
  const bytes = fixture(); const large = Buffer.concat([Buffer.from([255,255]), bytes, Buffer.from([255])]);
  const view = new Uint8Array(large.buffer, large.byteOffset + 2, bytes.length);
  assert.deepEqual(rewrite(request, { status: 200, body: view }).body, rewrite(request, { status: 200, body: bytes }).body);
});

test('Quantumult returns exact ArrayBuffer bytes', () => {
  const input = fixture();
  const response = rewrite(request, { statusCode: 200, bodyBytes: Uint8Array.from(input).buffer }, true);
  assert.ok(response.bodyBytes instanceof ArrayBuffer);
  assert.deepEqual(new Uint8Array(response.bodyBytes), rewrite(request, { status: '200', body: input }).body);
});

for (const body of [undefined, '', new Uint8Array(), Buffer.from([10,99,0]), Buffer.from([0]), msg(2, msg(1, Buffer.from('server error')))]) {
  test('unsupported/invalid response passes through: ' + String(body), () => {
    assert.deepEqual(rewrite(request, { status: 200, body }), {});
  });
}

test('unsupported bootstrap variant remains unchanged', () => {
  assert.deepEqual(rewrite({ ...request, url: request.url.replace('user-customization-service/v1/customize', 'bootstrap/v1/bootstrap') }, { status: 200, body: msg(3, num(1, 7)) }), {});
});

test('non-200, wrong method, untrusted hostname and lookalike paths pass through', () => {
  for (const req of [{ ...request, method: 'GET' }, { ...request, url: request.url + '-other' }, { ...request, url: request.url.replace('spotify.com', 'spotify.com.attacker.test') }]) {
    assert.deepEqual(rewrite(req, { status: 200, body: fixture() }), {});
  }
  for (const status of [304, 401, 500]) assert.deepEqual(rewrite(request, { status, body: fixture() }), {});
});

test('proxy runtime finishes exactly once for malformed or unsupported responses', () => {
  for (const body of [undefined, new Uint8Array(), Buffer.from([10,99,0])]) {
    const calls = [];
    vm.runInNewContext(fs.readFileSync('js/spotify-compatible.js', 'utf8'), {
      Uint8Array, ArrayBuffer, $request: request, $response: { status: 200, body }, $done: result => calls.push(result)
    }, { timeout: 1000 });
    assert.equal(calls.length, 1); assert.deepEqual(Object.keys(calls[0]), []);
  }
});

test('excessive field counts and oversized bodies pass through within bounded work', () => {
  const tooManyFields = Buffer.concat(Array.from({ length: 65537 }, () => num(120, 0)));
  assert.deepEqual(rewrite(request, { status: 200, body: tooManyFields }), {});
  assert.deepEqual(rewrite(request, { status: 200, body: new Uint8Array(4 * 1024 * 1024 + 1) }), {});
});

test('known attribute wire-type drift passes through unchanged', () => {
  const changedSchema = msg(1, msg(3, entry('ads', msg(2, Buffer.from('not-a-boolean')))));
  assert.deepEqual(rewrite(request, { status: 200, body: changedSchema }), {});
});
