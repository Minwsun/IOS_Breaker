# Third-party sources and local changes

Reviewed on 2026-10-21. Vendoring changes hosting, not authorship or license. This repository contains independently licensed works; no blanket license is assigned to legacy scripts.

| Component | Pinned source | License / notice | Local treatment |
| --- | --- | --- | --- |
| Spotify and App2Smile scripts | `app2smile/rules` commit `df6366a7024e0b3f0aa3510c5b791eea6f3cba89` | MIT, `licenses/app2smile-LICENSE` | Scripts retained unchanged; modules adapted. `spotify-capabilities-safe.js` is a documented defensive adaptation. |
| Sub-Store backend | `2.42.6`, source `1f0318bc6feb46fbe204836f32ca7acab37ea67e` | AGPL-3.0, `licenses/Sub-Store-AGPL-3.0.txt` | Pristine JS in `js/vendor/sub-store/`; source/build manifests in `vendor/sources/Sub-Store-2.42.6.tar.gz`. `scripts/prepare_substore.py` generates modified frontend redirect/CORS bundles. |
| Sub-Store frontend | `2.34.1` | GPL-3.0, `licenses/Sub-Store-Front-End-GPL-3.0.txt` | Local distribution and source archive; extraction/patch provenance in `vendor/sub-store-frontend-lock.json`. |
| Blackmatrix7 rule lists | `f9e403a75bbc4bee939c6d8dd766cf78f1b512f3` | GPL-2.0, `licenses/blackmatrix7-GPL-2.0.txt` | Shadowrocket text lists with author/source headers. URLs and hashes in `vendor/assets-lock.json`. These editable text lists are their source form. |
| Website libraries/fonts | See `web-self-hosting.md` | MIT; Font Awesome also CC BY 4.0 / OFL 1.1 | Assets and notices under `assets/vendor/`. |

`vendor/assets-lock.json` records exact upstream downloads. `vendor/apps-lock.json` distinguishes source hashes from adapted module hashes. Modified modules cannot be restored verbatim from upstream: retain the reviewed adaptations in Git. Distribute source archives/license files with the GPL/AGPL components and preserve notices in bundled libraries.

## Existing copies retained

The original checkout contains scripts credited to other authors, including obfuscated bundles, and APNs/TestFlight/Zalo rule snapshots. Their complete redistribution provenance has not been established here. They have not been relabeled MIT/GPL or represented as authored here. Standalone modules now reference the existing local copies; prior functionality is not independently certified.

No new app code was imported from `chxm1023/Rewrite`, whose inspected repository lacks a clear reusable code license. Bilibili/Tieba protobuf and BaiduMap were left out pending review of embedded third-party notices. See the research report for candidate sources and exclusions.

## Network access

Upstream URLs in lock files and source comments are maintenance/provenance references. The Sub-Store frontend must be published on your website for its redirect to work. App APIs, translation APIs, DNS and user-supplied subscription providers remain external services. No production traffic, credentials or personal response fixtures were collected.

The local `spotify-compatible.js` uses protocol field numbers documented in the pinned Spotify schema, with a new wire-preserving implementation. It does not replace the upstream asset bytes or their hashes. No Amlabort/Eevee/Endel client code or binaries were imported in this follow-up.

The local `revenuecat-compatible.js`, premium-module generator and catalog generator are new implementations in this checkout. RevenueCat SDK models and fixtures were consulted for protocol documentation; no SDK code was vendored. The 16 app profiles retain only legacy User-Agent evidence, not verified StoreKit product IDs. Source listings in `app-candidates.json` are research records, not imported scripts or confirmed app support. No additional unlicensed app code was copied in the October 22 expansion.
