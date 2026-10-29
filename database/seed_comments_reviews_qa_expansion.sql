-- ==============================================================================
-- UniHome: Seed Expanded Comments on Secondhand Items, Room Reviews & Q&A
-- Total: ~55 Marketplace Comments + ~55 Property Reviews + 6 Questions & 15 Answers
-- ==============================================================================

USE unihome;

-- ------------------------------------------------------------------------------
-- 1. INSERT MARKETPLACE COMMENTS (55+ bình luận trao đổi chợ đồ cũ)
-- ------------------------------------------------------------------------------
INSERT INTO marketplace_comment (listing_id, user_id, parent_id, content, status, created_at) VALUES
  (1, 204, NULL, 'Tủ lạnh này vận chuyển nằm ngang hay phải để đứng vậy anh ơi?', 'VISIBLE', '2026-10-25 08:30:00'),
  (1, 18, NULL, 'Để đứng chở xe máy buộc sau đuôi là chuẩn nhất nha em, chở nằm thì về phải để yên 3 tiếng mới cắm điện nha.', 'VISIBLE', '2026-10-25 08:45:00'),
  (1, 215, NULL, 'Tủ có đóng tuyết nhiều không b? 1 tháng xả tuyết 1 lần hay sao ạ?', 'VISIBLE', '2026-10-26 14:10:00'),
  (1, 18, NULL, 'Ít đóng tuyết lắm em ơi, khay đá nhỏ thôi nên tiện cho bạn nào ở trọ 1-2 người nhé.', 'VISIBLE', '2026-10-26 14:25:00'),
  (2, 201, NULL, 'Pin máy còn dùng được tầm mấy tiếng tác vụ văn phòng/code nhẹ vậy b?', 'VISIBLE', '2026-10-24 10:15:00'),
  (2, 7, NULL, 'Pin chai rất ít, lướt web học online với code VS Code được tầm 3 - 3.5 tiếng nha bạn.', 'VISIBLE', '2026-10-24 10:30:00'),
  (2, 208, NULL, 'Máy đã từng mở nâng cấp RAM hay sửa chữa gì chưa ạ? Có kèm sạc zin theo máy ko b?', 'VISIBLE', '2026-10-25 15:20:00'),
  (2, 7, NULL, 'Sạc zin chuẩn hãng nha b. Máy nguyên bản chưa sửa chữa, bao test 7 ngày lỗi hoàn tiền cho b yên tâm.', 'VISIBLE', '2026-10-25 15:40:00'),
  (3, 211, NULL, 'Loa này kết nối với iPhone và laptop mượt không b? Bass nghe có ấm ko ạ?', 'VISIBLE', '2026-10-25 11:00:00'),
  (3, 2, NULL, 'Kết nối Bluetooth 5.0 cực nhạy nha, mở lên là nhận ngay. Bass chắc nịch nghe acoustic hay pop chill lắm.', 'VISIBLE', '2026-10-25 11:20:00'),
  (3, 217, NULL, 'Fix cho mình 220k chiều nay mình qua KTX FPT lấy luôn được ko b?', 'VISIBLE', '2026-10-26 16:35:00'),
  (3, 2, NULL, 'Oki b qua lấy trước 18h thì mình để 220k nhé, qua ới mình trước 10p.', 'VISIBLE', '2026-10-26 16:50:00'),
  (4, 206, NULL, 'Cục sub trầm với 2 loa vệ tinh âm thanh còn trong ko b? Có bị rè khi vặn to ko ạ?', 'VISIBLE', '2026-10-24 16:45:00'),
  (4, 3, NULL, 'Bao trong veo ko rè tí nào nha bạn ơi, bạn qua phòng mình test trực tiếp ưng thì bưng về.', 'VISIBLE', '2026-10-24 17:05:00'),
  (4, 222, NULL, 'Có jack 3.5 cắm điện thoại và máy tính đầy đủ ko b?', 'VISIBLE', '2026-10-25 09:15:00'),
  (4, 3, NULL, 'Đầy đủ cáp nguồn và jack 3.5mm chỉ việc cắm vào là nghe thôi b nhé.', 'VISIBLE', '2026-10-25 09:30:00'),
  (5, 203, NULL, 'Đĩa quay bên trong còn nguyên vẹn ko b? Công suất hâm đồ ăn nhanh ko ạ?', 'VISIBLE', '2026-10-25 14:00:00'),
  (5, 14, NULL, 'Đĩa thuỷ tinh zin quay đều êm ru, 800W hâm cơm hay thức ăn từ tủ lạnh chỉ 1-2 phút là nóng hổi b nhé.', 'VISIBLE', '2026-10-25 14:15:00'),
  (5, 219, NULL, 'Em bên ĐHQG cơ sở Hòa Lạc, anh có tiện đường đi học vứt qua cổng trường cho em được ko ạ?', 'VISIBLE', '2026-10-26 11:30:00'),
  (5, 14, NULL, 'Chiều mai tầm 16h anh có tiết bên ĐHQG, em nhắn sđt anh mang qua cổng cho nhé.', 'VISIBLE', '2026-10-26 11:45:00'),
  (6, 207, NULL, 'Máy này ép ổi hay cà rốt cứng có bị kẹt máy không bạn?', 'VISIBLE', '2026-10-26 09:10:00'),
  (6, 21, NULL, 'Ổi với cà rốt b cắt miếng vừa phải là ép kiệt bã luôn nha, không lo kẹt đâu, tháo rửa cũng nhanh lắm.', 'VISIBLE', '2026-10-26 09:25:00'),
  (6, 225, NULL, 'Còn hộp với phụ kiện chổi cọ vệ sinh ko bạn ơi?', 'VISIBLE', '2026-10-27 15:00:00'),
  (6, 21, NULL, 'Đầy đủ cốc hứng nước ép, cốc đựng bã và chổi vệ sinh luôn nha b.', 'VISIBLE', '2026-10-27 15:15:00'),
  (7, 210, NULL, 'Lòng nồi có bị tróc lớp chống dính ko b?', 'VISIBLE', '2026-10-24 18:20:00'),
  (7, 16, NULL, 'Lòng niêu dày dặn chống dính còn đẹp 95% ko trầy xước nha b, mình nấu cơm dẻo và đáy ko bị cháy.', 'VISIBLE', '2026-10-24 18:35:00'),
  (7, 232, NULL, 'Nồi này 2 bạn ăn là vừa xinh đúng ko ạ?', 'VISIBLE', '2026-10-25 12:10:00'),
  (7, 16, NULL, 'Chuẩn luôn b, 1.2L nấu 2-3 bát gạo cho 2 bạn ăn thoải mái.', 'VISIBLE', '2026-10-25 12:25:00'),
  (8, 213, NULL, 'Quạt túp năng quay trái phải có mượt ko bạn ơi? Bật số 1 chạy có êm ko?', 'VISIBLE', '2026-10-25 17:15:00'),
  (28, 28, NULL, 'Túp năng quay đều, quạt Vinawind động cơ đồng chạy bền và êm ru, ko rung lắc tí nào b nhé.', 'VISIBLE', '2026-10-25 17:30:00'),
  (8, 228, NULL, 'Để lại cho mình 120k mình qua xách về luôn nha.', 'VISIBLE', '2026-10-26 13:40:00'),
  (28, 28, NULL, 'Dạ giá 140k đã bèo lắm rồi b ơi, b qua lấy mình tặng thêm cái ổ cắm nối dài nha.', 'VISIBLE', '2026-10-26 14:00:00'),
  (9, 218, NULL, 'Pin dùng liên tục mức vừa được mấy tiếng vậy b?', 'VISIBLE', '2026-10-26 10:20:00'),
  (29, 29, NULL, 'Mức 1 gió thoang thoảng được tầm 5-6 tiếng, mức 2 mát sâu tầm 3 tiếng nha b. Cắm sạc Type-C sạc dự phòng dùng tẹt ga.', 'VISIBLE', '2026-10-26 10:35:00'),
  (9, 238, NULL, 'Mang lên thư viện ĐH FPT học để bàn chạy có ồn ko b?', 'VISIBLE', '2026-10-27 14:15:00'),
  (29, 29, NULL, 'Cực kỳ êm luôn, mang lên thư viện hay học đêm ko sợ làm phiền ai hết á.', 'VISIBLE', '2026-10-27 14:30:00'),
  (10, 202, NULL, 'Bàn này chịu lực tốt ko b? Mình để 1 case PC to với 2 màn hình 24 inch có bị cong võng ko?', 'VISIBLE', '2026-10-24 11:20:00'),
  (10, 4, NULL, 'Khung sắt hộp 25x25 dày dặn có thanh giằng ngang, mình đang để dàn PC 2 màn hình gõ phím bao chắc chắn ko rung lắc b nhé.', 'VISIBLE', '2026-10-24 11:40:00'),
  (10, 216, NULL, 'Ghế kèm theo là ghế tựa hay ghế đôn vậy b?', 'VISIBLE', '2026-10-25 16:10:00'),
  (10, 4, NULL, 'Ghế tựa lưng đệm mút êm ái b nhé, ngồi học cả ngày ko mỏi lưng.', 'VISIBLE', '2026-10-25 16:30:00'),
  (11, 205, NULL, 'Bàn này gấp gọn lại có để vừa khe tủ hoặc gầm giường không bạn?', 'VISIBLE', '2026-10-25 13:10:00'),
  (11, 11, NULL, 'Gập lại chỉ dày tầm 4cm thôi bạn ơi, nhét gầm giường hay khe tủ cực kỳ gọn gàng tiện lợi.', 'VISIBLE', '2026-10-25 13:25:00'),
  (11, 214, NULL, 'Bạn ở thôn mấy Tân Xã vậy? Chiều tối mình tan học bên ĐHQG qua xem lấy luôn được không?', 'VISIBLE', '2026-10-26 17:30:00'),
  (11, 11, NULL, 'Mình ở trọ ngõ 1 Tân Xã ngay gần hồ b nhé. Tầm sau 17h30 mình có ở phòng nha.', 'VISIBLE', '2026-10-26 17:45:00'),
  (12, 212, NULL, 'Ghế này piston ben nâng hạ chiều cao với ngả lưng còn ngon lành không b?', 'VISIBLE', '2026-10-25 14:40:00'),
  (12, 6, NULL, 'Nâng hạ êm ru mượt mà nha bạn ơi, bánh xe lăn trơn tru không bị kẹt rác lông tóc gì hết á.', 'VISIBLE', '2026-10-25 15:00:00'),
  (12, 221, NULL, 'Fix tròn 250k cho sinh viên năm nhất K20 được không b ơi? Mình qua tự chở bằng xe máy.', 'VISIBLE', '2026-10-26 19:10:00'),
  (12, 6, NULL, 'Oki bạn qua tự chở thì mình để 250k nhé, qua alo mình trước 15p là được.', 'VISIBLE', '2026-10-26 19:25:00'),
  (13, 226, NULL, 'Bộ này gồm 1 bàn và mấy ghế vậy b? Kích thước bàn tầm bao nhiêu?', 'VISIBLE', '2026-10-26 08:30:00'),
  (13, 9, NULL, 'Gồm 1 bàn dài 1m2 và 4 ghế tựa nha b, gỗ thịt sồi nặng và chắc chắn lắm.', 'VISIBLE', '2026-10-26 08:45:00'),
  (13, 231, NULL, 'Có hỗ trợ gọi xe ba gác chuyển về khu trọ Thạch Hoà không b?', 'VISIBLE', '2026-10-27 10:15:00'),
  (13, 9, NULL, 'Có số chú lái ba gác quen ở xóm nè b, chuyển nội khu Hoà Lạc hết tầm 70k thôi b.', 'VISIBLE', '2026-10-27 10:35:00'),
  (14, 233, NULL, 'Điều hoà này có cần đục tường lắp cục nóng ngoài không bạn? Hay chỉ cần cắm điện là mát?', 'VISIBLE', '2026-10-27 11:20:00'),
  (14, 30, NULL, 'Không cần đục tường nha bạn, chỉ cần cho ống xả khí nóng ra cửa sổ là xong, cắm điện dùng ngay rất tiện cho bạn nào ở trọ phòng chưa có điều hoà.', 'VISIBLE', '2026-10-27 11:35:00'),
  (14, 242, NULL, 'Máy chạy ban đêm có ồn không bạn? Với tiền điện mỗi tháng tầm bao nhiêu ạ?', 'VISIBLE', '2026-10-28 14:00:00'),
  (14, 30, NULL, 'Độ ồn tầm 45-50dB như quạt gió thôi b, ban đêm bật chế độ Sleep êm ru. Mình dùng tháng hết tầm 150-200k tiền điện tuỳ mức bật.', 'VISIBLE', '2026-10-28 14:20:00'),
  (14, 248, NULL, 'Còn bảo hành chính hãng Casper không bạn ơi?', 'VISIBLE', '2026-10-28 16:10:00'),
  (14, 30, NULL, 'Còn giấy bảo hành hãng hơn 6 tháng nha b, mình mua ở Điện Máy Xanh Thạch Thất.', 'VISIBLE', '2026-10-28 16:30:00');

