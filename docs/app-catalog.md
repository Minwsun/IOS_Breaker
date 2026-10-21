# Danh mục module và script ứng dụng

Tài liệu này được tạo từ các module và script trong repository. Trạng thái mô tả bằng chứng trong mã nguồn; **không phải xác nhận tính năng hoạt động**. Hiện chưa có bằng chứng kiểm thử trên thiết bị cho các mục bên dưới.

## Chọn module

1. Chọn đúng module ứng dụng bạn dùng và kiểm tra tên file trước khi import vào Shadowrocket.
2. Không bật nhiều lựa chọn Spotify cùng lúc. Với RevenueCat, Dynamic, Legacy và All In One là handler chung; chúng đụng với các module theo app. Các module theo app khác nhau có thể cùng tồn tại nếu User-Agent selector khác nhau; hai đường dẫn Locket là alias trùng selector nên chỉ chọn một.
3. Cấp quyền MITM/chứng chỉ chỉ khi bạn hiểu và chấp nhận việc proxy đọc được lưu lượng HTTPS của các hostname được liệt kê. Có thể cần bật HTTPS Decryption cho các host đó.
4. Sau khi cài, kiểm tra app và log proxy; nếu gặp lỗi, tắt module trước. Không coi mô tả hoặc script name là cam kết mở khóa hay tương thích phiên bản.
5. Source/license được ghi khi repository có manifest hoặc metadata rõ ràng. `Not recorded` nghĩa là nguồn hoặc giấy phép chưa được xác định trong dữ liệu máy đọc được.

## Module

### IOS Breaker All In One

- Tệp: `All_In_One.conf`
- Trạng thái: `experimental-unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `*.googlevideo.com`, `*spclient.spotify.com`, `-redirector*.googlevideo.com`, `ap*.intsig.net`, `api-account.kinemasters.com`, `api-mobile.soundcloud.com`, `api-sub.meitu.com`, `api.mr.pixocial.com`, `api.picsart.com`, `api.rc-backup.com`, `api.revenuecat.com`, `api.xiuxiu.meitu.com`, `buy.itunes.apple.com`, `h5.xiuxiu.meitu.com`, `intsig.net`, `newbeee-api.beautyplus.com`, `photos.adobe.io`, `premium*.truecaller.com`, `s.youtube.com`, `spclient.wg.spotify.com`, `spotify.com`, `sub.store`, `truecaller.com`, `us-central1-alight-creative.cloudfunctions.net`, `user-snow-api.snow.me`, `www.youtube.com`, `xiuxiu.meitu.com`, `youtubei.googleapis.com`
- Mô tả: Self-hosted assets. Third-party notices: docs/THIRD_PARTY.md. Device testing required.
- Quy tắc script:
  - `Sub-Store Core` — `http-request`; endpoint regex `^https?:\/\/sub\.store\/((download)|api\/(preview|sync|(utils\/node-info)))`; processor `js/sub-store-1.selfhost.js`; source/license: `Not recorded` / `Not recorded`
  - `Sub-Store Simple` — `http-request`; endpoint regex `^https?:\/\/sub\.store`; processor `js/sub-store-0.selfhost.js`; source/license: `Not recorded` / `Not recorded`
  - `Sub-Store Sync` — `cron`; endpoint regex `(không có)`; processor `js/vendor/sub-store/cron-sync-artifacts.min.js`; source/license: `https://github.com/sub-store-org/Sub-Store/releases/download/2.42.6/cron-sync-artifacts.min.js` / `AGPL-3.0`
  - `youtube.request` — `http-request`; endpoint regex `^https:\/\/youtubei\.googleapis\.com\/youtubei\/v1\/(browse|next|player|reel\/reel_watch_sequence|get_watch)`; processor `js/youtube.response.js`; source/license: `Not recorded` / `Not recorded`
  - `youtube.response` — `http-response`; endpoint regex `^https:\/\/youtubei\.googleapis\.com\/(youtubei\/v1\/(browse|next|player|search|reel\/reel_watch_sequence|guide|account\/get_setting|get_watch))(\?(.*))?$`; processor `js/youtube.response.js`; source/license: `Not recorded` / `Not recorded`
  - `spotify-json` — `http-request`; endpoint regex `^https:\/\/(spclient\.wg\.spotify\.com|.*-spclient\.spotify\.com(:443)?)\/(artistview\/v1\/artist|album-entity-view\/v2\/album)\/`; processor `js/spotify-json.js`; source/license: `https://raw.githubusercontent.com/app2smile/rules/df6366a7024e0b3f0aa3510c5b791eea6f3cba89/js/spotify-json.js` / `MIT`
  - `spotify-proto` — `http-response`; endpoint regex `^https:\/\/(spclient\.wg\.spotify\.com|.*-spclient\.spotify\.com(:443)?)\/(bootstrap\/v1\/bootstrap|user-customization-service\/v1\/customize)(\?[^#]*)?$`; processor `js/spotify-compatible.js`; source/license: `Not recorded` / `Not recorded`
  - `SoundCloudGo+` — `http-response`; endpoint regex `https://api-mobile.soundcloud.com/configuration/ios`; processor `js/SoundCloudGoPlus.js`; source/license: `Not recorded` / `Not recorded`
  - `AlightMotion` — `http-response`; endpoint regex `^https:\/\/us-central1-alight-creative\.cloudfunctions\.net\/getAccountStatusAndLicenses`; processor `js/AlightMotion.js`; source/license: `Not recorded` / `Not recorded`
  - `PicsArt` — `http-request`; endpoint regex `^https:\/\/api\.picsart\.com\/gw-v2\/shop\/subscription\/apple\/purchases`; processor `js/PicsArt.js`; source/license: `Not recorded` / `Not recorded`
  - `Wink` — `http-response`; endpoint regex `^https?:\/\/api-sub\.meitu\.com\/v2\/user\/vip_info_by_group\.json`; processor `js/WinkVipCrack.js`; source/license: `Not recorded` / `Not recorded`
  - `Truecaller` — `http-response`; endpoint regex `^https://premium-(.+)\.truecaller\.com/v\d/(subscriptions|products\/apple)`; processor `js/TrueCaller.js`; source/license: `Not recorded` / `Not recorded`
  - `Lightroom` — `http-response`; endpoint regex `^https:\/\/photos\.adobe\.io\/v\d\/accounts`; processor `js/lightroom.js`; source/license: `Not recorded` / `Not recorded`
  - `Kinemaster` — `http-response`; endpoint regex `^https:\/\/api-account\.kinemasters\.com\/v\d\/user\/subscribe$`; processor `js/Kinemaster.js`; source/license: `Not recorded` / `Not recorded`
  - `Camscanner` — `http-response`; endpoint regex `https:\/\/(api|api-cs.*)\.intsig\.net\/purchase\/cs\/query_prop`; processor `js/camScanner.js`; source/license: `Not recorded` / `Not recorded`
  - `BeautyPlus` — `http-response`; endpoint regex `https:\/\/(api\.mr\.pixocial\.com\/v1\/manual_unlock|newbeee-api\.beautyplus\.com\/api\/v1\/asset\/balance)`; processor `js/BeautyPlus.js`; source/license: `Not recorded` / `Not recorded`
  - `revenuecat` — `http-response`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`
  - `deleteHeader` — `http-request`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`
  - `iTunes` — `http-response`; endpoint regex `^https?:\/\/buy\.itunes\.apple\.com\/verifyReceipt$`; processor `js/iTunes.js`; source/license: `Not recorded` / `Not recorded`
  - `Snow` — `http-response`; endpoint regex `^https?:\/\/user-snow-api\.snow\.me\/v\d\/purchase\/subscription\/subscriber\/status`; processor `js/Snow.js`; source/license: `Not recorded` / `Not recorded`
  - `Meitu` — `http-response`; endpoint regex `^https?:\/\/(h5|api)\.xiuxiu\.meitu\.com\/v\d\/(h\d\/vip|vip|user)\/`; processor `js/MeiTuXiuXiu.js`; source/license: `Not recorded` / `Not recorded`

