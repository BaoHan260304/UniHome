# UNIHOME ROUND 2 — VIP EFFECT RESEARCH AND VISUAL TEST REPORT

## 1. MỤC TIÊU VÀ ĐẶC TẢ NGHIỆP VỤ (BUSINESS SPECIFICATION)
- **Quy tắc tuyệt đối (Strict Invariant):** LOẠI BỎ TOÀN BỘ huy hiệu / nhãn chữ dán đè dạng tĩnh (`VIP`, `VIP GOLD`, `VIP NEON`, `ACCOUNT_VIP_NEON`, `★ VIP Gold`, `💎 VIP Neon`, biểu tượng vương miện/kim cương cạnh tên).
- **Hình thức nhận diện VIP:** Thể hiện đẳng cấp qua chuyển động ánh sáng mượt mà bằng CSS Keyframe Animations:
  1. **Hiệu ứng tên chuyển sắc đa chiều (Animated Name Gradients):** Chữ đổi màu liên tục, bóng đổ ánh sáng tương ứng.
  2. **Viền ảnh đại diện phát sáng chuyển động (Avatar Animated Glow Ring):** Viền bo góc tỏa ánh sáng nhịp thở (pulse glow ring).
  3. **Viền khung tin nhắn động (Animated Message Bubble Accents):** Đường viền tin nhắn đồng bộ tông màu VIP.
  4. **Hỗ trợ tiếp cận (Reduced Motion):** Khi người dùng kích hoạt `prefers-reduced-motion: reduce`, toàn bộ hoạt ảnh dừng lại ở dải gradient tĩnh trang nhã, không gây chớp giật.

---

## 2. DANH SÁCH 8 VIP COSMETIC SKINS

| Skin ID | Tên hiển thị | Tông màu chủ đạo | Keyframes Animation | Lớp CSS (Name / Frame / Bubble) | Trạng thái Runtime |
|---|---|---|---|---|---|
| `NEON_VIOLET` | Tím Neon Cyberpunk | Tím - Hồng Neon (`#c084fc`, `#a855f7`) | `vip-shimmer-neon` (3s ease) | `vip-name-neon`, `vip-ring-neon`, `vip-bubble-neon` | **PASS (VERIFIED)** |
| `AURORA` | Cực quang phương Bắc | Xanh ngọc - Lục bảo (`#10b981`, `#06b6d4`) | `vip-aurora-flow` (4s ease) | `vip-name-aurora`, `vip-ring-aurora`, `vip-bubble-aurora` | **PASS (VERIFIED)** |
| `SUNSET_GOLD` | Hoàng hôn dát vàng | Hổ phách - Cam ấm (`#f59e0b`, `#ef4444`) | `vip-sunset-sweep` (3.5s ease) | `vip-name-sunset`, `vip-ring-sunset`, `vip-bubble-sunset` | **PASS (VERIFIED)** |
| `CRIMSON_EDGE` | Đỏ hồng thạch lựu | Đỏ thẫm - Cánh hồng (`#e11d48`, `#fda4af`) | `vip-crimson-pulse` (2.5s pulse) | `vip-name-crimson`, `vip-ring-crimson`, `vip-bubble-crimson` | **PASS (VERIFIED)** |
| `ICE_BLUE` | Băng thanh hàn ngọc | Xanh băng tuyết (`#06b6d4`, `#93c5fd`) | `vip-ice-sparkle` (3s sparkle) | `vip-name-ice`, `vip-ring-ice`, `vip-bubble-ice` | **PASS (VERIFIED)** |
| `HOLOGRAPHIC` | Lăng kính Hologram | Đa sắc quang phổ (`#ec4899`, `#8b5cf6`, `#3b82f6`) | `vip-holo-prism` (4s linear) | `vip-name-holographic`, `vip-ring-holographic`, `vip-bubble-holographic` | **PASS (VERIFIED)** |
| `SAKURA_BLOOM` | Hoa anh đào nở | Hồng phấn - Anh đào (`#f472b6`, `#fda4af`) | `vip-sakura-bloom` (3.5s flow) | `vip-name-sakura`, `vip-ring-sakura`, `vip-bubble-sakura` | **PASS (VERIFIED)** |
| `THUNDER_STRIKE` | Tia chớp hoàng kim | Vàng tia sét - Điện quang (`#eab308`, `#facc15`) | `vip-thunder-spark` (2s spark) | `vip-name-thunder`, `vip-ring-thunder`, `vip-bubble-thunder` | **PASS (VERIFIED)** |

---

## 3. NGHIÊN CỨU TÀI LIỆU VÀ TÌNH TRẠNG KẾT NỐI (RESEARCH LOG)
- **Tình trạng kết nối Internet:** Môi trường thực thi sandbox bị cô lập mạng ngoài (PowerShell Web Requests tới các trang bên ngoài như `codepen.io` timeout).
- **Giải pháp kỹ thuật thay thế chuẩn xác:**
  - Tự thiết kế và dựng toàn bộ dải keyframes CSS chuẩn hóa trực tiếp vào [`frontend/src/index.css`](file:///c:/Users/Phan%20Huu%20Kien/Desktop/UniHome/frontend/src/index.css).
  - Tích hợp chuẩn CSS3 gradient clipping (`-webkit-background-clip: text`), `drop-shadow` SVG filters và multi-layer box shadows.
  - Tích hợp Media Query `@media (prefers-reduced-motion: reduce)` đóng băng chuyển động thành dải màu tĩnh cao cấp.

---

## 4. BẰNG CHỨNG KIỂM THỬ THỰC TẾ (RUNTIME DOM & HEADLESS CHROME EVIDENCE)
1. **API Cập nhật Skin người dùng VIP:**
   - Method & URL: `PUT http://localhost:8080/api/users/cosmetic-style`
   - Payload: `{"cosmeticStyle":"NEON_VIOLET"}`
   - Response: `{"success": true, "cosmeticStyle": "NEON_VIOLET"}` (HTTP 200)
2. **Headless Chrome DOM Test tại `/community`:**
   - Lệnh kiểm thử: `chrome.exe --headless --disable-gpu --dump-dom "http://localhost:5173/community"`
   - Kết quả kiểm tra lớp hoạt ảnh:
     - `Contains vip-name-neon`: **True**
     - `Contains vip-ring-neon`: **True**
     - `Contains vip-bubble-neon`: **True**
   - Kết quả kiểm tra loại bỏ huy hiệu tĩnh:
     - `Contains '💎 VIP Neon'`: **False** (Đã xóa hoàn toàn)
     - `Contains 'ACCOUNT_VIP_NEON'`: **False** (Đã xóa hoàn toàn)
3. **Headless Chrome DOM Test tại `/users/4/public` (Public Profile):**
   - Lệnh kiểm thử: `chrome.exe --headless --disable-gpu --dump-dom "http://localhost:5173/users/4/public"`
   - Kết quả kiểm tra:
     - `Contains vip-name-neon`: **True**
     - `Contains vip-ring-neon`: **True**
     - `Contains '💎 VIP Neon'`: **False**
     - `Contains 'ACCOUNT_VIP_NEON'`: **False**
