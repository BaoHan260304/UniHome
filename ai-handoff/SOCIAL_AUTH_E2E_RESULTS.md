# BÁO CÁO KIỂM THỬ XÃ HỘI (GOOGLE & FACEBOOK AUTH E2E)

## 1. Google Authentication
- **Hiện tượng lỗi ban đầu:** Giao diện `/login` và `/register` hiển thị hai banner lỗi màu đỏ cạnh nhau chứa cùng dòng chữ "Sai Google Client ID".
- **Nguyên nhân gốc rễ:**
  1. `Login.tsx` truyền `<SocialAuthSection onError={setServerError} />`, trong khi bản thân `SocialAuthSection.tsx` đã tự render thông báo lỗi qua state nội bộ `{actionError}`.
  2. `backend/src/main/resources/application.properties` để trống biến `${GOOGLE_CLIENT_ID:}` khiến giá trị `googleClientId` trong Spring Boot là rỗng, không khớp với Google Audience từ Frontend.
- **Biện pháp đã xử lý:**
  1. Cập nhật `application.properties`: gán giá trị mặc định cho `unihome.google.client-id` khớp chuẩn với `VITE_GOOGLE_CLIENT_ID` (`677321146530-kgbfvsajpacefkt95e5j6l2ngc9lqm30.apps.googleusercontent.com`).
  2. Xóa bỏ prop `onError={setServerError}` dư thừa trong cả [`Login.tsx`](file:///c:/Users/Phan%20Huu%20Kien/Desktop/UniHome/frontend/src/pages/Login.tsx) và [`Register.tsx`](file:///c:/Users/Phan%20Huu%20Kien/Desktop/UniHome/frontend/src/pages/Register.tsx).
- **Kết quả nghiệm thu trực tiếp:**
  - Nút GIS chuẩn của Google được render sạch đẹp trên trang Login, không có bất kỳ banner lỗi lặp lại nào.
  - Bằng chứng ảnh thật: `evidence_login_live.png`.

---

## 2. Phòng chống chiếm đoạt tài khoản (Anti-Hijack Social Completion)
- **Lỗ hổng trước đây:** Client gửi trực tiếp `{ email, sub, authProvider }` lên `/api/auth/social-complete` mà không có bằng chứng chứng minh phiên OAuth hợp lệ từ Google/Facebook.
- **Cơ chế bảo mật mới:**
  - Khi người dùng mới xác thực thành công qua Google/Facebook tại `/api/auth/google` hoặc `/api/auth/facebook`, hệ thống sinh một mã vé dùng một lần `ticket` (UUID) lưu vào bộ nhớ cache an toàn kèm thời gian hết hạn 10 phút.
  - Client chỉ nhận được `ticket` và chuyển tiếp đến trang `/social-complete`.
  - Endpoint `/api/auth/social-complete` bắt buộc phải có `ticket` hợp lệ, lấy đúng danh tính đã được Google/Facebook bảo chứng, sau đó hủy vé ngay lập tức.
- **Bằng chứng kiểm thử thực tế:**
  ```json
  POST /api/auth/social-complete
  Body: { "email": "hacker@unihome.vn", "fullName": "Hacker", "phone": "0912345678" }
  Response: HTTP 403 Forbidden
  {
    "status": 403,
    "message": "Phiên hoàn tất liên kết mạng xã hội không hợp lệ hoặc thiếu mã xác thực (ticket missing)",
    "path": "/api/auth/social-complete"
  }
  ```
- **Trạng thái:** **PASS**

---

## 3. Facebook Login
- **Trạng thái:** **BLOCKED BY PROVIDER**
- **Chi tiết:** Meta App ID `1669837058097210` thông báo lỗi từ Meta: "Ứng dụng không hoạt động: Ứng dụng này hiện không truy cập được và nhà phát triển đã biết về sự cố này". Xem chi tiết hướng dẫn tại `SOCIAL_PROVIDER_CONFIG_CHECKLIST.md`.