### IOS Breaker All In One

- Tệp: `All_In_One.sgmodule`
- Trạng thái: `experimental-unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `*.googlevideo.com`, `*spclient.spotify.com`, `-redirector*.googlevideo.com`, `ap*.intsig.net`, `api-account.kinemasters.com`, `api-mobile.soundcloud.com`, `api-sub.meitu.com`, `api.mr.pixocial.com`, `api.picsart.com`, `api.rc-backup.com`, `api.revenuecat.com`, `api.xiuxiu.meitu.com`, `buy.itunes.apple.com`, `h5.xiuxiu.meitu.com`, `intsig.net`, `newbeee-api.beautyplus.com`, `photos.adobe.io`, `premium*.truecaller.com`, `s.youtube.com`, `spclient.wg.spotify.com`, `spotify.com`, `sub.store`, `truecaller.com`, `us-central1-alight-creative.cloudfunctions.net`, `user-snow-api.snow.me`, `www.youtube.com`, `xiuxiu.meitu.com`, `youtubei.googleapis.com`
- Mô tả: Self-hosted assets. Third-party notices: docs/THIRD_PARTY.md. Device testing required.
- Quy tắc script:
  - `Sub-Store Core` — `http-request`; endpoint regex `^https?:\/\/sub\.store\/((download)|api\/(preview|sync|(utils\/node-info)))`; processor `js/sub-store-1.selfhost.js`; source/license: `Not recorded` / `Not recorded`
  - `Sub-Store Simple` — `http-request`; endpoint regex `^https?:\/\/sub\.store`; processor `js/sub-store-0.selfhost.js`; source/license: `Not recorded` / `Not recorded`
  - `Sub-Store Sync` — `cron`; endpoint regex `(không có)`; processor `js/vendor/sub-store/cron-sync-artifacts.min.js`; source/license: `https://github.com/sub-store-org/Sub-Store/releases/download/2.42.6/cron-sync-artifacts.min.js` / `AGPL-3.0`
  - `youtube.request` — `http-request`; endpoint regex `^https:\/\/youtubei\.googleapis\.com\/youtubei\/v1\/(browse|next|player|reel\/reel_watch_sequence|get_watch)`; processor `js/youtube.response.js`; source/license: `Not recorded` / `Not recorded`
  - `youtube.response` — `http-response`; endpoint regex `^https:\/\/youtubei\.googleapis\.com\/(youtubei\/v1\/(browse|next|player|search|reel\/reel_watch_sequence|guide|account\/get_setting|get_watch))(\?(.*))?$`; processor `js/youtube.response.js`; source/license: `Not recorded` / `Not recorded`
  - `spotify-json` — `http-request`; endpoint regex `^https:\/\/(spclient\.wg\.spotify\.com|.*-spclient\.spotify\.com(:443)?)\/(artistview\/v1\/artist|album-entity-view\/v2\/album)\/`; processor `js/spotify-json.js`; source/license: `https://raw.githubusercontent.com/app2smile/rules/df6366a7024e0b3f0aa3510c5b791eea6f3cba89/js/spotify-json.js` / `MIT`
  - `spotify-proto` — `http-response`; endpoint regex `^https:\/\/(spclient\.wg\.spotify\.com|.*-spclient\.spotify\.com(:443)?)\/(bootstrap\/v1\/bootstrap|user-customization-service\/v1\/customize)(\?[^#]*)?$`; processor `js/spotify-compatible.js`; source/license: `Not recorded` / `Not recorded`
  - `SoundCloudGo+` — `http-response`; endpoint regex `https://api-mobile.soundcloud.com/configuration/ios`; processor `js/SoundCloudGoPlus.js`; source/license: `Not recorded` / `Not recorded`
  - `AlightMotion` — `http-response`; endpoint regex `^https:\/\/us-central1-alight-creative\.cloudfunctions\.net\/getAccountStatusAndLicenses`; processor `js/AlightMotion.js`; source/license: `Not recorded` / `Not recorded`
  - `PicsArt` — `http-request`; endpoint regex `^https:\/\/api\.picsart\.com\/gw-v2\/shop\/subscription\/apple\/purchases`; processor `js/PicsArt.js`; source/license: `Not recorded` / `Not recorded`
  - `Wink` — `http-response`; endpoint regex `^https?:\/\/api-sub\.meitu\.com\/v2\/user\/vip_info_by_group\.json`; processor `js/WinkVipCrack.js`; source/license: `Not recorded` / `Not recorded`
  - `Truecaller` — `http-response`; endpoint regex `^https://premium-(.+)\.truecaller\.com/v\d/(subscriptions|products\/apple)`; processor `js/TrueCaller.js`; source/license: `Not recorded` / `Not recorded`
  - `Lightroom` — `http-response`; endpoint regex `^https:\/\/photos\.adobe\.io\/v\d\/accounts`; processor `js/lightroom.js`; source/license: `Not recorded` / `Not recorded`
  - `Kinemaster` — `http-response`; endpoint regex `^https:\/\/api-account\.kinemasters\.com\/v\d\/user\/subscribe$`; processor `js/Kinemaster.js`; source/license: `Not recorded` / `Not recorded`
  - `Camscanner` — `http-response`; endpoint regex `https:\/\/(api|api-cs.*)\.intsig\.net\/purchase\/cs\/query_prop`; processor `js/camScanner.js`; source/license: `Not recorded` / `Not recorded`
  - `BeautyPlus` — `http-response`; endpoint regex `https:\/\/(api\.mr\.pixocial\.com\/v1\/manual_unlock|newbeee-api\.beautyplus\.com\/api\/v1\/asset\/balance)`; processor `js/BeautyPlus.js`; source/license: `Not recorded` / `Not recorded`
  - `revenuecat` — `http-response`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`
  - `deleteHeader` — `http-request`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`
  - `iTunes` — `http-response`; endpoint regex `^https?:\/\/buy\.itunes\.apple\.com\/verifyReceipt$`; processor `js/iTunes.js`; source/license: `Not recorded` / `Not recorded`
  - `Snow` — `http-response`; endpoint regex `^https?:\/\/user-snow-api\.snow\.me\/v\d\/purchase\/subscription\/subscriber\/status`; processor `js/Snow.js`; source/license: `Not recorded` / `Not recorded`
  - `Meitu` — `http-response`; endpoint regex `^https?:\/\/(h5|api)\.xiuxiu\.meitu\.com\/v\d\/(h\d\/vip|vip|user)\/`; processor `js/MeiTuXiuXiu.js`; source/license: `Not recorded` / `Not recorded`