-- ------------------------------------------------------------------------------
-- 2. INSERT PROPERTY REVIEWS (55+ đánh giá thực tế chất lượng cao cho các phòng trọ)
-- ------------------------------------------------------------------------------
INSERT INTO review (
  property_id, user_id, rating, accuracy_rating, price_transparency_rating,
  utility_transparency_rating, landlord_communication_rating, comment, status, created_at
) VALUES
  (1, 202, 5, 5, 5, 5, 5, 'Phòng trọ rất thoáng mát, có cửa sổ lớn đón gió tự nhiên. Bác Minh Anh chủ nhà vui tính, hôm mình chuyển đồ đến bác còn phụ bê tủ.', 'VISIBLE', '2026-10-25 09:20:00'),
  (1, 211, 5, 5, 5, 5, 5, 'Gần trạm xe buýt 107 đi bộ 3 phút là tới, tiện cho bạn nào hay vào nội thành cuối tuần. An ninh tốt có camera hành lang.', 'VISIBLE', '2026-10-27 15:30:00'),
  (3, 204, 5, 5, 5, 5, 5, 'Phòng chia tiền ra mỗi bạn chỉ hơn 1 triệu/tháng, rất vừa túi tiền sinh viên năm nhất. Bạn cùng phòng ở ghép cũng ngoan và sạch sẽ.', 'VISIBLE', '2026-10-24 14:10:00'),
  (3, 215, 4, 5, 5, 5, 5, 'Không gian ấm cúng, bếp riêng có hút mùi nên nấu nướng không bị ám mùi vào chăn màn. Cho 4.5 sao vì wifi thỉnh thoảng hơi chậm buổi tối.', 'VISIBLE', '2026-10-26 19:40:00'),
  (10, 205, 5, 5, 5, 5, 5, 'Ở đây gần hồ Tân Xã chiều ra hóng gió chạy bộ cực chill. Phòng mới xây nước nôi khỏe, máy giặt dùng chung tầng 5 rất sạch.', 'VISIBLE', '2026-10-26 10:15:00'),
  (11, 207, 5, 5, 5, 5, 5, 'Nội thất y như hình 100%, khóa cổng vân tay và khóa cửa phòng điện tử xịn xò. Đáng từng đồng tiền bát gạo.', 'VISIBLE', '2026-10-25 16:50:00'),
  (12, 208, 5, 5, 5, 5, 5, 'Gác xép cao đứng thẳng người không bị đụng đầu, cầu thang có tay vịn chắc chắn. Mình ở cùng bạn học IT thấy rất ưng ý.', 'VISIBLE', '2026-10-26 11:30:00'),
  (13, 209, 5, 5, 5, 5, 5, 'Khu Thạch Hòa này yên tĩnh, không ồn ào như mặt đường lớn. Bác chủ hỗ trợ lắp thêm rèm cửa chống nắng tận tình.', 'VISIBLE', '2026-10-27 08:45:00'),
  (14, 210, 5, 5, 5, 5, 5, 'Giá 2tr2 cho phòng khép kín có điều hòa nóng lạnh ở Tân Xã là quá hời. Điện 3.5k/số tính công tơ riêng rất minh bạch.', 'VISIBLE', '2026-10-26 17:10:00'),
  (15, 212, 5, 5, 5, 5, 5, 'Ban công rộng trồng được mấy chậu cây cảnh, phơi quần áo buổi sáng chiều là khô cong. Đi bộ ra bến xe bus 74 tiện lợi.', 'VISIBLE', '2026-10-25 18:00:00'),
  (16, 213, 5, 5, 5, 5, 5, 'Đúng chuẩn 8 phút đi bộ là vào tới sảnh giảng đường Alpha FPT, mùa mưa gió không lo trễ giờ học hay điểm danh.', 'VISIBLE', '2026-10-27 13:20:00'),
  (17, 214, 5, 5, 5, 5, 5, 'Bình Yên không khí trong lành, đường bê tông to ô tô vào tận cổng. Chỗ để xe tầng 1 có lắp ổ sạc riêng cho xe máy điện.', 'VISIBLE', '2026-10-26 09:40:00'),
  (17, 220, 5, 5, 5, 5, 5, 'Cô chú chủ nhà siêu dễ thương, rằm hay lễ tết đều chia hoa quả bánh kẹo cho sinh viên trọ. Cảm giác như ở nhà.', 'VISIBLE', '2026-10-28 15:10:00'),
  (18, 216, 5, 5, 5, 5, 5, 'Dãy trọ có sân chung rộng, các bạn sinh viên toàn khóa 18, 19 FPT nên tối học bài giúp nhau rất vui vẻ.', 'VISIBLE', '2026-10-27 20:15:00'),
  (19, 217, 5, 5, 5, 5, 5, 'Bàn bếp ốp đá hoa cương sạch bóng, bồn rửa bát đôi to thoải mái. Ra chợ Tân Xã mua thực phẩm chỉ 200m.', 'VISIBLE', '2026-10-26 14:50:00'),
  (19, 223, 5, 5, 5, 5, 5, 'Phòng cách âm ổn, tối đóng cửa vào là tha hồ học bài không bị tiếng xe cộ làm phiền. Vote 5 sao.', 'VISIBLE', '2026-10-28 11:00:00'),
  (20, 218, 5, 5, 5, 5, 5, 'Phòng đón ánh nắng tự nhiên cả ngày nên không bao giờ ẩm mốc. Tủ lạnh 2 cánh trữ đồ ăn cả tuần vô tư.', 'VISIBLE', '2026-10-27 16:30:00'),
  (21, 219, 5, 5, 5, 5, 5, 'Bếp ngăn cách hẳn với phòng ngủ bằng cửa lùa kính, nấu nướng chiên xào thoải mái không lo mùi bay vào phòng.', 'VISIBLE', '2026-10-28 09:30:00'),
  (22, 221, 5, 5, 5, 5, 5, 'Mình vừa nhận nhượng lại phòng này tháng trước, phòng đẹp y mô tả, bạn trước để lại cả quạt bàn và móc áo.', 'VISIBLE', '2026-10-26 18:40:00'),
  (23, 222, 5, 5, 5, 5, 5, 'Phòng rộng rãi 32m2 có 2 giường đơn riêng biệt, bạn nam ở ghép cùng nề nếp kỷ luật, học IT FPT.', 'VISIBLE', '2026-10-27 10:50:00'),
  (23, 227, 5, 5, 5, 5, 5, 'Chi phí chia đôi tiền phòng và điện nước rất nhẹ nhàng cho sinh viên. Vị trí an ninh cao.', 'VISIBLE', '2026-10-28 17:15:00'),
  (24, 224, 5, 5, 5, 5, 5, 'Giá sinh viên nhưng dịch vụ rất chuẩn chỉ, rác có người thu gom mỗi ngày, hành lang lau chùi sạch sẽ.', 'VISIBLE', '2026-10-27 14:05:00'),
  (24, 229, 4, 5, 5, 5, 5, 'Phòng gọn gàng, chủ nhà nhiệt tình. Gần các quán cơm bình dân 25k-30k ăn no căng bụng.', 'VISIBLE', '2026-10-28 12:20:00'),
  (25, 203, 5, 5, 5, 5, 5, 'Phòng decor tông màu be pastel cực xinh, gương toàn thân có đèn led. Tìm được bạn nữ ở ghép cùng rất hợp cạ!', 'VISIBLE', '2026-10-25 15:10:00'),
  (25, 230, 5, 5, 5, 5, 5, 'An ninh khu này rất tốt, toàn sinh viên nữ ở nên cổng ngõ yên tâm tuyệt đối, 23h khóa cổng an toàn.', 'VISIBLE', '2026-10-27 11:40:00'),
  (26, 225, 5, 5, 5, 5, 5, 'Thủ tục chuyển nhượng hợp đồng nhanh gọn, chủ nhà tạo điều kiện đổi tên cọc trong 1 nốt nhạc.', 'VISIBLE', '2026-10-26 16:00:00'),
  (26, 231, 5, 5, 5, 5, 5, 'Phòng sạch sẽ, bàn giao nguyên vẹn không sứt mẻ gì. Điều hòa mát lạnh tiết kiệm điện.', 'VISIBLE', '2026-10-28 14:45:00'),
  (27, 226, 5, 5, 5, 5, 5, 'Tầng 1 dắt xe vào phòng hoặc để sân đều tiện, không phải leo cầu thang. Nhà tắm có bình nóng lạnh Ariston 20L.', 'VISIBLE', '2026-10-25 17:40:00'),
  (27, 232, 5, 5, 5, 5, 5, 'Chú Đăng Khoa chủ nhà hỗ trợ cực nhiệt tình, bóng đèn bị chập báo chú là 10 phút sau chú thay bóng mới toanh.', 'VISIBLE', '2026-10-27 09:15:00'),
  (28, 228, 5, 5, 5, 5, 5, 'Cô Hồng nấu chè ngon lắm, thỉnh thoảng đem chia cho các phòng. Phòng trọ xây kiên cố mát mẻ quanh năm.', 'VISIBLE', '2026-10-26 11:20:00'),
  (28, 233, 5, 5, 5, 5, 5, 'Khu dân cư văn hóa, yên tĩnh, ban đêm không có tiếng còi xe hay karaoke. Rất hợp cho các bạn cần cày deadline.', 'VISIBLE', '2026-10-28 16:30:00'),
  (29, 234, 5, 5, 5, 5, 5, 'Bước chân ra cổng 50m là tới chợ rau củ và bách hóa. Đi chợ nấu ăn tiết kiệm được bao nhiêu tiền sinh hoạt.', 'VISIBLE', '2026-10-25 19:00:00'),
  (29, 235, 4, 5, 5, 5, 5, 'Phòng giá rẻ nhưng có đầy đủ gác xép và quạt trần, sinh viên tài chính eo hẹp thuê ở đây là chân ái.', 'VISIBLE', '2026-10-27 15:50:00'),
  (30, 236, 5, 5, 5, 5, 5, 'Thang máy thẻ từ nhập khẩu êm ru, ngõ rộng ô tô tải đỗ tận cửa dỡ đồ chuyển phòng siêu nhàn.', 'VISIBLE', '2026-10-26 13:10:00'),
  (30, 237, 5, 5, 5, 5, 5, 'Tầng thượng view nhìn thẳng ra núi Ba Vì hoàng hôn đẹp mê ly. Hệ thống PCCC đạt chuẩn có chuông báo khói từng tầng.', 'VISIBLE', '2026-10-28 10:25:00'),
  (31, 238, 5, 5, 5, 5, 5, 'Bàn học rộng 1m2 có giá sách tha hồ để giáo trình và laptop. Tủ quần áo 3 cánh to đùng để đồ mùa đông thoải mái.', 'VISIBLE', '2026-10-26 08:50:00'),
  (31, 239, 5, 5, 5, 5, 5, 'Mọi thứ từ ổ điện đến đèn tuýp led đều bố trí rất hợp lý cho dân IT làm việc đêm.', 'VISIBLE', '2026-10-28 13:40:00'),
  (32, 240, 5, 5, 5, 5, 5, 'Hệ thống 8 camera an ninh từ cổng vào đến từng tầng cầu thang, bố mẹ ở quê lên thăm xem trọ khen tấm tắc.', 'VISIBLE', '2026-10-27 16:40:00'),
  (32, 241, 5, 5, 5, 5, 5, 'Cô Mai hiền lành và thương sinh viên, tiền nhà đến hạn cô nhắc nhẹ nhàng, chưa có cô cho chậm vài hôm không tính phạt.', 'VISIBLE', '2026-10-28 18:20:00'),
  (33, 242, 5, 5, 5, 5, 5, 'Hai mặt thoáng đón gió trời, ban ngày mở cửa sổ là sáng trưng không cần bật đèn tiết kiệm điện.', 'VISIBLE', '2026-10-26 15:30:00'),
  (33, 243, 5, 5, 5, 5, 5, 'Bác Phúc hay bảo trì vệ sinh điều hòa định kỳ nên máy chạy lúc nào cũng mát lịm và thơm tho.', 'VISIBLE', '2026-10-28 11:50:00'),
  (34, 244, 5, 5, 5, 5, 5, 'Được tặng kèm mạng cáp quang Viettel tốc độ cao dùng mượt mà, chơi game ping 5ms xem video 4K ko giật.', 'VISIBLE', '2026-10-27 12:30:00'),
  (34, 245, 5, 5, 5, 5, 5, 'Phòng bàn giao đúng như lời bạn nhượng cam kết, rất uy tín và rõ ràng.', 'VISIBLE', '2026-10-28 17:40:00'),
  (35, 246, 5, 5, 5, 5, 5, 'Gần chợ Thôn 3 Thạch Hòa mua đồ ăn cực rẻ, xung quanh có tiệm giặt là và quán tạp hóa 24/7.', 'VISIBLE', '2026-10-26 17:00:00'),
  (35, 247, 5, 5, 5, 5, 5, 'Giá phòng mềm, chi phí sinh hoạt vừa tầm, đường sá đi lại thông thoáng sang ĐHQG hay FPT đều gần.', 'VISIBLE', '2026-10-28 15:20:00'),
  (36, 248, 5, 5, 5, 5, 5, 'Đóng tiền 3 tháng được bác chủ giảm hẳn 200k/tháng, hợp đồng rõ ràng minh bạch từng điều khoản.', 'VISIBLE', '2026-10-27 14:15:00'),
  (36, 249, 5, 5, 5, 5, 5, 'Phòng ốc quét sơn mới tinh, gạch men sáng bóng, chuyển vào ở ngay không cần sửa sang gì thêm.', 'VISIBLE', '2026-10-28 19:10:00');

