// Local compatibility implementation. Wire field numbers are documented by
// app2smile/rules at df6366a7024e0b3f0aa3510c5b791eea6f3cba89 (MIT).
// Unlike a schema decode/re-encode, untouched protobuf fields remain verbatim.
// This changes client attributes only; it cannot grant server-backed purchases.
(() => {
  'use strict';
  const MAX_SIZE = 4 * 1024 * 1024;

  function join(parts) {
    const length = parts.reduce((sum, part) => sum + part.length, 0);
    if (length > MAX_SIZE) throw new Error('Message too large');
    const result = new Uint8Array(length);
    let offset = 0;
    for (const part of parts) { result.set(part, offset); offset += part.length; }
    return result;
  }

  function varint(value) {
    const bytes = [];
    do {
      const next = value % 128;
      value = Math.floor(value / 128);
      bytes.push(next + (value ? 128 : 0));
    } while (value);
    return new Uint8Array(bytes);
  }

  function readNumber(bytes, cursor) {
    let value = 0, scale = 1;
    for (let i = 0; i < 5; i++) {
      if (cursor.pos >= bytes.length) throw new Error('Truncated varint');
      const byte = bytes[cursor.pos++];
      value += (byte & 127) * scale;
      if (value > 0xffffffff) throw new Error('Oversized tag or length');
      if (!(byte & 128)) return value;
      scale *= 128;
    }
    throw new Error('Invalid varint');
  }

  function fields(bytes) {
    const result = [], cursor = { pos: 0 };
    while (cursor.pos < bytes.length) {
      if (result.length >= 65536) throw new Error('Too many protobuf fields');
      const start = cursor.pos, tag = readNumber(bytes, cursor);
      const number = Math.floor(tag / 8), wire = tag % 8;
      if (!number) throw new Error('Invalid field number');
      let payload;
      if (wire === 2) {
        const length = readNumber(bytes, cursor), begin = cursor.pos;
        cursor.pos += length;
        payload = bytes.subarray(begin, cursor.pos);
      } else if (wire === 0) {
        let ended = false;
        for (let i = 0; i < 10; i++) {
          if (cursor.pos >= bytes.length) throw new Error('Truncated scalar');
          const byte = bytes[cursor.pos++];
          if (i === 9 && byte > 1) throw new Error('Oversized scalar');
          if (!(byte & 128)) { ended = true; break; }
        }
        if (!ended) throw new Error('Invalid scalar');
      } else if (wire === 1) cursor.pos += 8;
      else if (wire === 5) cursor.pos += 4;
      else throw new Error('Unsupported protobuf group');
      if (cursor.pos > bytes.length) throw new Error('Truncated field');
      result.push({ number, wire, payload, raw: bytes.subarray(start, cursor.pos) });
    }
    return result;
  }

  function message(number, payload) {
    return join([varint(number * 8 + 2), varint(payload.length), payload]);
  }

  function ascii(value) {
    return new Uint8Array(value.split('').map(char => char.charCodeAt(0)));
  }

  function text(bytes) {
    if (bytes.length > 1024) return null;
    let result = '';
    for (let i = 0; i < bytes.length; i++) {
      if (bytes[i] > 127) return null;
      result += String.fromCharCode(bytes[i]);
    }
    return result;
  }

  // Smallest set of client options; retain real quality/offline/HiFi information.
  const attributes = {
    type: 'premium', catalogue: 'premium', 'player-license': 'premium',
    ads: false, shuffle: false, 'pick-and-shuffle': false,
    unrestricted: true, 'on-demand': true,
    'com.spotify.madprops.use.ucs.product.state': true,
    'com.spotify.madprops.delivered.by.ucs': true
  };

  function patchValue(bytes, value) {
    const parsed = fields(bytes);
    if (parsed.some(field => (field.number === 2 || field.number === 3) && field.wire !== 0 ||
      field.number === 4 && field.wire !== 2)) throw new Error('Changed account attribute schema');
    const retained = parsed.filter(field => ![2, 3, 4].includes(field.number));
    const encoded = typeof value === 'boolean'
      ? new Uint8Array([16, value ? 1 : 0]) : message(4, ascii(value));
    return join(retained.map(field => field.raw).concat([encoded]));
  }

  function patchAttributes(bytes) {
    const parsed = fields(bytes), seen = Object.create(null);
    // Require an actual map entry; a missing/changed schema passes through.
    if (!parsed.some(field => field.number === 1 && field.wire === 2)) return null;
    const parts = parsed.map(field => {
      if (field.number !== 1 || field.wire !== 2) return field.raw;
      const entry = fields(field.payload);
      const keys = entry.filter(item => item.number === 1 && item.wire === 2);
      const values = entry.filter(item => item.number === 2 && item.wire === 2);
      if (keys.length !== 1 || values.length !== 1) throw new Error('Unsupported map entry');
      const key = text(keys[0].payload);
      if (!Object.prototype.hasOwnProperty.call(attributes, key)) return field.raw;
      seen[key] = true;
      return message(1, join(entry.map(item => item === values[0]
        ? message(2, patchValue(item.payload, attributes[key])) : item.raw)));
    });
    for (const key of Object.keys(attributes)) {
      if (!seen[key]) parts.push(message(1, join([
        message(1, ascii(key)), message(2, patchValue(new Uint8Array(), attributes[key]))
      ])));
    }
    return join(parts);
  }

  function patchPath(bytes, path) {
    if (!path.length) return patchAttributes(bytes);
    const parsed = fields(bytes);
    const matches = parsed.filter(field => field.number === path[0] && field.wire === 2);
    if (matches.length !== 1) return null;
    const changed = patchPath(matches[0].payload, path.slice(1));
    if (!changed) return null;
    return join(parsed.map(field => field === matches[0] ? message(field.number, changed) : field.raw));
  }

  function rewrite(request, response, quantumult) {
    if (Number(response.status || response.statusCode) !== 200 ||
        String(request.method).toUpperCase() !== 'POST') return {};
    const match = /^https:\/\/(?:spclient\.wg\.spotify\.com|[a-z0-9-]+-spclient\.spotify\.com)(?::443)?\/(bootstrap\/v1\/bootstrap|user-customization-service\/v1\/customize)(?:\?[^#]*)?$/.exec(request.url);
    if (!match) return {};
    const input = quantumult ? response.bodyBytes : response.body;
    let bytes;
    if (input instanceof ArrayBuffer) bytes = new Uint8Array(input);
    else if (ArrayBuffer.isView(input)) bytes = new Uint8Array(input.buffer, input.byteOffset, input.byteLength);
    else return {};
    if (!bytes.length || bytes.length > MAX_SIZE) return {};
    try {
      const path = match[1].startsWith('bootstrap') ? [2, 1, 1, 1, 3] : [1, 3];
      const result = patchPath(bytes, path);
      if (!result) return {};
      return quantumult ? { bodyBytes: result.buffer } : { body: result };
    } catch (_) { return {}; }
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { rewrite };
  if (typeof $request !== 'undefined' && typeof $response !== 'undefined') {
    let output = {};
    try { output = rewrite($request, $response, typeof $task !== 'undefined'); } catch (_) {}
    $done(output);
  }
})();
