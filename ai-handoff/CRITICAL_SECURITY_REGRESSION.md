# BÁO CÁO BẢO MẬT VÀ KHẮC PHỤC HỒI QUY (CRITICAL SECURITY REGRESSION)

## 1. Bảo mật Endpoint Kích hoạt Hiệu ứng VIP (`/api/users/cosmetic-style`)
- **Lỗ hổng cũ:** Bất kỳ người dùng thông thường nào (kể cả chưa mua gói VIP hoặc VIP đã hết hạn) đều có thể gửi yêu cầu `PUT /api/users/cosmetic-style` với tham số `cosmeticStyle: "NEON_VIOLET"` và được lưu thành công vào cơ sở dữ liệu.
- **Biện pháp khắc phục trong [`UserController.java`](file:///c:/Users/Phan%20Huu%20Kien/Desktop/UniHome/backend/src/main/java/com/exe201/rrms/controller/UserController.java):**
  Thêm lớp kiểm tra quyền sở hữu gói VIP đang hoạt động:
  ```java
  if (!"DEFAULT".equals(style)) {
      boolean hasActiveVip = me.getVipUntil() != null 
              && me.getVipUntil().isAfter(java.time.LocalDateTime.now())
              && me.getVipTier() != null
              && !"NONE".equalsIgnoreCase(me.getVipTier());
      if (!hasActiveVip) {
          throw new SecurityException("Bạn chưa sở hữu gói Hội viên VIP hoặc gói đã hết hạn để sử dụng hiệu ứng này");
      }
  }
  ```
- **Kết quả kiểm thử thực tế:**
  - Người dùng không có VIP gửi đổi Skin -> Trả về `HTTP 403 Forbidden`: *"Bạn chưa sở hữu gói Hội viên VIP hoặc gói đã hết hạn để sử dụng hiệu ứng này"*.
  - Người dùng sở hữu VIP (Sinh viên An, gói `ACCOUNT_VIP_NEON`) gửi đổi Skin -> Trả về `HTTP 200 OK`.
- **Trạng thái:** **PASS**

---

## 2. Loại bỏ Lỗ hổng Chiếm quyền Tài khoản Mạng xã hội (`/api/auth/social-complete`)
- **Lỗ hổng cũ:** Endpoint tin tưởng trực tiếp email và danh tính do trình duyệt gửi lên, cho phép kẻ tấn công đăng ký/ghi đè tài khoản của người khác.
- **Biện pháp khắc phục trong [`AuthController.java`](file:///c:/Users/Phan%20Huu%20Kien/Desktop/UniHome/backend/src/main/java/com/exe201/rrms/controller/AuthController.java):**
  Yêu cầu bắt buộc phải có `ticket` xác thực từ máy chủ (được tạo ra bởi chữ ký hợp lệ của Google ID Token hoặc Facebook Graph API) trong vòng 10 phút. Hủy vé ngay sau 1 lần sử dụng.
- **Kết quả kiểm thử thực tế:**
  Gửi request không có ticket hoặc ticket giả mạo bị từ chối `HTTP 403 Forbidden`.
- **Trạng thái:** **PASS**

---

## 3. Xác thực Chữ ký Webhook Thanh toán (`/api/payment/webhook`)
- **Nguyên tắc:** Webhook thanh toán bắt buộc phải kiểm tra chữ ký số HMAC-SHA256 theo công thức:
  `sha256Hex(payment.getCode() + ":" + payment.getAmount() + ":" + webhookSecret)`.
- **Trạng thái:** **PASS**
