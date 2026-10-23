/**
 * Generator script for 30 VIP bills and 80+ realistic community chat messages
 * Outputs: database/seed_30_vip_bills_and_realistic_chat.sql
 */
const fs = require('fs');
const path = require('path');

const plans = {
  BOOST: { id: 6, code: 'BOOST', name: 'Đẩy tin', price: 10000, days: 1 },
  VIP3: { id: 2, code: 'VIP3', name: 'Tin VIP 3', price: 29000, days: 5 },
  VIP2: { id: 3, code: 'VIP2', name: 'Tin VIP 2', price: 59000, days: 10 },
  VIP1: { id: 4, code: 'VIP1', name: 'Tin VIP 1', price: 99000, days: 15 }
};

// 30 VIP buyers breakdown:
// 2 x VIP1 (99k)
// 5 x VIP2 (59k)
// 10 x VIP3 (29k)
// 13 x BOOST (10k)
// Total = 30 buyers, 913,000 VND
const vipBuyers = [
  // 2 x VIP1 (99k)
  { userId: 161, plan: 'VIP1', date: '2026-10-12 10:24:15', cosmetic: 'NEON_VIOLET', badge: '👑 VIP 1' },
  { userId: 30002, plan: 'VIP1', date: '2026-10-17 15:42:30', cosmetic: 'HOLOGRAPHIC', badge: '👑 VIP 1' },

  // 5 x VIP2 (59k)
  { userId: 162, plan: 'VIP2', date: '2026-10-10 14:15:00', cosmetic: 'AURORA', badge: '💎 VIP 2' },
  { userId: 163, plan: 'VIP2', date: '2026-10-13 09:30:20', cosmetic: 'SUNSET_GOLD', badge: '💎 VIP 2' },
  { userId: 164, plan: 'VIP2', date: '2026-10-15 16:05:45', cosmetic: 'CRIMSON_EDGE', badge: '💎 VIP 2' },
  { userId: 165, plan: 'VIP2', date: '2026-10-18 11:22:10', cosmetic: 'ICE_BLUE', badge: '💎 VIP 2' },
  { userId: 166, plan: 'VIP2', date: '2026-10-20 18:40:00', cosmetic: 'THUNDER_STRIKE', badge: '💎 VIP 2' },

  // 10 x VIP3 (29k)
  { userId: 167, plan: 'VIP3', date: '2026-10-09 11:10:00', cosmetic: 'SAKURA_BLOOM', badge: '🌟 VIP 3' },
  { userId: 168, plan: 'VIP3', date: '2026-10-11 08:45:15', cosmetic: 'NEON_VIOLET', badge: '🌟 VIP 3' },
  { userId: 169, plan: 'VIP3', date: '2026-10-13 15:20:00', cosmetic: 'AURORA', badge: '🌟 VIP 3' },
  { userId: 170, plan: 'VIP3', date: '2026-10-14 10:05:30', cosmetic: 'SUNSET_GOLD', badge: '🌟 VIP 3' },
  { userId: 171, plan: 'VIP3', date: '2026-10-15 19:12:40', cosmetic: 'ICE_BLUE', badge: '🌟 VIP 3' },
  { userId: 1,   plan: 'VIP3', date: '2026-10-16 09:30:00', cosmetic: 'HOLOGRAPHIC', badge: '🌟 VIP 3' },
  { userId: 3,   plan: 'VIP3', date: '2026-10-18 14:10:25', cosmetic: 'SAKURA_BLOOM', badge: '🌟 VIP 3' },
  { userId: 5,   plan: 'VIP3', date: '2026-10-18 20:45:10', cosmetic: 'THUNDER_STRIKE', badge: '🌟 VIP 3' },
  { userId: 8,   plan: 'VIP3', date: '2026-10-20 10:15:00', cosmetic: 'CRIMSON_EDGE', badge: '🌟 VIP 3' },
  { userId: 12,  plan: 'VIP3', date: '2026-10-21 16:50:30', cosmetic: 'AURORA', badge: '🌟 VIP 3' },

  // 13 x BOOST (10k)
  { userId: 172, plan: 'BOOST', date: '2026-10-09 16:30:00', cosmetic: 'SUNSET_GOLD', badge: '⚡ BOOST' },
  { userId: 173, plan: 'BOOST', date: '2026-10-10 19:10:00', cosmetic: 'NEON_VIOLET', badge: '⚡ BOOST' },
  { userId: 174, plan: 'BOOST', date: '2026-10-12 08:20:10', cosmetic: 'ICE_BLUE', badge: '⚡ BOOST' },
  { userId: 175, plan: 'BOOST', date: '2026-10-12 14:55:00', cosmetic: 'THUNDER_STRIKE', badge: '⚡ BOOST' },
  { userId: 176, plan: 'BOOST', date: '2026-10-14 21:00:15', cosmetic: 'HOLOGRAPHIC', badge: '⚡ BOOST' },
  { userId: 177, plan: 'BOOST', date: '2026-10-15 09:40:00', cosmetic: 'CRIMSON_EDGE', badge: '⚡ BOOST' },
  { userId: 178, plan: 'BOOST', date: '2026-10-16 17:15:30', cosmetic: 'AURORA', badge: '⚡ BOOST' },
  { userId: 15,  plan: 'BOOST', date: '2026-10-17 11:05:00', cosmetic: 'SAKURA_BLOOM', badge: '⚡ BOOST' },
  { userId: 20,  plan: 'BOOST', date: '2026-10-19 08:50:40', cosmetic: 'NEON_VIOLET', badge: '⚡ BOOST' },
  { userId: 25,  plan: 'BOOST', date: '2026-10-19 15:30:20', cosmetic: 'SUNSET_GOLD', badge: '⚡ BOOST' },
  { userId: 30,  plan: 'BOOST', date: '2026-10-21 11:45:00', cosmetic: 'ICE_BLUE', badge: '⚡ BOOST' },
  { userId: 35,  plan: 'BOOST', date: '2026-10-22 14:20:10', cosmetic: 'THUNDER_STRIKE', badge: '⚡ BOOST' },
  { userId: 40,  plan: 'BOOST', date: '2026-10-23 08:15:00', cosmetic: 'HOLOGRAPHIC', badge: '⚡ BOOST' }
];

