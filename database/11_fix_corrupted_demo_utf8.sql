-- ==============================================================================
-- UNiHOME CLEAN DEMO DATA & MOJIBAKE FIX (11_fix_corrupted_demo_utf8.sql)
-- Safe migration: Fixes corrupted question marks (??) in demo rows across:
-- partner, voucher, second_hand_listing, service_listing.
-- Does NOT drop tables or erase user data.
-- ==============================================================================

SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 1. CHUẨN HÓA DỮ LIỆU ĐỐI TÁC (PARTNER)
UPDATE partner SET 
  name = 'Highlands Coffee', 
  category = 'COFFEE',
  description = 'Chuỗi cà phê hàng đầu Việt Nam dành cho sinh viên và giới trẻ.' 
WHERE id = 1;

UPDATE partner SET 
  name = 'Phúc Long Coffee & Tea', 
  category = 'COFFEE',
  description = 'Trà sữa và trà đào nổi tiếng dành cho giới trẻ.' 
WHERE id = 2;

UPDATE partner SET 
  name = 'Ahamove Express', 
  category = 'MOVING',
  description = 'Dịch vụ vận chuyển hàng hóa, chuyển phòng trọ sinh viên siêu tốc.' 
WHERE id = 3;

UPDATE partner SET 
  name = 'J&T Express', 
  category = 'LOGISTICS',
  description = 'Chuyển phát nhanh bưu kiện sinh viên toàn quốc giá rẻ.' 
WHERE id = 4;

UPDATE partner SET 
  name = 'Nhà Sách Fahasa', 
  category = 'BOOKSTORE',
  description = 'Hệ thống nhà sách cung cấp giáo trình, văn phòng phẩm sinh viên.' 
WHERE id = 5;

UPDATE partner SET 
  name = 'FPT Telecom Sinh Viên', 
  category = 'INTERNET',
  description = 'Nhà mạng viễn thông cung cấp Internet cáp quang tốc độ cao cho sinh viên.' 
WHERE id = 6;


-- 2. CHUẨN HÓA DỮ LIỆU VOUCHER ƯU ĐÃI
UPDATE voucher SET 
  title = 'Giảm 20.000đ cho đơn từ 69.000đ Highlands', 
  category = 'FOOD', 
  description = 'Áp dụng cho toàn bộ đồ uống tại các cửa hàng Highlands toàn quốc.',
  terms = 'Mỗi hóa đơn áp dụng 1 voucher. Không áp dụng cùng CTKM khác.',
  usage_instructions = 'Đưa mã QR hoặc nhập mã khi thanh toán tại quầy.'
WHERE id = 1;

UPDATE voucher SET 
  title = 'Giảm 15% Trà Sữa Phúc Long', 
  category = 'FOOD', 
  description = 'Ưu đãi đặc quyền cho thành viên UniHome khi gọi món qua app hoặc tại quầy.',
  terms = 'Giảm tối đa 30.000đ/đơn hàng.',
  usage_instructions = 'Quét mã khi thanh toán tại cửa hàng.'
WHERE id = 2;

UPDATE voucher SET 
  title = 'Giảm 50.000đ Chuyển trọ Ahamove', 
  category = 'MOVING', 
  description = 'Hỗ trợ sinh viên chuyển phòng trọ đầu kỳ với xe ba gác hoặc tải van.',
  terms = 'Áp dụng cho chuyến xe giao hàng 3 gác hoặc tải van tại HN và TP.HCM.',
  usage_instructions = 'Nhập mã trong mục Khuyến mại trên ứng dụng Ahamove.'
WHERE id = 3;

UPDATE voucher SET 
  title = 'Voucher 30.000đ Mua Sách Giáo Trình Fahasa', 
  category = 'OTHER', 
  description = 'Tài trợ chi phí mua sách và dụng cụ học tập đầu năm học mới.',
  terms = 'Áp dụng tại hệ thống nhà sách Fahasa toàn quốc và Fahasa.com.',
  usage_instructions = 'Xuất trình mã voucher tại quầy thu ngân.'
