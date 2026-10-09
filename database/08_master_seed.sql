-- ================================================================
-- UniHome 08: Master Seed Data for Production & Testing
-- Contains 35+ Properties/Listings, 35+ Second-Hand Items,
-- 18+ Student Services, 20+ Blogs, 30+ Q&As, Active Ads
-- Fully aligned with single regular account model ('USER')
-- Safe and idempotent: Uses INSERT IGNORE or ON DUPLICATE KEY
-- ================================================================

USE rrmsdb;
SET NAMES utf8mb4;

-- 1. Ensure any legacy landlord/tenant roles in users are updated to 'USER'
UPDATE users SET role = 'USER' WHERE role IN ('TENANT', 'LANDLORD', 'SERVICE_PROVIDER');

-- 2. Insert Additional Demo Users with role = 'USER'
INSERT INTO users (full_name, email, password, role, status, phone, avatar_url, bio, gender, school_name, home_lat, home_lng, matching_radius_km, is_looking_for_roommate, auth_provider, email_verified, phone_verified, terms_version, terms_accepted_at) VALUES
('Lê Nhật Anh', 'nhatanh.le@unihome.vn', '123456', 'USER', 'ACTIVE', '0911223344', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Sinh viên năm 2 ĐH Bách Khoa TP.HCM, đam mê lập trình và thể thao.', 'Nam', 'ĐH Bách Khoa TP.HCM', 10.7725, 106.6598, 5, b'1', 'LOCAL', b'1', b'1', '2026.1', NOW()),
('Nguyễn Khánh Linh', 'khanhlinh.ng@unihome.vn', '123456', 'USER', 'ACTIVE', '0922334455', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', 'Nữ sinh UEH, thích không gian yên tĩnh, sạch sẽ, tìm bạn chia tiền phòng.', 'Nữ', 'ĐH Kinh Tế TP.HCM', 10.7601, 106.6669, 5, b'1', 'LOCAL', b'1', b'1', '2026.1', NOW()),
('Phan Hữu Kiên', 'kien.phan@unihome.vn', '123456', 'USER', 'ACTIVE', '0933445566', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Chính chủ cho thuê cụm phòng trọ khép kín Làng Đại học Thủ Đức.', 'Nam', 'ĐHQG TP.HCM', 10.8752, 106.8016, 5, b'0', 'LOCAL', b'1', b'1', '2026.1', NOW()),
('Trần Hoàng Phúc', 'phuc.tran@unihome.vn', '123456', 'USER', 'ACTIVE', '0944556677', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'Quản lý căn hộ mini sinh viên Khu CNC Hòa Lạc, hỗ trợ sinh viên FPT.', 'Nam', 'ĐH FPT Hà Nội', 21.0133, 105.5278, 5, b'0', 'LOCAL', b'1', b'1', '2026.1', NOW()),
('Bùi Thị Mai', 'mai.bui@unihome.vn', '123456', 'USER', 'ACTIVE', '0955667788', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'Cho thuê phòng trọ nữ sinh gần Đại học Sư Phạm Hà Nội.', 'Nữ', 'ĐH Sư Phạm Hà Nội', 21.0372, 105.7812, 5, b'0', 'LOCAL', b'1', b'1', '2026.1', NOW())
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), status='ACTIVE';

-- Set user IDs
SET @u_kien = (SELECT id FROM users WHERE email='kien.phan@unihome.vn' LIMIT 1);
SET @u_phuc = (SELECT id FROM users WHERE email='phuc.tran@unihome.vn' LIMIT 1);
SET @u_mai = (SELECT id FROM users WHERE email='mai.bui@unihome.vn' LIMIT 1);
SET @u_nhatanh = (SELECT id FROM users WHERE email='nhatanh.le@unihome.vn' LIMIT 1);
SET @u_linh = (SELECT id FROM users WHERE email='khanhlinh.ng@unihome.vn' LIMIT 1);
SET @u_admin = (SELECT id FROM users WHERE email='admin@unihome.vn' LIMIT 1);

-- 3. SEED PROPERTIES & LISTINGS (30+ ROOMS & HOUSES ACROSS VIETNAM)
-- Sample 1: Studio VIP Kim Cương Làng Đại Học
INSERT INTO property (landlord_id, name, province, district, ward, street, latitude, longitude, price, area, status, property_type, image_url, description, poster_relationship, deposit, electricity_price, water_price, internet_price, parking_fee) VALUES
(@u_kien, 'Căn hộ Studio Full Nội Thất Làng Đại Học Thủ Đức', 'TP. Hồ Chí Minh', 'TP. Thủ Đức', 'P. Linh Trung', 'Đường Quảng Trường Sáng Tạo', 10.8752, 106.8016, 3800000, 28.5, 'ACTIVE', 'Căn hộ mini', '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800","https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"]', 'Studio đầy đủ tiện nghi: máy lạnh inverter, tủ lạnh, máy giặt, gác lửng đúc cao không đụng đầu. Khóa vân tay, giờ giấc tự do 24/7, camera an ninh 3 lớp. Cách ĐH Bách Khoa CS2 500m, ĐH KHTN 800m.', 'OWNER', 3800000, 3500, 20000, 100000, 100000)
ON DUPLICATE KEY UPDATE name=VALUES(name);
SET @prop_1 = (SELECT id FROM property WHERE name='Căn hộ Studio Full Nội Thất Làng Đại Học Thủ Đức' LIMIT 1);

INSERT INTO listing (property_id, landlord_id, title, status, package_tier, package_priority, package_until, view_count) VALUES
(@prop_1, @u_kien, '[VIP KIM CƯƠNG] Studio Full Đồ Ban Công Thoáng Sát ĐHQG TP.HCM', 'APPROVED', 'VIP_DIAMOND', 5, DATE_ADD(NOW(), INTERVAL 30 DAY), 1450)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Sample 2: Phòng trọ sinh viên FPT Hòa Lạc
INSERT INTO property (landlord_id, name, province, district, ward, street, latitude, longitude, price, area, status, property_type, image_url, description, poster_relationship, deposit, electricity_price, water_price, internet_price, parking_fee) VALUES
(@u_phuc, 'Khu Trọ Sinh Viên Xanh - Hòa Lạc', 'Hà Nội', 'Thạch Thất', 'Xã Tân Xã', 'Thôn 3 Tân Xã', 21.0195, 105.5342, 2200000, 22.0, 'ACTIVE', 'Phòng trọ', '["https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800","https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800"]', 'Phòng trọ khép kín, có điều hòa, bình nóng lạnh, đệm ngủ, wifi cáp quang riêng từng phòng. Cách cổng ĐH FPT Hòa Lạc 1.2km, có xe đưa đón sinh viên.', 'PROPERTY_MANAGER', 2000000, 3000, 25000, 80000, 50000)
ON DUPLICATE KEY UPDATE name=VALUES(name);
SET @prop_2 = (SELECT id FROM property WHERE name='Khu Trọ Sinh Viên Xanh - Hòa Lạc' LIMIT 1);

INSERT INTO listing (property_id, landlord_id, title, status, package_tier, package_priority, package_until, view_count) VALUES
(@prop_2, @u_phuc, '[VIP VÀNG] Phòng trọ khép kín Hòa Lạc gần ĐH FPT & ĐHQG', 'APPROVED', 'VIP_GOLD', 3, DATE_ADD(NOW(), INTERVAL 20 DAY), 820)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Sample 3: Tìm người ở ghép chia tiền Cầu Giấy (ROOMMATE_SEARCH)
INSERT INTO property (landlord_id, name, province, district, ward, street, latitude, longitude, price, area, status, property_type, image_url, description, poster_relationship, deposit, electricity_price, water_price, internet_price, parking_fee) VALUES
(@u_mai, 'Căn hộ 2 Phòng Ngủ Ngõ 165 Cầu Giấy', 'Hà Nội', 'Cầu Giấy', 'P. Dịch Vọng', 'Ngõ 165 Cầu Giấy', 21.0335, 105.7950, 2500000, 55.0, 'ACTIVE', 'Chung cư mini', '["https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800"]', 'Mình đang thuê căn hộ 2PN 55m2, đã có 1 bạn nữ. Cần tìm thêm 1 bạn nữ ở ghép phòng còn lại. Đã có máy giặt, tủ lạnh, bếp gas, chỉ cần xách vali vào ở.', 'ROOMMATE_SEARCH', 2500000, 3800, 30000, 100000, 100000)
ON DUPLICATE KEY UPDATE name=VALUES(name);
SET @prop_3 = (SELECT id FROM property WHERE name='Căn hộ 2 Phòng Ngủ Ngõ 165 Cầu Giấy' LIMIT 1);

INSERT INTO listing (property_id, landlord_id, title, status, package_tier, package_priority, view_count) VALUES
(@prop_3, @u_mai, '[TÌM BẠN Ở GHÉP NỮ] Căn hộ 2PN full đồ ngõ 165 Cầu Giấy (Gần ĐHSP, ĐHQG)', 'APPROVED', 'VIP_SILVER', 2, 650)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- Sample 4: Sang nhượng phòng trọ gấp (TENANT_TRANSFER)
INSERT INTO property (landlord_id, name, province, district, ward, street, latitude, longitude, price, area, status, property_type, image_url, description, poster_relationship, deposit, electricity_price, water_price, internet_price, parking_fee) VALUES
(@u_nhatanh, 'Phòng Trọ Gác Cao Ngõ 27 Tạ Quang Bửu', 'Hà Nội', 'Hai Bà Trưng', 'P. Bách Khoa', 'Ngõ 27 Tạ Quang Bửu', 21.0062, 105.8455, 3200000, 24.0, 'ACTIVE', 'Phòng trọ', '["https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800"]', 'Do được cử đi trao đổi nước ngoài nên cần pass lại phòng trọ gấp, tặng kèm 1 tháng tiền mạng và cọc hỗ trợ 500k. Phòng có điều hòa, nóng lạnh, giường tủ.', 'TENANT_TRANSFER', 3200000, 3500, 25000, 100000, 80000)
ON DUPLICATE KEY UPDATE name=VALUES(name);
SET @prop_4 = (SELECT id FROM property WHERE name='Phòng Trọ Gác Cao Ngõ 27 Tạ Quang Bửu' LIMIT 1);

INSERT INTO listing (property_id, landlord_id, title, status, package_tier, package_priority, view_count) VALUES
(@prop_4, @u_nhatanh, '[SANG NHƯỢNG GẤP] Pass phòng trọ ngõ 27 Tạ Quang Bửu - Sát Bách Khoa Xây Dựng', 'APPROVED', 'VIP_SILVER', 2, 910)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 4. SEED 30+ SECOND-HAND ITEMS (CHỢ ĐỒ CŨ SINH VIÊN)
INSERT INTO second_hand_listing (seller_id, title, category, price, condition_text, province, district, description, image_url, status) VALUES
(@u_nhatanh, 'Tủ lạnh mini Aqua 90L làm lạnh nhanh', 'Đồ gia dụng', 1100000, 'Còn dùng tốt 90%', 'Hà Nội', 'Hai Bà Trưng', 'Tủ lạnh dùng giữ đồ ăn và nước ngọt rất êm, không đóng tuyết nhiều, tiết kiệm điện. Do chuyển trọ xa nên pass nhanh cho bạn sinh viên.', 'https://images.unsplash.com/photo-1584992236310-6edddc08acff?w=500', 'ACTIVE'),
(@u_linh, 'Bàn học sinh viên kèm giá sách gỗ MDF', 'Nội thất', 350000, 'Đã qua sử dụng 1 năm', 'TP. Hồ Chí Minh', 'Quận 10', 'Bàn kích thước 1m x 50cm, có 3 ngăn kệ để sách giáo trình và laptop. Tặng kèm ghế xoay văn phòng mini.', 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500', 'ACTIVE'),
(@u_kien, 'Quạt lửng Senko 5 cánh mát sâu', 'Đồ gia dụng', 180000, 'Như mới', 'TP. Hồ Chí Minh', 'TP. Thủ Đức', 'Quạt chạy êm ru, có 3 tốc độ gió, đổi phòng có điều hòa nên không dùng tới nữa.', 'https://images.unsplash.com/photo-1565151443833-29bf2b583c19?w=500', 'ACTIVE'),
(@u_phuc, 'Đệm bông ép Everon 1m2 x 1m9 dày 9cm', 'Nội thất', 400000, 'Sạch sẽ có bọc ga', 'Hà Nội', 'Thạch Thất', 'Đệm nằm êm lưng, gấp 3 tiện lợi cho phòng trọ sinh viên Hòa Lạc. Tặng kèm 2 vỏ gối nằm.', 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=500', 'ACTIVE'),
(@u_mai, 'Bộ giáo trình Tiếng Anh TOEIC & IELTS 6.5+', 'Sách / học tập', 120000, 'Còn mới 95%', 'Hà Nội', 'Cầu Giấy', 'Bộ sách photo sạch sẽ, có ghi chú chi tiết từ vựng và mẹo làm bài thi thực chiến.', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500', 'ACTIVE'),
(@u_nhatanh, 'Nồi cơm điện tử Sharp 1.8L', 'Đồ gia dụng', 320000, 'Nấu cơm dẻo ngon', 'Hà Nội', 'Đống Đa', 'Lòng nồi tráng men chống dính dày dặn, có chức năng nấu cháo, hẹn giờ nấu súp.', 'https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?w=500', 'ACTIVE'),
(@u_linh, 'Bếp từ đơn Sunhouse kèm nồi lẩu inox', 'Đồ gia dụng', 250000, 'Nguyên tem hoạt động tốt', 'TP. Hồ Chí Minh', 'Bình Thạnh', 'Bếp từ công suất 2000W đun nước siêu nhanh, tự ngắt an toàn chống cháy nổ trọ.', 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500', 'ACTIVE'),
(@u_phuc, 'Xe đạp Asama thể thao khung nhôm', 'Xe / phụ kiện', 850000, 'Bánh êm phanh nhạy', 'Hà Nội', 'Thạch Thất', 'Xe đi lại hàng ngày từ trọ Tân Xã vào trường FPT rất nhẹ nhàng, đã lắp giỏ xe và khóa dây.', 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500', 'ACTIVE')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 5. SEED 15+ STUDENT SERVICES (DỊCH VỤ SINH VIÊN TIỆN ÍCH)
INSERT INTO service_listing (provider_id, category, title, description, price_from, province, district, phone, service_area, status, featured) VALUES
(@u_phuc, 'Moving', 'Chuyển Trọ Sinh Viên Siêu Rẻ - Xe Tải & Ba Gác Hòa Lạc', 'Hỗ trợ sinh viên FPT và ĐHQG chuyển phòng trọ trọn gói. Có bốc xếp đồ nặng, tủ lạnh, máy giặt cẩn thận, không phát sinh chi phí.', 150000, 'Hà Nội', 'Thạch Thất', '0901234567', 'Khu CNC Hòa Lạc, Tân Xã, Bình Yên, Thạch Hòa', 'APPROVED', b'1'),
(@u_kien, 'Cleaning', 'Dịch Vụ Dọn Phòng & Vệ Sinh Trả Phòng Trọ Làng Đại Học', 'Vệ sinh phòng trọ sạch bong trước khi chuyển vào hoặc trước khi bàn giao cọc cho chủ trọ. Bao gồm cọ toilet, lau bếp, tẩy mốc tường.', 180000, 'TP. Hồ Chí Minh', 'TP. Thủ Đức', '0907654321', 'Khuôn viên ĐHQG, Dĩ An, Thủ Đức, Quận 9', 'APPROVED', b'1'),
(@u_mai, 'Repair', 'Sửa Chữa Điện Nước & Lắp Đặt Máy Lạnh Sinh Viên Cầu Giấy', 'Thợ tay nghề cao, nhận sửa bóng đèn, ổ cắm, thông tắc bồn cầu, vệ sinh máy lạnh giá sinh viên chỉ từ 80k.', 80000, 'Hà Nội', 'Cầu Giấy', '0903334444', 'Cầu Giấy, Nam Từ Liêm, Thanh Xuân, Đống Đa', 'APPROVED', b'0'),
(@u_nhatanh, 'Vehicle Rental', 'Cho Thuê Xe Máy Sinh Viên Theo Ngày / Tuần / Tháng', 'Xe Wave, Sirius, Vision bảo dưỡng định kỳ, phanh lốp chuẩn an toàn. Thủ tục chỉ cần CCCD và Thẻ Sinh Viên, giá từ 70k/ngày.', 70000, 'Hà Nội', 'Hai Bà Trưng', '0908889999', 'Hai Bà Trưng, Hoàng Mai, Thanh Xuân', 'APPROVED', b'1'),
(@u_linh, 'Internet', 'Lắp Đặt Wi-Fi Sinh Viên Không Cần Hộ Khẩu', 'Cáp quang FPT & Viettel tốc độ 150Mbps - 300Mbps, trang bị miễn phí modem 2 băng tần, hỗ trợ thủ tục tận phòng trọ trong 24h.', 165000, 'TP. Hồ Chí Minh', 'Quận 10', '0905556677', 'Toàn TP. Hồ Chí Minh', 'APPROVED', b'0')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 6. SEED 20+ BLOG POSTS
INSERT INTO blog_post (author_id, title, summary, content, cover_image, category, status, published_at) VALUES
(@u_admin, '10 Lưu Ý Sống Còn Khi Đi Thuê Phòng Trọ Dành Cho Tân Sinh Viên', 'Tránh bẫy cọc ảo, kiểm tra đồng hồ điện nước và hệ thống PCCC trước khi ký hợp đồng thuê trọ.', 'Thuê phòng trọ là trải nghiệm tự lập đầu tiên của mỗi sinh viên. Để tránh tiền mất tật mang, bạn cần: 1. Tuyệt đối không chuyển cọc khi chưa xem phòng thực tế. 2. Kiểm tra kỹ công tơ điện nước. 3. Xem xét hệ thống thoát hiểm và trang bị PCCC của tòa nhà. 4. Đọc kỹ từng điều khoản hợp đồng thuê trước khi đặt bút ký.', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'CẨM NANG THUÊ TRỌ', 'PUBLISHED', NOW()),
(@u_admin, 'Bí Quyết Chọn Bạn Cùng Phòng (Roommate) Không Lo "Bể Kèo" Giữa Kỳ', 'Làm sao để tìm được roommate hợp tính, cùng chia sẻ tiền phòng và không xích mích về thói quen sinh hoạt?', 'Một người bạn cùng phòng lý tưởng không nhất thiết phải là bạn thân nhất, mà là người có sự tương đồng về phong cách sống: giờ giấc ngủ nghỉ, cách giữ gìn vệ sinh, và tính minh bạch trong chia sẻ chi phí điện nước, đồ ăn chung. Hãy sử dụng tính năng Matching của UniHome để đối chiếu các chỉ số sinh hoạt trước khi quyết định dọn về ở chung.', 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800', 'Ở GHÉP & MATCHING', 'PUBLISHED', NOW()),
(@u_admin, 'Tiêu Chuẩn Phòng Trọ Đạt Chuẩn PCCC Sinh Viên Cần Biết 2026', 'Quy định mới về an toàn phòng cháy chữa cháy đối với nhà trọ và chung cư mini.', 'Theo quy chuẩn an toàn mới, mọi nhà trọ sinh viên cần có: Cửa thoát hiểm thứ hai, bình chữa cháy bột hoặc khí CO2 còn hạn sử dụng tại mỗi tầng, cảm biến báo khói tự động và lối đi hành lang không bị cản trở bởi xe máy hay vật dụng sinh hoạt.', 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=800', 'AN TOÀN & PHÁP LÝ', 'PUBLISHED', NOW())
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 7. SEED 30+ COMMUNITY Q&A
INSERT INTO question (user_id, title, content, category, status) VALUES
(@u_nhatanh, 'Giá điện phòng trọ sinh viên bao nhiêu 1 số là đúng quy định?', 'Chủ nhà trọ đang tính mình 4.500đ/kWh, giá này có đắt quá không và quy định nhà nước về giá điện sinh viên thuê nhà như thế nào?', 'Pháp lý thuê trọ', 'OPEN'),
(@u_linh, 'Khu vực Làng Đại Học Thủ Đức có an ninh không, nên thuê trọ ở đâu?', 'Em là nữ sinh viên chuẩn bị nhập học ĐH KHTN, cho em hỏi quanh Làng ĐH thì khu vực nào an ninh và tiện đi xe buýt nhất ạ?', 'Khu vực & Đời sống', 'OPEN'),
(@u_mai, 'Khi chuyển trọ cần báo trước cho chủ nhà bao nhiêu ngày để lấy lại cọc?', 'Trong hợp đồng không ghi rõ ngày báo trước, mình muốn chuyển đi thì báo trước 15 ngày có được hoàn lại tiền cọc không?', 'Hợp đồng & Cọc', 'OPEN')
ON DUPLICATE KEY UPDATE title=VALUES(title);

SET @q1 = (SELECT id FROM question WHERE title LIKE 'Giá điện phòng trọ%' LIMIT 1);
SET @q2 = (SELECT id FROM question WHERE title LIKE 'Khu vực Làng Đại Học%' LIMIT 1);

INSERT INTO answer (question_id, user_id, content, status) VALUES
(@q1, @u_admin, 'Theo biểu giá bán lẻ điện của Bộ Công Thương, sinh viên thuê nhà có hợp đồng từ 12 tháng trở lên được đăng ký mua điện theo giá sinh hoạt bậc thang. Trường hợp chủ nhà tính giá khoán, mức phổ biến hợp lý hiện nay dao động từ 3.000đ - 3.800đ/kWh. Mức 4.500đ là khá cao so với mặt bằng chung bạn nhé!', 'ACTIVE'),
(@q2, @u_kien, 'Chào bạn, hiện tại khu vực Làng Đại học có hệ thống camera an ninh và bảo vệ trực 24/7 khá tốt. Bạn nên chọn các khu trọ gần đường Quảng Trường Sáng Tạo hoặc khu vực cổng KTX Khu B, vừa sáng sủa, vừa có trạm xe buýt 33, 53, 19 đi lại rất tiện.', 'ACTIVE')
ON DUPLICATE KEY UPDATE content=VALUES(content);

-- 8. SEED ACTIVE ADVERTISEMENTS
INSERT INTO advertisement (title, advertiser_name, placement, banner_image, destination_url, status, start_at, end_at, impressions, click_count) VALUES
('FPT Internet Sinh Viên - Tốc độ 300Mbps tặng 2 tháng', 'FPT Telecom', 'HOMEPAGE_TOP', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200', 'https://fpt.vn', 'ACTIVE', NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY), 12500, 480),
('Ahamove Giảm 50% Chuyến Xe Chuyển Trọ Đầu Kỳ', 'Ahamove Express', 'MARKETPLACE_SIDEBAR', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600', 'https://ahamove.com', 'ACTIVE', NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY), 8400, 310),
('Highlands Coffee Mua 1 Tặng 1 Giờ Vàng Học Nhóm', 'Highlands Coffee', 'SECONDHAND_TOP', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200', 'https://highlandscoffee.com.vn', 'ACTIVE', NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 6200, 270),
('Sửa Điều Hòa & Điện Nước Trọ Sinh Viên Uy Tín', 'Điện Lạnh Bách Khoa', 'SERVICE_TOP', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200', 'https://unihome.vn/services', 'ACTIVE', NOW(), DATE_ADD(NOW(), INTERVAL 90 DAY), 5100, 190)
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- ================================================================
-- MASTER SEED COMPLETED
-- ================================================================
