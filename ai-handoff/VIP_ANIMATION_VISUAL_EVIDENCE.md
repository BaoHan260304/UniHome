# BẰNG CHỨNG THỊ GIÁC HỆ THỐNG SKIN VIP HOẠT ẢNH (8 SKINS - ZERO STATIC BADGES)

## 1. Nguyên tắc thiết kế (Zero Static Badge Policy)
- **Tuyệt đối không hiển thị huy hiệu tĩnh:** Toàn bộ các huy hiệu text hoặc nhãn dán tĩnh như `VIP`, `VIP GOLD`, `VIP NEON`, `ACCOUNT_VIP_*`, biểu tượng kim cương cố định đã được loại bỏ hoàn toàn khỏi giao diện người dùng theo đúng hợp đồng thiết kế.
- **Biểu thị VIP hoàn toàn bằng hoạt ảnh CSS Keyframes:**

## 2. Danh mục 8 Skin VIP Hoạt ảnh trong `frontend/src/index.css`
1. **NEON_VIOLET (Tím Neon Cyberpunk):**
   - `@keyframes vip-shimmer-neon`: Chuyển sắc tím hồng neon kết hợp `filter: drop-shadow(0 0 8px rgba(168, 85, 247, 0.8))`.
   - Lớp viền: `.vip-ring-neon`, Khung chat: `.vip-bubble-neon`.
2. **AURORA (Cực quang phương Bắc):**
   - `@keyframes vip-aurora-flow`: Dải màu xanh ngọc lục bảo chuyển động mượt mà.
   - Lớp viền: `.vip-ring-aurora`, Khung chat: `.vip-bubble-aurora`.
3. **SUNSET_GOLD (Hoàng hôn dát vàng):**
   - `@keyframes vip-sunset-sweep`: Sắc cam hổ phách hoàng hôn ấm áp.
   - Lớp viền: `.vip-ring-sunset`, Khung chat: `.vip-bubble-sunset`.
4. **CRIMSON_EDGE (Đỏ hồng thạch lựu):**
   - `@keyframes vip-crimson-pulse`: Viền ruby nhịp thở đỏ thẫm uy lực.
   - Lớp viền: `.vip-ring-crimson`, Khung chat: `.vip-bubble-crimson`.
5. **ICE_BLUE (Băng thanh hàn ngọc):**
   - `@keyframes vip-ice-sparkle`: Xanh băng tuyết, ánh lướt cạnh tinh thể pha lê.
   - Lớp viền: `.vip-ring-ice`, Khung chat: `.vip-bubble-ice`.
6. **HOLOGRAPHIC (Lăng kính Hologram):**
   - `@keyframes vip-holo-prism`: Quang phổ đa sắc chuyển động lăng kính 360 độ.
   - Lớp viền: `.vip-ring-holographic`, Khung chat: `.vip-bubble-holo`.
7. **SAKURA_BLOOM (Hoa anh đào nở):**
   - `@keyframes vip-sakura-bloom`: Cánh hoa anh đào trôi quanh khung chat nhẹ nhàng.
   - Lớp viền: `.vip-ring-sakura`, Khung chat: `.vip-bubble-sakura`.
8. **THUNDER_STRIKE (Tia chớp hoàng kim):**
   - `@keyframes vip-thunder-spark`: Tia chớp điện quang vàng nhấp nháy dọc viền chat.
   - Lớp viền: `.vip-ring-thunder`, Khung chat: `.vip-bubble-thunder`.

## 3. Bằng chứng thị giác thực tế
- File ảnh chụp màn hình popover hoạt ảnh: `evidence_profile_popover_live.png`.
- Tên hiển thị người dùng và viền ảnh avatar áp dụng hiệu ứng `vip-name-neon` và `vip-ring-neon` đồng bộ trên toàn bộ nền tảng.