### App2Smile Bilibili JSON (experimental)

- Tệp: `modules/App2Smile-Bilibili.sgmodule`
- Trạng thái: `experimental-unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `app.bilibili.com`
- Mô tả: EXPERIMENTAL: JSON response filtering only; Shadowrocket compatibility and current app behavior are unverified.
- Quy tắc script:
  - `bili-json` — `http-response`; endpoint regex `^https:\/\/app\.bilibili\.com\/x\/(v2\/(splash\/(list|show)|feed\/index\?)|resource\/show\/tab\/v2)`; processor `js/app2smile-bilibili-json.js`; source/license: `https://raw.githubusercontent.com/app2smile/rules/df6366a7024e0b3f0aa3510c5b791eea6f3cba89/js/bilibili-json.js` / `MIT`

### App2Smile Qidian (experimental)

- Tệp: `modules/App2Smile-Qidian.sgmodule`
- Trạng thái: `experimental-unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `magev6.if.qidian.com`
- Mô tả: EXPERIMENTAL: Shadowrocket compatibility and current app behavior are unverified; upstream notes proxy must stay enabled while using Qidian on Quantumult X.
- Quy tắc script:
  - `qidian-json` — `http-response`; endpoint regex `^https:\/\/magev6\.if\.qidian\.com\/argus\/api\/(v4\/client\/getsplashscreen|v2\/(deeplink\/geturl|dailyrecommend\/getdailyrecommend)|v1\/(client\/getconf$|bookshelf\/getHoverAdv|adv\/getadvlistbatch\?positions=iOS_tab))`; processor `js/app2smile-qidian.js`; source/license: `https://raw.githubusercontent.com/app2smile/rules/df6366a7024e0b3f0aa3510c5b791eea6f3cba89/js/qidian.js` / `MIT`

### App2Smile QQ News (experimental)

- Tệp: `modules/App2Smile-QQNews.sgmodule`
- Trạng thái: `experimental-unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `news.ssp.qq.com`, `r.inews.qq.com`
- Mô tả: EXPERIMENTAL: splash removal may rely on fresh app install/cache state; Shadowrocket compatibility and current app behavior are unverified.
- Quy tắc script:
  - `qqnews-json` — `http-response`; endpoint regex `^https:\/\/(news\.ssp\.qq\.com\/app|r\.inews\.qq\.com\/(get(QQNewsUnreadList|TagFeedList)|gw\/page\/(channel_feed|event_detail)|news_feed\/hot_module_list))`; processor `js/app2smile-qqnews.js`; source/license: `https://raw.githubusercontent.com/app2smile/rules/df6366a7024e0b3f0aa3510c5b791eea6f3cba89/js/qq-news.js` / `MIT`

### App2Smile Tieba JSON (experimental)

