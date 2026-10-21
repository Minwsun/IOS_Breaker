# Module RevenueCat mở rộng

Ngày cập nhật: 22/10/2026. Các module dùng chung `js/revenuecat-compatible.js` trong repo này, thay cách tạo lại toàn bộ customer của `Crack.js`. Kiểm thử hiện tại dùng dữ liệu giả lập, chưa xác nhận mở Pro/Premium trên app thật.

## Chọn cấu hình

- Nếu dùng All In One: bộ xử lý Dynamic đã có sẵn. Không bật thêm module RevenueCat khác, kể cả Legacy hoặc Locket.
- Nếu dùng cấu hình riêng: chọn `modules/RevenueCat-Dynamic.sgmodule` cho các request RevenueCat phù hợp, hoặc một module theo app bên dưới. Không bật chồng hai module cùng bắt một request.
- Module theo app kiểm tra User-Agent dựa trên dấu vết script cũ. Nếu app đổi User-Agent, chuyển nhà cung cấp hoặc không còn gửi request phù hợp, module sẽ không tác động. Đây là danh sách ứng viên thử nghiệm, không phải danh sách app được chứng nhận hoạt động.

| App | Module |
| --- | --- |
| 1Blocker | [RevenueCat-1Blocker](../modules/RevenueCat-1Blocker.sgmodule) |
| VSCO | [RevenueCat-VSCO](../modules/RevenueCat-VSCO.sgmodule) |
| Pillow | [RevenueCat-Pillow](../modules/RevenueCat-Pillow.sgmodule) |
| Scanner Pro | [RevenueCat-ScannerPro](../modules/RevenueCat-ScannerPro.sgmodule) |
| Anybox | [RevenueCat-Anybox](../modules/RevenueCat-Anybox.sgmodule) |
| APTV | [RevenueCat-APTV](../modules/RevenueCat-APTV.sgmodule) |
| Darkroom | [RevenueCat-Darkroom](../modules/RevenueCat-Darkroom.sgmodule) |
| Photomator | [RevenueCat-Photomator](../modules/RevenueCat-Photomator.sgmodule) |
| Photoroom | [RevenueCat-Photoroom](../modules/RevenueCat-Photoroom.sgmodule) |
| Locket | [RevenueCat-Locket](../modules/RevenueCat-Locket.sgmodule) |
| OffScreen | [RevenueCat-OffScreen](../modules/RevenueCat-OffScreen.sgmodule) |
| Noto | [RevenueCat-Noto](../modules/RevenueCat-Noto.sgmodule) |
| WidgetSmith | [RevenueCat-WidgetSmith](../modules/RevenueCat-WidgetSmith.sgmodule) |
| HTTPBot | [RevenueCat-HTTPBot](../modules/RevenueCat-HTTPBot.sgmodule) |
| Grow | [RevenueCat-Grow](../modules/RevenueCat-Grow.sgmodule) |
| Unfold | [RevenueCat-Unfold](../modules/RevenueCat-Unfold.sgmodule) |

`modules/Locket.sgmodule` là alias giữ đường dẫn tải cũ. Nguồn bằng chứng User-Agent nằm trong [manifest app](../config/revenuecat-apps.json); toàn bộ module và nhóm xung đột nằm trong [catalog](app-catalog.md).

## Cơ chế và giới hạn

Script chỉ xử lý endpoint customer/receipt v1 trên `api.revenuecat.com` và `api.rc-backup.com`. Request bỏ cache ETag; response không có chữ ký được ghép với mapping sản phẩm lấy từ chính hostname RevenueCat của request. Authorization chỉ được giữ trong bộ nhớ và gửi đến hostname đó, không lưu hoặc ghi log. Lookup chờ tối đa 4,5 giây khi runtime cung cấp timer.

Mapping cung cấp ID sản phẩm và entitlement đã cấu hình. Script giữ customer ID, các trường chưa biết, transaction ID có sẵn và dữ liệu không liên quan; đặt hạn phía client cho các entitlement có trong mapping. Nó có thể tạo ngày mua phía client khi bản gốc không có. Nó không tạo giao dịch App Store, chữ ký hợp lệ hoặc quyền truy cập máy chủ. Mapping không chứng minh người dùng đã mua sản phẩm. Sản phẩm có Android base plan được bỏ qua.

Response có `X-Signature` hoặc `X-RevenueCat-Signature` được giữ nguyên. Thiếu Authorization/customer ID, HTTP lỗi, JSON lỗi, mapping rỗng hoặc quá giới hạn cũng giữ nguyên response. App kiểm tra quyền trên server, dùng provider khác hoặc yêu cầu xác minh chữ ký cần được đánh giá riêng; không có bảo đảm module này tác động được.

## Thử trên thiết bị

Publish branch và tài nguyên trước khi nhập URL raw. Bật MITM cho hai hostname trong module và cài/tin cậy CA theo hướng dẫn Shadowrocket. Đóng rồi mở lại app; thử tính năng cụ thể, ghi phiên bản iOS/app và kết quả, không chỉ nhìn nhãn Premium. Nếu không thay đổi, kiểm tra request có đúng endpoint và User-Agent hay không, response có chữ ký hay không và mapping có tồn tại hay không. Không đưa Authorization hoặc dữ liệu khách hàng vào issue công khai.

Chưa có kiểm thử iPhone, đăng nhập tài khoản hoặc gọi API app thật trong lần triển khai này. Xem [nghiên cứu protocol](revenuecat-protocol-research.md) và [nguồn ứng viên bổ sung](app-expansion-research.md).