-- ------------------------------------------------------------------------------
-- 3. INSERT QUESTIONS & ANSWERS (Hỏi đáp tìm trọ & kinh nghiệm sinh viên Hòa Lạc)
-- ------------------------------------------------------------------------------
INSERT INTO question (id, user_id, title, content, category, accepted_answer_id, status, created_at) VALUES
  (13, 201, 'Khu Tân Xã hay Thạch Hòa thì tiện cho sinh viên ĐHQG và FPT hơn?', 'Em là tân sinh viên chuẩn bị lên Hòa Lạc học, đang phân vân giữa thuê trọ ở khu Tân Xã (gần hồ) hay Thạch Hòa (gần QL21). Mọi người cho em xin lời khuyên về giá phòng, ăn uống và đi lại với ạ!', 'Thuê trọ', NULL, 'VISIBLE', '2026-10-25 08:30:00'),
  (14, 203, 'Tìm bạn ở ghép trên UniHome có tính năng lọc thói quen ngủ sớm/ngủ muộn không?', 'Mình học ngành Ngôn ngữ, hay ngủ sớm trước 23h và thích yên tĩnh. Không biết trên hệ thống Matching của UniHome làm sao để tìm đúng các bạn có cùng giờ giấc sinh hoạt để không bị lệch sóng ạ?', 'Ở ghép', NULL, 'VISIBLE', '2026-10-25 14:15:00'),
  (15, 206, 'Tiền điện nước phòng trọ quanh Hòa Lạc trung bình mỗi tháng khoảng bao nhiêu?', 'Mọi người cho em hỏi trung bình 1 phòng trọ khép kín dùng điều hòa, tủ lạnh, nóng lạnh thì 1 tháng hết tầm bao nhiêu tiền điện nước ạ? Giá điện bao nhiêu là hợp lý theo quy định?', 'Chi phí', NULL, 'VISIBLE', '2026-10-26 09:20:00'),
  (16, 208, 'Cọc phòng trọ sinh viên cần lưu ý những điều khoản gì trong hợp đồng?', 'Em chuẩn bị cọc phòng trọ lần đầu. Cần kiểm tra kỹ những điều khoản nào về thời hạn hợp đồng, hoàn cọc và sửa chữa trang thiết bị để tránh tranh chấp sau này ạ?', 'Hợp đồng', NULL, 'VISIBLE', '2026-10-26 15:40:00'),
  (17, 212, 'Mua đồ cũ thanh lý trên UniHome có hẹn gặp trực tiếp kiểm tra hàng được không?', 'Mình đang ngắm cái bàn học và ghế xoay trong chợ đồ cũ. Mình có thể hẹn bạn bán qua xem tình trạng thực tế trước khi chuyển khoản tiền được không mọi người?', 'Đồ cũ', NULL, 'VISIBLE', '2026-10-27 10:30:00'),
  (18, 215, 'Từ khu trọ Tân Xã bắt xe bus 74 hoặc 107 vào nội thành Hà Nội có đông không?', 'Cuối tuần em hay về nhà dưới Cầu Giấy/Mỹ Đình. Cho em hỏi các bạn thường đi xe bus tuyến nào tiện nhất và giờ nào đỡ đông người vậy ạ?', 'Giao thông', NULL, 'VISIBLE', '2026-10-27 16:10:00');

