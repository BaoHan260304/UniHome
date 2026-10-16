# UniHome Complete

Phiên bản mở rộng từ source code UniHome ban đầu, giữ phong cách UI/UX Tailwind hiện có và bổ sung toàn bộ core flow của bài toán:

- Marketplace tìm phòng nâng cao theo khu vực, trường, giá, bán kính, verified, sort.
- Chủ trọ đăng miễn phí nhưng phải qua `PENDING_REVIEW` trước khi public.
- `NEED_REVISION`, `REJECTED`, `SUSPENDED`, freshness 15 ngày, archive/history.
- VIP/Featured/Boost áp dụng trên từng listing; không tăng số bài được đăng.
- Remote / On-site verification và checklist.
- Guest phải đăng nhập trước khi xem SĐT/Zalo; không cần chủ trọ approve yêu cầu thuê.
- Quan tâm phòng + same-room roommate matching + nearby matching 1/3/5 km.
- Rule engine tính % ổn định; AI chỉ giải thích lý do, không dùng chiêm tinh.
- Public profile, follow, Chat Center.
- Wallet, QR, lịch sử giao dịch, direct package purchase.
- Admin console: user/role, moderation, verification, finance, package, report, service, blog, ads, audit.
- Dịch vụ tiện ích, chợ đồ cũ, blog, Q&A, quảng cáo banner ngoài web.

## Chạy nhanh

### Database
1. Import `database/rrmsdb_backup_original.sql`.
2. Run `database/01_extend_rrmsdb.sql`.

### Backend
Set environment variables from `backend/.env.example`, then run Spring Boot.

### Frontend
Copy `frontend/.env.example` to `.env`, set API URL / Google Client ID, then:

```bash
npm install
npm run dev
```

## Lưu ý tích hợp bên ngoài

Google Login, tọa độ/map, VietQR và AI Gemini cần cấu hình credential / môi trường. Xem file hướng dẫn DOCX đi kèm trong thư mục `docs/`.
