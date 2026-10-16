# BÁO CÁO KIỂM THỬ KHÔI PHỤC QUẢNG CÁO & CÁCH LY PHIÊN (ADS SESSION ISOLATION E2E)

## 1. Khôi phục 3 Vị trí Quảng cáo Desktop trên Trang chủ
Trong mã nguồn [`Marketplace.tsx`](file:///c:/Users/Phan%20Huu%20Kien/Desktop/UniHome/frontend/src/pages/Marketplace.tsx), hệ thống bố trí quảng cáo đa chiều:
1. **`HOME_TOP`:** Banner ngang lớn hiển thị ngay dưới tiêu đề Bảng tin, hỗ trợ xoay vòng các chiến dịch khuyến mại (ví dụ Dịch vụ chuyển trọ sinh viên, FPT Internet).
2. **`HOME_LEFT`:** Cột quảng cáo cánh trái cố định (`sticky top-28`, độ rộng 160px) trên màn hình máy tính desktop (kích thước xl).
3. **`HOME_RIGHT`:** Cột quảng cáo cánh phải cố định (`sticky top-28`, độ rộng 180px) trên màn hình máy tính desktop.

- Bằng chứng ảnh chụp màn hình trình duyệt thật: `evidence_homepage_ads_live.png`.

---

## 2. Kiểm thử Cách ly Ẩn quảng cáo theo Phiên (Session Isolation)
- **Cơ chế lưu trữ:**
  Trong [`AdSlot.tsx`](file:///c:/Users/Phan%20Huu%20Kien/Desktop/UniHome/frontend/src/components/AdSlot.tsx):
  ```typescript
  const getStorageKey = () => {
    const user = getUser();
    const token = localStorage.getItem('authToken') || 'guest_sess';
    const uid = user?.id ? String(user.id) : 'guest';
    return `unihome_hidden_ads_${uid}_${token.slice(-10)}`;
  };
  ```
  Quảng cáo bị ẩn được lưu vào `sessionStorage` gắn chặt với ID người dùng và token phiên làm việc hiện tại.

- **Kết quả kiểm thử tự động với trình duyệt Chrome:**
  1. Khi tải trang ban đầu: **3 quảng cáo** hiển thị (`HOME_TOP`, `HOME_LEFT`, `HOME_RIGHT`).
  2. Người dùng nhấp vào nút `✕` trên quảng cáo `HOME_TOP`:
     - Quảng cáo bị ẩn ngay lập tức.
     - `sessionStorage` tạo key: `unihome_hidden_ads_guest_guest_sess`.
  3. Tải lại trang (F5) trong cùng phiên trình duyệt:
     - Quảng cáo bị ẩn tiếp tục được duy trì trạng thái ẩn.
  4. Đăng xuất hoặc đăng nhập phiên tài khoản khác:
     - Hàm `clearAuth()` trong [`api.ts`](file:///c:/Users/Phan%20Huu%20Kien/Desktop/UniHome/frontend/src/lib/api.ts) tự động xóa sạch toàn bộ các key bắt đầu bằng `unihome_hidden_ads`.
     - Người dùng mới hoặc khách mở tab mới sẽ nhìn thấy đầy đủ các quảng cáo bình thường, không bị ảnh hưởng chéo.
- **Trạng thái:** **PASS**