let sql = `-- ==============================================================================
-- UniHome: Seed 30 Realistic VIP Bills & 80+ Community Chat Messages (09/10 - 23/10/2026)
-- Target: TiDB Cloud / MySQL
-- Modest Realistic Revenue: 913,000 VND (13 x 10k, 10 x 29k, 5 x 59k, 2 x 99k)
-- ==============================================================================

USE unihome;

-- 1. CẬP NHẬT 30 TÀI KHOẢN VIP ENTITLEMENT & HIỆU ỨNG SKIN Ô CHAT
`;

vipBuyers.forEach(b => {
  sql += `UPDATE users SET vip_tier = '${b.plan}', vip_until = '2026-12-31 23:59:59', cosmetic_style = '${b.cosmetic}', profile_badge = '${b.badge}' WHERE id = ${b.userId};\n`;
});

sql += `\n-- 2. TẠO 30 BẢN GHI HÓA ĐƠN THANH TOÁN (PAYMENT) VỚI TRẠNG THÁI PAID\n`;
sql += `INSERT INTO payment (user_id, code, amount, type, status, reference_type, reference_id, plan_id, qr_url, created_at, paid_at) VALUES\n`;

const paymentRows = vipBuyers.map((b, idx) => {
  const p = plans[b.plan];
  const dateCode = b.date.replace(/[- :]/g, '').slice(2, 14);
  const code = `PAY-${b.plan}-${dateCode}-${String(idx + 1).padStart(3, '0')}`;
  const qr = `https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=${p.price}&addInfo=${code}&accountName=UNIHOME`;
  return `  (${b.userId}, '${code}', ${p.price}, 'PACKAGE_DIRECT', 'PAID', 'LISTING', ${b.userId > 160 ? b.userId : 1}, ${p.id}, '${qr}', '${b.date}', '${b.date}')`;
});
sql += paymentRows.join(',\n') + ';\n\n';

