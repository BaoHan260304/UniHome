-- ==============================================================================
-- UniHome: Seed 14 Secondhand Listings (17 Real Photos) & Comprehensive Admin Data
-- Target: TiDB Cloud / MySQL
-- Fully interlocked with Chat, Listings, Payments, Users
-- ==============================================================================

USE unihome;

-- 1. DỌN DẸP DỮ LIỆU CŨ CỦA SECONDHAND & ADMIN CẦN NẠP LẠI
DELETE FROM second_hand_listing WHERE id >= 1;
DELETE FROM report WHERE id >= 1;
DELETE FROM voucher_redemption WHERE id >= 1;
DELETE FROM voucher_code_pool WHERE id >= 1;
DELETE FROM voucher WHERE id >= 1;
DELETE FROM partner WHERE id >= 1;
DELETE FROM audit_log WHERE id >= 1;
DELETE FROM answer WHERE question_id >= 10;
DELETE FROM question WHERE id >= 10;
DELETE FROM listing WHERE id IN (35, 36);
DELETE FROM property WHERE id IN (35, 36);

-- ------------------------------------------------------------------------------
-- 2. INSERT 14 SECOND-HAND LISTINGS (17 ẢNH THỰC TẾ)
-- ------------------------------------------------------------------------------
INSERT INTO second_hand_listing (
  id, seller_id, title, category, price, condition_text, province, district,
  description, image_url, gallery_json, status, expires_at, created_at
) VALUES
  (1, 18, 'Tủ lạnh mini Casper 93L còn dùng tốt lạnh sâu', 'Đồ gia dụng', 800000, 'Dùng 8 tháng, còn bảo hành', 'Hà Nội', 'Huyện Thạch Thất',
   'Em chuyển trọ sang phòng mới đã có sẵn tủ lạnh nên cần pass lại tủ lạnh mini Casper 93L. Tủ chạy êm ru, làm đá nhanh, không đóng tuyết nhiều. Fix 50k xăng xe cho bạn nào qua bốc sớm ở Thôn 1 Tân Xã.',
   '/secondhand/tu-lanh.jpg', '["/secondhand/tu-lanh.jpg", "/secondhand/tu-lanh-1.jpg"]', 'SOLD', '2026-11-20 00:00:00', '2026-10-10 14:18:30'),

  (2, 7, 'Laptop Asus Vivobook 15 i5 mỏng nhẹ học tập IT / Đồ họa', 'Thiết bị điện tử', 5500000, 'Nguyên zin 95%, pin 3.5h', 'Hà Nội', 'Huyện Thạch Thất',
   'Lên đời máy bàn nên pass lại Asus Vivobook 15. Cấu hình Core i5, RAM 8GB, SSD 256GB màn hình 15.6 inch FHD chống chói. Máy dùng mượt mà các tác vụ code C++, Java, làm slide, đồ họa Photoshop nhẹ. Tặng kèm chuột không dây và túi chống sốc.',
   '/secondhand/laptop.jpg', '["/secondhand/laptop.jpg", "/secondhand/laptop-1.jpg"]', 'ACTIVE', '2026-11-20 00:00:00', '2026-10-12 09:30:00'),

  (3, 2, 'Loa Bluetooth di động chống nước nghe nhạc chill', 'Thiết bị điện tử', 250000, 'Mới 98%, pin trâu 6 tiếng', 'Hà Nội', 'Huyện Thạch Thất',
   'Loa Bluetooth âm bass ấm, có đèn led đổi màu theo nhạc. Pin nghe liên tục cả buổi chiều học bài. Nhỏ gọn tiện mang đi picnic hoặc để bàn học phòng trọ.',
   '/secondhand/loa.jpg', '["/secondhand/loa.jpg", "/secondhand/loa-1.jpg"]', 'ACTIVE', '2026-11-20 00:00:00', '2026-10-13 15:45:00'),

  (4, 3, 'Dàn loa máy tính vi tính Microlab 2.1 âm thanh cực đã', 'Thiết bị điện tử', 350000, 'Hoạt động hoàn hảo', 'Hà Nội', 'Huyện Thạch Thất',
   'Dàn loa 2.1 gồm 1 loa sub siêu trầm và 2 loa vệ tinh, cắm cổng 3.5mm hoặc máy tính nghe nhạc xem phim bass đánh rung bàn. Thanh lý nhanh lên đồ mới.',
   '/secondhand/dan-loa.jpg', '["/secondhand/dan-loa.jpg"]', 'ACTIVE', '2026-11-20 00:00:00', '2026-10-14 11:20:00'),

  (5, 14, 'Lò vi sóng cơ Sharp 20L rã đông và hâm nóng nhanh', 'Đồ gia dụng', 650000, 'Còn mới 90%, sạch sẽ', 'Hà Nội', 'Huyện Thạch Thất',
   'Lò vi sóng Sharp nút vặn cơ siêu bền, dung tích 20L. Hâm nóng thức ăn và rã đông thịt chỉ mất 2-3 phút, sinh viên lười nấu cơm có cái này cực tiện.',
   '/secondhand/lo-vi-song.jpg', '["/secondhand/lo-vi-song.jpg"]', 'ACTIVE', '2026-11-20 00:00:00', '2026-10-15 16:10:00'),

  (6, 21, 'Máy ép hoa quả chậm mini ép kiệt bã', 'Đồ gia dụng', 280000, 'Mới dùng 3 lần', 'Hà Nội', 'Huyện Thạch Thất',
   'Mua về định làm nước ép detox nhưng lười rửa nên pass lại. Máy ép chậm giữ nguyên vitamin, ép ổi, cà rốt, cam kiệt nước. Dễ tháo lắp vệ sinh.',
   '/secondhand/may-ep-hoa-qua.jpg', '["/secondhand/may-ep-hoa-qua.jpg"]', 'ACTIVE', '2026-11-20 00:00:00', '2026-10-16 10:15:00'),

  (7, 16, 'Nồi cơm điện nắp gài Sunhouse 1.2L lòng niêu chống dính', 'Đồ gia dụng', 180000, 'Dùng tốt, không dính cơm', 'Hà Nội', 'Huyện Thạch Thất',
   'Nồi cơm Sunhouse 1.2L nấu cho 2-3 người ăn vừa vặn. Lòng nồi dày dặn chống dính tốt, mâm nhiệt làm nóng nhanh cơm dẻo. Ai ở Tân Xã qua lấy fix 20k.',
   '/secondhand/noi-com.jpg', '["/secondhand/noi-com.jpg"]', 'SOLD', '2026-11-20 00:00:00', '2026-10-09 11:42:15'),

  (8, 28, 'Quạt cây lửng Vinawind 3 tốc độ gió cánh đỏ mát rượi', 'Đồ gia dụng', 140000, 'Chạy êm, gió mạnh', 'Hà Nội', 'Huyện Thạch Thất',
   'Quạt cây điện cơ Vinawind quốc dân của sinh viên. Chạy êm ru không rung lắc, tút năng quay đều. Phòng lắp điều hòa bật số 1 thoang thoảng cực dễ ngủ.',
   '/secondhand/quat.jpg', '["/secondhand/quat.jpg"]', 'ACTIVE', '2026-11-20 00:00:00', '2026-10-17 14:00:00'),

  (9, 29, 'Quạt mini để bàn tích điện sạc cổng Type-C', 'Đồ gia dụng', 75000, 'Mới 99%', 'Hà Nội', 'Huyện Thạch Thất',
   'Quạt tích điện để bàn học 3 cấp độ gió, pin sạc dùng được 3-4 tiếng nếu mất điện. Đèn báo pin rõ ràng, nhỏ gọn để cạnh laptop.',
   '/secondhand/quat-mini.jpg', '["/secondhand/quat-mini.jpg"]', 'ACTIVE', '2026-11-20 00:00:00', '2026-10-18 19:25:00'),

  (10, 4, 'Bộ bàn ghế làm việc học tập khung sắt chắc chắn', 'Bàn ghế - Nội thất', 420000, 'Gỗ công nghiệp còn bóng đẹp', 'Hà Nội', 'Huyện Thạch Thất',
   'Combo cả bàn lẫn ghế khung sắt sơn tĩnh điện, mặt bàn gỗ sáng màu kích thước 100x50cm. Ghế có tựa lưng êm không mỏi, pass cả bộ chuyển trọ.',
   '/secondhand/bo-ban-ghe.jpg', '["/secondhand/bo-ban-ghe.jpg"]', 'ACTIVE', '2026-11-20 00:00:00', '2026-10-19 08:40:00'),

  (11, 11, 'Bàn học gỗ gấp chân chữ U gọn nhẹ', 'Bàn ghế - Nội thất', 80000, 'Chân sắt gập mở tốt', 'Hà Nội', 'Huyện Thạch Thất',
   'Bàn gấp ngồi bệt hoặc để trên giường học bài. Mặt bàn có rãnh để ipad và chỗ để cốc nước tiện lợi. Qua ngõ trọ Minh Anh lấy giúp mình nhé.',
   '/secondhand/ban.jpg', '["/secondhand/ban.jpg"]', 'ACTIVE', '2026-11-20 00:00:00', '2026-10-19 16:30:00'),

  (12, 6, 'Ghế xoay văn phòng có bánh xe đệm lưới thoáng khí', 'Bàn ghế - Nội thất', 290000, 'Piston nâng hạ mượt mà', 'Hà Nội', 'Huyện Thạch Thất',
   'Ghế xoay lưng lưới ngồi lâu không bị bí mồ hôi lưng. Bánh xe trượt êm, piston tăng giảm chiều cao hoạt động trơn tru.',
   '/secondhand/ghe.jpg', '["/secondhand/ghe.jpg"]', 'ACTIVE', '2026-11-20 00:00:00', '2026-10-20 11:15:00'),

  (13, 9, 'Bộ bàn ghế ăn / học tập gỗ sồi tự nhiên', 'Bàn ghế - Nội thất', 350000, 'Chắc chắn, màu gỗ sáng', 'Hà Nội', 'Huyện Thạch Thất',
   'Bộ bàn ghế gỗ nhỏ gọn phù hợp phòng trọ 20-25m2. Để đồ ăn hoặc ngồi học đều vừa vặn, không tốn diện tích.',
   '/secondhand/ban-ghe.jpg', '["/secondhand/ban-ghe.jpg"]', 'ACTIVE', '2026-11-20 00:00:00', '2026-10-21 14:50:00'),

  (14, 30, 'Điều hòa di động Casper 9000BTU cắm điện dùng ngay', 'Đồ gia dụng', 2800000, 'Máy lạnh buốt, đủ ống gió', 'Hà Nội', 'Huyện Thạch Thất',
   'Dành riêng cho phòng trọ không cho khoan tường lắp điều hòa treo tường. Máy có 4 bánh xe đẩy đi đẩy lại, cắm điện vào là phả hơi lạnh ngay. Đầy đủ ống dẫn khí nóng ra cửa sổ.',
   '/secondhand/dieu-hoa.jpg', '["/secondhand/dieu-hoa.jpg"]', 'ACTIVE', '2026-11-20 00:00:00', '2026-10-22 09:10:00');

