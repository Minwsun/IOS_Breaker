# Spotify: current evidence and compatibility repair

Checked 2026-10-21. Branch `codex/self-hosted-app-expansion`.

## Current version versus source age

Apple's [live lookup endpoint](https://itunes.apple.com/lookup?id=324684580&country=us) returned **9.1.92**, released **2026-10-19**, minimum iOS **16.1**. Selected metadata is retained in `appstore-snapshot.json`. Some App Store page variants still surfaced 9.1.80; the live metadata supersedes that result. This does not establish support for either version by a script.

The pinned `app2smile/rules` revision is `df6366a7024e0b3f0aa3510c5b791eea6f3cba89` (2026-03-04). Stable `spotify-proto.js` last changed on February 25; the March revision adds a separate test handler. Both use a fixed protobuf schema and assume success branches exist. Upstream's [maintainer guidance](https://github.com/app2smile/rules/issues/225) lists Surge/Loon/Quantumult X, not confirmed Shadowrocket support, and warns against Very High quality, stale cache and overlapping scripts.

## Reproduced defects and repair

Synthetic protobuf fixtures reproduced two defects in the original local upstream handler:

1. A successful customize response containing an unknown top-level protobuf field lost that field after decode/re-encode. The old bundled schema cannot preserve every newer field it does not know.
2. Empty or absent bodies at status 200 threw before invoking `$done`; an error envelope or missing nested success branch has the same structural risk.

The new `js/spotify-compatible.js` patches the known account-attribute map directly in protobuf wire data. It keeps untouched fields verbatim at the root, nested envelopes, map entries and attribute values. It handles both known bootstrap/customize layouts, optional URL queries, ArrayBuffer/view offsets and Quantumult X byte output. Unsupported/malformed data, error variants, non-200 responses and unknown layouts pass through unchanged and complete exactly once. Unsupported protobuf group wire types also pass through rather than being guessed.

The small set of client options is explicit in the source. Actual audio-quality, high-bitrate, offline and HiFi-related fields are preserved; the processor does not invent purchases or server media permissions. This is a locally tested compatibility repair, **not a confirmed fix for the user's playback symptom or proof that Spotify 9.1.92 grants all Premium features**. No real Spotify account/API was used in tests.

## Module selection

- `modules/Spotify.sgmodule`: new local compatibility processor, also selected in All In One.
- `modules/Spotify-Upstream.sgmodule`: exact pinned upstream processor as a comparison/fallback; do not enable alongside the new module or All In One's Spotify handlers.
- `modules/Spotify-Experimental.sgmodule`: upstream's March test variant plus the separate defensive JSON-capabilities adapter. It is not automatically considered newer-version compatible.

All code paths are hosted in this repo. Upstream copies and lock hashes remain unchanged. Do not enable multiple Spotify response transformers at the same time.

## What public issue reports actually say

- [Issue 268](https://github.com/app2smile/rules/issues/268), opened February 21: account logouts, including reports from Windows. This does not prove a specific proxy script is responsible.
- [Issue 269](https://github.com/app2smile/rules/issues/269), April: users reported behavior improving without a matching upstream script update. Remote service changes are therefore a competing explanation.
- [Issue 274](https://github.com/app2smile/rules/issues/274), September: tracks skip after a few seconds. A suggested community module has no clear reusable code license and adds multiple feature/ad filters; another user's QX UDP setting change fixed only some songs. These are leads, not a maintainer-confirmed root cause.
- [Amlabort's module](https://github.com/Amlabort/MY_clash/blob/main/files/surge/spot-NoAd.module) links gabo, proto, home, search and scroll handlers. A newer wrapper or more handlers does not establish current playback compatibility. Its code was researched but not imported.

For an actual device diagnosis, the missing information is the user's Spotify build, iOS/proxy build, exact symptom, whether the script ran, response status/endpoint and route. A useful first comparison is unmodified playback versus the single compatibility module, with the same account/network, a non-Very-High quality setting and no competing rewrite. Compare the same region route with DIRECT only when suitable for the account/network. Avoid changing several route/cache/script settings together. Do not publish tokens or full user response bodies.

## Other public mechanisms

See `public-client-options.md` for the current EeveeSpotify client-patch candidates. Their latest specifically documented target is 9.1.88, behind Apple's 9.1.92. A client patch, a proxy rewrite and a VPN route change are different mechanisms and require separate compatibility evidence.

## Tests

```sh
node --test tests/spotify-compatible.test.js tests/spotify.test.js
python scripts/verify_repo.py
```

The compatibility suite uses generated messages and checks unknown-field preservation, unchanged quality/offline attributes, exact byte buffers, malformed/error passthrough and one completion callback. It does not exercise Spotify's servers or subscription state.
