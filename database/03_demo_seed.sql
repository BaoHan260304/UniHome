USE rrmsdb;
SET NAMES utf8mb4;

-- Demo accounts. Password is 123456. AuthService will upgrade plaintext to PBKDF2 after first successful login.
INSERT INTO users(full_name,email,password,role,status,phone,avatar_url,bio,gender,school_name,home_lat,home_lng,matching_radius_km,is_looking_for_roommate,facebook_url,zalo_url)
VALUES
('UniHome Admin','admin@unihome.vn','123456','SUPER_ADMIN','ACTIVE','0900000001','https://ui-avatars.com/api/?name=UniHome+Admin&background=4f46e5&color=fff','Tài khoản quản trị demo.','Nam','FPT University',21.0133,105.5278,5,b'0','https://facebook.com/','https://zalo.me/'),
('Chủ trọ Minh Anh','landlord@unihome.vn','123456','LANDLORD','ACTIVE','0900000002','https://ui-avatars.com/api/?name=Minh+Anh&background=4f46e5&color=fff','Chủ trọ demo UniHome.','Nam',NULL,21.0133,105.5278,5,b'0','https://facebook.com/','https://zalo.me/'),
('UniMove Hòa Lạc','service@unihome.vn','123456','SERVICE_PROVIDER','ACTIVE','0900000003','https://ui-avatars.com/api/?name=UniMove&background=4f46e5&color=fff','Nhà cung cấp dịch vụ demo.','Nam',NULL,21.0133,105.5278,5,b'0','https://facebook.com/','https://zalo.me/'),
('Nguyễn Minh An','student@unihome.vn','123456','TENANT','ACTIVE','0900000011','https://ui-avatars.com/api/?name=Nguyen+Minh+An&background=4f46e5&color=fff','Sinh viên demo.','Nam','FPT University',21.0133,105.5278,5,b'1','https://facebook.com/','https://zalo.me/'),
('Trần Đức Huy','student2@unihome.vn','123456','TENANT','ACTIVE','0900000012','https://ui-avatars.com/api/?name=Tran+Duc+Huy&background=4f46e5&color=fff','Sinh viên demo.','Nam','Đại học Quốc gia Hà Nội',21.0133,105.5278,5,b'1','https://facebook.com/','https://zalo.me/'),
('Lê Hoàng Nam','student3@unihome.vn','123456','TENANT','ACTIVE','0900000013','https://ui-avatars.com/api/?name=Le+Hoang+Nam&background=4f46e5&color=fff','Sinh viên demo.','Nam','FPT University',21.0133,105.5278,5,b'1','https://facebook.com/','https://zalo.me/')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name),role=VALUES(role),status='ACTIVE';

SET @landlord=(SELECT id FROM users WHERE email='landlord@unihome.vn' LIMIT 1);
SET @provider=(SELECT id FROM users WHERE email='service@unihome.vn' LIMIT 1);
SET @admin=(SELECT id FROM users WHERE email='admin@unihome.vn' LIMIT 1);
SET @s1=(SELECT id FROM users WHERE email='student@unihome.vn' LIMIT 1);
SET @s2=(SELECT id FROM users WHERE email='student2@unihome.vn' LIMIT 1);
SET @s3=(SELECT id FROM users WHERE email='student3@unihome.vn' LIMIT 1);

INSERT INTO service_listing(provider_id,category,title,description,price_from,province,district,phone,zalo_url,image_url,status,featured)
SELECT @provider,'Moving','Chuyển trọ sinh viên Hòa Lạc','Nhận chuyển đồ, vali, bàn ghế nhỏ; báo giá trước khi đi.',120000,'Hà Nội','Thạch Thất','0900000003','https://zalo.me/0900000003','/demo/service-moving.png','ACTIVE',b'1'
WHERE NOT EXISTS(SELECT 1 FROM service_listing WHERE title='Chuyển trọ sinh viên Hòa Lạc');
INSERT INTO service_listing(provider_id,category,title,description,price_from,province,district,phone,zalo_url,image_url,status,featured)
SELECT @provider,'Cleaning','Dọn phòng trước khi chuyển vào','Vệ sinh sàn, WC, khu bếp và cửa kính.',150000,'Hà Nội','Thạch Thất','0900000003','https://zalo.me/0900000003','/demo/service-moving.png','ACTIVE',b'0'
WHERE NOT EXISTS(SELECT 1 FROM service_listing WHERE title='Dọn phòng trước khi chuyển vào');

INSERT INTO second_hand_listing(seller_id,title,category,price,condition_text,province,district,description,image_url,status,expires_at)
SELECT @s1,'Bàn học gỗ còn tốt','Nội thất',250000,'Đã qua sử dụng','Hà Nội','Thạch Thất','Bàn chắc chắn, phù hợp phòng trọ sinh viên.','/demo/secondhand-desk.png','ACTIVE',DATE_ADD(NOW(),INTERVAL 30 DAY)
WHERE NOT EXISTS(SELECT 1 FROM second_hand_listing WHERE title='Bàn học gỗ còn tốt');
INSERT INTO second_hand_listing(seller_id,title,category,price,condition_text,province,district,description,image_url,status,expires_at)
SELECT @s2,'Quạt đứng sinh viên','Đồ gia dụng',180000,'Còn tốt','Hà Nội','Thạch Thất','Quạt chạy êm, ba mức gió.','/demo/secondhand-desk.png','ACTIVE',DATE_ADD(NOW(),INTERVAL 30 DAY)
WHERE NOT EXISTS(SELECT 1 FROM second_hand_listing WHERE title='Quạt đứng sinh viên');

