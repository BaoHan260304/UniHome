/**
 * Generator script for expanded comments on secondhand listings, room reviews, and student Q&A
 * Outputs: database/seed_comments_reviews_qa_expansion.sql
 */

const fs = require('fs');
const path = require('path');

let sql = `-- ==============================================================================
-- UniHome: Seed Expanded Comments on Secondhand Items, Room Reviews & Q&A
-- Total: ~55 Marketplace Comments + ~55 Property Reviews + 6 Questions & 15 Answers
-- ==============================================================================

USE unihome;

`;

// ------------------------------------------------------------------------------
// 1. SECONDHAND COMMENTS (55 comments across all 14 listings)
// ------------------------------------------------------------------------------
const secondhandComments = [
  // Listing 1: Tủ lạnh mini Casper 93L (Seller 18)
  { listingId: 1, userId: 204, content: 'Tủ lạnh này vận chuyển nằm ngang hay phải để đứng vậy anh ơi?', date: '2026-10-25 08:30:00' },
  { listingId: 1, userId: 18, content: 'Để đứng chở xe máy buộc sau đuôi là chuẩn nhất nha em, chở nằm thì về phải để yên 3 tiếng mới cắm điện nha.', date: '2026-10-25 08:45:00' },
  { listingId: 1, userId: 215, content: 'Tủ có đóng tuyết nhiều không b? 1 tháng xả tuyết 1 lần hay sao ạ?', date: '2026-10-26 14:10:00' },
  { listingId: 1, userId: 18, content: 'Ít đóng tuyết lắm em ơi, khay đá nhỏ thôi nên tiện cho bạn nào ở trọ 1-2 người nhé.', date: '2026-10-26 14:25:00' },

  // Listing 2: Laptop Asus Vivobook 15 (Seller 7)
  { listingId: 2, userId: 201, content: 'Pin máy còn dùng được tầm mấy tiếng tác vụ văn phòng/code nhẹ vậy b?', date: '2026-10-24 10:15:00' },
  { listingId: 2, userId: 7, content: 'Pin chai rất ít, lướt web học online với code VS Code được tầm 3 - 3.5 tiếng nha bạn.', date: '2026-10-24 10:30:00' },
  { listingId: 2, userId: 208, content: 'Máy đã từng mở nâng cấp RAM hay sửa chữa gì chưa ạ? Có kèm sạc zin theo máy ko b?', date: '2026-10-25 15:20:00' },
  { listingId: 2, userId: 7, content: 'Sạc zin chuẩn hãng nha b. Máy nguyên bản chưa sửa chữa, bao test 7 ngày lỗi hoàn tiền cho b yên tâm.', date: '2026-10-25 15:40:00' },

  // Listing 3: Loa Bluetooth di động chống nước (Seller 2)
  { listingId: 3, userId: 211, content: 'Loa này kết nối với iPhone và laptop mượt không b? Bass nghe có ấm ko ạ?', date: '2026-10-25 11:00:00' },
  { listingId: 3, userId: 2, content: 'Kết nối Bluetooth 5.0 cực nhạy nha, mở lên là nhận ngay. Bass chắc nịch nghe acoustic hay pop chill lắm.', date: '2026-10-25 11:20:00' },
  { listingId: 3, userId: 217, content: 'Fix cho mình 220k chiều nay mình qua KTX FPT lấy luôn được ko b?', date: '2026-10-26 16:35:00' },
  { listingId: 3, userId: 2, content: 'Oki b qua lấy trước 18h thì mình để 220k nhé, qua ới mình trước 10p.', date: '2026-10-26 16:50:00' },

  // Listing 4: Dàn loa máy tính vi tính Microlab 2.1 (Seller 3)
  { listingId: 4, userId: 206, content: 'Cục sub trầm với 2 loa vệ tinh âm thanh còn trong ko b? Có bị rè khi vặn to ko ạ?', date: '2026-10-24 16:45:00' },
  { listingId: 4, userId: 3, content: 'Bao trong veo ko rè tí nào nha bạn ơi, bạn qua phòng mình test trực tiếp ưng thì bưng về.', date: '2026-10-24 17:05:00' },
  { listingId: 4, userId: 222, content: 'Có jack 3.5 cắm điện thoại và máy tính đầy đủ ko b?', date: '2026-10-25 09:15:00' },
  { listingId: 4, userId: 3, content: 'Đầy đủ cáp nguồn và jack 3.5mm chỉ việc cắm vào là nghe thôi b nhé.', date: '2026-10-25 09:30:00' },

  // Listing 5: Lò vi sóng cơ Sharp 20L (Seller 14)
  { listingId: 5, userId: 203, content: 'Đĩa quay bên trong còn nguyên vẹn ko b? Công suất hâm đồ ăn nhanh ko ạ?', date: '2026-10-25 14:00:00' },
  { listingId: 5, userId: 14, content: 'Đĩa thuỷ tinh zin quay đều êm ru, 800W hâm cơm hay thức ăn từ tủ lạnh chỉ 1-2 phút là nóng hổi b nhé.', date: '2026-10-25 14:15:00' },
  { listingId: 5, userId: 219, content: 'Em bên ĐHQG cơ sở Hòa Lạc, anh có tiện đường đi học vứt qua cổng trường cho em được ko ạ?', date: '2026-10-26 11:30:00' },
  { listingId: 5, userId: 14, content: 'Chiều mai tầm 16h anh có tiết bên ĐHQG, em nhắn sđt anh mang qua cổng cho nhé.', date: '2026-10-26 11:45:00' },

  // Listing 6: Máy ép hoa quả chậm mini (Seller 21)
  { listingId: 6, userId: 207, content: 'Máy này ép ổi hay cà rốt cứng có bị kẹt máy không bạn?', date: '2026-10-26 09:10:00' },
  { listingId: 6, userId: 21, content: 'Ổi với cà rốt b cắt miếng vừa phải là ép kiệt bã luôn nha, không lo kẹt đâu, tháo rửa cũng nhanh lắm.', date: '2026-10-26 09:25:00' },
  { listingId: 6, userId: 225, content: 'Còn hộp với phụ kiện chổi cọ vệ sinh ko bạn ơi?', date: '2026-10-27 15:00:00' },
  { listingId: 6, userId: 21, content: 'Đầy đủ cốc hứng nước ép, cốc đựng bã và chổi vệ sinh luôn nha b.', date: '2026-10-27 15:15:00' },

  // Listing 7: Nồi cơm điện nắp gài Sunhouse 1.2L (Seller 16)
  { listingId: 7, userId: 210, content: 'Lòng nồi có bị tróc lớp chống dính ko b?', date: '2026-10-24 18:20:00' },
  { listingId: 7, userId: 16, content: 'Lòng niêu dày dặn chống dính còn đẹp 95% ko trầy xước nha b, mình nấu cơm dẻo và đáy ko bị cháy.', date: '2026-10-24 18:35:00' },
  { listingId: 7, userId: 232, content: 'Nồi này 2 bạn ăn là vừa xinh đúng ko ạ?', date: '2026-10-25 12:10:00' },
  { listingId: 7, userId: 16, content: 'Chuẩn luôn b, 1.2L nấu 2-3 bát gạo cho 2 bạn ăn thoải mái.', date: '2026-10-25 12:25:00' },

  // Listing 8: Quạt cây lửng Vinawind (Seller 28)
  { listingId: 8, userId: 213, content: 'Quạt túp năng quay trái phải có mượt ko bạn ơi? Bật số 1 chạy có êm ko?', date: '2026-10-25 17:15:00' },
  { listingId: 28, userId: 28, content: 'Túp năng quay đều, quạt Vinawind động cơ đồng chạy bền và êm ru, ko rung lắc tí nào b nhé.', date: '2026-10-25 17:30:00' },
  { listingId: 8, userId: 228, content: 'Để lại cho mình 120k mình qua xách về luôn nha.', date: '2026-10-26 13:40:00' },
  { listingId: 28, userId: 28, content: 'Dạ giá 140k đã bèo lắm rồi b ơi, b qua lấy mình tặng thêm cái ổ cắm nối dài nha.', date: '2026-10-26 14:00:00' },

  // Listing 9: Quạt mini để bàn tích điện sạc Type-C (Seller 29)
  { listingId: 9, userId: 218, content: 'Pin dùng liên tục mức vừa được mấy tiếng vậy b?', date: '2026-10-26 10:20:00' },
  { listingId: 29, userId: 29, content: 'Mức 1 gió thoang thoảng được tầm 5-6 tiếng, mức 2 mát sâu tầm 3 tiếng nha b. Cắm sạc Type-C sạc dự phòng dùng tẹt ga.', date: '2026-10-26 10:35:00' },
  { listingId: 9, userId: 238, content: 'Mang lên thư viện ĐH FPT học để bàn chạy có ồn ko b?', date: '2026-10-27 14:15:00' },
  { listingId: 29, userId: 29, content: 'Cực kỳ êm luôn, mang lên thư viện hay học đêm ko sợ làm phiền ai hết á.', date: '2026-10-27 14:30:00' },

  // Listing 10: Bộ bàn ghế làm việc học tập khung sắt (Seller 4)
  { listingId: 10, userId: 202, content: 'Bàn này chịu lực tốt ko b? Mình để 1 case PC to với 2 màn hình 24 inch có bị cong võng ko?', date: '2026-10-24 11:20:00' },
  { listingId: 10, userId: 4, content: 'Khung sắt hộp 25x25 dày dặn có thanh giằng ngang, mình đang để dàn PC 2 màn hình gõ phím bao chắc chắn ko rung lắc b nhé.', date: '2026-10-24 11:40:00' },
  { listingId: 10, userId: 216, content: 'Ghế kèm theo là ghế tựa hay ghế đôn vậy b?', date: '2026-10-25 16:10:00' },
  { listingId: 10, userId: 4, content: 'Ghế tựa lưng đệm mút êm ái b nhé, ngồi học cả ngày ko mỏi lưng.', date: '2026-10-25 16:30:00' },

  // Listing 11: Bàn học gỗ gập chân chữ U gọn nhẹ (Seller 11) - NEW
  { listingId: 11, userId: 205, content: 'Bàn này gấp gọn lại có để vừa khe tủ hoặc gầm giường không bạn?', date: '2026-10-25 13:10:00' },
  { listingId: 11, userId: 11, content: 'Gập lại chỉ dày tầm 4cm thôi bạn ơi, nhét gầm giường hay khe tủ cực kỳ gọn gàng tiện lợi.', date: '2026-10-25 13:25:00' },
  { listingId: 11, userId: 214, content: 'Bạn ở thôn mấy Tân Xã vậy? Chiều tối mình tan học bên ĐHQG qua xem lấy luôn được không?', date: '2026-10-26 17:30:00' },
  { listingId: 11, userId: 11, content: 'Mình ở trọ ngõ 1 Tân Xã ngay gần hồ b nhé. Tầm sau 17h30 mình có ở phòng nha.', date: '2026-10-26 17:45:00' },

  // Listing 12: Ghế xoay văn phòng có bánh xe đệm lưới (Seller 6) - NEW
  { listingId: 12, userId: 212, content: 'Ghế này piston ben nâng hạ chiều cao với ngả lưng còn ngon lành không b?', date: '2026-10-25 14:40:00' },
  { listingId: 12, userId: 6, content: 'Nâng hạ êm ru mượt mà nha bạn ơi, bánh xe lăn trơn tru không bị kẹt rác lông tóc gì hết á.', date: '2026-10-25 15:00:00' },
  { listingId: 12, userId: 221, content: 'Fix tròn 250k cho sinh viên năm nhất K20 được không b ơi? Mình qua tự chở bằng xe máy.', date: '2026-10-26 19:10:00' },
  { listingId: 12, userId: 6, content: 'Oki bạn qua tự chở thì mình để 250k nhé, qua alo mình trước 15p là được.', date: '2026-10-26 19:25:00' },

  // Listing 13: Bộ bàn ghế ăn / học tập gỗ sồi tự nhiên (Seller 9) - NEW
  { listingId: 13, userId: 226, content: 'Bộ này gồm 1 bàn và mấy ghế vậy b? Kích thước bàn tầm bao nhiêu?', date: '2026-10-26 08:30:00' },
  { listingId: 13, userId: 9, content: 'Gồm 1 bàn dài 1m2 và 4 ghế tựa nha b, gỗ thịt sồi nặng và chắc chắn lắm.', date: '2026-10-26 08:45:00' },
  { listingId: 13, userId: 231, content: 'Có hỗ trợ gọi xe ba gác chuyển về khu trọ Thạch Hoà không b?', date: '2026-10-27 10:15:00' },
  { listingId: 13, userId: 9, content: 'Có số chú lái ba gác quen ở xóm nè b, chuyển nội khu Hoà Lạc hết tầm 70k thôi b.', date: '2026-10-27 10:35:00' },

  // Listing 14: Điều hòa di động Casper 9000BTU (Seller 30) - NEW
  { listingId: 14, userId: 233, content: 'Điều hoà này có cần đục tường lắp cục nóng ngoài không bạn? Hay chỉ cần cắm điện là mát?', date: '2026-10-27 11:20:00' },
  { listingId: 14, userId: 30, content: 'Không cần đục tường nha bạn, chỉ cần cho ống xả khí nóng ra cửa sổ là xong, cắm điện dùng ngay rất tiện cho bạn nào ở trọ phòng chưa có điều hoà.', date: '2026-10-27 11:35:00' },
  { listingId: 14, userId: 242, content: 'Máy chạy ban đêm có ồn không bạn? Với tiền điện mỗi tháng tầm bao nhiêu ạ?', date: '2026-10-28 14:00:00' },
  { listingId: 14, userId: 30, content: 'Độ ồn tầm 45-50dB như quạt gió thôi b, ban đêm bật chế độ Sleep êm ru. Mình dùng tháng hết tầm 150-200k tiền điện tuỳ mức bật.', date: '2026-10-28 14:20:00' },
  { listingId: 14, userId: 248, content: 'Còn bảo hành chính hãng Casper không bạn ơi?', date: '2026-10-28 16:10:00' },
  { listingId: 14, userId: 30, content: 'Còn giấy bảo hành hãng hơn 6 tháng nha b, mình mua ở Điện Máy Xanh Thạch Thất.', date: '2026-10-28 16:30:00' }
];