- Tệp: `modules/App2Smile-Tieba.sgmodule`
- Trạng thái: `experimental-unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `baidu.com`, `c.tieba`, `c.tieba.baidu.com`, `tiebac.baidu.com`
- Mô tả: EXPERIMENTAL: JSON response filtering only; Shadowrocket compatibility and current app behavior are unverified.
- Quy tắc script:
  - `tieba-json` — `http-response`; endpoint regex `^https?:\/\/(tiebac|c\.tieba)\.baidu\.com\/(c\/(s\/sync|f\/(ad\/getSplashAd|frs\/(page|threadlist|generalTabList)|pb\/(pic)?page|excellent\/personalized))$|tiebaads\/commonbatch\?)`; processor `js/app2smile-tieba-json.js`; source/license: `https://raw.githubusercontent.com/app2smile/rules/df6366a7024e0b3f0aa3510c5b791eea6f3cba89/js/tieba-json.js` / `MIT`

### App2Smile Zhihu (experimental)

- Tệp: `modules/App2Smile-Zhihu.sgmodule`
- Trạng thái: `experimental-unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `api.zhihu.com`, `appcloud2.zhihu.com`, `www.zhihu.com`
- Mô tả: EXPERIMENTAL: Shadowrocket compatibility and current app behavior are unverified.
- Quy tắc script:
  - `zhihu-json` — `http-response`; endpoint regex `^https:\/\/(appcloud2\.zhihu\.com\/v3\/config$|www\.zhihu\.com\/api\/v4\/(answers\/\d+\/recommendations|articles\/\d+\/recommendation)|api\.zhihu\.com\/(topstory\/recommend|commercial_api\/(real_time_launch_v2|app_float_layer$)|questions\/\d+\/feeds\?|v4\/questions\/\d+\/answers\?))`; processor `js/app2smile-zhihu.js`; source/license: `https://raw.githubusercontent.com/app2smile/rules/df6366a7024e0b3f0aa3510c5b791eea6f3cba89/js/zhihu.js` / `MIT`

### BeautyPlus

- Tệp: `modules/BeautyPlus.sgmodule`
- Trạng thái: `unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `api.mr.pixocial.com`, `newbeee-api.beautyplus.com`
- Mô tả: BeautyPlus Premium Unlock
- Quy tắc script:
  - `BeautyPlus` — `http-response`; endpoint regex `https:\/\/(api\.mr\.pixocial\.com\/v1\/manual_unlock|newbeee-api\.beautyplus\.com\/api\/v1\/asset\/balance)`; processor `js/BeautyPlus.js`; source/license: `Not recorded` / `Not recorded`

### Camera360 pro

- Tệp: `modules/Camera360.sgmodule`
- Trạng thái: `unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `*.camera360.com`, `camera360.com`
- Mô tả: Tep Lenh Crack
- Quy tắc script:
  - `camera360` — `http-response`; endpoint regex `^https?:\/\/.*\.camera360\.com\/(api\/(order\/purchase|iap\/check-receipt)|v\d\/operational-positions)`; processor `js/Camera360.js`; source/license: `Not recorded` / `Not recorded`

### iTunes

- Tệp: `modules/itunes.sgmodule`
- Trạng thái: `unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `buy.itunes.apple.com`
- Mô tả: iTunes
- Quy tắc script:
  - `iTunes` — `http-response`; endpoint regex `^https?:\/\/buy\.itunes\.apple\.com\/verifyReceipt$`; processor `js/iTunes.js`; source/license: `Not recorded` / `Not recorded`

### Locket - RevenueCat experimental

- Tệp: `modules/Locket.sgmodule`
- Trạng thái: `experimental-unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `api.rc-backup.com`, `api.revenuecat.com`
- Mô tả: Mapping discovery; fixture-tested only. Signed responses pass through. Never combine with another RevenueCat processor.
- Quy tắc script:
  - `rc-locket-request` — `http-request`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`
  - `rc-locket-response` — `http-response`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`

### 1Blocker - RevenueCat experimental

- Tệp: `modules/RevenueCat-1Blocker.sgmodule`
- Trạng thái: `experimental-unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `api.rc-backup.com`, `api.revenuecat.com`
- Mô tả: Mapping discovery; fixture-tested only. Signed responses pass through. Never combine with another RevenueCat processor.
- Quy tắc script:
  - `rc-1blocker-request` — `http-request`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`
  - `rc-1blocker-response` — `http-response`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`

### Anybox - RevenueCat experimental

- Tệp: `modules/RevenueCat-Anybox.sgmodule`
- Trạng thái: `experimental-unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `api.rc-backup.com`, `api.revenuecat.com`
- Mô tả: Mapping discovery; fixture-tested only. Signed responses pass through. Never combine with another RevenueCat processor.
- Quy tắc script:
  - `rc-anybox-request` — `http-request`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`
  - `rc-anybox-response` — `http-response`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`

### APTV - RevenueCat experimental

- Tệp: `modules/RevenueCat-APTV.sgmodule`
- Trạng thái: `experimental-unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `api.rc-backup.com`, `api.revenuecat.com`
- Mô tả: Mapping discovery; fixture-tested only. Signed responses pass through. Never combine with another RevenueCat processor.
- Quy tắc script:
  - `rc-aptv-request` — `http-request`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`
  - `rc-aptv-response` — `http-response`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`

### Darkroom - RevenueCat experimental

- Tệp: `modules/RevenueCat-Darkroom.sgmodule`
- Trạng thái: `experimental-unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `api.rc-backup.com`, `api.revenuecat.com`
- Mô tả: Mapping discovery; fixture-tested only. Signed responses pass through. Never combine with another RevenueCat processor.
- Quy tắc script:
  - `rc-darkroom-request` — `http-request`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`
  - `rc-darkroom-response` — `http-response`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`

### All RevenueCat apps - RevenueCat experimental

- Tệp: `modules/RevenueCat-Dynamic.sgmodule`
- Trạng thái: `experimental-unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `api.rc-backup.com`, `api.revenuecat.com`
- Mô tả: Mapping discovery; fixture-tested only. Signed responses pass through. Never combine with another RevenueCat processor.
- Quy tắc script:
  - `rc-dynamic-request` — `http-request`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`
  - `rc-dynamic-response` — `http-response`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`

### Grow - RevenueCat experimental

- Tệp: `modules/RevenueCat-Grow.sgmodule`
- Trạng thái: `experimental-unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `api.rc-backup.com`, `api.revenuecat.com`
- Mô tả: Mapping discovery; fixture-tested only. Signed responses pass through. Never combine with another RevenueCat processor.
- Quy tắc script:
  - `rc-grow-request` — `http-request`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`
  - `rc-grow-response` — `http-response`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`