-- ------------------------------------------------------------------------------
-- 3. INSERT 2 LISTINGS VÀO MỤC KIỂM DUYỆT (MODERATION TAB: PENDING & REVISION)
-- ------------------------------------------------------------------------------
INSERT INTO property (
  id, landlord_id, name, province, district, ward, street, latitude, longitude,
  price, area, deposit, electricity_price, water_price, internet_price, parking_fee, other_fees,
  furniture, property_type, post_type, poster_relationship, total_rooms, available_rooms,
  total_floors, floor_text, max_occupants, nearest_school, nearest_school_distance_km,
  amenities, rules, contact_phone, contact_zalo, status, availability,
  last_availability_confirmed_at, description, image_url, media_json, panorama_count, video_count,
  created_at, updated_at
) VALUES
  (35, 179, 'Phòng trọ sinh viên Thạch Hòa gần chợ', 'Hà Nội', 'Huyện Thạch Thất', 'Xã Thạch Hòa', 'Khu TĐC Thạch Hòa', 21.0310, 105.5340,
   2400000, 22, 2400000, 3800, 80000, 80000, 0, 0,
   'Cơ bản', 'Phòng trọ', 'CHO_THUE', 'OWNER', 10, 2, 3, 'Tầng 2', 2, 'Đại học Quốc gia Hà Nội', 1.0,
   'Điều hòa|Nóng lạnh|Giường|Bàn học', 'Không ồn ào sau 23h', '0912001122', '0912001122', 'ACTIVE', 'AVAILABLE',
   NOW(), 'Phòng trọ mới đăng ký cần admin duyệt bài.', '/rooms/7.jpg', '["/rooms/7.jpg"]', 0, 0, NOW(), NOW()),

  (36, 180, 'Phòng khép kín Tân Xã giá ưu đãi', 'Hà Nội', 'Huyện Thạch Thất', 'Xã Tân Xã', 'Thôn 3 Tân Xã', 21.0160, 105.5230,
   2300000, 20, 2300000, 4000, 80000, 80000, 0, 0,
   'Cơ bản', 'Phòng trọ', 'CHO_THUE', 'OWNER', 8, 1, 2, 'Tầng 1', 2, 'FPT University', 1.4,
   'Điều hòa|Nóng lạnh', 'Giữ vệ sinh chung', '0913998877', '0913998877', 'ACTIVE', 'AVAILABLE',
   NOW(), 'Phòng khép kín sạch sẽ.', '/rooms/4.jpg', '["/rooms/4.jpg"]', 0, 0, NOW(), NOW());

