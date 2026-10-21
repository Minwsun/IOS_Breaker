# IOS Breaker — cấu hình Shadowrocket tự host

Branch triển khai: `codex/self-hosted-app-expansion`. Thêm module từ nguồn đã kiểm tra, lưu script/tài nguyên trong repo và ghim nguồn bằng commit + SHA-256.

**Trạng thái:** branch thử nghiệm dành cho PR vào `main`. Dùng URL raw của branch bên dưới để thử các thay đổi trước khi merge. Module mới chưa được kiểm thử trên iPhone/Shadowrocket; GitHub Pages/Sub-Store frontend chưa được triển khai trong đợt này.

## Module đã thêm

Đợt mở rộng 22/10 thêm **16 profile app RevenueCat**, một module Dynamic dùng chung và cập nhật alias Locket. Gồm **1Blocker, VSCO, Pillow, Scanner Pro, Anybox, APTV, Darkroom, Photomator, Photoroom, Locket, OffScreen, Noto, WidgetSmith, HTTPBot, Grow, Unfold**. Mã mới giữ customer ID và dữ liệu không liên quan, lấy ID sản phẩm từ mapping thay vì đoán, giữ nguyên response có chữ ký và xử lý lỗi/timeout. Các profile dựa trên User-Agent trong script cũ, chưa xác minh trên phiên bản app hiện tại.

Xem [module và cách dùng RevenueCat](docs/revenuecat-usage.md), [catalog và nhóm xung đột](docs/app-catalog.md), [24 mục nguồn cho 22 app](docs/app-expansion-research.md). Catalog ghi rõ script cục bộ, nguồn, giấy phép và mức kiểm chứng; mục nghiên cứu không đồng nghĩa với module đã triển khai.

| App | File | Phạm vi |
| --- | --- | --- |
| Spotify | [Spotify.sgmodule](modules/Spotify.sgmodule) | Bộ xử lý tương thích cục bộ giữ trường protobuf chưa biết; đã tích hợp trong All In One, chưa thử trên thiết bị |
| Spotify upstream | [Spotify-Upstream.sgmodule](modules/Spotify-Upstream.sgmodule) | Bản upstream được ghim để đối chiếu/dự phòng; không bật cùng bản trên |
| Spotify thử nghiệm | [Spotify-Experimental.sgmodule](modules/Spotify-Experimental.sgmodule) | Protobuf thử nghiệm + adapter device-capabilities có kiểm tra lỗi; dùng thay stable |
| Bilibili | [App2Smile-Bilibili.sgmodule](modules/App2Smile-Bilibili.sgmodule) | Lọc JSON; chưa bao gồm transformer protobuf |
| Baidu Tieba | [App2Smile-Tieba.sgmodule](modules/App2Smile-Tieba.sgmodule) | Lọc JSON + rule cục bộ; chưa bao gồm protobuf |
| Qidian | [App2Smile-Qidian.sgmodule](modules/App2Smile-Qidian.sgmodule) | Lọc splash, quảng cáo và cấu hình JSON |
| Zhihu | [App2Smile-Zhihu.sgmodule](modules/App2Smile-Zhihu.sgmodule) | Lọc quảng cáo/gợi ý JSON + rule cục bộ |
| QQNews | [App2Smile-QQNews.sgmodule](modules/App2Smile-QQNews.sgmodule) | Lọc splash/feed JSON; có thể phụ thuộc cache |

Các module app mới được để riêng, chưa tự bật trong All In One. Nguồn và ứng viên khác: [nghiên cứu của Luna](docs/research-apps-luna.md).

Nghiên cứu sâu Premium: [1Blocker, Endel và các mapping khác](docs/premium-research-luna.md), [Spotify hiện tại và lỗi đã sửa](docs/spotify-current.md), [các hướng client sửa đổi công khai](docs/public-client-options.md). Apple Lookup ngày 21/10/2026 trả Spotify 9.1.92; chưa có kiểm thử thiết bị xác nhận mở Premium trên bản này.

## Cài trên thiết bị