### HTTPBot - RevenueCat experimental

- Tệp: `modules/RevenueCat-HTTPBot.sgmodule`
- Trạng thái: `experimental-unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `api.rc-backup.com`, `api.revenuecat.com`
- Mô tả: Mapping discovery; fixture-tested only. Signed responses pass through. Never combine with another RevenueCat processor.
- Quy tắc script:
  - `rc-httpbot-request` — `http-request`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`
  - `rc-httpbot-response` — `http-response`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`

### RevenueCat Legacy (experimental)

- Tệp: `modules/RevenueCat-Legacy.sgmodule`
- Trạng thái: `experimental-unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `api.rc-backup.com`, `api.revenuecat.com`
- Mô tả: Use instead of the All-In-One RevenueCat response handler; never enable both.
- Quy tắc script:
  - `RevenueCatVip` — `http-response`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/.+\/(receipts$|subscribers\/[^/]+$)`; processor `js/revenuecat.js`; source/license: `Not recorded` / `Not recorded`

### Locket - RevenueCat experimental

- Tệp: `modules/RevenueCat-Locket.sgmodule`
- Trạng thái: `experimental-unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `api.rc-backup.com`, `api.revenuecat.com`
- Mô tả: Mapping discovery; fixture-tested only. Signed responses pass through. Never combine with another RevenueCat processor.
- Quy tắc script:
  - `rc-locket-request` — `http-request`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`
  - `rc-locket-response` — `http-response`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`

### Noto - RevenueCat experimental

- Tệp: `modules/RevenueCat-Noto.sgmodule`
- Trạng thái: `experimental-unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `api.rc-backup.com`, `api.revenuecat.com`
- Mô tả: Mapping discovery; fixture-tested only. Signed responses pass through. Never combine with another RevenueCat processor.
- Quy tắc script:
  - `rc-noto-request` — `http-request`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`
  - `rc-noto-response` — `http-response`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`

### OffScreen - RevenueCat experimental

- Tệp: `modules/RevenueCat-OffScreen.sgmodule`
- Trạng thái: `experimental-unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `api.rc-backup.com`, `api.revenuecat.com`
- Mô tả: Mapping discovery; fixture-tested only. Signed responses pass through. Never combine with another RevenueCat processor.
- Quy tắc script:
  - `rc-offscreen-request` — `http-request`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`
  - `rc-offscreen-response` — `http-response`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`

### Photomator - RevenueCat experimental

- Tệp: `modules/RevenueCat-Photomator.sgmodule`
- Trạng thái: `experimental-unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `api.rc-backup.com`, `api.revenuecat.com`
- Mô tả: Mapping discovery; fixture-tested only. Signed responses pass through. Never combine with another RevenueCat processor.
- Quy tắc script:
  - `rc-photomator-request` — `http-request`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`
  - `rc-photomator-response` — `http-response`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`

### Photoroom - RevenueCat experimental

- Tệp: `modules/RevenueCat-Photoroom.sgmodule`
- Trạng thái: `experimental-unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `api.rc-backup.com`, `api.revenuecat.com`
- Mô tả: Mapping discovery; fixture-tested only. Signed responses pass through. Never combine with another RevenueCat processor.
- Quy tắc script:
  - `rc-photoroom-request` — `http-request`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`
  - `rc-photoroom-response` — `http-response`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`

### Pillow - RevenueCat experimental

- Tệp: `modules/RevenueCat-Pillow.sgmodule`
- Trạng thái: `experimental-unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `api.rc-backup.com`, `api.revenuecat.com`
- Mô tả: Mapping discovery; fixture-tested only. Signed responses pass through. Never combine with another RevenueCat processor.
- Quy tắc script:
  - `rc-pillow-request` — `http-request`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`
  - `rc-pillow-response` — `http-response`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`

### Scanner Pro - RevenueCat experimental

- Tệp: `modules/RevenueCat-ScannerPro.sgmodule`
- Trạng thái: `experimental-unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `api.rc-backup.com`, `api.revenuecat.com`
- Mô tả: Mapping discovery; fixture-tested only. Signed responses pass through. Never combine with another RevenueCat processor.
- Quy tắc script:
  - `rc-scannerpro-request` — `http-request`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`
  - `rc-scannerpro-response` — `http-response`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`

### Unfold - RevenueCat experimental

- Tệp: `modules/RevenueCat-Unfold.sgmodule`
- Trạng thái: `experimental-unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `api.rc-backup.com`, `api.revenuecat.com`
- Mô tả: Mapping discovery; fixture-tested only. Signed responses pass through. Never combine with another RevenueCat processor.
- Quy tắc script:
  - `rc-unfold-request` — `http-request`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`
  - `rc-unfold-response` — `http-response`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`

### VSCO - RevenueCat experimental

- Tệp: `modules/RevenueCat-VSCO.sgmodule`
- Trạng thái: `experimental-unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `api.rc-backup.com`, `api.revenuecat.com`
- Mô tả: Mapping discovery; fixture-tested only. Signed responses pass through. Never combine with another RevenueCat processor.
- Quy tắc script:
  - `rc-vsco-request` — `http-request`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`
  - `rc-vsco-response` — `http-response`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`

### WidgetSmith - RevenueCat experimental

- Tệp: `modules/RevenueCat-WidgetSmith.sgmodule`
- Trạng thái: `experimental-unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `api.rc-backup.com`, `api.revenuecat.com`
- Mô tả: Mapping discovery; fixture-tested only. Signed responses pass through. Never combine with another RevenueCat processor.
- Quy tắc script:
  - `rc-widgetsmith-request` — `http-request`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`
  - `rc-widgetsmith-response` — `http-response`; endpoint regex `^https:\/\/api\.(revenuecat|rc-backup)\.com\/v1\/(receipts|subscribers\/[^/?#]+)\/?(\?[^#]*)?$`; processor `js/revenuecat-compatible.js`; source/license: `Not recorded` / `Not recorded`