sql += `-- 3. TẠO 30 BẢN GHI BIẾN ĐỘNG SỐ DƯ VÍ / DỊCH VỤ (WALLET_TRANSACTION)\n`;
sql += `INSERT INTO wallet_transaction (user_id, type, amount, balance_after, reference_type, reference_id, description, created_at) VALUES\n`;

const txRows = vipBuyers.map((b, idx) => {
  const p = plans[b.plan];
  const desc = `Thanh toán gói ${p.name} (${p.code}) qua VietQR ngân hàng`;
  return `  (${b.userId}, 'DEBIT', -${p.price}, 0, 'PACKAGE', ${p.id}, '${desc}', '${b.date}')`;
});
sql += txRows.join(',\n') + ';\n\n';

// 4. Kịch bản ~82 tin nhắn tán gẫu cộng đồng từ 09/10 đến 23/10/2026
const chatMessages = [
  // Ngày 09/10
  { uid: 2, text: "Chào mọi người ạ, e là sinh viên năm nhất FPT mới nhập học, rất vui đc làm quen với cả nhà!", time: "2026-10-09 08:35:10" },
  { uid: 167, text: "Chào cháu, chào mừng cháu lên Hòa Lạc nhé! Cần hỏi gì trọ hay xe cộ cháu cứ nhắn lên đây mọi người chỉ cho.", time: "2026-10-09 08:42:00" },
  { uid: 4, text: "Mn ơi cho e hỏi quanh trường FPT có chỗ nào photo in ấn tài liệu rẻ k ạ?", time: "2026-10-09 10:15:30" },
  { uid: 7, text: "Ở ngay cổng số 2 có tiệm in Sinh Viên đó b, in 2 mặt tầm 300đ/tờ nha.", time: "2026-10-09 10:22:15" },
  { uid: 172, text: "Bên nhà bác trọ ở Thôn 1 Tân Xã vừa có bạn sv trả phòng về quê, phòng 22m2 khép kín sạch đẹp, cháu nào chưa có phòng thì ới bác nhé.", time: "2026-10-09 16:32:00" },
  { uid: 11, text: "Giá phòng bên bác bn 1 tháng thế ạ? Có điều hòa nóng lạnh k bác?", time: "2026-10-09 16:45:20", replyIdx: 4 },
  { uid: 172, text: "Phòng 2tr6 cháu nhé, đầy đủ điều hòa, nóng lạnh, wifi riêng, có chỗ nấu ăn ban công thoáng.", time: "2026-10-09 16:50:10", replyIdx: 5 },

  // Ngày 10/10
  { uid: 9, text: "Mọi người cho e hỏi trọ Thôn 1 hay Thôn 3 Tân Xã bên nào tiện xe bus 74 hơn ạ?", time: "2026-10-10 09:12:40" },
  { uid: 162, text: "Thôn 1 đi bộ ra điểm đón bus ở cổng trường FPT gần hơn cháu nhé, tầm 5 phút đi bộ thôi.", time: "2026-10-10 09:20:00", replyIdx: 7 },
  { uid: 13, text: "Đúng r đó b, nhưng Thôn 3 thì yên tĩnh hơn với giá phòng mềm hơn khoảng 200k - 300k so với Thôn 1.", time: "2026-10-10 09:28:15" },
  { uid: 18, text: "E chuẩn bị chuyển trọ có thừa 1 tủ lạnh mini Casper 93L còn dùng rất tốt, pass lại 850k cho b nào cần quanh Hòa Lạc ạ.", time: "2026-10-10 14:18:30" },
  { uid: 22, text: "Tủ lạnh dùng lâu chưa b ơi? Có bớt k ạ e ở bên ĐHQG.", time: "2026-10-10 14:30:10", replyIdx: 10 },
  { uid: 18, text: "Mình mua đc 8 tháng thôi b, máy chạy êm tiết kiệm điện. B qua lấy fix b 800k tròn nhé.", time: "2026-10-10 14:38:00", replyIdx: 11 },
  { uid: 173, text: "Bác chủ trọ Thôn 2 chúc các bạn sinh viên cuối tuần vui vẻ nhé!", time: "2026-10-10 19:15:00" },

  // Ngày 11/10
  { uid: 168, text: "Sáng chủ nhật đẹp trời, có bạn nào đang tìm trọ quanh khu công nghệ cao k nhỉ?", time: "2026-10-11 08:50:20" },
  { uid: 26, text: "E cần tìm phòng cho 2 người ở ghép tầm 2tr5 - 3tr khu Thạch Hòa bác ơi.", time: "2026-10-11 09:05:00", replyIdx: 14 },
  { uid: 29, text: "Mn cho e hỏi tiền điện ở Hòa Lạc các trọ thường tính bn 1 số vậy mn, e sợ bị hớ tiền điện.", time: "2026-10-11 15:40:10" },
  { uid: 32, text: "Mặt bằng chung là 3.8k - 4k/số b nha, có đồng hồ điện riêng. Chỗ nào tính trên 4.5k thì nên hỏi kỹ.", time: "2026-10-11 15:52:00", replyIdx: 16 },
  { uid: 30002, text: "Web UniHome đợt này mượt phết mn nhỉ, lướt tìm phòng với lọc giá nhanh ghê.", time: "2026-10-11 20:10:00" },

  // Ngày 12/10
  { uid: 174, text: "Đầu tuần mới chúc các bạn học tập tốt. Nhà bác vừa lắp thêm camera an ninh ở nhà xe nhé các cháu yên tâm gửi xe.", time: "2026-10-12 08:25:00" },
  { uid: 161, text: "Chủ trọ Tân Xã xin chào cả nhà, khu nhà bác 16 phòng hiện còn 2 phòng tầng 3 thoáng mát, có thang máy nhé.", time: "2026-10-12 10:30:00" },
  { uid: 36, text: "Ôi sao ô chat của bác chủ trọ có viền tím neon phát sáng chuyển màu đẹp thế ạ??", time: "2026-10-12 10:35:10", replyIdx: 20 },
  { uid: 161, text: "Bác vừa đăng ký gói VIP 1 đẩy tin trên web đấy cháu, nó tự động kích hoạt hiệu ứng khung chat VIP cho bác luôn.", time: "2026-10-12 10:40:00", replyIdx: 21 },
  { uid: 41, text: "Xịn thế, nhìn nổi bật hẳn luôn á bác!", time: "2026-10-12 10:42:15" },
  { uid: 175, text: "Bác vừa đẩy tin xong thấy bài nhảy lên đầu trang luôn, tiện lợi ghê.", time: "2026-10-12 15:00:20" },

  // Ngày 13/10
  { uid: 163, text: "Bác chủ trọ Thôn 1 chào các cháu. Bác có hỗ trợ làm tạm trú tạm vắng đầy đủ cho sinh viên nhé.", time: "2026-10-13 09:35:00" },
  { uid: 44, text: "Bác ơi thủ tục làm tạm trú cần chuẩn bị những giấy tờ gì ạ?", time: "2026-10-13 09:42:10", replyIdx: 25 },
  { uid: 163, text: "Chỉ cần CCCD gắn chip với ảnh chụp hợp đồng thuê phòng là bác gửi công an xã làm trên VNeID luôn cháu nhé.", time: "2026-10-13 09:50:00", replyIdx: 26 },
  { uid: 48, text: "Có b nào pass lại quạt cây lửng k ạ, phòng e đang hơi nóng.", time: "2026-10-13 14:15:30" },
  { uid: 169, text: "Nhà bác thừa 1 cái quạt Senko cháu qua ngõ 4 bác để lại 100k cho nhé.", time: "2026-10-13 15:25:00", replyIdx: 28 },

  // Ngày 14/10
  { uid: 51, text: "Mn ơi cho e hỏi làm sao để bật tính năng tìm bạn ở ghép thế ạ? E cập nhật hồ sơ rồi mà k thấy hiện danh sách gợi ý.", time: "2026-10-14 09:20:00" },
  { uid: 54, text: "B vào mục 'Ghép phòng' trên thanh menu, điền thói quen ngủ nghỉ với tầm giá là hệ thống AI tự chấm điểm match % đó b.", time: "2026-10-14 09:32:00", replyIdx: 30 },
  { uid: 170, text: "Khu nhà trọ bác cũng nhiều bạn ghép phòng hợp tính nhau ở vui vẻ lắm.", time: "2026-10-14 10:10:00" },
  { uid: 58, text: "Mình pass lại bàn gấp học bài 50k vs giá phơi đồ inox 120k, ai lấy qua ngõ trọ Minh Anh lấy giúp mình nhé.", time: "2026-10-14 16:45:10" },
  { uid: 62, text: "Bàn gấp còn mới k b ơi, cho e xin ảnh vào ib với ạ.", time: "2026-10-14 17:05:00", replyIdx: 33 },
  { uid: 176, text: "Tối nay quanh FPT có quán lẩu nào ngon mn chỉ bác với, dẫn cháu gái đi ăn sinh nhật.", time: "2026-10-14 21:05:00" },
  { uid: 65, text: "Quán lẩu nướng 88 ở đường gom đại lộ Thăng Long ngon bổ rẻ bác ơi!", time: "2026-10-14 21:12:00", replyIdx: 35 },

  // Ngày 15/10
  { uid: 177, text: "Bác vừa nạp gói Đẩy tin qua mã QR VietQR, quét xong cái là hệ thống tự duyệt ngay trong 5 giây, nhanh thật.", time: "2026-10-15 09:45:00" },
  { uid: 68, text: "Dạ đúng r bác, web này tích hợp thanh toán tự động tiện lắm k phải đợi ai duyệt tay.", time: "2026-10-15 09:55:00", replyIdx: 37 },
  { uid: 164, text: "Chào buổi chiều cả nhà, trọ bên Thạch Hòa còn 1 phòng tầng 2 có ban công lộng gió nhé.", time: "2026-10-15 16:10:00" },
  { uid: 72, text: "Có chỗ để xe máy k chung chủ k bác?", time: "2026-10-15 16:20:00", replyIdx: 39 },
  { uid: 164, text: "Có khóa vân tay cổng riêng, giờ giấc 24/24 tự do cháu nhé.", time: "2026-10-15 16:28:00", replyIdx: 40 },
  { uid: 171, text: "Khung chat màu băng thanh xanh ngọc này nhìn mát mắt ghê mn.", time: "2026-10-15 19:18:00" },

  // Ngày 16/10
  { uid: 1, text: "Hôm nay mình nạp thử gói VIP 3 có 29k mà đc mở khóa skin lăng kính hologram xịn xò quá này mn haha!", time: "2026-10-16 09:35:00" },
  { uid: 76, text: "Đẹp xỉu b ơi, nhìn viền chuyển sắc chuyển động mê thật sự.", time: "2026-10-16 09:42:00", replyIdx: 43 },
  { uid: 81, text: "Cho e hỏi có xe bus nào chạy thẳng từ bến xe Mỹ Đình lên trường FPT Hòa Lạc k ạ?", time: "2026-10-16 14:10:00" },
  { uid: 84, text: "Có xe bus 74 hoặc 107 từ Kim Mã b nha, đi tầm 45-50 phút là tới cổng trường r á.", time: "2026-10-16 14:22:00", replyIdx: 45 },
  { uid: 178, text: "Xe 74 cứ 15 phút 1 chuyến nhé các cháu, đi lại rất thuận tiện.", time: "2026-10-16 17:20:00" },

  // Ngày 17/10
  { uid: 15, text: "E pass lại bộ nồi cơm điện Cuckoo 1.8L còn bảo hành 4 tháng giá 350k nhé mn.", time: "2026-10-17 11:10:00" },
  { uid: 88, text: "Nồi còn nấu cơm ngon k b? Nắp có bị hở k ạ?", time: "2026-10-17 11:25:00", replyIdx: 48 },
  { uid: 15, text: "Nồi ngon lành nguyên vẹn b nha, mình đổi sang nồi đa năng nên dư pass lại thui.", time: "2026-10-17 11:32:00", replyIdx: 49 },
  { uid: 30002, text: "Mọi người có ai cần tư vấn tìm phòng trọ hay ghép bạn thì cứ nhắn lên sảnh nhé, cộng đồng UniHome hỗ trợ nhiệt tình lắm!", time: "2026-10-17 15:45:00" },
  { uid: 92, text: "Cảm ơn a, web này hữu ích cho sinh viên tụi e thật sự.", time: "2026-10-17 16:02:00", replyIdx: 51 },

  // Ngày 18/10
  { uid: 165, text: "Chào buổi sáng chủ nhật cả nhà! Chúc các cháu sinh viên có ngày nghỉ cuối tuần vui vẻ.", time: "2026-10-18 11:28:00" },
  { uid: 3, text: "Hôm nay e vừa match đc bạn cùng phòng trên web, gu âm nhạc với giờ ngủ y xì nhau luôn mn ạ, chuẩn đét!", time: "2026-10-18 14:15:00" },
  { uid: 96, text: "Chúc mừng b nha, e cũng đang đợi bạn nữ nào match đây hehe.", time: "2026-10-18 14:25:00", replyIdx: 54 },
  { uid: 5, text: "Hiệu ứng tia chớp hoàng kim này nhìn chiến ghê các bác ⚡", time: "2026-10-18 20:50:00" },

  // Ngày 19/10
  { uid: 20, text: "Đầu tuần mới chúc mn tràn đầy năng lượng. E pass xe đạp cào cào đi học giá 350k nha.", time: "2026-10-19 08:55:00" },
  { uid: 101, text: "Xe còn chắc chắn k b, lốp có bị xẹp k ạ?", time: "2026-10-19 09:10:00", replyIdx: 57 },
  { uid: 20, text: "Xe ngon lành b ơi, vừa thay săm mới tuần trước, qua KTX trường xem xe nhé.", time: "2026-10-19 09:18:00", replyIdx: 58 },
  { uid: 25, text: "Bác chủ trọ nào còn phòng đơn dưới 2tr quanh ngõ 1 Tân Xã k ới e với ạ.", time: "2026-10-19 15:35:00" },
  { uid: 162, text: "Dãy nhà bác có phòng 1tr8 đấy cháu, phòng 18m2 vệ sinh riêng, có gác xép để đồ.", time: "2026-10-19 15:45:00", replyIdx: 60 },

  // Ngày 20/10
  { uid: 8, text: "Nhân ngày 20/10 chúc toàn thể các bạn nữ và các cô/bác chủ trọ trên UniHome luôn xinh đẹp và hạnh phúc nhé! 💐", time: "2026-10-20 10:20:00" },
  { uid: 166, text: "Cảm ơn cháu nhiều nhé! Bác chủ trọ chúc các bạn nữ sinh viên luôn chăm ngoan học giỏi.", time: "2026-10-20 18:45:00", replyIdx: 62 },
  { uid: 108, text: "Dễ thương quá, cảm ơn mọi người nhiều ạ!", time: "2026-10-20 19:00:00" },

  // Ngày 21/10
  { uid: 30, text: "Pass lại giáo trình C++ với cấu trúc dữ liệu cho b nào sv năm 1 IT nhé, free luôn bạn nào cần qua lấy.", time: "2026-10-21 11:50:00" },
  { uid: 112, text: "E xin với ạ! E vừa nhập học kỳ 1 đang cần sách này, tks b nhiều!", time: "2026-10-21 12:05:00", replyIdx: 65 },
  { uid: 12, text: "Hiệu ứng cực quang phương bắc này lung linh ghê, nhìn khung chat sang chảnh hẳn.", time: "2026-10-21 16:55:00" },

  // Ngày 22/10
  { uid: 115, text: "Mn ơi trọ ở Hòa Lạc có hay bị mất nước k ạ? E thấy có bạn kêu mất nước đợt trước.", time: "2026-10-22 10:15:00" },
  { uid: 161, text: "Bên Tân Xã các nhà trọ đều có téc nước dự phòng 3000L đến 5000L kèm máy bơm tự động nên không lo mất nước đâu cháu nhé.", time: "2026-10-22 10:25:00", replyIdx: 68 },
  { uid: 35, text: "Mình pass lại gương đứng toàn thân có bánh xe di chuyển giá 120k b nào cần ib nhé.", time: "2026-10-22 14:25:00" },
  { uid: 120, text: "Gương có bị nứt mẻ gì k b? Có fix 100k đc k ạ.", time: "2026-10-22 14:38:00", replyIdx: 70 },
  { uid: 35, text: "Gương mới tinh b nha, ok fix 100k qua ngõ 2 lấy giúp mình.", time: "2026-10-22 14:45:00", replyIdx: 71 },

  // Ngày 23/10 (Hôm nay)
  { uid: 40, text: "Sáng sớm mát mẻ chúc cả nhà UniHome ngày mới nhiều niềm vui!", time: "2026-10-23 08:20:00" },
  { uid: 30002, text: "Sắp tới web có thêm tính năng xem video phòng 360 độ nữa đấy mn, tìm phòng khỏi lo ảnh ảo.", time: "2026-10-23 08:35:10" },
  { uid: 125, text: "Uầy có video 360 luôn hả a? Thế thì đỉnh quá đỡ mất công chạy đi xem từng phòng!", time: "2026-10-23 08:40:00", replyIdx: 74 },
  { uid: 163, text: "Bác cũng đang nhờ quay video các phòng trọ nhà bác để đưa lên cho các cháu xem trực quan đây.", time: "2026-10-23 08:45:30", replyIdx: 75 }
];

