# UNIHOME ROUND 2 — BROWSER E2E TEST MATRIX (CASES A - AO)

Hệ thống đã thực thi toàn bộ kịch bản kiểm thử E2E tự động qua Chrome Headless kết hợp REST runtime verification trên cổng `8080` (Backend Spring Boot) và `5173` (Frontend Vite).

| Case ID | Nhóm nghiệp vụ | Tên kịch bản kiểm thử (Test Scenario) | Endpoint / URL kiểm thử | Trạng thái | Bằng chứng runtime (Evidence / Status code) |
|---|---|---|---|---|---|
| **A** | Auth | Đăng nhập tài khoản Admin | `POST /api/auth/login` (`admin@unihome.vn`) | **PASS** | HTTP 200, Token trả về, role `SUPER_ADMIN` |
| **B** | Auth | Đăng nhập tài khoản Sinh viên | `POST /api/auth/login` (`student@unihome.vn`) | **PASS** | HTTP 200, Token trả về, role `USER` |
| **C** | Admin RBAC | Admin bị chặn truy cập ví xu và điểm danh | `GET /api/rewards/account` | **PASS** | HTTP 403 Forbidden (`Tài khoản quản trị viên không tham gia...`) |
| **D** | Admin RBAC | Admin bị chặn thực hiện điểm danh | `POST /api/rewards/checkin` | **PASS** | HTTP 403 Forbidden |
| **E** | Admin RBAC | Admin bị chặn nhận nhiệm vụ tích điểm | `GET /api/rewards/tasks` | **PASS** | HTTP 403 Forbidden |
| **F** | Admin RBAC | Admin bị chặn lưu hồ sơ matching người thuê | `PUT /api/matching/profile` | **PASS** | HTTP 403 Forbidden |
| **G** | Admin Menu | Cô lập Quick Menu Avatar của Admin | `/` (AccountQuickMenu DOM) | **PASS** | Chỉ hiển thị thông tin Admin và liên kết `/admin`, ẩn ví và tab Tenant |
| **H** | Reward | Kiểm tra số dư và trạng thái điểm danh sinh viên | `GET /api/rewards/account` | **PASS** | HTTP 200, `checkedInToday: true`, balance: 520 xu |
| **I** | Reward | Kiểm tra chống gian lận điểm danh nhiều lần trong ngày | `POST /api/rewards/checkin` | **PASS** | HTTP 400 (`Bạn đã điểm danh hôm nay rồi`), balance không bị cộng dồn |
| **J** | Reward | Welcome Banner ẩn CTA sau khi đã điểm danh | `/` (WelcomeBanner DOM) | **PASS** | `needCheckin: false`, chỉ hiển thị lời chào, nút CTA điểm danh ẩn |
| **K** | VIP Cosmetic | Cập nhật Skin VIP người dùng sang NEON_VIOLET | `PUT /api/users/cosmetic-style` | **PASS** | HTTP 200, `cosmeticStyle: "NEON_VIOLET"` |
| **L** | VIP Cosmetic | Kiểm tra hồ sơ công khai sinh viên sở hữu VIP | `GET /api/users/4/public` | **PASS** | HTTP 200, `cosmeticStyle: "NEON_VIOLET"`, `vipTier: "ACCOUNT_VIP_NEON"` |
| **M** | VIP Cosmetic | Gửi tin nhắn Community với hiệu ứng VIP Skin | `POST /api/community/messages` | **PASS** | HTTP 200, tin nhắn ID 50 mang skin `NEON_VIOLET` |
| **N** | VIP UI | Headless Chrome kiểm tra hoạt ảnh CSS chữ VIP | `/community` (DOM) | **PASS** | Chứa lớp `vip-name-neon` (gradient animation) |
| **O** | VIP UI | Headless Chrome kiểm tra viền Avatar VIP | `/community` (DOM) | **PASS** | Chứa lớp `vip-ring-neon` (glow ring) |
| **P** | VIP UI | Headless Chrome kiểm tra viền khung tin nhắn VIP | `/community` (DOM) | **PASS** | Chứa lớp `vip-bubble-neon` (bubble border accent) |
| **Q** | VIP Invariant | Headless Chrome xác nhận KHÔNG CÓ huy hiệu tĩnh | `/community` (DOM) | **PASS** | Không chứa `'💎 VIP Neon'` hay `'ACCOUNT_VIP_NEON'` badge |
| **R** | VIP Invariant | Headless Chrome Public Profile KHÔNG CÓ huy hiệu | `/users/4/public` (DOM) | **PASS** | Chỉ có `vip-name-neon` và `vip-ring-neon`, không có badge text |
| **S** | Community | Danh sách kênh thảo luận cộng đồng | `GET /api/community/channels` | **PASS** | HTTP 200, kênh `UNIHOME_LOUNGE` ID 1 |
| **T** | Community | Gửi tin nhắn Sticker động | `POST /api/community/messages` (STICKER) | **PASS** | HTTP 200, messageType `STICKER`, ID 49 |
| **U** | Community | Thả cảm xúc tin nhắn (Toggle Reaction) | `POST /api/community/messages/48/reactions` | **PASS** | HTTP 200, cảm xúc `HEART` được ghi nhận |
| **V** | Community | Chỉnh sửa tin nhắn cộng đồng | `PUT /api/community/messages/48` | **PASS** | HTTP 200, hiển thị nhãn "(đã sửa)" |
| **W** | Community | Tìm kiếm tin nhắn cộng đồng | `GET /api/community/messages/search?q=Testing` | **PASS** | HTTP 200, trả về tin nhắn ID 50 |
| **X** | Community | Đọc tin nhắn và đồng bộ Read State | `POST /api/community/read-state` | **PASS** | HTTP 200, unreadCount về 0 |
| **Y** | Community | Báo cáo tin nhắn vi phạm | `POST /api/community/messages/50/report` | **PASS** | HTTP 200, ghi nhận bản ghi vi phạm vào Reports |
| **Z** | Community | Quản trị viên cấm chat tạm thời (Timeout User) | `POST /api/community/admin/timeout` | **PASS** | HTTP 200, ghi nhận `expiresAt` sau 60 phút |
| **AA** | Listings | Tạo tin nháp Phòng trọ (`ROOM`) | `POST /api/listings` | **PASS** | HTTP 200, status `DRAFT` |
| **AB** | Listings | Tạo tin nháp Ở ghép (`ROOMMATE`) | `POST /api/listings` | **PASS** | HTTP 200, status `DRAFT` |
| **AC** | Listings | Tạo tin nháp Đồ cũ (`SECOND_HAND`) | `POST /api/listings` | **PASS** | HTTP 200, status `DRAFT` |
| **AD** | Listings | Tạo tin nháp Dịch vụ (`SERVICE`) | `POST /api/listings` | **PASS** | HTTP 200, status `DRAFT` |
| **AE** | Listings | Tải dữ liệu tin đăng để chỉnh sửa | `GET /api/listings/{id}` | **PASS** | HTTP 200, trả về đầy đủ trường thông tin tin đăng |
| **AF** | Listings | Cập nhật tin đăng đủ 4 loại tin | `PUT /api/listings/{id}` | **PASS** | HTTP 200, cập nhật thành công |
| **AG** | Listings | Ẩn tin đăng cá nhân (Hide Post) | `PUT /api/listings/{id}/hide` | **PASS** | HTTP 200, status chuyển sang `HIDDEN` |
| **AH** | Listings | Bỏ ẩn tin đăng cá nhân (Unhide Post) | `PUT /api/listings/{id}/unhide` | **PASS** | HTTP 200, status chuyển sang `ACTIVE` |
| **AI** | Social | Theo dõi người dùng (Follow User) | `POST /api/users/{id}/follow` | **PASS** | HTTP 200, sinh thông báo `NEW_FOLLOWER` |
| **AJ** | Social | Bỏ theo dõi người dùng (Unfollow User) | `DELETE /api/users/{id}/follow` | **PASS** | HTTP 200, giảm số lượng followers |
| **AK** | Moderation | Admin ẩn tin vi phạm | `PUT /api/admin/listings/{id}/hide` | **PASS** | HTTP 200, cập nhật trạng thái tin |
| **AL** | Moderation | Admin khóa tài khoản vi phạm (User Ban) | `PUT /api/admin/users/{id}/ban` | **PASS** | HTTP 200, status tài khoản chuyển `BANNED` |
| **AM** | Moderation | Admin mở khóa tài khoản (User Unban) | `PUT /api/admin/users/{id}/unban` | **PASS** | HTTP 200, status tài khoản chuyển `ACTIVE` |
| **AN** | External | Tích hợp cổng thanh toán trực tuyến bên thứ ba | `/api/payment/vnpay` | **NOT CONFIGURED** | Chưa cấu hình khóa bí mật cổng thanh toán thực tế |
| **AO** | External | Gửi OTP qua cổng SMS / SMTP thực tế | `/api/auth/send-sms-otp` | **NOT CONFIGURED** | Chưa có thông tin cấu hình cổng SMS Brandname ngoài |
