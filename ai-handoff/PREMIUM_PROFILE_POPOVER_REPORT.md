# BÁO CÁO TRIỂN KHAI PROFILE POPOVER HOẠT ẢNH CAO CẤP (DISCORD-STYLE)

## 1. Giới thiệu chức năng
Component [`PremiumProfilePopover.tsx`](file:///c:/Users/Phan%20Huu%20Kien/Desktop/UniHome/frontend/src/components/PremiumProfilePopover.tsx) mang đến trải nghiệm nhận diện người dùng phong cách thẻ hồ sơ Discord / Steam:
- Hiển thị khi người dùng nhấp vào avatar hoặc tên thành viên trong Community Chat V2 hoặc chi tiết sản phẩm Đồ cũ.
- Tự động đồng bộ màu sắc gradient và hào quang theo 8 gói Skin VIP hoạt ảnh của người dùng mục tiêu.

## 2. Các thành phần giao diện & Dữ liệu
1. **Banner ảnh bìa kích thước lớn:**
   - Hỗ trợ ảnh bìa người dùng (`coverUrl`) hoặc tự động tạo dải màu gradient tương thích với Skin VIP của người dùng (ví dụ Skin Neon Violet: dải màu tím cyberpunk; Aurora: xanh cực quang).
2. **Avatar đè lên banner với khung viền hoạt ảnh:**
   - Kích thước lớn (88x88px), viền tròn 4px, có bóng đổ nổi bật và gắn trực tiếp class hào quang `glowClass`.
3. **Tên hiển thị & Vai trò:**
   - Text gradient chuyển động động mượt mà (`textClass`).
   - Huy hiệu vai trò tối giản: `Chủ trọ`, `Người thuê`, `Đối tác dịch vụ`, hoặc `Thành viên`.
   - Đối với tài khoản Ban Quản trị: hiển thị thẻ `🛡️ BAN QUẢN TRỊ`.
4. **Bộ đếm số liệu công khai:**
   - Số người theo dõi (`followers`).
   - Đang theo dõi (`following`).
   - Số tin đăng đang hiển thị (`activeListingsCount`) lọc từ các tin có trạng thái `ACTIVE`.
5. **Cụm nút hành động tương tác:**
   - **Xem trang cá nhân:** Điều hướng tới `/users/{id}`.
   - **Nhắn tin (DM):** Điều hướng tới `/chat?partnerId={id}`.
   - **Theo dõi / Bỏ theo dõi:** Thực hiện gọi API `POST /users/{id}/follow`, cập nhật số lượng realtime.
   - **Sửa hồ sơ:** Tự động hiển thị khi xem chính bản thân mình.
   - **Báo cáo người dùng:** Gửi thông báo vi phạm về hệ thống quản trị.
   - Vô hiệu hóa tính năng theo dõi/DM đối với tài khoản Ban Quản trị (Admin Moderation Isolation).

## 3. Bằng chứng kiểm thử giao diện thực tế
- File ảnh chụp màn hình trình duyệt: `evidence_profile_popover_live.png`.
- Kiểm thử nhấp mở popover của Nguyễn Minh An (VIP Neon) trên kênh Tán gẫu:
  - Banner tím hồng ánh sáng Neon hiển thị trọn vẹn.
  - Avatar có khung viền hào quang phát sáng `vip-ring-neon`.
  - Tên `Nguyễn Minh An` chuyển động gradient màu tím `vip-name-neon`.
  - Hiển thị đầy đủ số tin đăng: **8 tin đang đăng**, **0 người theo dõi**, **1 đang theo dõi**.