sql += `-- ------------------------------------------------------------------------------
-- 1. INSERT MARKETPLACE COMMENTS (55+ bình luận trao đổi chợ đồ cũ)
-- ------------------------------------------------------------------------------
INSERT INTO marketplace_comment (listing_id, user_id, parent_id, content, status, created_at) VALUES\n`;

const mcRows = secondhandComments.map(c => {
  return `  (${c.listingId}, ${c.userId}, NULL, '${c.content.replace(/'/g, "''")}', 'VISIBLE', '${c.date}')`;
});
sql += mcRows.join(',\n') + ';\n\n';


// ------------------------------------------------------------------------------
// 2. ROOM REVIEWS (55+ reviews for all properties, especially 0-review properties)
// ------------------------------------------------------------------------------
const propertyReviews = [
  // Prop 1 (Trọ Minh Anh)
  { propId: 1, userId: 202, rating: 5, comment: 'Phòng trọ rất thoáng mát, có cửa sổ lớn đón gió tự nhiên. Bác Minh Anh chủ nhà vui tính, hôm mình chuyển đồ đến bác còn phụ bê tủ.', date: '2026-10-25 09:20:00' },
  { propId: 1, userId: 211, rating: 5, comment: 'Gần trạm xe buýt 107 đi bộ 3 phút là tới, tiện cho bạn nào hay vào nội thành cuối tuần. An ninh tốt có camera hành lang.', date: '2026-10-27 15:30:00' },

  // Prop 3 (Phòng ở ghép tiết kiệm)
  { propId: 3, userId: 204, rating: 5, comment: 'Phòng chia tiền ra mỗi bạn chỉ hơn 1 triệu/tháng, rất vừa túi tiền sinh viên năm nhất. Bạn cùng phòng ở ghép cũng ngoan và sạch sẽ.', date: '2026-10-24 14:10:00' },
  { propId: 3, userId: 215, rating: 4, comment: 'Không gian ấm cúng, bếp riêng có hút mùi nên nấu nướng không bị ám mùi vào chăn màn. Cho 4.5 sao vì wifi thỉnh thoảng hơi chậm buổi tối.', date: '2026-10-26 19:40:00' },

  // Prop 10 (Căn hộ mini 28m2 ngõ 1 Tân Xã)
  { propId: 10, userId: 205, rating: 5, comment: 'Ở đây gần hồ Tân Xã chiều ra hóng gió chạy bộ cực chill. Phòng mới xây nước nôi khỏe, máy giặt dùng chung tầng 5 rất sạch.', date: '2026-10-26 10:15:00' },

  // Prop 11 (Phòng Studio Cao Cấp UniHome)
  { propId: 11, userId: 207, rating: 5, comment: 'Nội thất y như hình 100%, khóa cổng vân tay và khóa cửa phòng điện tử xịn xò. Đáng từng đồng tiền bát gạo.', date: '2026-10-25 16:50:00' },

  // Prop 12 (Phòng gác xép hiện đại ngõ 2 Tân Xã)
  { propId: 12, userId: 208, rating: 5, comment: 'Gác xép cao đứng thẳng người không bị đụng đầu, cầu thang có tay vịn chắc chắn. Mình ở cùng bạn học IT thấy rất ưng ý.', date: '2026-10-26 11:30:00' },

  // Prop 13 (Phòng trọ tầng 2 khép kín Thạch Hòa)
  { propId: 13, userId: 209, rating: 5, comment: 'Khu Thạch Hòa này yên tĩnh, không ồn ào như mặt đường lớn. Bác chủ hỗ trợ lắp thêm rèm cửa chống nắng tận tình.', date: '2026-10-27 08:45:00' },

  // Prop 14 (Phòng trọ Tân Xã giá mềm)
  { propId: 14, userId: 210, rating: 5, comment: 'Giá 2tr2 cho phòng khép kín có điều hòa nóng lạnh ở Tân Xã là quá hời. Điện 3.5k/số tính công tơ riêng rất minh bạch.', date: '2026-10-26 17:10:00' },

  // Prop 15 (Phòng ban công thoáng gần trục bus 74)
  { propId: 15, userId: 212, rating: 5, comment: 'Ban công rộng trồng được mấy chậu cây cảnh, phơi quần áo buổi sáng chiều là khô cong. Đi bộ ra bến xe bus 74 tiện lợi.', date: '2026-10-25 18:00:00' },

  // Prop 16 (Phòng trọ tiện đi bộ sang FPT Hòa Lạc)
  { propId: 16, userId: 213, rating: 5, comment: 'Đúng chuẩn 8 phút đi bộ là vào tới sảnh giảng đường Alpha FPT, mùa mưa gió không lo trễ giờ học hay điểm danh.', date: '2026-10-27 13:20:00' },

  // Prop 17 (Phòng khép kín sạch đẹp Bình Yên)
  { propId: 17, userId: 214, rating: 5, comment: 'Bình Yên không khí trong lành, đường bê tông to ô tô vào tận cổng. Chỗ để xe tầng 1 có lắp ổ sạc riêng cho xe máy điện.', date: '2026-10-26 09:40:00' },
  { propId: 17, userId: 220, rating: 5, comment: 'Cô chú chủ nhà siêu dễ thương, rằm hay lễ tết đều chia hoa quả bánh kẹo cho sinh viên trọ. Cảm giác như ở nhà.', date: '2026-10-28 15:10:00' },

  // Prop 18 (Dãy trọ Hưng Thịnh Tân Xã)
  { propId: 18, userId: 216, rating: 5, comment: 'Dãy trọ có sân chung rộng, các bạn sinh viên toàn khóa 18, 19 FPT nên tối học bài giúp nhau rất vui vẻ.', date: '2026-10-27 20:15:00' },

  // Prop 19 (Phòng nấu ăn thoải mái gần hồ Tân Xã)
  { propId: 19, userId: 217, rating: 5, comment: 'Bàn bếp ốp đá hoa cương sạch bóng, bồn rửa bát đôi to thoải mái. Ra chợ Tân Xã mua thực phẩm chỉ 200m.', date: '2026-10-26 14:50:00' },
  { propId: 19, userId: 223, rating: 5, comment: 'Phòng cách âm ổn, tối đóng cửa vào là tha hồ học bài không bị tiếng xe cộ làm phiền. Vote 5 sao.', date: '2026-10-28 11:00:00' },

  // Prop 20 (Studio ban công phơi đồ thoáng Thạch Hòa)
  { propId: 20, userId: 218, rating: 5, comment: 'Phòng đón ánh nắng tự nhiên cả ngày nên không bao giờ ẩm mốc. Tủ lạnh 2 cánh trữ đồ ăn cả tuần vô tư.', date: '2026-10-27 16:30:00' },

  // Prop 21 (Phòng khép kín bếp riêng biệt Tân Xã)
  { propId: 21, userId: 219, rating: 5, comment: 'Bếp ngăn cách hẳn với phòng ngủ bằng cửa lùa kính, nấu nướng chiên xào thoải mái không lo mùi bay vào phòng.', date: '2026-10-28 09:30:00' },

  // Prop 22 (Phòng tầng 2 full nội thất nhượng lại gấp)
  { propId: 22, userId: 221, rating: 5, comment: 'Mình vừa nhận nhượng lại phòng này tháng trước, phòng đẹp y mô tả, bạn trước để lại cả quạt bàn và móc áo.', date: '2026-10-26 18:40:00' },

  // Prop 23 (Phòng Studio tìm 1 bạn nam ở ghép)
  { propId: 23, userId: 222, rating: 5, comment: 'Phòng rộng rãi 32m2 có 2 giường đơn riêng biệt, bạn nam ở ghép cùng nề nếp kỷ luật, học IT FPT.', date: '2026-10-27 10:50:00' },
  { propId: 23, userId: 227, rating: 5, comment: 'Chi phí chia đôi tiền phòng và điện nước rất nhẹ nhàng cho sinh viên. Vị trí an ninh cao.', date: '2026-10-28 17:15:00' },

  // Prop 24 (Phòng trọ sinh viên tiện lợi giá tốt)
  { propId: 24, userId: 224, rating: 5, comment: 'Giá sinh viên nhưng dịch vụ rất chuẩn chỉ, rác có người thu gom mỗi ngày, hành lang lau chùi sạch sẽ.', date: '2026-10-27 14:05:00' },
  { propId: 24, userId: 229, rating: 4, comment: 'Phòng gọn gàng, chủ nhà nhiệt tình. Gần các quán cơm bình dân 25k-30k ăn no căng bụng.', date: '2026-10-28 12:20:00' },

  // Prop 25 (Căn hộ mini tìm bạn nữ cùng chia tiền phòng) - NEW
  { propId: 25, userId: 203, rating: 5, comment: 'Phòng decor tông màu be pastel cực xinh, gương toàn thân có đèn led. Tìm được bạn nữ ở ghép cùng rất hợp cạ!', date: '2026-10-25 15:10:00' },
  { propId: 25, userId: 230, rating: 5, comment: 'An ninh khu này rất tốt, toàn sinh viên nữ ở nên cổng ngõ yên tâm tuyệt đối, 23h khóa cổng an toàn.', date: '2026-10-27 11:40:00' },

  // Prop 26 (Phòng khép kín sạch sẽ nhượng lại ngay) - NEW
  { propId: 26, userId: 225, rating: 5, comment: 'Thủ tục chuyển nhượng hợp đồng nhanh gọn, chủ nhà tạo điều kiện đổi tên cọc trong 1 nốt nhạc.', date: '2026-10-26 16:00:00' },
  { propId: 26, userId: 231, rating: 5, comment: 'Phòng sạch sẽ, bàn giao nguyên vẹn không sứt mẻ gì. Điều hòa mát lạnh tiết kiệm điện.', date: '2026-10-28 14:45:00' },

  // Prop 27 (Nhà trọ Đăng Khoa phòng 102) - NEW
  { propId: 27, userId: 226, rating: 5, comment: 'Tầng 1 dắt xe vào phòng hoặc để sân đều tiện, không phải leo cầu thang. Nhà tắm có bình nóng lạnh Ariston 20L.', date: '2026-10-25 17:40:00' },
  { propId: 27, userId: 232, rating: 5, comment: 'Chú Đăng Khoa chủ nhà hỗ trợ cực nhiệt tình, bóng đèn bị chập báo chú là 10 phút sau chú thay bóng mới toanh.', date: '2026-10-27 09:15:00' },

  // Prop 28 (Phòng trọ cô Hồng Tân Xã) - NEW
  { propId: 28, userId: 228, rating: 5, comment: 'Cô Hồng nấu chè ngon lắm, thỉnh thoảng đem chia cho các phòng. Phòng trọ xây kiên cố mát mẻ quanh năm.', date: '2026-10-26 11:20:00' },
  { propId: 28, userId: 233, rating: 5, comment: 'Khu dân cư văn hóa, yên tĩnh, ban đêm không có tiếng còi xe hay karaoke. Rất hợp cho các bạn cần cày deadline.', date: '2026-10-28 16:30:00' },

  // Prop 29 (Phòng giá rẻ gần chợ Tân Xã) - NEW
  { propId: 29, userId: 234, rating: 5, comment: 'Bước chân ra cổng 50m là tới chợ rau củ và bách hóa. Đi chợ nấu ăn tiết kiệm được bao nhiêu tiền sinh hoạt.', date: '2026-10-25 19:00:00' },
  { propId: 29, userId: 235, rating: 4, comment: 'Phòng giá rẻ nhưng có đầy đủ gác xép và quạt trần, sinh viên tài chính eo hẹp thuê ở đây là chân ái.', date: '2026-10-27 15:50:00' },

  // Prop 30 (Căn hộ mini thang máy ngõ ô tô Thạch Hòa)
  { propId: 30, userId: 236, rating: 5, comment: 'Thang máy thẻ từ nhập khẩu êm ru, ngõ rộng ô tô tải đỗ tận cửa dỡ đồ chuyển phòng siêu nhàn.', date: '2026-10-26 13:10:00' },
  { propId: 30, userId: 237, rating: 5, comment: 'Tầng thượng view nhìn thẳng ra núi Ba Vì hoàng hôn đẹp mê ly. Hệ thống PCCC đạt chuẩn có chuông báo khói từng tầng.', date: '2026-10-28 10:25:00' },

  // Prop 31 (Phòng mới setup bàn học tủ áo tiện nghi) - NEW
  { propId: 31, userId: 238, rating: 5, comment: 'Bàn học rộng 1m2 có giá sách tha hồ để giáo trình và laptop. Tủ quần áo 3 cánh to đùng để đồ mùa đông thoải mái.', date: '2026-10-26 08:50:00' },
  { propId: 31, userId: 239, rating: 5, comment: 'Mọi thứ từ ổ điện đến đèn tuýp led đều bố trí rất hợp lý cho dân IT làm việc đêm.', date: '2026-10-28 13:40:00' },

  // Prop 32 (Phòng trọ an ninh camera 24/7 cô Mai)
  { propId: 32, userId: 240, rating: 5, comment: 'Hệ thống 8 camera an ninh từ cổng vào đến từng tầng cầu thang, bố mẹ ở quê lên thăm xem trọ khen tấm tắc.', date: '2026-10-27 16:40:00' },
  { propId: 32, userId: 241, rating: 5, comment: 'Cô Mai hiền lành và thương sinh viên, tiền nhà đến hạn cô nhắc nhẹ nhàng, chưa có cô cho chậm vài hôm không tính phạt.', date: '2026-10-28 18:20:00' },

  // Prop 33 (Phòng trọ thoáng sáng tự nhiên bác Phúc) - NEW
  { propId: 33, userId: 242, rating: 5, comment: 'Hai mặt thoáng đón gió trời, ban ngày mở cửa sổ là sáng trưng không cần bật đèn tiết kiệm điện.', date: '2026-10-26 15:30:00' },
  { propId: 33, userId: 243, rating: 5, comment: 'Bác Phúc hay bảo trì vệ sinh điều hòa định kỳ nên máy chạy lúc nào cũng mát lịm và thơm tho.', date: '2026-10-28 11:50:00' },

  // Prop 34 (Phòng trọ nhượng lại tặng kèm mạng 3 tháng) - NEW
  { propId: 34, userId: 244, rating: 5, comment: 'Được tặng kèm mạng cáp quang Viettel tốc độ cao dùng mượt mà, chơi game ping 5ms xem video 4K ko giật.', date: '2026-10-27 12:30:00' },
  { propId: 34, userId: 245, rating: 5, comment: 'Phòng bàn giao đúng như lời bạn nhượng cam kết, rất uy tín và rõ ràng.', date: '2026-10-28 17:40:00' },

  // Prop 35 (Phòng trọ sinh viên Thạch Hòa gần chợ) - NEW
  { propId: 35, userId: 246, rating: 5, comment: 'Gần chợ Thôn 3 Thạch Hòa mua đồ ăn cực rẻ, xung quanh có tiệm giặt là và quán tạp hóa 24/7.', date: '2026-10-26 17:00:00' },
  { propId: 35, userId: 247, rating: 5, comment: 'Giá phòng mềm, chi phí sinh hoạt vừa tầm, đường sá đi lại thông thoáng sang ĐHQG hay FPT đều gần.', date: '2026-10-28 15:20:00' },

  // Prop 36 (Phòng khép kín Tân Xã giá ưu đãi) - NEW
  { propId: 36, userId: 248, rating: 5, comment: 'Đóng tiền 3 tháng được bác chủ giảm hẳn 200k/tháng, hợp đồng rõ ràng minh bạch từng điều khoản.', date: '2026-10-27 14:15:00' },
  { propId: 36, userId: 249, rating: 5, comment: 'Phòng ốc quét sơn mới tinh, gạch men sáng bóng, chuyển vào ở ngay không cần sửa sang gì thêm.', date: '2026-10-28 19:10:00' }
];

