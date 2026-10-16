# UNIHOME ROUND 2 — ROOT CAUSE ANALYSIS & FIX LOG

## 1. ADMIN RBAC ISOLATION (CÔ LẬP TOÀN DIỆN TÀI KHOẢN ADMIN)
- **Triệu chứng trước khi sửa:**
  - Tài khoản Admin (`admin@unihome.vn`) khi đăng nhập vẫn hiển thị khung số dư xu Uni xu, thông tin điểm danh hàng ngày và các liên kết nghiệp vụ người thuê (`/tenant/*`).
  - Gọi API `/api/rewards/account`, `/checkin`, `/tasks` bằng token Admin trả về HTTP 200 hoặc ném lỗi chưa được bắt chuẩn.
- **Nguyên nhân gốc rễ (Root Cause):**
  - Frontend: [`AccountQuickMenu.tsx`](file:///c:/Users/Phan%20Huu%20Kien/Desktop/UniHome/frontend/src/components/AccountQuickMenu.tsx) hiển thị mặc định menu ví điểm và liên kết thuê trọ cho tất cả người dùng mà không lọc theo `user.role`.
  - Backend: [`RewardController.java`](file:///c:/Users/Phan%20Huu%20Kien/Desktop/UniHome/backend/src/main/java/com/exe201/rrms/controller/RewardController.java) thiếu tầng chặn quyền RBAC cho các chức năng người dùng thường; [`ApiExceptionHandler.java`](file:///c:/Users/Phan%20Huu%20Kien/Desktop/UniHome/backend/src/main/java/com/exe201/rrms/controller/ApiExceptionHandler.java) ánh xạ `SecurityException` về HTTP 401 thay vì chuẩn HTTP 403 Forbidden.
- **Giải pháp xử lý (Fix Implemented):**
  - **Frontend:** Viết lại hoàn toàn `AccountQuickMenu.tsx`, cô lập tài khoản Admin (`ADMIN`, `SUPER_ADMIN`). Admin chỉ thấy thông tin cá nhân và nút "Trang quản trị hệ thống" (`/admin`), ẩn toàn bộ ví xu, điểm danh, các tab Tenant.
  - **Backend:** Thêm kiểm tra quyền trong `RewardController.java` (`getAccount`, `checkin`, `getTasks`, `claimTask`) ném `SecurityException("Tài khoản quản trị viên không tham gia chương trình tích điểm thưởng.")`. Cập nhật `ApiExceptionHandler.java` ánh xạ `SecurityException` chuẩn HTTP 403.
- **Kết quả xác minh (Evidence):**
  - Gọi `GET /api/rewards/account` với Admin Token trả về đúng `HTTP 403 Forbidden` (`{"status":403,"message":"Tài khoản quản trị viên không tham gia..."}`).

---

## 2. REWARD DAILY CHECK-IN SYNC & WELCOME BANNER FIX
- **Triệu chứng trước khi sửa:**
  - Sau khi người dùng đã điểm danh trong ngày (theo múi giờ `Asia/Ho_Chi_Minh`), banner chào mừng ở trang chủ vẫn hiển thị nút kêu gọi "Điểm danh ngay".
- **Nguyên nhân gốc rễ (Root Cause):**
  - API `RewardService.java` chưa cung cấp trường cờ boolean chuẩn `checkedInToday` và `alreadyClaimedToday` trong đối tượng tổng quan tài khoản (`getAccountSummary`), dẫn đến frontend phải suy đoán từ danh sách lịch sử.
- **Giải pháp xử lý (Fix Implemented):**
  - **Backend:** Cập nhật `RewardService.java` phương thức `getAccountSummary` trả về trực tiếp `checkedInToday: true`, `alreadyClaimedToday: true`, `todayPoints`, và `nextClaimPoints`.
  - **Frontend:** Cập nhật [`App.tsx`](file:///c:/Users/Phan%20Huu%20Kien/Desktop/UniHome/frontend/src/App.tsx) trong hàm `checkWelcome`. Khi `checkedInToday === true`, biến `needCheckin` được gán `false`, banner chỉ hiển thị lời chào "Chào mừng bạn quay lại!" và ẩn hoàn toàn nút CTA điểm danh.

---

## 3. ZERO VISUAL VIP BADGES & 8 ANIMATED VIP SKINS
- **Triệu chứng trước khi sửa:**
  - Giao diện chat cộng đồng và hồ sơ công khai hiển thị các huy hiệu/nhãn chữ dán đè dạng tĩnh (`m.profileBadge`, `m.vipTier`, `p.profileBadge`).
- **Nguyên nhân gốc rễ (Root Cause):**
  - `CommunityPage.tsx`, `PublicProfile.tsx` có các thẻ `<span>` badge hiển thị nhãn chữ VIP đè lên avatar và nickname. Chưa có hệ thống CSS Keyframe Animation toàn diện cho 8 Skin VIP.
- **Giải pháp xử lý (Fix Implemented):**
  - **CSS:** Bổ sung đầy đủ 8 bộ Keyframes và Classes (`vip-name-*`, `vip-ring-*`, `vip-bubble-*`) vào [`frontend/src/index.css`](file:///c:/Users/Phan%20Huu%20Kien/Desktop/UniHome/frontend/src/index.css), tích hợp `@media (prefers-reduced-motion: reduce)`.
  - **Logic:** Cập nhật `getVipCosmeticStyle` trong [`frontend/src/lib/api.ts`](file:///c:/Users/Phan%20Huu%20Kien/Desktop/UniHome/frontend/src/lib/api.ts) trả về các lớp hoạt ảnh và ẩn toàn bộ badge (`badgeClass: 'hidden'`).
  - **UI Cleanup:** Xóa bỏ hoàn toàn các thẻ badge trong [`CommunityPage.tsx`](file:///c:/Users/Phan%20Huu%20Kien/Desktop/UniHome/frontend/src/pages/CommunityPage.tsx) và [`PublicProfile.tsx`](file:///c:/Users/Phan%20Huu%20Kien/Desktop/UniHome/frontend/src/pages/PublicProfile.tsx).
  - **Backend API:** Bổ sung endpoint `PUT /api/users/cosmetic-style` trong [`UserController.java`](file:///c:/Users/Phan%20Huu%20Kien/Desktop/UniHome/backend/src/main/java/com/exe201/rrms/controller/UserController.java) cho phép người dùng chuyển đổi phong cách VIP đã sở hữu.

---

## 4. DRAFT & EDIT ROUNDTRIP ĐỦ 4 LOẠI TIN
- **Triệu chứng trước khi sửa:**
  - Người dùng chỉnh sửa tin đăng loại Dịch vụ (Service) hoặc Đồ cũ (Secondhand) gặp lỗi mapping dữ liệu khi load draft hoặc lưu cập nhật.
- **Nguyên nhân gốc rễ (Root Cause):**
  - [`PostCreatePage.tsx`](file:///c:/Users/Phan%20Huu%20Kien/Desktop/UniHome/frontend/src/pages/PostCreatePage.tsx) thiếu xử lý đồng bộ giữa endpoint `GET /api/listings/{id}` và form tạo tin; thiếu hỗ trợ route `/edit/:id`.
- **Giải pháp xử lý (Fix Implemented):**
  - Bổ sung định tuyến `Route path="/edit/:id"` trong [`App.tsx`](file:///c:/Users/Phan%20Huu%20Kien/Desktop/UniHome/frontend/src/App.tsx).
  - Hoàn thiện roundtrip tải dữ liệu và cập nhật `PUT /api/listings/{id}` cho cả 4 danh mục: Phòng trọ (`ROOM`), Ở ghép (`ROOMMATE`), Đồ cũ (`SECOND_HAND`), Dịch vụ (`SERVICE`).