INSERT INTO blog_post(author_id,category,title,summary,content,cover_image,tags,status,reading_minutes,published_at)
SELECT @admin,'PCCC','Checklist PCCC sinh viên nên kiểm tra trước khi thuê trọ','Checklist lối thoát, bình chữa cháy, ổ điện và các nguy cơ cơ bản.','1. Kiểm tra lối thoát và cầu thang\n\n2. Kiểm tra bình chữa cháy và nội quy.\n\n3. Kiểm tra ổ điện, dây dẫn và thiết bị công suất lớn.\n\n4. Thống nhất quy tắc an toàn khi ở ghép.','/demo/blog-pccc.png','PCCC,sinh viên,thuê trọ','PUBLISHED',5,NOW()
WHERE NOT EXISTS(SELECT 1 FROM blog_post WHERE title='Checklist PCCC sinh viên nên kiểm tra trước khi thuê trọ');
INSERT INTO blog_post(author_id,category,title,summary,content,cover_image,tags,status,reading_minutes,published_at)
SELECT @admin,'Thuê trọ an toàn','5 thông tin phải hỏi rõ trước khi đặt cọc','Giá thuê chưa phải toàn bộ chi phí.','Hãy xác nhận giá thuê, tiền cọc, giá điện, nước, Internet, gửi xe và điều kiện hoàn cọc trước khi thanh toán.','/demo/blog-pccc.png','đặt cọc,chi phí','PUBLISHED',4,NOW()
WHERE NOT EXISTS(SELECT 1 FROM blog_post WHERE title='5 thông tin phải hỏi rõ trước khi đặt cọc');

INSERT INTO question(user_id,title,content,category,status)
SELECT @s1,'Giá điện 4.000đ/kWh có nên hỏi lại chủ trọ không?','Mình muốn biết cần kiểm tra thêm những khoản phí nào trước khi cọc.','Chi phí','VISIBLE'
WHERE NOT EXISTS(SELECT 1 FROM question WHERE title='Giá điện 4.000đ/kWh có nên hỏi lại chủ trọ không?');
SET @q1=(SELECT id FROM question WHERE title='Giá điện 4.000đ/kWh có nên hỏi lại chủ trọ không?' LIMIT 1);
INSERT INTO answer(question_id,user_id,content,status)
SELECT @q1,@landlord,'Bạn nên hỏi rõ giá điện, nước, Internet, gửi xe và các phí khác; nên lưu lại trao đổi để đối chiếu.','VISIBLE'
WHERE NOT EXISTS(SELECT 1 FROM answer WHERE question_id=@q1);

INSERT INTO advertisement(title,banner_image,destination_url,placement,status,start_at,end_at)
SELECT 'Dịch vụ chuyển trọ sinh viên','/demo/ad-campus.png','https://www.facebook.com/','TOP_BANNER','ACTIVE',NOW(),DATE_ADD(NOW(),INTERVAL 30 DAY)
WHERE NOT EXISTS(SELECT 1 FROM advertisement WHERE title='Dịch vụ chuyển trọ sinh viên');

-- Matching demo profiles. The DataSeeder will also fill these safely when the backend starts.
INSERT INTO matching_profile(user_id,enabled,gender,school_name,latitude,longitude,radius_km,budget_min,budget_max,move_in_date,sleep_schedule,cleanliness_level,smoking,pets,cooking,noise_preference,guest_frequency,study_work_schedule,expense_style,communication_style,intro,facebook_url,zalo_url)
SELECT @s1,b'1','Nam','FPT University',21.0133,105.5278,5,1800000,3200000,'2026-10','23:00',4,'Không','Không','Có','Yên tĩnh','Ít','Ban ngày','Chia đều','Thẳng thắn','Sinh viên tìm bạn ở cùng Hòa Lạc.','https://facebook.com/','https://zalo.me/'
WHERE NOT EXISTS(SELECT 1 FROM matching_profile WHERE user_id=@s1);
INSERT INTO matching_profile(user_id,enabled,gender,school_name,latitude,longitude,radius_km,budget_min,budget_max,move_in_date,sleep_schedule,cleanliness_level,smoking,pets,cooking,noise_preference,guest_frequency,study_work_schedule,expense_style,communication_style,intro,facebook_url,zalo_url)
SELECT @s2,b'1','Nam','Đại học Quốc gia Hà Nội',21.0150,105.5290,5,1800000,3300000,'2026-10','23:30',4,'Không','Không','Có','Yên tĩnh','Ít','Ban ngày','Chia đều','Thẳng thắn','Sinh viên tìm bạn ở cùng Hòa Lạc.','https://facebook.com/','https://zalo.me/'
WHERE NOT EXISTS(SELECT 1 FROM matching_profile WHERE user_id=@s2);