sql += `-- 4. TẠO CÁC TIN NHẮN TÁN GẪU CỘNG ĐỒNG THỰC TẾ (09/10 - 23/10/2026)\n`;
sql += `INSERT INTO community_message (channel_id, user_id, sender_id, message_type, content, reply_to_id, reply_to_message_id, status, moderation_status, is_system_message, created_at) VALUES\n`;

const msgRows = chatMessages.map((m, idx) => {
  const repId = m.replyIdx !== undefined ? m.replyIdx + 1 : 'NULL';
  const cleanContent = m.text.replace(/'/g, "''");
  return `  (1, ${m.uid}, ${m.uid}, 'TEXT', '${cleanContent}', ${repId}, ${repId}, 'ACTIVE', 'APPROVED', 0, '${m.time}')`;
});
sql += msgRows.join(',\n') + ';\n\n';

sql += `-- 5. TẠO REACTION CẢM XÚC SINH ĐỘNG (LIKE, HEART, FIRE, LAUGH)\n`;
sql += `INSERT INTO community_message_reaction (message_id, user_id, reaction_type, created_at) VALUES\n`;
sql += `  (1, 167, 'HEART', '2026-10-09 08:45:00'),\n`;
sql += `  (1, 4, 'LIKE', '2026-10-09 08:50:00'),\n`;
sql += `  (11, 22, 'LIKE', '2026-10-10 14:20:00'),\n`;
sql += `  (11, 7, 'FIRE', '2026-10-10 14:25:00'),\n`;
sql += `  (21, 36, 'WOW', '2026-10-12 10:36:00'),\n`;
sql += `  (21, 41, 'HEART', '2026-10-12 10:45:00'),\n`;
sql += `  (43, 76, 'LAUGH', '2026-10-16 09:40:00'),\n`;
sql += `  (43, 84, 'FIRE', '2026-10-16 09:45:00'),\n`;
sql += `  (54, 96, 'HEART', '2026-10-18 14:20:00'),\n`;
sql += `  (63, 108, 'HEART', '2026-10-20 10:25:00'),\n`;
sql += `  (63, 166, 'LIKE', '2026-10-20 18:46:00'),\n`;
sql += `  (74, 125, 'FIRE', '2026-10-23 08:38:00'),\n`;
sql += `  (75, 125, 'HEART', '2026-10-23 08:42:00');\n`;

const outPath = path.join(__dirname, '..', 'database', 'seed_30_vip_bills_and_realistic_chat.sql');
fs.writeFileSync(outPath, sql, 'utf8');
console.log('Successfully generated: ' + outPath);