### snow

- Tệp: `modules/snow.sgmodule`
- Trạng thái: `unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `user-snow-api.snow.me`
- Mô tả: snow crack
- Quy tắc script:
  - `snow` — `http-response`; endpoint regex `^https?:\/\/user-snow-api\.snow\.me\/v\d\/purchase\/subscription\/subscriber\/status`; processor `js/Snow.js`; source/license: `Not recorded` / `Not recorded`

### SODA

- Tệp: `modules/SODA.sgmodule`
- Trạng thái: `unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `purchase-soda-api.snow.me`
- Mô tả: SOSA crack
- Quy tắc script:
  - `soda` — `http-response`; endpoint regex `^https?:\/\/purchase-soda-api\.snow\.me\/v\d\/purchase\/subscription\/subscriber\/status`; processor `js/Soda.js`; source/license: `Not recorded` / `Not recorded`

### SpotifyTest

- Tệp: `modules/Spotify-Experimental.sgmodule`
- Trạng thái: `experimental-unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `*spclient.spotify.com`, `spclient.wg.spotify.com`, `spotify.com`
- Mô tả: không có
- Quy tắc script:
  - `spotify-json` — `http-request`; endpoint regex `^https:\/\/(spclient\.wg\.spotify\.com|.*-spclient\.spotify\.com(:443)?)\/(artistview\/v1\/artist|album-entity-view\/v2\/album)\/`; processor `js/spotify-json.js`; source/license: `https://raw.githubusercontent.com/app2smile/rules/df6366a7024e0b3f0aa3510c5b791eea6f3cba89/js/spotify-json.js` / `MIT`
  - `spotify-json2` — `http-response`; endpoint regex `^https:\/\/(spclient\.wg\.spotify\.com|.*-spclient\.spotify\.com(:443)?)\/device-capabilities\/v1\/capabilities`; processor `js/spotify-capabilities-safe.js`; source/license: `app2smile/rules` / `MIT`
  - `spotify-proto` — `http-response`; endpoint regex `^https:\/\/(spclient\.wg\.spotify\.com|.*-spclient\.spotify\.com(:443)?)\/(bootstrap\/v1\/bootstrap|user-customization-service\/v1\/customize)$`; processor `js/spotify-proto-test.js`; source/license: `https://raw.githubusercontent.com/app2smile/rules/df6366a7024e0b3f0aa3510c5b791eea6f3cba89/js/spotify-proto-test.js` / `MIT`

### Spotify Upstream (2026-02-25)

- Tệp: `modules/Spotify-Upstream.sgmodule`
- Trạng thái: `experimental-unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `*spclient.spotify.com`, `spclient.wg.spotify.com`, `spotify.com`
- Mô tả: 2025.06.27 部分解锁premium,音质不能设置为超高(建议登录后再打开脚本,重启app等待脚本生效)
- Quy tắc script:
  - `spotify-json` — `http-request`; endpoint regex `^https:\/\/(spclient\.wg\.spotify\.com|.*-spclient\.spotify\.com(:443)?)\/(artistview\/v1\/artist|album-entity-view\/v2\/album)\/`; processor `js/spotify-json.js`; source/license: `https://raw.githubusercontent.com/app2smile/rules/df6366a7024e0b3f0aa3510c5b791eea6f3cba89/js/spotify-json.js` / `MIT`
  - `spotify-proto` — `http-response`; endpoint regex `^https:\/\/(spclient\.wg\.spotify\.com|.*-spclient\.spotify\.com(:443)?)\/(bootstrap\/v1\/bootstrap|user-customization-service\/v1\/customize)$`; processor `js/spotify-proto.js`; source/license: `https://raw.githubusercontent.com/app2smile/rules/df6366a7024e0b3f0aa3510c5b791eea6f3cba89/js/spotify-proto.js` / `MIT`

### Spotify Compatibility (experimental)

- Tệp: `modules/Spotify.sgmodule`
- Trạng thái: `experimental-unverified`; kiểm thử thiết bị: **chưa xác nhận**
- Host MITM: `*spclient.spotify.com`, `spclient.wg.spotify.com`, `spotify.com`
- Mô tả: Local wire-preserving response patch; device validation required. No offline/HiFi promise.
- Quy tắc script:
  - `spotify-json` — `http-request`; endpoint regex `^https:\/\/(spclient\.wg\.spotify\.com|.*-spclient\.spotify\.com(:443)?)\/(artistview\/v1\/artist|album-entity-view\/v2\/album)\/`; processor `js/spotify-json.js`; source/license: `https://raw.githubusercontent.com/app2smile/rules/df6366a7024e0b3f0aa3510c5b791eea6f3cba89/js/spotify-json.js` / `MIT`
  - `spotify-proto` — `http-response`; endpoint regex `^https:\/\/(spclient\.wg\.spotify\.com|.*-spclient\.spotify\.com(:443)?)\/(bootstrap\/v1\/bootstrap|user-customization-service\/v1\/customize)(\?[^#]*)?$`; processor `js/spotify-compatible.js`; source/license: `app2smile/rules` / `MIT`

## Nhóm xung đột