INSERT INTO listing (
  id, property_id, landlord_id, title, status, package_tier, package_priority,
  package_until, boost_until, published_at, last_confirmed_at, freshness_due_at,
  view_count, interest_count, revision_note, created_at, updated_at
) VALUES
  (35, 35, 179, 'Phòng trọ sinh viên Thạch Hòa gần chợ TĐC', 'PENDING_REVIEW', 'FREE', 0,
   NULL, NULL, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 15 DAY), 5, 0, NULL, NOW(), NOW()),

  (36, 36, 180, 'Phòng khép kín Tân Xã giá ưu đãi đầu kỳ', 'NEED_REVISION', 'FREE', 0,
   NULL, NULL, NULL, NOW(), DATE_ADD(NOW(), INTERVAL 15 DAY), 8, 1,
   'Vui lòng bổ sung thêm ảnh khu vệ sinh và cam kết công tơ điện riêng minh bạch theo tiêu chuẩn UniHome.', NOW(), NOW());

-- ------------------------------------------------------------------------------
-- 4. INSERT 4 REPORTS (BÁO CÁO VI PHẠM & XỬ LÝ)
-- ------------------------------------------------------------------------------
INSERT INTO report (
  id, reporter_id, target_type, target_id, reason_code, details, status, handled_by, resolution, created_at, resolved_at
) VALUES
  (1, 17, 'LISTING', 14, 'INCORRECT_PRICE',
   'Chủ trọ báo giá trên web 2.2tr nhưng lúc em qua xem phòng lại bảo phòng đó vừa cho thuê, hướng dẫn sang phòng 2.6tr.',
   'RESOLVED', 30001, 'Đã liên hệ trực tiếp chủ nhà nhắc nhở cập nhật trạng thái phòng chính xác, chủ nhà đã xin lỗi và cập nhật đúng phòng trống.',
   '2026-10-16 11:20:00', '2026-10-16 14:30:00'),

  (2, 24, 'LISTING', 18, 'DUPLICATE',
   'Bài đăng này bị trùng lặp nội dung với một bài đăng trước đó của trọ Hưng Thịnh.',
   'RESOLVED', 30001, 'Đã kiểm tra và gộp bài đăng trùng lặp, giữ lại tin đăng chính chủ đầy đủ thông tin.',
   '2026-10-18 09:15:00', '2026-10-18 10:00:00'),

  (3, 33, 'SECOND_HAND', 1, 'ALREADY_SOLD',
   'Em nhắn hỏi mua tủ lạnh nhưng bạn seller bảo đã có bạn cọc lấy rồi, nhờ admin đổi trạng thái để mọi người đỡ mất công hỏi ạ.',
   'RESOLVED', 30001, 'Đã đối soát tin nhắn chat và cập nhật trạng thái món đồ sang SOLD (Đã bán).',
   '2026-10-20 15:40:00', '2026-10-20 16:10:00'),

  (4, 45, 'LISTING', 19, 'OTHER',
   'Chủ trọ này rất nhiệt tình nhưng số Zalo trên bài đăng bị sai 1 số làm sinh viên nhắn tin hỏi phòng không được.',
   'OPEN', NULL, NULL,
   '2026-10-23 09:30:00', NULL);

