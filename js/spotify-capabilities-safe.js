// Defensive adapter for the experimental device-capabilities response.
// Based on app2smile/rules js/spotify-json2.js (MIT), revision
// df6366a7024e0b3f0aa3510c5b791eea6f3cba89. See licenses/app2smile-LICENSE.
// Local changes: fail open on errors; never invent HiFi capability/eligibility.
(() => {
  const status = $response.status || $response.statusCode;
  if ((status && status !== 200) || !$response.body ||
      !$request.url.includes('/device-capabilities/v1/capabilities')) {
    $done({});
    return;
  }
  try {
    const body = JSON.parse($response.body);
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      $done({});
      return;
    }
    body.effective_license = 'premium';
    $done({ body: JSON.stringify(body) });
  } catch (_) {
    $done({});
  }
})();
