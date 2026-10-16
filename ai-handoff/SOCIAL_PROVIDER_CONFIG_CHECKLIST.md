# HƯỚNG DẪN CẤU HÌNH NHÀ CUNG CẤP OAUTH (GOOGLE & FACEBOOK)

Tài liệu này cung cấp danh sách kiểm tra (checklist) để kích hoạt hoàn toàn Google Sign-In và Facebook Login trên môi trường Production/Staging khi có quyền quản trị viên trên Google Cloud Console và Meta for Developers.

---

## 1. Cấu hình Google Cloud Console (OAuth 2.0 Client ID)

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/apis/credentials).
2. Chọn dự án UniHome.
3. Trong mục **OAuth 2.0 Client IDs**, mở cấu hình của Web Client ID hiện tại (`677321146530-kgbfvsajpacefkt95e5j6l2ngc9lqm30.apps.googleusercontent.com`):
   - **Authorized JavaScript origins:**
     - `http://localhost:5173`
     - `http://localhost:8080`
     - `https://unihome.vn` (tên miền production)
   - **Authorized redirect URIs:**
     - `http://localhost:5173`
     - `https://unihome.vn/login`
4. Trong mục **OAuth consent screen**:
   - Publishing status: Chuyển sang **In production** (hoặc thêm email tester vào danh sách Test Users nếu ở chế độ Testing).
   - Scopes yêu cầu: `.../auth/userinfo.email`, `.../auth/userinfo.profile`, `openid`.

---

## 2. Cấu hình Meta for Developers (Facebook Login)

Hiện tại Meta App ID `1669837058097210` đang bị chặn với thông báo "Ứng dụng không hoạt động". Cần thực hiện các bước sau:

1. Đăng nhập vào [Meta for Developers](https://developers.facebook.com/apps/1669837058097210/).
2. **App Mode (Chế độ ứng dụng):**
   - Đang ở chế độ **Development**. Để người dùng bất kỳ có thể đăng nhập, hãy chuyển trạng thái ở thanh điều hướng trên cùng sang **Live** (Trực tiếp).
   - Yêu cầu trước khi chuyển Live: Cung cấp URL Chính sách bảo mật (`https://unihome.vn/terms`) và biểu tượng ứng dụng.
3. **Facebook Login Settings (Cài đặt Đăng nhập bằng Facebook):**
   - Bật **Đăng nhập OAuth từ web**.
   - Thêm vào **URI chuyển hướng OAuth hợp lệ**:
     - `http://localhost:5173/`
     - `https://unihome.vn/`
4. **App Review (Xét duyệt ứng dụng):**
   - Quyền `public_profile` và `email` mặc định có quyền truy cập chuẩn. Kiểm tra để đảm bảo đã bật cho người dùng công khai.
5. **Đồng bộ Secret về Backend (Nâng cao):**
   - Sao chép `App Secret` từ Meta Dashboard và thêm vào biến môi trường:
     `FACEBOOK_APP_SECRET=your_app_secret`
