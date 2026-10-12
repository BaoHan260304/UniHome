# UNIHOME ROUND 2 — REQUIREMENT TRACEABILITY MATRIX

Tài liệu đối chiếu và chứng thực 100% các yêu cầu nghiệp vụ trong đợt triển khai Round 2 (UniHome Master Specification).

## 1. QUY TẮC BẤT BIẾN (INVARIANTS & CONSTRAINTS)

| Mã yêu cầu | Mô tả quy tắc | Triển khai thực tế | Trạng thái |
|---|---|---|---|
| **INV-01** | Tuyệt đối không xóa/reset code, không force push | Toàn bộ source code được bảo toàn; không chạy lệnh reset, checkout hay commit trái phép. | **PASS** |
| **INV-02** | Tuyệt đối không drop database `rrmsdb` | Database MySQL cục bộ được bảo toàn dữ liệu gốc, không chạy lại toàn bộ schema. | **PASS** |
| **INV-03** | Loại bỏ toàn bộ huy hiệu VIP tĩnh (`VIP`, `VIP GOLD`, `VIP NEON`, `★ VIP`) | Xóa hoàn toàn các thẻ badge trong `CommunityPage.tsx`, `PublicProfile.tsx`. Ẩn lớp `badgeClass`. | **PASS** |
| **INV-04** | Nhận diện VIP qua hoạt ảnh CSS mượt mà (8 Skins) | Xây dựng 8 bộ keyframes trong `index.css` với dải màu chuyển động, vòng sáng viền và khung viền tin nhắn. | **PASS** |
| **INV-05** | Hỗ trợ tiếp cận (`prefers-reduced-motion`) | CSS Media Query tự động ngắt chuyển động thành màu tĩnh cho người dùng nhạy cảm ánh sáng. | **PASS** |
| **INV-06** | Cô lập toàn bộ tài khoản Admin (Moderation-only) | Admin không có ví xu, không điểm danh, không matching profile. API ném HTTP 403 Forbidden. | **PASS** |
| **INV-07** | Đồng bộ Banner chào mừng sau khi điểm danh | Khi đã điểm danh trong ngày (`Asia/Ho_Chi_Minh`), banner ẩn nút CTA điểm danh ngay lập tức. | **PASS** |

---

## 2. NHÓM CHỨC NĂNG CỘNG ĐỒNG (COMMUNITY V2 - 64 ITEMS SUMMARY)

| Phân hệ | Yêu cầu chính | Chi tiết thực thi | Kết quả |
|---|---|---|---|
| **Channels** | Kênh thảo luận sinh viên | Kênh UniHome Lounge ID 1 hoạt động ổn định, thống kê người online trực tiếp. | **PASS** |
| **Rich Chat** | Hỗ trợ tin nhắn Đa phương tiện | Gửi nhận tin nhắn Văn bản, Hình ảnh tải lên, Sticker Pack động, xem trước Reply. | **PASS** |
| **Reactions** | Thả biểu cảm cảm xúc | Đầy đủ 6 biểu cảm emoji (❤️, 👍, 😂, 🔥, 😮, 😢), hỗ trợ bấm bật/tắt (toggle). | **PASS** |
| **Message Lifecycle** | Chỉnh sửa và Xóa tin nhắn | Hỗ trợ sửa tin nhắn trong khung thời gian quy định, hiển thị nhãn "(đã sửa)". | **PASS** |
| **Search & History** | Tìm kiếm và xem lịch sử | Tìm kiếm tin nhắn theo từ khóa, lọc lịch sử chat công khai của từng người dùng. | **PASS** |
| **Moderation** | Báo cáo và Xử lý vi phạm | Thành viên gửi báo cáo vi phạm; Quản trị viên thực hiện cấm chat tạm thời (Timeout). | **PASS** |

---

## 3. NHÓM TIN ĐĂNG VÀ NGHIỆP VỤ LIÊN QUAN (MARKETPLACE & LISTINGS)

| Phân hệ | Yêu cầu chính | Chi tiết thực thi | Kết quả |
|---|---|---|---|
| **Draft & Edit** | Lưu nháp và Chỉnh sửa cả 4 loại tin | Hỗ trợ đầy đủ Phòng trọ, Ở ghép, Đồ cũ và Dịch vụ. Route `/edit/:id` load và lưu chuẩn. | **PASS** |
| **Lifecycle** | Ẩn, hiện và quản lý tin | Người dùng chủ động ẩn/hiện tin đăng; Quản trị viên kiểm duyệt tin đăng. | **PASS** |
| **Social** | Theo dõi và Thông báo | Bấm theo dõi/bỏ theo dõi sinh viên, hệ thống tự động phát thông báo `NEW_FOLLOWER`. | **PASS** |
| **External Integrations** | Cổng thanh toán & SMS OTP thật | Khóa tích hợp bên thứ ba chưa được cung cấp trong môi trường cục bộ. | **NOT CONFIGURED** |
