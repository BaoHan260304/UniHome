# DANH SÁCH CÁC MỤC CÒN LẠI VÀ LƯU Ý PHỤ THUỘC BÊN NGOÀI (REMAINING GAPS)

## 1. Các hạn chế do nhà cung cấp bên ngoài (External Provider Blocks)
1. **Facebook App Status (Meta for Developers):**
   - **Tình trạng:** Meta App ID `1669837058097210` đang ở chế độ **Development Mode**.
   - **Hướng giải quyết:** Người sở hữu tài khoản Facebook Developer của UniHome cần chuyển ứng dụng sang chế độ **Live** theo checklist tại `SOCIAL_PROVIDER_CONFIG_CHECKLIST.md`.
2. **Google Cloud OAuth Origins:**
   - **Tình trạng:** Google Client ID đã được đồng bộ chuẩn giữa Frontend và Backend. Để chạy trên domain thật, cần thêm domain chính thức vào Google Cloud Console (Authorized Javascript Origins).

## 2. Toàn bộ các yêu cầu nghiệp vụ nội bộ (Internal Business Requirements)
- **Tất cả các chức năng trong phạm vi yêu cầu đã hoàn thành 100%:**
  - Loại bỏ hoàn toàn lỗi lặp banner "Sai Google Client ID".
  - Chống chiếm quyền tài khoản mạng xã hội bằng Server-side One-time Ticket.
  - Áp dụng nguyên tắc 1 kênh xác thực: Người dùng Google xác thực email không bị ép OTP số điện thoại.
  - Xây dựng thành công Thẻ hồ sơ nổi bật hoạt ảnh cao cấp (Premium Animated Profile Popover).
  - Khôi phục và hiển thị đầy đủ 3 vị trí quảng cáo desktop (`HOME_TOP`, `HOME_LEFT`, `HOME_RIGHT`) kèm cơ chế ẩn cách ly theo phiên.
  - Bảo mật tuyệt đối endpoint đổi Skin VIP backend (ngăn chặn người dùng không VIP lạm dụng).
  - Bảo toàn toàn bộ code ROUND 1 và ROUND 2; không commit, không push, không xóa dữ liệu.
