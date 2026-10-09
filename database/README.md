# UniHome database

Có 2 cách dùng database mới.

## A. Cài mới hoàn toàn

Chạy duy nhất:

```sql
00_unihome_full_schema.sql
```

File này tạo đầy đủ `rrmsdb`, toàn bộ bảng, foreign key, index và các gói Free/VIP/Boost.

## B. Giữ database cũ và nâng cấp dữ liệu

Theo thứ tự:

1. Import `rrmsdb_backup_original.sql`.
2. Chạy `01_extend_rrmsdb.sql` để thêm các module mới nhưng không làm mất dữ liệu cũ.
3. Chạy `02_migrate_legacy_to_full.sql` để hoàn thiện kiểu tiền, index, liên kết Room và bảng lịch sử Matching.
4. Start Spring Boot. Trong môi trường development vẫn để `spring.jpa.hibernate.ddl-auto=update` để đồng bộ các thay đổi nhỏ trong entity.

## Các thay đổi quan trọng so với DB gốc

- `Property` là dữ liệu căn/khu trọ; `Listing` là tin đăng. Tin hết hạn/gia hạn không làm mất property/review.
- Listing có moderation, freshness 15 ngày, VIP/Boost theo từng tin.
- Có verification, review, report, favorite và room interest.
- Matching có hồ sơ riêng, same-room pool, tọa độ/radius và bảng `match_result` để lưu snapshot nếu cần.
- Có conversation/message, follow và notification center.
- Có package, payment QR, wallet transaction và expense cho dashboard tài chính.
- Có service listing, second-hand marketplace, blog, Q&A, advertisement và audit log.
- Tiền phòng/điện/nước/gói dịch vụ dùng `BIGINT` (VND), không dùng floating point.

Các cột legacy `post_limit`, `current_package`, `package_expiry_date` trong `users` chỉ giữ để import dữ liệu cũ. Logic VIP mới nằm ở `listing.package_tier/package_until/boost_until`.
