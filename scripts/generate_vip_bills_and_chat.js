/**
 * Generator script for 30 VIP bills and realistic community chat messages
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

// 30 VIP buyers: Exactly 2 x VIP1 (99k), 5 x VIP2 (59k), 10 x VIP3 (29k), 13 x BOOST (10k)
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
-- UniHome: Seed 30 Realistic VIP Bills & Authentic Student Chat Messages (09/10 - 23/10/2026)
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
sql += `DELETE FROM payment WHERE code LIKE 'PAY-%';\n`;
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
sql += `DELETE FROM wallet_transaction WHERE description LIKE '%VietQR%';\n`;
sql += `INSERT INTO wallet_transaction (user_id, type, amount, balance_after, reference_type, reference_id, description, created_at) VALUES\n`;

const txRows = vipBuyers.map((b, idx) => {
  const p = plans[b.plan];
  const desc = `Thanh toán gói ${p.name} (${p.code}) qua VietQR ngân hàng`;
  return `  (${b.userId}, 'DEBIT', -${p.price}, 0, 'PACKAGE', ${p.id}, '${desc}', '${b.date}')`;
});
sql += txRows.join(',\n') + ';\n\n';

// 4. Kịch bản ~75 tin nhắn tán gẫu cộng đồng thực tế: 85% Sinh viên, 15% Chủ trọ đăng tin ngắn gọn, KHÔNG sến súa/nịnh bợ
const chatMessages = [
  // Ngày 09/10
  { uid: 2, text: "Mn ơi cho e hỏi quanh FPT có quán photo in ấn nào rẻ k ạ?", time: "2026-10-09 08:35:10" },
  { uid: 7, text: "Cổng số 2 có quán in Sinh Viên nha b, in 2 mặt 300đ/tờ.", time: "2026-10-09 08:42:00", replyIdx: 0 },
  { uid: 11, text: "Tks b nhé, vừa qua in xấp slide môn C++ rồi.", time: "2026-10-09 10:15:30", replyIdx: 1 },
  { uid: 172, text: "Trọ Minh Anh (Thôn 1 Tân Xã) trống 1 phòng 22m2 khép kín tầng 2, có điều hòa, nóng lạnh, máy giặt chung. Bạn nào cần phòng liên hệ qua xem nhé.", time: "2026-10-09 16:30:00" },
  { uid: 14, text: "Phòng bên mình giá bn 1 tháng thế ạ?", time: "2026-10-09 16:45:20", replyIdx: 3 },
  { uid: 172, text: "2tr5/tháng b nhé, điện nước công tơ riêng.", time: "2026-10-09 16:50:10", replyIdx: 4 },

  // Ngày 10/10
  { uid: 9, text: "Mọi người cho e hỏi trọ Thôn 1 hay Thôn 3 Tân Xã bên nào tiện đi xe 74 hơn ạ?", time: "2026-10-10 09:12:40" },
  { uid: 13, text: "Thôn 1 đi bộ ra điểm đón cổng trường gần hơn b nha, Thôn 3 thì yên tĩnh hơn với giá rẻ hơn tầm 200-300k.", time: "2026-10-10 09:20:00", replyIdx: 6 },
  { uid: 9, text: "Oki tks b, chắc e tìm bên Thôn 3 cho đỡ ồn.", time: "2026-10-10 09:28:15", replyIdx: 7 },
  { uid: 18, text: "E chuyển trọ dư 1 tủ lạnh mini Casper 93L còn dùng tốt, pass lại 800k ở Thôn 1 Tân Xã nhé.", time: "2026-10-10 14:18:30" },
  { uid: 22, text: "Tủ lạnh dùng lâu chưa b? Có fix thêm tiền xăng xe k e qua chở.", time: "2026-10-10 14:30:10", replyIdx: 9 },
  { uid: 18, text: "Dùng đc 8 tháng b ơi, qua lấy bớt b 50k xăng xe nha.", time: "2026-10-10 14:38:00", replyIdx: 10 },
  { uid: 22, text: "Ok b, cho e xin địa chỉ ngõ với sđt lát chiều e qua xem nhé.", time: "2026-10-10 14:45:00", replyIdx: 11 },

  // Ngày 11/10
  { uid: 26, text: "E cần tìm phòng cho 2 người ở ghép tầm 2tr5 - 3tr khu Thạch Hòa, ai biết trọ nào ổn chỉ e với.", time: "2026-10-11 08:50:20" },
  { uid: 29, text: "Mn cho e hỏi tiền điện ở Hòa Lạc các trọ thường tính bn 1 số vậy mn, e sv năm nhất sợ bị hớ.", time: "2026-10-11 15:40:10" },
  { uid: 32, text: "Đa số 3.8k - 4k/số b nha, có đồng hồ riêng từng phòng. Chỗ nào tính trên 4.5k thì nên hỏi kỹ.", time: "2026-10-11 15:52:00", replyIdx: 14 },
  { uid: 29, text: "Dạ e cảm ơn b nhiều ạ.", time: "2026-10-11 16:05:00", replyIdx: 15 },
  { uid: 30002, text: "Ai tìm bạn ở ghép nhớ điền đầy đủ phần thói quen sinh hoạt nhé, ghép trúng bạn hợp tính ở thích lắm.", time: "2026-10-11 20:10:00" },

  // Ngày 12/10
  { uid: 161, text: "Khu trọ Tân Xã còn 2 phòng studio tầng 3 ban công thoáng mát, có thang máy, khóa vân tay 24/7. Bạn nào cần xem phòng nhắn mình nhé.", time: "2026-10-12 10:25:00" },
  { uid: 36, text: "Ủa sao ô chat của bạn kia có viền tím neon phát sáng hay thế mn?", time: "2026-10-12 10:35:10" },
  { uid: 1, text: "Nạp gói VIP trên web là có á b, bấm vào nút 'Hiệu ứng VIP' ở thanh trên cùng để chọn màu.", time: "2026-10-12 10:40:00", replyIdx: 19 },
  { uid: 36, text: "À ra thế, nhìn nổi bật ghê haha.", time: "2026-10-12 10:42:15", replyIdx: 20 },
  { uid: 41, text: "Có ai pass ấm siêu tốc vs quạt cây k ạ, phòng e trống chưa có gì.", time: "2026-10-12 15:00:20" },
  { uid: 43, text: "Mình có ấm siêu tốc Sunhouse 1.8L còn mới 90k nè, ngõ 3 Tân Xã qua lấy nhé.", time: "2026-10-12 15:15:00", replyIdx: 22 },

  // Ngày 13/10
  { uid: 44, text: "Mn ơi làm tạm trú tạm vắng thì chủ trọ làm cho hay mình tự đi làm ở công an xã ạ?", time: "2026-10-13 09:35:00" },
  { uid: 163, text: "Chủ trọ làm cho b nhé, chỉ cần gửi ảnh CCCD gắn chip với thông tin là làm trên VNeID đc.", time: "2026-10-13 09:42:10", replyIdx: 24 },
  { uid: 44, text: "Dạ vâng e cảm ơn ạ.", time: "2026-10-13 09:48:00", replyIdx: 25 },
  { uid: 48, text: "Quanh ĐHQG có quán cơm nào ngon bổ rẻ nhận ship k mn, nay e lười ra ngoài quá.", time: "2026-10-13 11:20:00" },
  { uid: 50, text: "Cơm sinh viên quán Chị Nga ở ngõ 1 ship từ 2 suất b nhé, 30k 1 suất ăn no căng.", time: "2026-10-13 11:32:00", replyIdx: 27 },

  // Ngày 14/10
  { uid: 51, text: "Mn ơi cho e hỏi làm sao để bật tính năng tìm bạn ở ghép thế ạ? E cập nhật hồ sơ rồi mà k thấy hiện danh sách gợi ý.", time: "2026-10-14 09:20:00" },
  { uid: 54, text: "B vào mục 'Ghép phòng' trên menu, điền thói quen ngủ nghỉ với tầm giá là hệ thống tự tính điểm match % đó b.", time: "2026-10-14 09:32:00", replyIdx: 29 },
  { uid: 51, text: "À e thấy rồi, tks b nhiều!", time: "2026-10-14 09:38:00", replyIdx: 30 },
  { uid: 58, text: "Mình pass lại bàn gấp học bài 50k vs giá phơi inox 100k, ai lấy qua ngõ trọ Minh Anh lấy giúp mình nhé.", time: "2026-10-14 16:45:10" },
  { uid: 62, text: "Bàn gấp còn chắc chắn k b, cho e xin kích thước với.", time: "2026-10-14 17:05:00", replyIdx: 32 },
  { uid: 58, text: "Bàn 40x60 chân sắt chắc chắn b nha, b qua lấy nhắn mình nhé.", time: "2026-10-14 17:15:00", replyIdx: 33 },

  // Ngày 15/10
  { uid: 68, text: "Mn cho e hỏi nạp đẩy tin trên web quét QR ngân hàng có tự duyệt luôn k ạ?", time: "2026-10-15 09:45:00" },
  { uid: 70, text: "Tự động đó b, quét VietQR tầm 5-10 giây là tin nhảy lên đầu luôn.", time: "2026-10-15 09:55:00", replyIdx: 35 },
  { uid: 164, text: "Trọ Hoa Sữa (Thạch Hòa) còn 1 phòng tầng 2 có ban công thoáng mát, khép kín, giờ giấc tự do chìa khóa riêng.", time: "2026-10-15 16:10:00" },
  { uid: 72, text: "Bên mình tiền điện nước tính thế nào ạ?", time: "2026-10-15 16:20:00", replyIdx: 37 },
  { uid: 164, text: "Điện 3k8/số, nước 80k/người/tháng b nhé.", time: "2026-10-15 16:28:00", replyIdx: 38 },

  // Ngày 16/10
  { uid: 1, text: "Mới nạp thử gói VIP 3 có 29k mà đc mở khóa skin lăng kính hologram này mn haha.", time: "2026-10-16 09:35:00" },
  { uid: 76, text: "Nhìn viền đổi màu chuyển động hay ghê b.", time: "2026-10-16 09:42:00", replyIdx: 40 },
  { uid: 81, text: "Cho e hỏi xe bus 74 từ Mỹ Đình lên Hòa Lạc chuyến muộn nhất mấy giờ thế ạ?", time: "2026-10-16 14:10:00" },
  { uid: 84, text: "Chuyến cuối ở bến Mỹ Đình tầm 20h30 nha b, nên ra trước 20h cho yên tâm.", time: "2026-10-16 14:22:00", replyIdx: 42 },
  { uid: 81, text: "Tks b nhiều nha.", time: "2026-10-16 14:30:00", replyIdx: 43 },

  // Ngày 17/10
  { uid: 15, text: "E pass lại nồi cơm điện Cuckoo 1.8L còn bảo hành giá 300k nhé mn.", time: "2026-10-17 11:10:00" },
  { uid: 88, text: "Nồi lòng niêu hay nhôm chống dính thế b?", time: "2026-10-17 11:25:00", replyIdx: 45 },
  { uid: 15, text: "Lòng chống dính dày dặn b nha, nấu cơm dẻo ngon k dính đáy.", time: "2026-10-17 11:32:00", replyIdx: 46 },
  { uid: 88, text: "Ok b chiều e qua ngõ 1 lấy nha.", time: "2026-10-17 11:40:00", replyIdx: 47 },
  { uid: 30002, text: "Có b nào sinh viên năm 1 cần tìm trọ giá hợp lý cứ lướt bộ lọc trên web nhé, lọc theo bán kính quanh trường rất tiện.", time: "2026-10-17 15:45:00" },

  // Ngày 18/10
  { uid: 3, text: "Nay e vừa match đc bạn cùng phòng trên web, hợp gu ăn uống với giờ ngủ luôn mn ạ, đỡ mất công tìm.", time: "2026-10-18 14:15:00" },
  { uid: 96, text: "Chúc mừng b nhé, e cũng đang tìm 1 bạn nữ ở ghép khu Tân Xã đây.", time: "2026-10-18 14:25:00", replyIdx: 49 },
  { uid: 5, text: "Skin tia chớp hoàng kim này nhìn chiến ghê các bác ⚡", time: "2026-10-18 20:50:00" },

  // Ngày 19/10
  { uid: 20, text: "Đầu tuần e pass xe đạp cào cào đi học giá 350k nha, lốp mới thay tuần trước.", time: "2026-10-19 08:55:00" },
  { uid: 101, text: "Xe còn phanh ngon k b, e qua xem xe ở đâu đc?", time: "2026-10-19 09:10:00", replyIdx: 52 },
  { uid: 20, text: "Phanh ngon lành b ơi, qua cổng KTX trường FPT xem xe nhé.", time: "2026-10-19 09:18:00", replyIdx: 53 },
  { uid: 25, text: "Có phòng đơn nào dưới 2tr quanh ngõ 1 Tân Xã k mn ơi?", time: "2026-10-19 15:35:00" },
  { uid: 165, text: "Bên dãy nhà mình có phòng 1tr8 đấy b, phòng 18m2 vệ sinh riêng, có gác xép để đồ.", time: "2026-10-19 15:45:00", replyIdx: 55 },

  // Ngày 20/10
  { uid: 8, text: "Chúc các bạn nữ trên UniHome ngày 20/10 vui vẻ và xinh đẹp nhé! 💐", time: "2026-10-20 10:20:00" },
  { uid: 108, text: "Cảm ơn b nhiều nha!", time: "2026-10-20 10:35:00", replyIdx: 57 },

  // Ngày 21/10
  { uid: 30, text: "Pass lại giáo trình C++ với Cấu trúc dữ liệu cho b nào sv năm 1 IT nhé, tặng luôn b nào cần qua lấy.", time: "2026-10-21 11:50:00" },
  { uid: 112, text: "B cho e xin với ạ, e đang học kỳ này. B ở ngõ mấy thế?", time: "2026-10-21 12:05:00", replyIdx: 59 },
  { uid: 30, text: "Mình ở ngõ 2 Tân Xã, tầm sau 5h chiều b qua cổng trọ alo mình nhé.", time: "2026-10-21 12:12:00", replyIdx: 60 },
  { uid: 12, text: "Skin cực quang phương bắc này xanh ngọc nhìn dịu mắt ghê.", time: "2026-10-21 16:55:00" },

  // Ngày 22/10
  { uid: 115, text: "Mn ơi trọ ở Hòa Lạc có hay bị mất nước k ạ?", time: "2026-10-22 10:15:00" },
  { uid: 118, text: "Đa số các trọ đều có bể ngầm với téc nước lớn dự phòng trên mái nên k lo mất nước đâu b.", time: "2026-10-22 10:25:00", replyIdx: 62 },
  { uid: 35, text: "Mình pass lại gương đứng toàn thân có bánh xe di chuyển giá 120k b nào cần ib nhé.", time: "2026-10-22 14:25:00" },
  { uid: 120, text: "Gương có nứt mẻ gì k b, 100k đc k e qua lấy luôn.", time: "2026-10-22 14:38:00", replyIdx: 64 },
  { uid: 35, text: "Gương mới tinh b nha, ok 100k qua ngõ 2 lấy giúp mình.", time: "2026-10-22 14:45:00", replyIdx: 65 },

  // Ngày 23/10 (Hôm nay)
  { uid: 40, text: "Sáng sớm mát mẻ chúc mn ngày mới nhiều năng lượng nhé!", time: "2026-10-23 08:20:00" },
  { uid: 30002, text: "Bạn nào vừa đăng bài tìm phòng nhớ để số Zalo hoặc check tin nhắn trên web thường xuyên nha.", time: "2026-10-23 08:35:10" },
  { uid: 122, text: "Oki a, e đang đợi b nào nhắn lại đây hehe.", time: "2026-10-23 08:42:00", replyIdx: 68 },
  { uid: 166, text: "Trọ Tân Xã còn 1 phòng đơn khép kín giá 2tr, bạn nào cần phòng ở ngay qua ngõ 3 xem nhé.", time: "2026-10-23 08:50:00" }
];

sql += `-- 4. TẠO CÁC TIN NHẮN TÁN GẪU CỘNG ĐỒNG THỰC TẾ (09/10 - 23/10/2026)\n`;
sql += `DELETE FROM community_message_reaction;\n`;
sql += `DELETE FROM community_message;\n`;
sql += `INSERT INTO community_message (channel_id, user_id, sender_id, message_type, content, reply_to_id, reply_to_message_id, status, moderation_status, is_system_message, created_at) VALUES\n`;

const msgRows = chatMessages.map((m, idx) => {
  const repId = m.replyIdx !== undefined ? m.replyIdx + 1 : 'NULL';
  const cleanContent = m.text.replace(/'/g, "''");
  return `  (1, ${m.uid}, ${m.uid}, 'TEXT', '${cleanContent}', ${repId}, ${repId}, 'ACTIVE', 'APPROVED', 0, '${m.time}')`;
});
sql += msgRows.join(',\n') + ';\n\n';

sql += `-- 5. TẠO REACTION CẢM XÚC SINH ĐỘNG (LIKE, HEART, FIRE, LAUGH)\n`;
sql += `INSERT INTO community_message_reaction (message_id, user_id, reaction_type, created_at) VALUES\n`;
sql += `  (1, 7, 'LIKE', '2026-10-09 08:45:00'),\n`;
sql += `  (10, 22, 'LIKE', '2026-10-10 14:20:00'),\n`;
sql += `  (10, 7, 'FIRE', '2026-10-10 14:25:00'),\n`;
sql += `  (19, 36, 'WOW', '2026-10-12 10:36:00'),\n`;
sql += `  (19, 41, 'HEART', '2026-10-12 10:45:00'),\n`;
sql += `  (40, 76, 'LAUGH', '2026-10-16 09:40:00'),\n`;
sql += `  (40, 84, 'FIRE', '2026-10-16 09:45:00'),\n`;
sql += `  (49, 96, 'HEART', '2026-10-18 14:20:00'),\n`;
sql += `  (56, 108, 'HEART', '2026-10-20 10:25:00'),\n`;
sql += `  (59, 112, 'LIKE', '2026-10-21 12:08:00'),\n`;
sql += `  (67, 122, 'HEART', '2026-10-23 08:38:00');\n`;

const outPath = path.join(__dirname, '..', 'database', 'seed_30_vip_bills_and_realistic_chat.sql');
fs.writeFileSync(outPath, sql, 'utf8');
console.log('Successfully generated updated SQL: ' + outPath);