WHERE id = 4;

UPDATE voucher SET 
  title = 'Miễn phí lắp đặt Modem Wi-Fi 6 FPT Sinh Viên', 
  category = 'INTERNET', 
  description = 'Tặng 100% phí hòa mạng khi ký hợp đồng Internet sinh viên 6 tháng.',
  terms = 'Áp dụng cho sinh viên có thẻ sinh viên chính chủ.',
  usage_instructions = 'Cung cấp mã cho nhân viên kỹ thuật FPT khi làm hợp đồng.'
WHERE id = 5;

-- Xóa các bản ghi voucher seed trùng lặp không có liên kết
DELETE FROM voucher WHERE id > 5;


-- 3. CHUẨN HÓA DỮ LIỆU ĐỒ CŨ (SECOND_HAND_LISTING)
UPDATE second_hand_listing SET
  title = 'Tủ lạnh mini Aqua 90L làm lạnh nhanh',
  category = 'Đồ gia dụng',
  condition_text = 'Còn dùng tốt 90%',
  description = 'Tủ lạnh dùng giữ đồ ăn và nước ngọt rất êm, không đóng tuyết nhiều, tiết kiệm điện. Do chuyển trọ xa nên pass nhanh cho bạn sinh viên.'
WHERE id = 3;

UPDATE second_hand_listing SET
  title = 'Bàn học sinh viên kèm giá sách gỗ MDF',
  category = 'Nội thất',
  condition_text = 'Mới 95%',
  description = 'Bàn học màu vân gỗ sáng, chân chắc chắn, có 3 ngăn để tài liệu sách vở. Tháo lắp dễ dàng chuyển phòng.'
WHERE id = 4;

UPDATE second_hand_listing SET
  title = 'Quạt lửng Senko 5 cánh mát sâu',
  category = 'Đồ gia dụng',
  condition_text = 'Đang chạy êm',
  description = 'Quạt chạy 3 tốc độ gió, tuốc năng xoay đều, lồng quạt chắc chắn an toàn cho phòng trọ sinh viên.'
WHERE id = 5;

UPDATE second_hand_listing SET
  title = 'Đệm bông ép Everon 1m2 x 1m9 dày 9cm',
  category = 'Nội thất',
  condition_text = 'Vỏ bọc sạch sẽ',
  description = 'Đệm gập 3 gọn gàng, độ đàn hồi tốt không bị xẹp lún, bọc vải gấm cao cấp còn mới.'
WHERE id = 6;

UPDATE second_hand_listing SET
  title = 'Bộ giáo trình Tiếng Anh TOEIC & IELTS 6.5+',
  category = 'Sách / học tập',
  condition_text = 'Chưa viết bút mực',
  description = 'Gồm trọn bộ tài liệu ôn luyện có đáp án chi tiết, tặng kèm tài khoản học từ vựng online cho bạn sinh viên.'
WHERE id = 7;

UPDATE second_hand_listing SET
  title = 'Nồi cơm điện tử Sharp 1.8L',
  category = 'Đồ gia dụng',
  condition_text = 'Nấu cơm dẻo ngon',
  description = 'Lòng nồi tráng men chống dính dày dặn, có chế độ hẹn giờ và nấu cháo dinh dưỡng.'
WHERE id = 8;

UPDATE second_hand_listing SET
  title = 'Bếp từ đơn Sunhouse kèm nồi lẩu inox',
  category = 'Đồ gia dụng',
  condition_text = 'Phím cảm ứng nhạy',
  description = 'Bếp từ công suất 2000W nấu siêu nhanh, an toàn chống cháy nổ cho phòng trọ khép kín.'
WHERE id = 9;

UPDATE second_hand_listing SET
  title = 'Xe đạp Asama thể thao khung nhôm',
  category = 'Xe / phụ kiện',
  condition_text = 'Phanh đĩa xịn',
  description = 'Xe đi học nhẹ nhàng êm ái, bộ truyền động Shimano 21 tốc độ, lốp mới thay còn gai dày.'
WHERE id = 10;