-- ------------------------------------------------------------------------------
-- 5. INSERT 4 ĐỐI TÁC (PARTNERS) & 4 VOUCHERS
-- ------------------------------------------------------------------------------
INSERT INTO partner (
  id, name, category, logo_url, description, contact_email, contact_phone, website_url, status, created_at
) VALUES
  (1, 'Chuyển Trọ Sinh Viên Thành Hưng Hòa Lạc', 'MOVING',
   'https://ui-avatars.com/api/?name=Thanh+Hung&background=4f46e5&color=fff&size=200&bold=true',
   'Dịch vụ xe tải và ba gác chuyển đồ trọn gói giá sinh viên quanh các trường ĐH FPT, ĐHQG, Vạn Xuân.',
   'thanhhung.hoalac@gmail.com', '0988112233', 'https://thanhhunghoalac.vn', 'ACTIVE', NOW()),

  (2, 'Cơm Tấm Sinh Viên Chị Nga - Thôn 1 Tân Xã', 'FOOD',
   'https://ui-avatars.com/api/?name=Com+Nga&background=ea580c&color=fff&size=200&bold=true',
   'Cơm trưa sinh viên nóng hổi, thực đơn đổi món hàng ngày, freeship từ 2 suất trong bán kính 2km.',
   'comchinga@gmail.com', '0977223344', 'https://facebook.com/comchinga', 'ACTIVE', NOW()),

  (3, 'Tiệm Giặt Sấy Tự Động 24/7 Tân Xã', 'CLEANING',
   'https://ui-avatars.com/api/?name=Giat+Say&background=0284c7&color=fff&size=200&bold=true',
   'Hệ thống máy giặt sấy công nghiệp nhập khẩu, giặt sấy thơm tho lấy ngay trong 45 phút.',
   'giatsay247@gmail.com', '0966334455', 'https://giatsaytanxa.vn', 'ACTIVE', NOW()),

  (4, 'DingTea Hòa Lạc - Trà Sữa & Không Gian Học Nhóm', 'COFFEE',
   'https://ui-avatars.com/api/?name=Ding+Tea&background=16a34a&color=fff&size=200&bold=true',
   'Không gian học nhóm máy lạnh mát mẻ, wifi 500Mbps, ổ cắm từng bàn phục vụ sinh viên làm việc.',
   'dingtea.hoalac@gmail.com', '0912334455', 'https://dingteahoalac.vn', 'ACTIVE', NOW());