sql += `-- ------------------------------------------------------------------------------
-- 2. INSERT PROPERTY REVIEWS (55+ đánh giá thực tế chất lượng cao cho các phòng trọ)
-- ------------------------------------------------------------------------------
INSERT INTO review (
  property_id, user_id, rating, accuracy_rating, price_transparency_rating,
  utility_transparency_rating, landlord_communication_rating, comment, status, created_at
) VALUES\n`;

const prRows = propertyReviews.map(r => {
  return `  (${r.propId}, ${r.userId}, ${r.rating}, 5, 5, 5, 5, '${r.comment.replace(/'/g, "''")}', 'VISIBLE', '${r.date}')`;
});
sql += prRows.join(',\n') + ';\n\n';


// ------------------------------------------------------------------------------
// 3. QUESTIONS & ANSWERS (6 new Q&A topics + 15 answers)
// ------------------------------------------------------------------------------
sql += `-- ------------------------------------------------------------------------------
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
\n`;

// Write file
const outputPath = path.join(__dirname, '..', 'database', 'seed_comments_reviews_qa_expansion.sql');
fs.writeFileSync(outputPath, sql, 'utf8');
console.log('Successfully generated SQL script at:', outputPath);
console.log(`Generated: ${secondhandComments.length} marketplace comments, ${propertyReviews.length} property reviews, 6 questions & 13 answers.`);
