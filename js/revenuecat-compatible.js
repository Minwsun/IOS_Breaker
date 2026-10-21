// Local implementation of the existing Crack.js product-mapping approach.
// Protocol references: docs/revenuecat-protocol-research.md.
// Does not grant a server purchase, forge a signature, or send data to another service.
(() => {
  'use strict';
  const MAX_BODY = 1024 * 1024;
  const EXPIRY = '2099-01-01T00:00:00Z';

  function object(value) { return value && typeof value === 'object' && !Array.isArray(value); }
  function identifier(value) {
    return typeof value === 'string' && value.length > 0 && value.length <= 512 &&
      !/[\u0000-\u001f\u007f]/.test(value) && !['__proto__', 'constructor', 'prototype'].includes(value);
  }
  function header(headers, name) {
    const key = Object.keys(headers || {}).find(key => key.toLowerCase() === name.toLowerCase());
    return key ? headers[key] : undefined;
  }
  function decode(data) {
    if (typeof data !== 'string' || data.length > MAX_BODY) throw new Error('Unsupported body');
    return JSON.parse(data);
  }
  function selectorMatches(request, argument) {
    if (!argument) return true;
    const part = String(argument).split('&').find(part => part.startsWith('ua='));
    if (!part) return true;
    try {
      const tokens = decodeURIComponent(part.slice(3)).split('|');
      const userAgent = String(header(request.headers, 'user-agent') || '').toLowerCase();
      return tokens.length <= 16 && tokens.every(identifier) &&
        tokens.some(token => {
          const prefix = token.toLowerCase();
          return userAgent === prefix || userAgent.startsWith(prefix + '/') ||
            userAgent.startsWith(prefix + ' ') || userAgent.startsWith(prefix + '%20');
        });
    } catch (_) { return false; }
  }
  function unsigned(response) {
    return !Object.keys(response.headers || {}).some(key =>
      /^(?:x-signature|x-revenuecat-signature)$/i.test(key));
  }
  function mappingRecords(data) {
    if (!object(data) || data.product_entitlement_mapping && data.productEntitlementMapping)
      throw new Error('Ambiguous mapping');
    const mapping = data.product_entitlement_mapping || data.productEntitlementMapping;
    if (!object(mapping)) throw new Error('Missing mapping');
    const keys = Object.keys(mapping);
    if (keys.length > 500) throw new Error('Too many products');
    const records = [];
    for (const key of keys) {
      const record = mapping[key];
      if (!object(record)) throw new Error('Invalid product');
      // Android base plans are not App Store product identifiers.
      if (record.base_plan_id != null || record.basePlanId != null) continue;
      const product = record.product_identifier || record.productIdentifier;
      if (!identifier(product) ||
          !Array.isArray(record.entitlements) || record.entitlements.length > 64 ||
          !record.entitlements.every(identifier)) throw new Error('Invalid mapping');
      for (const entitlement of record.entitlements) {
        if (records.length >= 1000) throw new Error('Too many entitlement links');
        records.push({ entitlement, product });
      }
    }
    return records;
  }
  function applyMapping(customer, records, now) {
    const subscriber = customer.subscriber;
    if (!object(subscriber) || (subscriber.entitlements && !object(subscriber.entitlements)) ||
        (subscriber.subscriptions && !object(subscriber.subscriptions))) throw new Error('Invalid customer');
    if (!records.length) return null;
    const entitlements = subscriber.entitlements || {};
    const subscriptions = subscriber.subscriptions || {};
    const choices = Object.create(null);
    for (const record of records) {
      const existing = entitlements[record.entitlement];
      if (!choices[record.entitlement] || (object(existing) && existing.product_identifier === record.product))
        choices[record.entitlement] = record;
    }
    const date = now.toISOString();
    for (const entitlement of Object.keys(choices)) {
      const product = choices[entitlement].product;
      // Preserve existing entitlements whose products are absent from this mapping.
      if (object(entitlements[entitlement]) && entitlements[entitlement].product_identifier &&
          entitlements[entitlement].product_identifier !== product) continue;
      const oldSubscription = Object.prototype.hasOwnProperty.call(subscriptions, product) && object(subscriptions[product])
        ? subscriptions[product] : {};
      const oldEntitlement = Object.prototype.hasOwnProperty.call(entitlements, entitlement) && object(entitlements[entitlement])
        ? entitlements[entitlement] : {};
      const purchaseDate = oldEntitlement.purchase_date || oldSubscription.purchase_date || date;
      const currentExpiry = Date.parse(oldEntitlement.expires_date || oldSubscription.expires_date || '');
      const expiry = Number.isFinite(currentExpiry) && currentExpiry > Date.parse(EXPIRY)
        ? (oldEntitlement.expires_date || oldSubscription.expires_date) : EXPIRY;
      subscriptions[product] = Object.assign({}, oldSubscription, {
        purchase_date: purchaseDate,
        original_purchase_date: oldSubscription.original_purchase_date || purchaseDate,
        expires_date: expiry,
        store: oldSubscription.store || 'app_store',
        ownership_type: oldSubscription.ownership_type || 'PURCHASED',
        is_sandbox: oldSubscription.is_sandbox === true
      });
      entitlements[entitlement] = Object.assign({}, oldEntitlement, {
        product_identifier: product, purchase_date: purchaseDate, expires_date: expiry
      });
    }
    subscriber.entitlements = entitlements;
    subscriber.subscriptions = subscriptions;
    return customer;
  }
  function run(request, response, api, done, argument) {
    let completed = false, timer;
    function finish(value) {
      if (completed) return;
      completed = true;
      if (timer !== undefined && api.clearTimeout) api.clearTimeout(timer);
      done(value);
    }
    const match = /^https:\/\/(api\.revenuecat\.com|api\.rc-backup\.com)(?::443)?\/v1\/(receipts|subscribers\/[^/?#]+)\/?(?:\?[^#]*)?$/.exec(request.url || '');
    const expectedMethod = match && match[2] === 'receipts' ? 'POST' : 'GET';
    if (!match || (request.method && String(request.method).toUpperCase() !== expectedMethod) ||
        !selectorMatches(request, argument)) { finish({}); return; }
    if (!response) {
      const headers = Object.assign({}, request.headers || {});
      for (const key of Object.keys(headers)) if (key.toLowerCase() === 'x-revenuecat-etag') delete headers[key];
      finish({ headers }); return;
    }
    if (Number(response.status || response.statusCode) !== 200 || !unsigned(response)) { finish({}); return; }
    let customer;
    try {
      customer = decode(response.body);
      if (!object(customer) || !object(customer.subscriber) ||
          typeof customer.subscriber.original_app_user_id !== 'string') { finish({}); return; }
    } catch (_) { finish({}); return; }
    const authorization = header(request.headers, 'authorization');
    if (typeof authorization !== 'string' || !/^Bearer [^\s\r\n]{1,512}$/i.test(authorization) || !api.get) {
      finish({}); return;
    }
    if (api.setTimeout) timer = api.setTimeout(() => finish({}), 4500);
    try {
      api.get({
        url: 'https://' + match[1] + '/v1/product_entitlement_mapping',
        headers: { Authorization: authorization, 'X-Platform': 'iOS' }
      }, (error, mappingResponse, data) => {
        if (completed) return;
        if (error || !mappingResponse || Number(mappingResponse.status || mappingResponse.statusCode) !== 200) {
          finish({}); return;
        }
        try {
          const records = mappingRecords(decode(data));
          const result = applyMapping(customer, records, api.now ? api.now() : new Date());
          if (!result) { finish({}); return; }
          const body = JSON.stringify(result);
          finish(body.length <= MAX_BODY ? { body } : {});
        } catch (_) { finish({}); }
      });
    } catch (_) { finish({}); }
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { run, mappingRecords, applyMapping };
  if (typeof $request !== 'undefined') {
    const api = {};
    if (typeof $httpClient !== 'undefined') api.get = (options, callback) => $httpClient.get(options, callback);
    if (typeof setTimeout !== 'undefined') api.setTimeout = setTimeout;
    if (typeof clearTimeout !== 'undefined') api.clearTimeout = clearTimeout;
    run($request, typeof $response === 'undefined' ? undefined : $response, api, $done,
      typeof $argument === 'undefined' ? '' : $argument);
  }
})();