1. Cài [Shadowrocket từ App Store](https://apps.apple.com/app/id932747118).
2. Trong tab cấu hình, nhập URL raw của module đã publish. Trang `index.html` có nút sao chép và deep link.
3. Nếu dùng rewrite HTTPS: tạo/cài CA của Shadowrocket trên thiết bị, bật tin cậy chứng chỉ và HTTPS Decryption cho các hostname trong module.
4. Bật kết nối và thử từng module. Không bật hai bộ xử lý Spotify cùng lúc; stable đã có trong All In One. RevenueCat Dynamic đã có trong All In One: không bật thêm module RevenueCat theo app, Legacy hoặc Locket khi dùng cấu hình này. Với cấu hình riêng, chọn một bộ xử lý RevenueCat cho cùng request.

URL của branch hiện tại:

- [All In One — module](https://raw.githubusercontent.com/Minwsun/IOS_Breaker/refs/heads/codex/self-hosted-app-expansion/All_In_One.sgmodule)
- [All In One — config](https://raw.githubusercontent.com/Minwsun/IOS_Breaker/refs/heads/codex/self-hosted-app-expansion/All_In_One.conf)
- [Spotify stable](https://raw.githubusercontent.com/Minwsun/IOS_Breaker/refs/heads/codex/self-hosted-app-expansion/modules/Spotify.sgmodule)
- [Locket — đường dẫn đã sửa](https://raw.githubusercontent.com/Minwsun/IOS_Breaker/refs/heads/codex/self-hosted-app-expansion/modules/Locket.sgmodule)

Spotify upstream nêu iOS 15+, chỉ thay đổi một phần hành vi client, không đặt chất lượng Very High. Không bảo đảm tải offline, lossless, quyền Premium thật hoặc hoạt động trên mọi phiên bản app. Xem [hướng dẫn maintainer](https://github.com/app2smile/rules/issues/225) và [báo cáo phát nhạc](https://github.com/app2smile/rules/issues/274). Nếu gặp lỗi, tắt module rồi kiểm tra route/khu vực tài khoản và bật lại từng phần.

## Phạm vi tự host

- Script/rule trong cấu hình được tải từ repo này. SODA, Snow, iTunes và Camera360 đã chuyển sang các bản JS có sẵn trong repo.
- Website lưu thư viện/font trong `assets/vendor/`; profile tải từ `assets/locket.mobileconfig`.
- Sub-Store backend 2.42.6 và frontend 2.34.1 lưu cục bộ, có license/source archive. Bundle dẫn về frontend của repo thay vì `sub-store.vercel.app`.
- Cần publish website tại `https://minwsun.github.io/IOS_Breaker/` và giữ nguyên các thư mục con để frontend mặc định hoạt động. Branch raw không tự triển khai GitHub Pages. Domain khác có cùng đường dẫn `/IOS_Breaker/assets/sub-store/`: `python scripts/prepare_substore.py --frontend https://YOUR-HOST/IOS_Breaker/assets/sub-store/`. Nếu đổi cả đường dẫn, cần cập nhật base của frontend và manifest theo `docs/web-self-hosting.md`.
- API Spotify/các app, DNS, subscription do bạn nhập và chức năng dịch online vẫn là dịch vụ ngoài. Tự host mã/tài nguyên không có nghĩa là tự vận hành máy chủ các app.

Chi tiết: [nguồn và giấy phép](docs/THIRD_PARTY.md), [tài nguyên website](docs/web-self-hosting.md). Các script cũ chưa rõ nguồn được ghi riêng, không gán lại tác giả hoặc giấy phép.

## Bảo trì và kiểm tra

Python 3.8+ và Node.js hỗ trợ `node --test`; không cần cài npm dependency:

```sh
python scripts/build_premium_modules.py
python scripts/render_configs.py
python scripts/build_app_catalog.py
python scripts/prepare_substore.py
python -m unittest discover -s tests -v
node --test tests/spotify.test.js tests/spotify-compatible.test.js tests/revenuecat.test.js
python scripts/verify_repo.py
git diff --check
```

Hai file All In One được sinh từ `config/all-in-one.template.sgmodule`; module RevenueCat được sinh từ `config/revenuecat-apps.json`. Sửa nguồn rồi chạy các generator để tránh lệch bản. Sau khi merge sang main, đổi ref cho tất cả đường dẫn phân phối; cả `build_premium_modules.py` và `render_configs.py` nhận `--ref main`, sau đó sinh lại catalog. Các module khác và website cũng cần đổi ref tương ứng.

Khôi phục bản upstream đã review, không tự nâng lên latest:

```sh
python scripts/vendor_assets.py --group rules
python scripts/vendor_assets.py --group spotify
python scripts/vendor_assets.py --group sub-store
# Bash/WSL: bash sync-rules.sh tương đương nhóm rules.
```

Downloader chỉ ghi sau khi tải HTTPS thành công, kiểm tra nội dung và SHA-256; 404/hash sai không ghi đè bản đang có. Đồng bộ theo từng file, không phải transaction cả nhóm. Hai amendment list hiện trống có chú thích; APNs/TestFlight/Zalo giữ bản có sẵn. Rule ChatGPT thay bằng OpenAI list, các list Blackmatrix dùng định dạng Shadowrocket.

Kiểm tra offline xác nhận checksum, đường dẫn, cú pháp JS và fixture tổng hợp; chưa thay thế thử trên iPhone. `spotify-json2.js` nguyên bản được giữ để đối chiếu, module thử nghiệm dùng `spotify-capabilities-safe.js` để xử lý body rỗng và không tự gán khả năng HiFi.