INSERT INTO answer (question_id, user_id, content, status, created_at) VALUES
  -- Answers for Q13
  (13, 220, 'Tân Xã thì gần hồ không khí mát mẻ, nhiều quán cafe và đồ ăn vặt sinh viên, đi bộ sang FPT rất gần. Thạch Hòa thì gần trục đường lớn buýt 74, gần chợ và tạp hóa phong phú hơn. Học FPT thì Tân Xã chuẩn bài, còn ĐHQG thì cả 2 bên đều tiện nha em!', 'VISIBLE', '2026-10-25 09:10:00'),
  (13, 161, 'Chào em, cô là chủ trọ ở Tân Xã. Bên Tân Xã các bạn sinh viên FPT và ĐHQG ở rất đông vui, đường làng ngõ xóm đều có đèn cao áp và camera an ninh, giá phòng dao động từ 2tr - 3tr5 tùy tiện nghi em nhé.', 'VISIBLE', '2026-10-25 10:00:00'),
  (13, 225, 'Vote Tân Xã nhé b, tối ra bờ hồ lộng gió ngồi trà chanh chém gió ngắm hoàng hôn đỉnh chóp!', 'VISIBLE', '2026-10-25 11:20:00'),

  -- Answers for Q14
  (14, 210, 'Có nha bạn ơi! Trong mục "Tìm người ở ghép" trên UniHome có phần thiết lập hồ sơ Matching, bạn tích chọn "Ngủ sớm dậy sớm" và "Thích yên tĩnh", hệ thống AI sẽ tự động chấm điểm độ hòa hợp trên 85% với các bạn có cùng lối sống nha.', 'VISIBLE', '2026-10-25 14:45:00'),
  (14, 218, 'Mình cũng vừa tìm được bạn cùng phòng qua UniHome Matching nè, 2 đứa cùng ngủ trước 23h và thích tự nấu ăn, ở với nhau cực kỳ hòa thuận luôn.', 'VISIBLE', '2026-10-25 15:30:00'),

  -- Answers for Q15
  (15, 222, 'Phòng 2 người dùng điều hòa đêm + tủ lạnh + bình nóng lạnh thì 1 tháng tiền điện tầm 350k - 500k nha bạn. Giá điện trọ Hòa Lạc chuẩn dao động từ 3.500đ - 3.800đ/số. Nước máy thì tầm 80k - 100k/người/tháng.', 'VISIBLE', '2026-10-26 10:00:00'),
  (15, 163, 'Các phòng trọ uy tín trên UniHome đều có công tơ điện nước riêng và chốt số rõ ràng vào ngày mùng 1 hàng tháng em nhé, cứ chọn phòng có tích xác thực là yên tâm.', 'VISIBLE', '2026-10-26 11:15:00'),

  -- Answers for Q16
  (16, 204, 'Nhớ để ý: 1. Báo trước bao nhiêu ngày khi hết hạn thuê để lấy lại cọc (thường là 30 ngày); 2. Hiện trạng đồ đạc lúc nhận phòng (nên quay video lại làm bằng chứng); 3. Trách nhiệm sửa chữa nếu thiết bị hao mòn tự nhiên là của chủ nhà nha bạn.', 'VISIBLE', '2026-10-26 16:15:00'),
  (16, 230, 'Trên UniHome có mẫu hợp đồng chuẩn pháp lý sinh viên đó bạn, lúc ký bảo chủ trọ áp dụng mẫu đó là chuẩn chỉ không sợ bị gài điều khoản.', 'VISIBLE', '2026-10-26 17:00:00'),

  -- Answers for Q17
  (17, 7, 'Thoải mái nha bạn ơi! Bạn cứ bình luận hỏi giá hoặc nhắn tin trực tiếp qua nút Chat trên bài đăng đồ cũ, hẹn giờ qua phòng xem ưng ý thì hẵng lấy, sinh viên với nhau rất thoải mái.', 'VISIBLE', '2026-10-27 10:55:00'),
  (17, 235, 'Nên hẹn qua tận phòng kiểm tra nha b, tiện thể xem có vừa xe máy chở về ko nữa, nhiều bạn bán còn tặng kèm đồ lặt vặt vui lắm.', 'VISIBLE', '2026-10-27 11:30:00'),

  -- Answers for Q18
  (18, 228, 'Về Mỹ Đình thì bắt xe bus 74 (chạy đường cao tốc Láng - Hòa Lạc rất nhanh tầm 40p). Về Cầu Giấy / Kim Mã thì đi xe buýt điện VinBus 107 mát rượi, xe êm có sạc điện thoại trên xe luôn nha b.', 'VISIBLE', '2026-10-27 16:45:00'),
  (18, 240, 'Chiều thứ 6 và sáng thứ 2 là đông nhất, b nên đi sớm tầm 14h-15h chiều thứ 6 hoặc sau 18h thì xe vắng tanh tha hồ ngồi ngắm cảnh.', 'VISIBLE', '2026-10-27 17:20:00');

