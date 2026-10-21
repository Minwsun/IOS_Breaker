// Offline, synthetic fixtures only. No real Spotify traffic, credentials or network.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const test = require('node:test');

function run(file, request, response) {
  const calls = [];
  const context = { $request: request, $response: response, $done: value => calls.push(value), console: { log() {} } };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), context, { timeout: 2000 });
  assert.equal(calls.length, 1, '$done must run exactly once');
  return calls[0];
}

test('artist request rewrites iPhone platform and port while preserving other query data', () => {
  const result = run('js/spotify-json.js', { url: 'https://ap-spclient.spotify.com:443/artistview/v1/artist/123?platform=iphone&market=VN' });
  assert.equal(result.url, 'https://ap-spclient.spotify.com/artistview/v1/artist/123?platform=ipad&market=VN');
});

test('already compatible requests stay unchanged', () => {
  const url = 'https://spclient.wg.spotify.com/album-entity-view/v2/album/123?platform=ipad';
  assert.equal(run('js/spotify-json.js', { url }).url, url);
});

const request = { url: 'https://spclient.wg.spotify.com/device-capabilities/v1/capabilities' };
test('experimental adapter preserves server-provided quality and HiFi eligibility', () => {
  const input = { effective_license: 'free', audio_quality: 'NORMAL', supports_hifi: { fully_supported: false, user_eligible: false } };
  const result = JSON.parse(run('js/spotify-capabilities-safe.js', request, { status: 200, body: JSON.stringify(input) }).body);
  assert.equal(result.effective_license, 'premium');
  assert.equal(result.audio_quality, input.audio_quality);
  assert.deepEqual(result.supports_hifi, input.supports_hifi);
});

test('missing HiFi object is neither dereferenced nor fabricated', () => {
  const result = JSON.parse(run('js/spotify-capabilities-safe.js', request, { status: 200, body: '{}' }).body);
  assert.equal('supports_hifi' in result, false);
});

for (const body of ['', '{broken', 'null', '[]']) {
  test('invalid payload passes through: ' + JSON.stringify(body), () => {
    assert.deepEqual(Object.keys(run('js/spotify-capabilities-safe.js', request, { status: 200, body })), []);
  });
}

test('server errors pass through untouched', () => {
  assert.deepEqual(Object.keys(run('js/spotify-capabilities-safe.js', request, { status: 503, body: '{"error":"unavailable"}' })), []);
});