INSERT INTO voucher (
  id, partner_id, title, category, description, image_url, discount_type, discount_value,
  min_order, points_cost, total_stock, remaining_stock, limit_per_user, code_mode, shared_code, status, start_at, end_at, created_at, updated_at
) VALUES
  (1, 1, 'Giảm 15% Dịch Vụ Chuyển Trọ Trọn Gói', 'MOVING',
   'Áp dụng cho sinh viên ĐH FPT và ĐHQG chuyển phòng trong bán kính 10km quanh Hòa Lạc.',
   '/demo/service-moving.png', 'PERCENT', 15, 300000, 150, 100, 84, 1, 'SHARED_CODE', 'CHUYENPHONG15', 'ACTIVE', '2026-10-01 00:00:00', '2026-12-31 23:59:59', NOW(), NOW()),

  (2, 2, 'Giảm 10.000đ Suất Cơm Trưa Sinh Viên', 'FOOD',
   'Áp dụng cho hóa đơn cơm trưa từ 35.000đ khi đặt món hoặc ăn trực tiếp tại quán Chị Nga.',
   '/demo/ad-campus.png', 'FIXED_AMOUNT', 10000, 35000, 50, 200, 168, 2, 'SHARED_CODE', 'COMNGON10K', 'ACTIVE', '2026-10-01 00:00:00', '2026-12-31 23:59:59', NOW(), NOW()),

  (3, 3, 'Tặng 1 Mẻ Sấy Khô Miễn Phí', 'CLEANING',
   'Miễn phí 1 mẻ sấy khô thơm cong 7kg khi giặt sấy tại tiệm Giặt Sấy Tự Động 24/7 Tân Xã.',
   '/demo/service-moving.png', 'FIXED_AMOUNT', 20000, 50000, 80, 100, 72, 1, 'SHARED_CODE', 'SAYKHOFREE', 'ACTIVE', '2026-10-01 00:00:00', '2026-12-31 23:59:59', NOW(), NOW()),

  (4, 4, 'Giảm 20% Toàn Bộ Menu Đồ Uống Size L', 'COFFEE',
   'Áp dụng tại DingTea Hòa Lạc cho mọi đồ uống trà sữa, trà hoa quả size L.',
   '/demo/ad-campus.png', 'PERCENT', 20, 45000, 100, 150, 129, 1, 'SHARED_CODE', 'DINGTEA20', 'ACTIVE', '2026-10-01 00:00:00', '2026-12-31 23:59:59', NOW(), NOW());