- **Spotify** (`spotify-overlap`): Choose one Spotify module: their active rules overlap. Thành viên: `All_In_One.conf`, `All_In_One.sgmodule`, `modules/Spotify-Experimental.sgmodule`, `modules/Spotify-Upstream.sgmodule`, `modules/Spotify.sgmodule`.
- **RevenueCat** (`revenuecat-overlap`): Global RevenueCat handlers overlap each other and every app-scoped handler. App-scoped handlers overlap only when their User-Agent selectors match. Thành viên: `All_In_One.conf`, `All_In_One.sgmodule`, `modules/Locket.sgmodule`, `modules/RevenueCat-1Blocker.sgmodule`, `modules/RevenueCat-APTV.sgmodule`, `modules/RevenueCat-Anybox.sgmodule`, `modules/RevenueCat-Darkroom.sgmodule`, `modules/RevenueCat-Dynamic.sgmodule`, `modules/RevenueCat-Grow.sgmodule`, `modules/RevenueCat-HTTPBot.sgmodule`, `modules/RevenueCat-Legacy.sgmodule`, `modules/RevenueCat-Locket.sgmodule`, `modules/RevenueCat-Noto.sgmodule`, `modules/RevenueCat-OffScreen.sgmodule`, `modules/RevenueCat-Photomator.sgmodule`, `modules/RevenueCat-Photoroom.sgmodule`, `modules/RevenueCat-Pillow.sgmodule`, `modules/RevenueCat-ScannerPro.sgmodule`, `modules/RevenueCat-Unfold.sgmodule`, `modules/RevenueCat-VSCO.sgmodule`, `modules/RevenueCat-WidgetSmith.sgmodule`.
  - Handler chung: `All_In_One.conf`, `All_In_One.sgmodule`, `modules/RevenueCat-Dynamic.sgmodule`, `modules/RevenueCat-Legacy.sgmodule`; mỗi handler chung đụng với các module theo app: `modules/Locket.sgmodule`, `modules/RevenueCat-1Blocker.sgmodule`, `modules/RevenueCat-APTV.sgmodule`, `modules/RevenueCat-Anybox.sgmodule`, `modules/RevenueCat-Darkroom.sgmodule`, `modules/RevenueCat-Grow.sgmodule`, `modules/RevenueCat-HTTPBot.sgmodule`, `modules/RevenueCat-Locket.sgmodule`, `modules/RevenueCat-Noto.sgmodule`, `modules/RevenueCat-OffScreen.sgmodule`, `modules/RevenueCat-Photomator.sgmodule`, `modules/RevenueCat-Photoroom.sgmodule`, `modules/RevenueCat-Pillow.sgmodule`, `modules/RevenueCat-ScannerPro.sgmodule`, `modules/RevenueCat-Unfold.sgmodule`, `modules/RevenueCat-VSCO.sgmodule`, `modules/RevenueCat-WidgetSmith.sgmodule`.
  - Alias/trùng selector `locket`: `modules/Locket.sgmodule` và `modules/RevenueCat-Locket.sgmodule`.

### Nhóm provider RevenueCat + Spotify

Hai provider này dùng hostname khác nhau nên có thể cần trong cùng cấu hình; đó không phải nhóm xung đột. Vẫn chỉ bật một module trong mỗi nhóm endpoint chồng lấn ở trên.

## JavaScript processors

Danh sách đầy đủ nằm trong `config/module-catalog.json`. Các file không được module nào tham chiếu vẫn được liệt kê để thấy script orphan; không suy ra rằng chúng còn tương thích.