-- Chuẩn hóa category cho toàn bộ đồ cũ
UPDATE second_hand_listing SET category = 'Nội thất' WHERE category IN ('B?n gh?', 'Bàn ghế', 'N?i th?t');
UPDATE second_hand_listing SET category = 'Đồ gia dụng' WHERE category IN ('?? gia d?ng', 'Đồ gia dụng');
UPDATE second_hand_listing SET category = 'Điện tử' WHERE category IN ('?? ?i?n t?', 'Điện tử');
UPDATE second_hand_listing SET category = 'Sách / học tập' WHERE category IN ('S?ch / h?c t?p', 'S?ch v?', 'Sách vở');
UPDATE second_hand_listing SET category = 'Xe / phụ kiện' WHERE category IN ('Xe / ph? ki?n', 'Xe c?', 'Xe cộ');
UPDATE second_hand_listing SET category = 'Khác' WHERE category IN ('Th? thao', 'Thể thao');


-- 4. CHUẨN HÓA DỮ LIỆU DỊCH VỤ (SERVICE_LISTING)
UPDATE service_listing SET
  title = 'Chuyển Trọ Sinh Viên Siêu Rẻ - Xe Tải & Ba Gác Hòa Lạc',
  category = 'Chuyển trọ',
  description = 'Đội ngũ sinh viên hỗ trợ khuân vác tận phòng, xe tải nhỏ len lỏi mọi ngõ ngách, giá rẻ nhất khu vực Hòa Lạc.'
WHERE id = 3;

UPDATE service_listing SET
  title = 'Dịch Vụ Dọn Phòng & Vệ Sinh Trả Phòng Trọ Làng Đại Học',
  category = 'Dọn vệ sinh',
  description = 'Lau dọn toilet, sàn nhà, tẩy ố gạch men, bàn giao phòng sạch sẽ cho chủ nhà nhận lại 100% tiền cọc.'
WHERE id = 4;

UPDATE service_listing SET
  title = 'Sửa Chữa Điện Nước & Lắp Đặt Máy Lạnh Sinh Viên Cầu Giấy',
  category = 'Sửa chữa',
  description = 'Thợ sửa điện nước giá sinh viên, bảo dưỡng điều hòa, thông tắc bồn cầu, thay phao nước bồn cầu có mặt sau 15 phút.'
WHERE id = 5;

UPDATE service_listing SET
  title = 'Cho Thuê Xe Máy Sinh Viên Theo Ngày / Tuần / Tháng',
  category = 'Xe máy',
  description = 'Xe Wave, Sirius, Vision máy khỏe, tiết kiệm xăng, thủ tục chỉ cần thẻ sinh viên, có kèm mũ bảo hiểm.'
WHERE id = 6;

UPDATE service_listing SET
  title = 'Lắp Đặt Wi-Fi Sinh Viên Không Cần Hộ Khẩu',
  category = 'Internet',
  description = 'Hỗ trợ sinh viên kéo mạng Internet cáp quang nhanh, miễn phí modem Wi-Fi 2 băng tần, kích hoạt trong ngày.'
WHERE id = 7;

-- Chuẩn hóa category cho toàn bộ dịch vụ
UPDATE service_listing SET category = 'Chuyển trọ' WHERE category IN ('Chuy?n tr?', 'Moving');
UPDATE service_listing SET category = 'Giặt ủi' WHERE category IN ('Gi?t ?i');
UPDATE service_listing SET category = 'Sửa chữa' WHERE category IN ('S?a ch?a', 'Repair');
UPDATE service_listing SET category = 'Dọn vệ sinh' WHERE category IN ('D?n v? sinh', 'Cleaning');
UPDATE service_listing SET category = 'Khóa cửa' WHERE category IN ('Kh?a c?a');
UPDATE service_listing SET category = 'Gia sư' WHERE category IN ('Gia s?');
UPDATE service_listing SET category = 'Ăn uống' WHERE category IN ('?n u?ng');
UPDATE service_listing SET category = 'Xe máy' WHERE category IN ('Xe m?y', 'Vehicle Rental');