-- ------------------------------------------------------------------------------
-- 6. INSERT 20 NHẬT KÝ KIỂM TOÁN HỆ THỐNG (AUDIT_LOG TAB)
-- ------------------------------------------------------------------------------
INSERT INTO audit_log (
  id, actor_id, action, target_type, target_id, details, created_at
) VALUES
  (1, 30001, 'APPROVE_PAYMENT', 'PAYMENT', 1, 'Đối soát hóa đơn VietQR thành công PAY-VIP1-261012-001 (99.000đ)', '2026-10-12 10:24:15'),
  (2, 30001, 'VERIFY_LISTING', 'LISTING', 10, 'Phê duyệt chứng chỉ xác minh thực tế ON_SITE_VERIFIED cho phòng 10 của Cô Hoàng Nga', '2026-10-12 11:00:00'),
  (3, 30001, 'APPROVE_PAYMENT', 'PAYMENT', 3, 'Đối soát hóa đơn VietQR thành công PAY-VIP2-261010-003 (59.000đ)', '2026-10-13 09:30:20'),
  (4, 30001, 'VERIFY_LISTING', 'LISTING', 12, 'Phê duyệt chứng chỉ xác minh thực tế ON_SITE_VERIFIED cho phòng 12 của Bác Lý Kiên', '2026-10-13 14:00:00'),
  (5, 30001, 'MODERATE_SECONDHAND', 'SECOND_HAND', 1, 'Duyệt bài đăng thanh lý Tủ lạnh mini Casper 93L của sinh viên Quốc Dũng', '2026-10-10 14:25:00'),
  (6, 30001, 'APPROVE_PAYMENT', 'PAYMENT', 8, 'Đối soát hóa đơn VietQR thành công PAY-VIP3-261009-008 (29.000đ)', '2026-10-14 10:05:30'),
  (7, 30001, 'RESOLVE_REPORT', 'REPORT', 1, 'Đã xử lý khiếu nại báo cáo chênh lệch giá phòng cho Listing #14', '2026-10-16 14:30:00'),
  (8, 30001, 'APPROVE_PAYMENT', 'PAYMENT', 2, 'Đối soát hóa đơn VietQR thành công gói VIP1 cho tài khoản Trần Trung Tân (99.000đ)', '2026-10-17 15:42:30'),
  (9, 30001, 'VERIFY_LISTING', 'LISTING', 11, 'Phê duyệt chứng chỉ xác minh thực tế ON_SITE_VERIFIED cho phòng Studio 11 của Trần Trung Tân', '2026-10-17 16:15:00'),
  (10, 30001, 'RESOLVE_REPORT', 'REPORT', 2, 'Đã gộp bài đăng trùng lặp cho Listing #18 theo phản ánh của sinh viên', '2026-10-18 10:00:00'),
  (11, 30001, 'APPROVE_PAYMENT', 'PAYMENT', 18, 'Đối soát hóa đơn VietQR thành công PAY-BOOST-261019-018 (10.000đ)', '2026-10-19 08:50:40'),
  (12, 30001, 'MODERATE_SECONDHAND', 'SECOND_HAND', 11, 'Kiểm duyệt bài đăng thanh lý Bàn học gỗ gấp chân chữ U của sinh viên Đức Lâm', '2026-10-19 16:35:00'),
  (13, 30001, 'RESOLVE_REPORT', 'REPORT', 3, 'Cập nhật trạng thái Tủ lạnh mini Casper sang Đã bán (SOLD)', '2026-10-20 16:10:00'),
  (14, 30001, 'UPDATE_SETTING', 'SYSTEM', 1, 'Cập nhật giới hạn tải tin nhắn tán gẫu cộng đồng lên 300 tin để tối ưu trải nghiệm', '2026-10-21 09:00:00'),
  (15, 30001, 'APPROVE_PAYMENT', 'PAYMENT', 29, 'Đối soát hóa đơn VietQR thành công gói BOOST cho sinh viên Võ Tiến Trung (10.000đ)', '2026-10-21 17:35:10'),
  (16, 30001, 'APPROVE_PAYMENT', 'PAYMENT', 30, 'Đối soát hóa đơn VietQR thành công gói BOOST cho sinh viên Hồ Văn Việt (10.000đ)', '2026-10-22 10:12:45'),
  (17, 30001, 'MODERATE_LISTING', 'LISTING', 36, 'Yêu cầu chủ trọ 180 bổ sung ảnh khu vệ sinh và cam kết giá điện trước khi duyệt', '2026-10-22 15:00:00'),
  (18, 30001, 'APPROVE_PAYMENT', 'PAYMENT', 33, 'Đối soát hóa đơn VietQR thành công gói BOOST cho sinh viên Dương Hữu Huy (10.000đ)', '2026-10-23 09:05:20'),
  (19, 30001, 'CONFIRM_AVAILABILITY', 'PROPERTY', 10, 'Hệ thống tự động xác nhận phòng trọ 10 vẫn còn 2 phòng khả dụng', '2026-10-23 10:00:00'),
  (20, 30001, 'CONFIRM_AVAILABILITY', 'PROPERTY', 11, 'Hệ thống tự động xác nhận phòng Studio 11 còn 1 phòng khả dụng', '2026-10-23 11:30:00');

