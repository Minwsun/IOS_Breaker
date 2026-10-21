# Public app-script expansion research

Reviewed 2026-10-21 from public GitHub source and repository metadata. This is a source inventory, not a compatibility claim. No script was run; no application API, account, subscription, or receipt was tested; no executable code was imported. Machine-readable rows are in [`config/app-candidates.json`](../config/app-candidates.json).

## Findings

There are 17 app-named response scripts in the public [`duyvinh09/Module_IOS`](https://github.com/duyvinh09/Module_IOS) tree spanning photo/video, productivity, music, and language-learning apps. Several have recent commits, but the repository currently declares no license. Public visibility does not grant permission to mirror or vendor these scripts. The entries are hypotheses that scripts exist and target the named app endpoints; none has evidence here of working against the current App Store build or unlocking a server-confirmed entitlement.

The repository's `main` head at review time was `4936c663773284c7ef429da1d0ea1ee71144790e`, pushed 2026-10-21. The `source_url` and `revision` fields pin each app-specific script to the commit that last changed that file. Pinning establishes provenance and reproducibility only, not legal permission or behavior. A subset of source commit messages are generic refactors, so recent dates do not necessarily indicate protocol updates.

Separately, MIT-licensed [`app2smile/rules`](https://github.com/app2smile/rules) provides actual scripts for Bilibili, Tieba, Qidian, Spotify, and YouTube. These are primarily ad, recommendation, or response/UI filters, not Premium entitlement implementations. Its head at review time was `df6366a7024e0b3f0aa3510c5b791eea6f3cba89` (2026-03-04). Several app-specific files are older than that head. Keep the repository's MIT notice and attribution with any permitted reuse, then test in the target client before claiming support.

This inventory yields 22 app names when the paid-feature/response-script set and ad/content-filter set are counted together; only the first set is relevant to subscription-like behavior, and it is not license-cleared for redistribution. There are not 20–30 license-cleared, version-tested, app-specific premium implementations in the inspected public sources. The project should not describe a generic RevenueCat mapping as a tested app solution: product labels and server entitlements are app-specific, and a response edit is distinct from a feature actually working.

## Candidate interpretation

The 17 app-named scripts in the unlicensed repository are: Alight Motion, BeautyPlus, Camera360, Duolingo, KineMaster, Locket, Meitu XiuXiu, PicsArt, SNOW, SODA, SoundCloud, Truecaller, VSCO, Wink, CamScanner, Adobe Lightroom, and NhacCuaTui. Their row-level source commit dates, URLs, high-level mechanism descriptions, declared-license status, and limitations are in the JSON. The inventory does not recommend copying them.

The MIT-licensed ad/content candidates are Bilibili (JSON and Protobuf), Baidu Tieba (JSON and Protobuf), Qidian Reading, Spotify, and YouTube. They are separated by `category` in the JSON so ad filtering is not misrepresented as Premium access. Protocol handlers may require features such as binary body interception that vary by client; no Shadowrocket compatibility was demonstrated in this research.

## Excluded or not counted

- `revenuecat.js`, `RevenueCat_Universal.js`, and receipt helpers are generic handlers, not independent app-specific implementations. App-name-to-entitlement strings are not proof of current RevenueCat configuration or working access.
- `chxm1023/Rewrite` is not counted as source: its public repository currently functions as a listing/README, lacks a license, and does not provide app source files to pin.
- General domain blocklists, VPN profiles, and request-denial rules are excluded from the premium candidate count. They can filter traffic, but do not establish account entitlements, server-side audio quality, cloud processing, or offline-download rights.
- Scripts without a clear license may be studied as public artifacts, but should not be copied or hosted without permission. A source commit hash is not a license.

## Evidence limits and next review gate

The source inventory proves only that public source files and mappings exist at pinned revisions. It does not prove the app still calls those routes, that the script parses current response bodies, that the client accepts modified data, or that a premium feature completes end to end. Before any compatibility statement, obtain lawful authorization and test the current app build in a controlled account, record the app version and observable feature, and keep private account/receipt data out of logs. For unlicensed sources, get permission before redistribution. No setup or bypass workflow is provided here.

## Primary sources

- [duyvinh09/Module_IOS source tree](https://github.com/duyvinh09/Module_IOS/tree/4936c663773284c7ef429da1d0ea1ee71144790e); repository metadata reports no declared license.
- [app2smile/rules source tree](https://github.com/app2smile/rules/tree/df6366a7024e0b3f0aa3510c5b791eea6f3cba89); repository declares MIT.
- [chxm1023/Rewrite](https://github.com/chxm1023/Rewrite); not counted as a script source.