- `js/AlightMotion.js` — unverified; module tham chiếu: `All_In_One.conf`, `All_In_One.sgmodule`; source/license: `Not recorded` / `Not recorded`.
- `js/app2smile-bilibili-json.js` — unverified; module tham chiếu: `modules/App2Smile-Bilibili.sgmodule`; source/license: `https://raw.githubusercontent.com/app2smile/rules/df6366a7024e0b3f0aa3510c5b791eea6f3cba89/js/bilibili-json.js` / `MIT`.
- `js/app2smile-qidian.js` — unverified; module tham chiếu: `modules/App2Smile-Qidian.sgmodule`; source/license: `https://raw.githubusercontent.com/app2smile/rules/df6366a7024e0b3f0aa3510c5b791eea6f3cba89/js/qidian.js` / `MIT`.
- `js/app2smile-qqnews.js` — unverified; module tham chiếu: `modules/App2Smile-QQNews.sgmodule`; source/license: `https://raw.githubusercontent.com/app2smile/rules/df6366a7024e0b3f0aa3510c5b791eea6f3cba89/js/qq-news.js` / `MIT`.
- `js/app2smile-tieba-json.js` — unverified; module tham chiếu: `modules/App2Smile-Tieba.sgmodule`; source/license: `https://raw.githubusercontent.com/app2smile/rules/df6366a7024e0b3f0aa3510c5b791eea6f3cba89/js/tieba-json.js` / `MIT`.
- `js/app2smile-zhihu.js` — unverified; module tham chiếu: `modules/App2Smile-Zhihu.sgmodule`; source/license: `https://raw.githubusercontent.com/app2smile/rules/df6366a7024e0b3f0aa3510c5b791eea6f3cba89/js/zhihu.js` / `MIT`.
- `js/BeautyPlus.js` — unverified; module tham chiếu: `All_In_One.conf`, `All_In_One.sgmodule`, `modules/BeautyPlus.sgmodule`; source/license: `Not recorded` / `Not recorded`.
- `js/Camera360.js` — unverified; module tham chiếu: `modules/Camera360.sgmodule`; source/license: `Not recorded` / `Not recorded`.
- `js/camScanner.js` — unverified; module tham chiếu: `All_In_One.conf`, `All_In_One.sgmodule`; source/license: `Not recorded` / `Not recorded`.
- `js/Crack.js` — unverified; module tham chiếu: không có; source/license: `Not recorded` / `Not recorded`.
- `js/deleteHeader.js` — unverified; module tham chiếu: không có; source/license: `Not recorded` / `Not recorded`.
- `js/iTunes.js` — unverified; module tham chiếu: `All_In_One.conf`, `All_In_One.sgmodule`, `modules/itunes.sgmodule`; source/license: `Not recorded` / `Not recorded`.
- `js/Kinemaster.js` — unverified; module tham chiếu: `All_In_One.conf`, `All_In_One.sgmodule`; source/license: `Not recorded` / `Not recorded`.
- `js/lightroom.js` — unverified; module tham chiếu: `All_In_One.conf`, `All_In_One.sgmodule`; source/license: `Not recorded` / `Not recorded`.
- `js/Locket_DuyVinh09.js` — unverified; module tham chiếu: không có; source/license: `Not recorded` / `Not recorded`.
- `js/MeiTuXiuXiu.js` — unverified; module tham chiếu: `All_In_One.conf`, `All_In_One.sgmodule`; source/license: `Not recorded` / `Not recorded`.
- `js/nhaccuatui.js` — unverified; module tham chiếu: không có; source/license: `Not recorded` / `Not recorded`.
- `js/PicsArt.js` — unverified; module tham chiếu: `All_In_One.conf`, `All_In_One.sgmodule`; source/license: `Not recorded` / `Not recorded`.
- `js/revenuecat-compatible.js` — unverified; module tham chiếu: `All_In_One.conf`, `All_In_One.sgmodule`, `modules/Locket.sgmodule`, `modules/RevenueCat-1Blocker.sgmodule`, `modules/RevenueCat-APTV.sgmodule`, `modules/RevenueCat-Anybox.sgmodule`, `modules/RevenueCat-Darkroom.sgmodule`, `modules/RevenueCat-Dynamic.sgmodule`, `modules/RevenueCat-Grow.sgmodule`, `modules/RevenueCat-HTTPBot.sgmodule`, `modules/RevenueCat-Locket.sgmodule`, `modules/RevenueCat-Noto.sgmodule`, `modules/RevenueCat-OffScreen.sgmodule`, `modules/RevenueCat-Photomator.sgmodule`, `modules/RevenueCat-Photoroom.sgmodule`, `modules/RevenueCat-Pillow.sgmodule`, `modules/RevenueCat-ScannerPro.sgmodule`, `modules/RevenueCat-Unfold.sgmodule`, `modules/RevenueCat-VSCO.sgmodule`, `modules/RevenueCat-WidgetSmith.sgmodule`; source/license: `Not recorded` / `Not recorded`.
- `js/revenuecat.js` — unverified; module tham chiếu: `modules/RevenueCat-Legacy.sgmodule`; source/license: `Not recorded` / `Not recorded`.
- `js/RevenueCat_Universal.js` — unverified; module tham chiếu: không có; source/license: `Not recorded` / `Not recorded`.
- `js/Snow.js` — unverified; module tham chiếu: `All_In_One.conf`, `All_In_One.sgmodule`, `modules/snow.sgmodule`; source/license: `Not recorded` / `Not recorded`.
- `js/Soda.js` — unverified; module tham chiếu: `modules/SODA.sgmodule`; source/license: `Not recorded` / `Not recorded`.
- `js/SoundCloudGoPlus.js` — unverified; module tham chiếu: `All_In_One.conf`, `All_In_One.sgmodule`; source/license: `Not recorded` / `Not recorded`.
- `js/spotify-capabilities-safe.js` — experimental-unverified; module tham chiếu: `modules/Spotify-Experimental.sgmodule`; source/license: `Not recorded` / `Not recorded`.
- `js/spotify-compatible.js` — unverified; module tham chiếu: `All_In_One.conf`, `All_In_One.sgmodule`, `modules/Spotify.sgmodule`; source/license: `Not recorded` / `Not recorded`.
- `js/spotify-json.js` — experimental-unverified; module tham chiếu: `All_In_One.conf`, `All_In_One.sgmodule`, `modules/Spotify-Experimental.sgmodule`, `modules/Spotify-Upstream.sgmodule`, `modules/Spotify.sgmodule`; source/license: `https://raw.githubusercontent.com/app2smile/rules/df6366a7024e0b3f0aa3510c5b791eea6f3cba89/js/spotify-json.js` / `MIT`.
- `js/spotify-json2.js` — unverified; module tham chiếu: không có; source/license: `https://raw.githubusercontent.com/app2smile/rules/df6366a7024e0b3f0aa3510c5b791eea6f3cba89/js/spotify-json2.js` / `MIT`.
- `js/spotify-proto-test.js` — experimental-unverified; module tham chiếu: `modules/Spotify-Experimental.sgmodule`; source/license: `https://raw.githubusercontent.com/app2smile/rules/df6366a7024e0b3f0aa3510c5b791eea6f3cba89/js/spotify-proto-test.js` / `MIT`.
- `js/spotify-proto.js` — unverified; module tham chiếu: `modules/Spotify-Upstream.sgmodule`; source/license: `https://raw.githubusercontent.com/app2smile/rules/df6366a7024e0b3f0aa3510c5b791eea6f3cba89/js/spotify-proto.js` / `MIT`.
- `js/sub-store-0.selfhost.js` — unverified; module tham chiếu: `All_In_One.conf`, `All_In_One.sgmodule`; source/license: `Not recorded` / `Not recorded`.
- `js/sub-store-1.selfhost.js` — unverified; module tham chiếu: `All_In_One.conf`, `All_In_One.sgmodule`; source/license: `Not recorded` / `Not recorded`.
- `js/TrueCaller.js` — unverified; module tham chiếu: `All_In_One.conf`, `All_In_One.sgmodule`; source/license: `Not recorded` / `Not recorded`.
- `js/VSCO.js` — unverified; module tham chiếu: không có; source/license: `Not recorded` / `Not recorded`.
- `js/WinkVipCrack.js` — unverified; module tham chiếu: `All_In_One.conf`, `All_In_One.sgmodule`; source/license: `Not recorded` / `Not recorded`.
- `js/youtube.response.js` — unverified; module tham chiếu: `All_In_One.conf`, `All_In_One.sgmodule`; source/license: `Not recorded` / `Not recorded`.

## Cập nhật danh mục

Chạy `python scripts/build_app_catalog.py` để tạo `config/module-catalog.json` và tài liệu này; chạy `python scripts/build_app_catalog.py --check` trong kiểm tra để phát hiện artifact cũ. Công cụ chỉ đọc file local, không cần package cài thêm hoặc kết nối mạng.