-- ------------------------------------------------------------------------------
-- 7. INSERT CÂU HỎI & TRẢ LỜI CỘNG ĐỒNG (Q&A TAB)
-- ------------------------------------------------------------------------------
INSERT INTO question (
  id, user_id, title, content, category, status, created_at
) VALUES
  (10, 15, 'Đi xe bus 74 từ bến xe Mỹ Đình lên trường FPT/ĐHQG có bị đông vào sáng thứ 2 không mn?',
   'Sáng thứ 2 e có tiết 8h ở trường mà chưa đi xe bus bao giờ, sợ tắc đường hoặc hết chỗ đứng.', 'Giao thông', 'VISIBLE', '2026-10-18 14:00:00'),

  (11, 20, 'Thuê trọ ở khu Tân Xã thì tiền cọc thường là mấy tháng vậy các bác?',
   'Em là tân sinh viên mới lên tìm phòng, thấy có chỗ đòi cọc 2 tháng liền k biết có bình thường k ạ?', 'Kinh nghiệm thuê', 'VISIBLE', '2026-10-20 09:15:00'),

  (12, 25, 'Đăng tin thanh lý đồ cũ trên UniHome có bị mất phí duy trì bài không?',
   'Mình dọn phòng thừa mấy cái bàn học với quạt muốn pass lại cho các bạn khóa sau.', 'Tính năng', 'VISIBLE', '2026-10-22 16:30:00');

INSERT INTO answer (
  id, question_id, user_id, content, status, created_at
) VALUES
  (10, 10, 2, 'Sáng thứ 2 xe 74 khá đông từ 6h30 đến 7h30 b nhé, bạn nên đi chuyến 6h15 hoặc bắt tuyến 107 từ Kim Mã thì vắng hơn nhiều, chạy đại lộ Thăng Long 40 phút là đến cổng trường rồi.', 'VISIBLE', '2026-10-18 14:25:00'),

  (11, 11, 161, 'Ở Hòa Lạc đa phần chủ trọ chỉ thu cọc 1 tháng tiền phòng thôi cháu nhé, đóng tiền nhà từng tháng một. Khi hết hợp đồng báo trước 15-30 ngày là được hoàn cọc 100%. Chỗ nào đòi cọc 2 tháng thì nên hỏi kỹ hợp đồng.', 'VISIBLE', '2026-10-20 09:40:00'),

  (12, 12, 30001, 'Đăng tin đồ cũ trên UniHome hoàn toàn miễn phí nha bạn, chỉ cần đăng nhập tài khoản sinh viên là đăng bài và trao đổi trực tiếp với người mua qua mục tin nhắn được ngay.', 'VISIBLE', '2026-10-22 16:45:00');
