# Validation — 2026-10-21

Branch: `codex/self-hosted-app-expansion`.

- Python downloader regression suite: 9 tests passed. Includes HTTP error-document rejection, checksum mismatch, preserving the last good file, path containment, HTTPS/redirect host allowlist, and rejecting policy-bearing Quantumult X rule rows.
- Node Spotify fixture suite: 9 tests passed. Synthetic requests only; checks platform/port rewriting, exactly one completion callback, malformed/empty responses, server errors and preservation of real HiFi capability fields.
- Mutation check: inverted the SHA256 mismatch condition temporarily, confirmed the Python suite failed, and restored the source before rerunning successfully.
- Final offline repository verification passed: 233 locked assets, 101 script/rule references and 38 proxy JavaScript parses; Shadowrocket rule syntax, generated All-In-One parity and local website asset checks passed.
- The frontend worker additionally verified 163 extracted Sub-Store files by size/hash and checked entry-page references, deployment subpath, PWA scope and manifest hashes. Its final frontend files are included in the 233 locked assets above.
- `git diff --check` passed after normalizing authored text line endings. Vendored script/rule/source-archive bytes are protected from Git newline conversion with `.gitattributes`.
- Independent Luna review checked configuration/downloader behavior and self-hosting boundaries. Findings addressed: external Sub-Store UI redirect, experimental Spotify empty-body handling, and exact-literal checking when deriving the local Sub-Store bundles.

No real iOS app traffic was intercepted, no accounts/credentials were used, and no Shadowrocket/iPhone end-to-end result is claimed. The frontend and branch raw URLs require publication before device testing. No commit, push, Pages deployment, or merge was performed.

Commands:

```sh
python -m unittest discover -s tests -v
node --test tests/spotify.test.js
python scripts/verify_repo.py
python scripts/render_configs.py --check
python scripts/prepare_substore.py --check
git diff --check
```

## Follow-up: Premium-source research and Spotify binary compatibility

On 2026-10-21, the follow-up reproduced unknown-field loss and missing-body completion failures in the existing upstream Spotify processor using synthetic input. `js/spotify-compatible.js` fixes these mechanics and is selected by the standalone Spotify module and generated All In One. The pinned original remains intact for fallback/comparison.

- 25 Node tests passed (9 earlier JSON/request tests plus 16 new binary compatibility tests); 9 Python downloader tests passed: **34 tests total**.
- Offline verification passed: **233 locked third-party assets, 103 script/rule references, 39 JavaScript parses**.
- A targeted mutation removed map-envelope unknown fields; the compatibility tests failed as expected. The source was restored and all 16 compatibility cases passed again.
- Independent Luna review of binary parsing, passthrough and completion found no actionable issue. Added field-count and body-size caps plus explicit wire-type drift tests.
- Apple live lookup metadata for twelve apps is saved in `appstore-snapshot.json`; it reports Spotify 9.1.92 released October 19. No live Spotify 9.1.92 device/subscription result is claimed.
- A separate synthetic check ran the existing legacy RevenueCat handler for a fabricated 1Blocker User-Agent: it modifies the expected entitlement but also clears other entitlements. This is recorded as code-path evidence only, not working-app certification.
- No current Endel/1Blocker/other paid-app unlock was certified from a source listing, and no new unlicensed third-party script or client binary was copied.

Updated Spotify commands:

```sh
node --test tests/spotify.test.js tests/spotify-compatible.test.js
python -m unittest discover -s tests -v
python scripts/verify_repo.py
git diff --check
```

## Follow-up: app expansion — 2026-10-22

- Added 16 app-scoped RevenueCat profiles and one shared Dynamic module, plus the existing Locket-path alias. Profile evidence is legacy User-Agent selection, not current app compatibility. All In One now selects the local implementation.
- RevenueCat fixture tests cover preserving customer identity, unknown fields and unrelated purchases; actual mapping IDs; signed-response pass-through; Android base-plan exclusion; selector boundaries; transport failures; method checks; unknown existing products; bounded work; and timeout/late callback completion.
- JavaScript suites: **51 passed** (26 RevenueCat and 25 Spotify). No live account, app API or device traffic was used.
- A temporary completion-guard mutation was detected by the RevenueCat suite; original source bytes were restored before verification.
- Offline repository verification: **233 locked assets, 137 configuration references, 40 JavaScript parses**. Generator parity, rules and website references passed.
- Luna source review checked 24 source records for 22 distinct apps. Subscription scripts and content filters are distinguished. No additional unlicensed app script or binary was imported.
- Independent catalog review found and fixed owner/repository URL validation, missing alternate All In One config, and overly broad conflict descriptions. All 13 catalog tests and 9 downloader tests pass: **22 Python tests; 73 tests total with JavaScript**. App-scoped modules use distinct script names; Locket alias and canonical module are documented duplicates.

This validates code mechanics and inventory consistency only. Signed responses pass through; mapping metadata is not a server purchase. Spotify 9.1.92 and the 16 RevenueCat apps remain unverified on device. Branch changes remain local and unpublished.
