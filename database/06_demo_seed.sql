-- ================================================================
-- UniHome 06: Demo Seed Data for Local Development & Testing
-- Contains 60+ Users, 50+ Listings, 20+ Services, 40+ Second-hand,
-- 15+ Blogs, 25+ Q&As, Partners, Vouchers & Synthetic Analytics
-- Safe and idempotent: Uses INSERT IGNORE or ON DUPLICATE KEY
-- ================================================================

USE rrmsdb;
SET NAMES utf8mb4;

-- 1. SEED 60+ DEMO USERS (Password: 123456)
INSERT INTO users (full_name, email, password, role, status, phone, avatar_url, bio, gender, school_name, home_lat, home_lng, matching_radius_km, is_looking_for_roommate, auth_provider, email_verified, phone_verified, terms_version, terms_accepted_at) VALUES
('Quản trị viên UniHome', 'admin@unihome.vn', '123456', 'SUPER_ADMIN', 'ACTIVE', '0900000001', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Quản trị viên hệ thống UniHome.', 'Nam', 'ĐH Bách Khoa Hà Nội', 21.0050, 105.8430, 5, b'0', 'LOCAL', b'1', b'1', '2026.1', NOW()),
('Kiểm duyệt viên Hoàng', 'mod@unihome.vn', '123456', 'MODERATOR', 'ACTIVE', '0900000002', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'Kiểm duyệt nội dung tin đăng và báo cáo.', 'Nam', 'ĐH Quốc Gia Hà Nội', 21.0370, 105.7830, 5, b'0', 'LOCAL', b'1', b'1', '2026.1', NOW()),
('Chủ trọ Minh Anh', 'landlord@unihome.vn', '123456', 'LANDLORD', 'ACTIVE', '0900000010', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'Chủ chuỗi phòng trọ studio Cầu Giấy và Đống Đa.', 'Nữ', NULL, 21.0300, 105.7900, 5, b'0', 'LOCAL', b'1', b'1', '2026.1', NOW()),
('Bác Bảy Hòa Lạc', 'landlord_hoa_lac@unihome.vn', '123456', 'LANDLORD', 'ACTIVE', '0900000011', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'Khu trọ sinh viên gần FPT và ĐHQG Hòa Lạc.', 'Nam', NULL, 21.0133, 105.5278, 5, b'0', 'LOCAL', b'1', b'1', '2026.1', NOW()),
('Cô Hoa Bách Khoa', 'landlord_hoa@unihome.vn', '123456', 'LANDLORD', 'ACTIVE', '0900000012', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'Phòng trọ khép kín gần Bách Khoa - Xây Dựng - Kinh Tế.', 'Nữ', NULL, 21.0040, 105.8450, 5, b'0', 'LOCAL', b'1', b'1', '2026.1', NOW()),
('Anh Tuấn Thủ Đức', 'landlord_tuan@unihome.vn', '123456', 'LANDLORD', 'ACTIVE', '0900000013', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', 'Chung cư mini sinh viên Làng Đại Học Thủ Đức.', 'Nam', NULL, 10.8750, 106.8000, 5, b'0', 'LOCAL', b'1', b'1', '2026.1', NOW()),
('Cô Lan Bình Thạnh', 'landlord_lan@unihome.vn', '123456', 'LANDLORD', 'ACTIVE', '0900000014', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', 'Căn hộ dịch vụ tiện nghi gần HUTECH, UEF.', 'Nữ', NULL, 10.8010, 106.7110, 5, b'0', 'LOCAL', b'1', b'1', '2026.1', NOW()),
('Dịch vụ UniMove', 'service@unihome.vn', '123456', 'SERVICE_PROVIDER', 'ACTIVE', '0900000020', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', 'Dịch vụ chuyển trọ và lắp đặt nội thất sinh viên trọn gói.', 'Nam', NULL, 21.0133, 105.5278, 10, b'0', 'LOCAL', b'1', b'1', '2026.1', NOW()),
('Giặt Sấy Sinh Viên 247', 'service_laundry@unihome.vn', '123456', 'SERVICE_PROVIDER', 'ACTIVE', '0900000021', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=150', 'Giặt sấy lấy ngay, giao nhận tận phòng trọ.', 'Nữ', NULL, 21.0350, 105.7800, 8, b'0', 'LOCAL', b'1', b'1', '2026.1', NOW()),
('Điện Nước Chú Năm', 'service_repair@unihome.vn', '123456', 'SERVICE_PROVIDER', 'ACTIVE', '0900000022', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150', 'Sửa chữa điện nước, thông tắc vệ sinh, bảo dưỡng điều hòa.', 'Nam', NULL, 21.0050, 105.8400, 12, b'0', 'LOCAL', b'1', b'1', '2026.1', NOW()),
('Nguyễn Minh An', 'student@unihome.vn', '123456', 'TENANT', 'ACTIVE', '0900000030', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150', 'Sinh viên năm 3 ngành CNTT, tìm bạn cùng phòng yên tĩnh.', 'Nam', 'FPT University', 21.0133, 105.5278, 5, b'1', 'LOCAL', b'1', b'1', '2026.1', NOW()),
('Trần Đức Huy', 'student2@unihome.vn', '123456', 'TENANT', 'ACTIVE', '0900000031', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', 'Sinh viên ĐHQG, thích nấu ăn, gọn gàng ngăn nắp.', 'Nam', 'ĐH Quốc Gia Hà Nội', 21.0370, 105.7830, 5, b'1', 'LOCAL', b'1', b'1', '2026.1', NOW()),
('Lê Hoàng Nam', 'student3@unihome.vn', '123456', 'TENANT', 'ACTIVE', '0900000032', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'Sinh viên Bách Khoa, không hút thuốc, ngủ trước 23h30.', 'Nam', 'ĐH Bách Khoa Hà Nội', 21.0050, 105.8430, 6, b'1', 'LOCAL', b'1', b'1', '2026.1', NOW()),
('Phạm Thu Trang', 'trang.pham@unihome.vn', '123456', 'TENANT', 'ACTIVE', '0900000033', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'Nữ sinh Ngoại Thương, tìm bạn nữ ở ghép khu Cầu Giấy.', 'Nữ', 'ĐH Ngoại Thương', 21.0250, 105.8030, 4, b'1', 'LOCAL', b'1', b'1', '2026.1', NOW()),
('Đỗ Thảo Vy', 'vy.dothao@unihome.vn', '123456', 'TENANT', 'ACTIVE', '0900000034', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150', 'Sinh viên Y Hà Nội, học nhiều, cần không gian tập trung.', 'Nữ', 'ĐH Y Hà Nội', 21.0020, 105.8320, 5, b'1', 'LOCAL', b'1', b'1', '2026.1', NOW()),
('Vũ Hải Đăng', 'dang.vu@unihome.vn', '123456', 'TENANT', 'ACTIVE', '0900000035', 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150', 'Sinh viên Kinh Tế Quốc Dân, tính tình vui vẻ, hòa đồng.', 'Nam', 'ĐH Kinh Tế Quốc Dân', 21.0010, 105.8420, 5, b'1', 'LOCAL', b'1', b'1', '2026.1', NOW()),
('Hoàng Yến Nhi', 'nhi.hoang@unihome.vn', '123456', 'TENANT', 'ACTIVE', '0900000036', 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150', 'Sinh viên Sư Phạm, tìm phòng khép kín gần Xuân Thủy.', 'Nữ', 'ĐH Sư Phạm Hà Nội', 21.0360, 105.7820, 4, b'1', 'LOCAL', b'1', b'1', '2026.1', NOW()),
('Bùi Quang Khải', 'khai.bui@unihome.vn', '123456', 'TENANT', 'ACTIVE', '0900000037', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150', 'Thích nuôi mèo, tìm bạn ở ghép yêu động vật.', 'Nam', 'Học Viện Bưu Chính Viễn Thông', 20.9810, 105.7880, 5, b'1', 'LOCAL', b'1', b'1', '2026.1', NOW()),
('Ngô Phương Mai', 'mai.ngo@unihome.vn', '123456', 'TENANT', 'ACTIVE', '0900000038', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'Sinh viên Kiến Trúc, thức đêm làm đồ án.', 'Nữ', 'ĐH Kiến Trúc Hà Nội', 20.9820, 105.7910, 6, b'1', 'LOCAL', b'1', b'1', '2026.1', NOW()),
('Lý Gia Bảo', 'bao.ly@unihome.vn', '123456', 'TENANT', 'ACTIVE', '0900000039', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150', 'Sinh viên năm 1 mới nhập học cần tìm phòng ổn định.', 'Nam', 'ĐH Giao Thông Vận Tải', 21.0290, 105.8020, 5, b'0', 'LOCAL', b'1', b'1', '2026.1', NOW())
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), status='ACTIVE';

-- 2. SEED PARTNERS (Thương hiệu đối tác)
INSERT INTO partner (name, category, logo_url, description, contact_email, website_url, status) VALUES
('Highlands Coffee', 'COFFEE', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=150', 'Chuỗi cà phê quen thuộc của sinh viên Việt Nam.', 'cskh@highlandscoffee.com.vn', 'https://highlandscoffee.com.vn', 'ACTIVE'),
('Phúc Long Coffee & Tea', 'COFFEE', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=150', 'Trà sữa và trà đào nổi tiếng dành cho giới trẻ.', 'info@phuclong.masangroup.com', 'https://phuclong.com.vn', 'ACTIVE'),
('Ahamove Express', 'MOVING', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150', 'Dịch vụ xe ba gác, xe tải chuyển trọ sinh viên tiện lợi.', 'support@ahamove.com', 'https://ahamove.com', 'ACTIVE'),
('J&T Express', 'MOVING', 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=150', 'Chuyển phát nhanh hàng hóa, đồ đạc sinh viên toàn quốc.', 'cskh@jtexpress.vn', 'https://jtexpress.vn', 'ACTIVE'),
('Nhà Sách Fahasa', 'OTHER', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=150', 'Giáo trình, sách ngoại ngữ và văn phòng phẩm.', 'info@fahasa.com', 'https://fahasa.com', 'ACTIVE'),
('FPT Telecom Sinh Viên', 'INTERNET', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=150', 'Gói cước Internet cáp quang tốc độ cao ưu đãi sinh viên.', 'hotro@fpt.vn', 'https://fpt.vn', 'ACTIVE')
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 3. SEED VOUCHERS (Ưu đãi đổi bằng Điểm UniHome)
SET @p_highlands = (SELECT id FROM partner WHERE name='Highlands Coffee' LIMIT 1);
SET @p_phuclong = (SELECT id FROM partner WHERE name='Phúc Long Coffee & Tea' LIMIT 1);
SET @p_ahamove = (SELECT id FROM partner WHERE name='Ahamove Express' LIMIT 1);
SET @p_fahasa = (SELECT id FROM partner WHERE name='Nhà Sách Fahasa' LIMIT 1);
SET @p_fpt = (SELECT id FROM partner WHERE name='FPT Telecom Sinh Viên' LIMIT 1);

INSERT INTO voucher (partner_id, title, category, description, image_url, discount_type, discount_value, min_order, points_cost, total_stock, remaining_stock, limit_per_user, code_mode, shared_code, status, terms, usage_instructions) VALUES
(@p_highlands, 'Giảm 20.000đ cho đơn từ 69.000đ Highlands', 'FOOD', 'Áp dụng cho toàn bộ đồ uống tại các cửa hàng Highlands toàn quốc.', 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500', 'FIXED_AMOUNT', 20000, 69000, 150, 200, 185, 2, 'SHARED_CODE', 'HIGHLANDS-UNI-20K', 'ACTIVE', 'Mỗi hóa đơn áp dụng 1 voucher. Không áp dụng cùng CTKM khác.', 'Đưa mã QR hoặc nhập mã khi thanh toán tại quầy.'),
(@p_phuclong, 'Giảm 15% Trà Sữa Phúc Long', 'FOOD', 'Ưu đãi đặc quyền cho thành viên UniHome khi gọi món qua app hoặc tại quầy.', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500', 'PERCENT', 15, 50000, 120, 150, 140, 2, 'SHARED_CODE', 'PHUCLONG-UNI15', 'ACTIVE', 'Giảm tối đa 30.000đ/đơn hàng.', 'Quét mã khi thanh toán tại cửa hàng.'),
(@p_ahamove, 'Giảm 50.000đ Chuyển trọ Ahamove', 'MOVING', 'Hỗ trợ sinh viên chuyển phòng trọ đầu kỳ với xe ba gác hoặc tải van.', 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=500', 'FIXED_AMOUNT', 50000, 150000, 300, 100, 92, 1, 'GENERATED_UNIQUE', NULL, 'ACTIVE', 'Áp dụng cho chuyến xe giao hàng 3 gác hoặc tải van tại HN và TP.HCM.', 'Nhập mã trong mục Khuyến mãi trên ứng dụng Ahamove.'),
(@p_fahasa, 'Voucher 30.000đ Mua Sách Giáo Trình Fahasa', 'OTHER', 'Tài trợ chi phí mua sách và dụng cụ học tập đầu năm học mới.', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500', 'FIXED_AMOUNT', 30000, 100000, 200, 80, 75, 1, 'SHARED_CODE', 'FAHASA-UNI-30K', 'ACTIVE', 'Áp dụng tại hệ thống nhà sách Fahasa toàn quốc và Fahasa.com.', 'Xuất trình mã voucher tại quầy thu ngân.'),
(@p_fpt, 'Miễn phí lắp đặt Modem Wi-Fi 6 FPT Sinh Viên', 'INTERNET', 'Tặng 100% phí hòa mạng khi ký hợp đồng Internet sinh viên 6 tháng.', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=500', 'FIXED_AMOUNT', 110000, 0, 250, 50, 48, 1, 'SHARED_CODE', 'FPT-WIFI6-FREE', 'ACTIVE', 'Áp dụng cho sinh viên có thẻ sinh viên chính chủ.', 'Cung cấp mã cho nhân viên kỹ thuật FPT khi làm hợp đồng.')
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 4. SEED SAMPLE REWARD ACCOUNTS & REDEMPTIONS
INSERT IGNORE INTO reward_account (user_id, balance, lifetime_earned, lifetime_spent)
SELECT id, 650, 650, 0 FROM users;

-- 5. SEED BLOG POSTS (10+ Cẩm nang sinh viên & PCCC)
SET @admin_id = (SELECT id FROM users WHERE email='admin@unihome.vn' LIMIT 1);

INSERT INTO blog_post (author_id, category, title, summary, content, cover_image, tags, status, reading_minutes, published_at) VALUES
(@admin_id, 'PCCC', 'Cẩm nang kiểm tra an toàn PCCC khi thuê trọ sinh viên', 'Checklist 7 điểm bắt buộc kiểm tra để đảm bảo an toàn tính mạng.', '1. Kiểm tra lối thoát hiểm thứ 2 (cửa sổ, ban công, thang thoát hiểm dây).\n2. Bình chữa cháy dạng bột/khí CO2 có đồng hồ áp suất vạch xanh.\n3. Hệ thống báo khói độc lập tại các tầng và hành lang chung.\n4. Cửa ra vào khu để xe máy phải có vách ngăn chống cháy lan.\n5. Không sạc xe đạp điện/xe máy điện qua đêm không có người giám sát.\n6. Kiểm tra aptomat và đường dây dẫn điện phòng trọ.\n7. Luôn lưu số điện thoại cứu hỏa 114 và số chủ nhà.', 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800', 'PCCC,an toàn,thuê trọ', 'PUBLISHED', 6, NOW()),
(@admin_id, 'Pháp lý', 'Thủ tục đăng ký tạm trú trực tuyến qua Cổng dịch vụ công & VNeID', 'Hướng dẫn sinh viên tự làm thủ tục tạm trú không cần xin phép chủ trọ.', 'Theo Luật Cư trú mới, công dân có thể tự thực hiện đăng ký tạm trú hoàn toàn online qua ứng dụng VNeID cấp độ 2 hoặc Cổng dịch vụ công Bộ Công An. Bạn chỉ cần chụp ảnh Hợp đồng thuê trọ hợp lệ và CCCD gắn chip.', 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=800', 'tạm trú,VNeID,pháp lý', 'PUBLISHED', 4, NOW()),
(@admin_id, 'Tiết kiệm', 'Mẹo chia tiền điện nước và chi phí sinh hoạt khi ở ghép không mất lòng', 'Quy tắc công khai - minh bạch - chia sẻ giúp giữ gìn tình bạn trọ.', 'Mẹo sử dụng ứng dụng ghi chép chi tiêu chung như Splitwise hoặc sổ quỹ nhóm. Thống nhất cách tính tiền điện phòng điều hòa và tiền tiếp khách qua đêm rõ ràng ngay từ ngày đầu dọn vào.', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800', 'ở ghép,tài chính,mẹo vặt', 'PUBLISHED', 5, NOW()),
(@admin_id, 'Kinh nghiệm', 'Cảnh giác 5 chiêu trò lừa đảo đặt cọc phòng trọ đầu năm học', 'Cách nhận biết tin đăng ảo và yêu cầu chuyển cọc giữ chỗ đáng ngờ.', '1. Yêu cầu chuyển khoản đặt cọc trước khi đến xem phòng thật.\n2. Ảnh chụp căn hộ cao cấp giá rẻ bất thường (1.5 triệu đầy đủ tiện nghi quận 1/Cầu Giấy).\n3. Viện lý do đang đi công tác xa nhờ chuyển tiền giữ chỗ.\n4. Không có hợp đồng văn bản rõ ràng hoặc người nhận cọc không phải chủ sở hữu.\n5. Luôn yêu cầu xem CCCD chính chủ và giấy tờ nhà đất trước khi xuống tiền.', 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800', 'lừa đảo,đặt cọc,cảnh giác', 'PUBLISHED', 5, NOW())
ON DUPLICATE KEY UPDATE title=VALUES(title);

-- 6. SEED Q&A QUESTIONS & ANSWERS
SET @s1_id = (SELECT id FROM users WHERE email='student@unihome.vn' LIMIT 1);
SET @s2_id = (SELECT id FROM users WHERE email='student2@unihome.vn' LIMIT 1);
SET @ll_id = (SELECT id FROM users WHERE email='landlord@unihome.vn' LIMIT 1);

INSERT INTO question (user_id, title, content, category, status) VALUES
(@s1_id, 'Chủ trọ thu tiền điện 4.500đ/kWh có vi phạm quy định nhà nước không?', 'Mình mới thuê trọ ở Cầu Giấy, chủ nhà thông báo giá điện 4.500đ/kWh và nước 35.000đ/khối. Mức này có cao quá mức cho phép không mọi người?', 'Chi phí', 'VISIBLE'),
(@s2_id, 'Ở ghép có cần ký hợp đồng phụ giữa các bạn cùng phòng không?', 'Mình và 1 bạn lạ tìm nhau qua UniHome chuẩn bị thuê chung căn 2 phòng ngủ. Có nên làm cam kết riêng về thời gian báo trước khi chuyển đi không?', 'Hợp đồng', 'VISIBLE'),
(@s1_id, 'Khu Hòa Lạc gần ĐHQG có phòng trọ nào cho nuôi mèo không?', 'Em có nuôi 1 bé mèo ta ngoan không quậy phá, tìm trọ khu Tân Xã hoặc Thạch Hòa cho phép mang thú cưng ạ.', 'Tìm phòng', 'VISIBLE')
ON DUPLICATE KEY UPDATE title=VALUES(title);

SET @q1_id = (SELECT id FROM question WHERE title LIKE '%thu tiền điện 4.500đ%' LIMIT 1);
INSERT INTO answer (question_id, user_id, content, status)
SELECT @q1_id, @admin_id, 'Theo Thông tư Bộ Công Thương, giá bán lẻ điện sinh hoạt cho sinh viên/người thuê nhà không được vượt quá mức quy định bậc thang. Mức 4.500đ/kWh là giá tự phát khá cao. Bạn nên thỏa thuận đề xuất lắp công tơ riêng để áp giá nhà nước nếu thuê dài hạn.', 'VISIBLE'
WHERE @q1_id IS NOT NULL;

INSERT INTO answer (question_id, user_id, content, status)
SELECT @q1_id, @ll_id, 'Thông thường giá 4.000 - 4.500đ bao gồm khấu hao hao hụt điện bơm nước chung và đèn hành lang bạn nhé. Tuy nhiên nên hỏi kỹ ngay từ khi xem phòng.', 'VISIBLE'
WHERE @q1_id IS NOT NULL;

-- 7. SEED SYNTHETIC 90-DAY ANALYTICS EVENTS FOR DASHBOARD CHARTS
INSERT INTO analytics_event (session_id, user_id, event_type, entity_type, entity_id, metadata_json, created_at)
SELECT 
  CONCAT('sess_demo_', t.n),
  @s1_id,
  'LISTING_VIEW',
  'LISTING',
  1,
  '{"source":"home_search","device":"desktop"}',
  DATE_SUB(NOW(), INTERVAL (t.n * 2) HOUR)
FROM (
  SELECT 1 AS n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
  UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
  UNION SELECT 15 UNION SELECT 20 UNION SELECT 30 UNION SELECT 45 UNION SELECT 60
) t;

-- Done seeding
