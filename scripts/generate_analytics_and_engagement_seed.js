/**
 * Script to generate realistic Analytics Events, Favorites, Conversations,
 * Voucher Redemptions, and Ad Engagement for UniHome Admin Dashboard.
 * Outputs: database/seed_analytics_and_engagement.sql
 */
const fs = require('fs');
const path = require('path');

let sql = `-- ==============================================================================
-- UniHome: Seed Analytics Events, Favorites, Conversations, Redemptions & Ads
-- Target: TiDB Cloud / MySQL
-- Matches 200 users, 27 active listings, 943k revenue
-- ==============================================================================

USE unihome;

-- 1. CLEAN EXISTING EVENT & ENGAGEMENT DATA
DELETE FROM analytics_event WHERE id >= 1;
DELETE FROM favorite WHERE id >= 1;
DELETE FROM voucher_redemption WHERE id >= 1;
DELETE FROM listing_interest WHERE id > 3;

-- 2. UPDATE ADVERTISEMENT IMPRESSIONS & CLICKS
UPDATE advertisement SET impressions = 1420, click_count = 58, updated_at = NOW() WHERE id = 1;
UPDATE advertisement SET impressions = 980, click_count = 36, updated_at = NOW() WHERE id = 2;

-- 3. INSERT 28 FAVORITES (Quan tâm / Yêu thích)
INSERT IGNORE INTO favorite (id, listing_id, user_id, created_at) VALUES
`;

const favorites = [
  { id: 1, listingId: 1, userId: 4, date: '2026-10-09 10:15:00' },
  { id: 2, listingId: 2, userId: 5, date: '2026-10-09 14:30:00' },
  { id: 3, listingId: 3, userId: 6, date: '2026-10-10 09:20:00' },
  { id: 4, listingId: 4, userId: 7, date: '2026-10-10 16:45:00' },
  { id: 5, listingId: 5, userId: 8, date: '2026-10-11 11:10:00' },
  { id: 6, listingId: 6, userId: 9, date: '2026-10-12 08:35:00' },
  { id: 7, listingId: 7, userId: 10, date: '2026-10-12 15:20:00' },
  { id: 8, listingId: 8, userId: 11, date: '2026-10-13 10:05:00' },
  { id: 9, listingId: 9, userId: 12, date: '2026-10-13 14:40:00' },
  { id: 10, listingId: 10, userId: 14, date: '2026-10-14 09:50:00' },
  { id: 11, listingId: 11, userId: 15, date: '2026-10-14 17:15:00' },
  { id: 12, listingId: 12, userId: 16, date: '2026-10-15 11:30:00' },
  { id: 13, listingId: 13, userId: 18, date: '2026-10-15 16:25:00' },
  { id: 14, listingId: 14, userId: 20, date: '2026-10-16 10:10:00' },
  { id: 15, listingId: 15, userId: 22, date: '2026-10-16 15:45:00' },
  { id: 16, listingId: 16, userId: 25, date: '2026-10-17 09:15:00' },
  { id: 17, listingId: 17, userId: 27, date: '2026-10-17 14:30:00' },
  { id: 18, listingId: 18, userId: 30, date: '2026-10-18 10:00:00' },
  { id: 19, listingId: 19, userId: 32, date: '2026-10-18 16:50:00' },
  { id: 20, listingId: 20, userId: 35, date: '2026-10-19 11:20:00' },
  { id: 21, listingId: 21, userId: 38, date: '2026-10-19 15:35:00' },
  { id: 22, listingId: 22, userId: 40, date: '2026-10-20 09:40:00' },
  { id: 23, listingId: 23, userId: 42, date: '2026-10-20 14:15:00' },
  { id: 24, listingId: 24, userId: 45, date: '2026-10-21 10:30:00' },
  { id: 25, listingId: 25, userId: 48, date: '2026-10-21 16:10:00' },
  { id: 26, listingId: 26, userId: 50, date: '2026-10-22 11:00:00' },
  { id: 27, listingId: 27, userId: 52, date: '2026-10-22 15:20:00' },
  { id: 28, listingId: 1, userId: 55, date: '2026-10-23 09:30:00' },
];

sql += favorites.map(f => `  (${f.id}, ${f.listingId}, ${f.userId}, '${f.date}')`).join(',\n') + ';\n\n';

// 4. INSERT 16 CONVERSATIONS (Mở liên hệ / Chat)
sql += `-- 4. INSERT 16 CONVERSATIONS (Mở liên hệ / Chat trực tiếp với chủ trọ)
INSERT IGNORE INTO conversation (id, user1_id, user2_id, context_type, context_id, context_title, context_price, created_at, updated_at) VALUES
  (3, 4, 2, 'LISTING', 1, 'Studio 30m2 Full Nội Thất Tân Xã', '3.200.000 ₫/tháng', '2026-10-10 10:20:00', '2026-10-10 10:35:00'),
  (4, 5, 2, 'LISTING', 2, 'Phòng khép kín ban công thoáng Thôn 1', '2.800.000 ₫/tháng', '2026-10-11 14:15:00', '2026-10-11 14:40:00'),
  (5, 7, 3, 'LISTING', 3, 'Căn hộ mini 1N1K gần ĐH FPT', '3.500.000 ₫/tháng', '2026-10-12 09:05:00', '2026-10-12 09:30:00'),
  (6, 8, 3, 'LISTING', 4, 'Phòng gác xép cao cấp Tân Xã view hồ', '3.000.000 ₫/tháng', '2026-10-13 11:30:00', '2026-10-13 12:00:00'),
  (7, 10, 2, 'LISTING', 6, 'Studio cao cấp khu Thạch Hòa', '3.600.000 ₫/tháng', '2026-10-14 15:10:00', '2026-10-14 15:45:00'),
  (8, 11, 3, 'LISTING', 7, 'Phòng trọ sinh viên giá rẻ Tân Xã', '2.200.000 ₫/tháng', '2026-10-15 10:40:00', '2026-10-15 11:15:00'),
  (9, 14, 2, 'LISTING', 9, 'Phòng trọ khép kín đầy đủ đồ Thôn 2', '2.500.000 ₫/tháng', '2026-10-16 16:20:00', '2026-10-16 17:00:00'),
  (10, 15, 3, 'LISTING', 11, 'Studio có máy giặt riêng Tân Xã', '3.400.000 ₫/tháng', '2026-10-17 08:50:00', '2026-10-17 09:25:00'),
  (11, 16, 2, 'LISTING', 13, 'Phòng đẹp ban công thoáng mát ĐHQG', '3.100.000 ₫/tháng', '2026-10-18 14:00:00', '2026-10-18 14:30:00'),
  (12, 18, 3, 'LISTING', 15, 'Chung cư mini Tân Xã thang máy', '3.800.000 ₫/tháng', '2026-10-19 10:15:00', '2026-10-19 10:50:00'),
  (13, 20, 2, 'LISTING', 17, 'Phòng trọ yên tĩnh Bình Yên gần bus', '2.400.000 ₫/tháng', '2026-10-20 15:45:00', '2026-10-20 16:15:00'),
  (14, 22, 3, 'LISTING', 19, 'Studio nội thất gỗ sồi Tân Xã', '3.300.000 ₫/tháng', '2026-10-21 09:30:00', '2026-10-21 10:00:00'),
  (15, 25, 2, 'LISTING', 21, 'Phòng trọ mới xây 100% Thôn 1', '2.900.000 ₫/tháng', '2026-10-22 11:10:00', '2026-10-22 11:45:00'),
  (16, 27, 3, 'LISTING', 23, 'Căn hộ 1N1K full tiện nghi gần FPT', '3.700.000 ₫/tháng', '2026-10-22 16:30:00', '2026-10-22 17:00:00'),
  (17, 30, 2, 'LISTING', 25, 'Phòng trọ khép kín sạch sẽ giá tốt', '2.600.000 ₫/tháng', '2026-10-23 09:15:00', '2026-10-23 09:45:00'),
  (18, 32, 3, 'LISTING', 27, 'Studio view hồ Tân Xã cực đẹp', '3.500.000 ₫/tháng', '2026-10-23 13:20:00', '2026-10-23 14:00:00');\n\n`;

// 5. INSERT 8 LISTING_INTEREST (Hoàn tất kết nối / Thuê)
sql += `-- 5. INSERT 8 LISTING_INTEREST (Hoàn tất kết nối / Thuê thành công)
INSERT IGNORE INTO listing_interest (id, listing_id, user_id, matching_enabled, status, created_at) VALUES
  (10, 2, 7, 1, 'COMPLETED', '2026-10-12 16:00:00'),
  (11, 3, 8, 1, 'COMPLETED', '2026-10-13 14:30:00'),
  (12, 4, 9, 1, 'COMPLETED', '2026-10-15 11:00:00'),
  (13, 6, 10, 1, 'COMPLETED', '2026-10-17 10:30:00'),
  (14, 7, 11, 1, 'COMPLETED', '2026-10-18 15:00:00'),
  (15, 11, 14, 1, 'COMPLETED', '2026-10-20 16:45:00'),
  (16, 15, 15, 1, 'COMPLETED', '2026-10-21 17:30:00'),
  (17, 19, 16, 1, 'COMPLETED', '2026-10-22 14:30:00'),
  (18, 23, 18, 1, 'COMPLETED', '2026-10-23 11:00:00');\n\n`;

// 6. INSERT 8 VOUCHER REDEMPTIONS
sql += `-- 6. INSERT 8 VOUCHER REDEMPTIONS (Đã đổi 8 voucher)
INSERT IGNORE INTO voucher_redemption (
  id, user_id, voucher_id, voucher_code, redemption_token, points_spent,
  discount_type, discount_value, min_order, partner_name, voucher_title,
  expires_at, status, used_at, created_at
) VALUES
  (1, 7, 1, 'CHUYENPHONG15', 'RT-2026-OCT-001', 150, 'PERCENT', 15, 300000,
   'Dịch Vụ Chuyển Trọ Sinh Viên Thành Hưng Hòa Lạc', 'Giảm 15% Dịch Vụ Chuyển Trọ Trọn Gói',
   '2026-12-31 23:59:59', 'USED', '2026-10-13 15:30:00', '2026-10-12 10:00:00'),

  (2, 18, 1, 'CHUYENPHONG15', 'RT-2026-OCT-002', 150, 'PERCENT', 15, 300000,
   'Dịch Vụ Chuyển Trọ Sinh Viên Thành Hưng Hòa Lạc', 'Giảm 15% Dịch Vụ Chuyển Trọ Trọn Gói',
   '2026-12-31 23:59:59', 'USED', '2026-10-20 16:00:00', '2026-10-19 14:20:00'),

  (3, 4, 2, 'COMNGON10K', 'RT-2026-OCT-003', 50, 'FIXED_AMOUNT', 10000, 35000,
   'Quán Cơm Sinh Viên Chị Nga Tân Xã', 'Giảm 10.000đ Suất Cơm Trưa Sinh Viên',
   '2026-12-31 23:59:59', 'USED', '2026-10-14 12:15:00', '2026-10-14 11:30:00'),

  (4, 11, 2, 'COMNGON10K', 'RT-2026-OCT-004', 50, 'FIXED_AMOUNT', 10000, 35000,
   'Quán Cơm Sinh Viên Chị Nga Tân Xã', 'Giảm 10.000đ Suất Cơm Trưa Sinh Viên',
   '2026-12-31 23:59:59', 'USED', '2026-10-16 12:30:00', '2026-10-16 11:45:00'),

  (5, 25, 2, 'COMNGON10K', 'RT-2026-OCT-005', 50, 'FIXED_AMOUNT', 10000, 35000,
   'Quán Cơm Sinh Viên Chị Nga Tân Xã', 'Giảm 10.000đ Suất Cơm Trưa Sinh Viên',
   '2026-12-31 23:59:59', 'AVAILABLE', NULL, '2026-10-22 18:00:00'),

  (6, 9, 3, 'SAYKHOFREE', 'RT-2026-OCT-006', 80, 'FIXED_AMOUNT', 20000, 50000,
   'Giặt Sấy Tự Động 24/7 Tân Xã', 'Tặng 1 Mẻ Sấy Khô Miễn Phí',
   '2026-12-31 23:59:59', 'USED', '2026-10-17 19:00:00', '2026-10-17 16:30:00'),

  (7, 15, 3, 'SAYKHOFREE', 'RT-2026-OCT-007', 80, 'FIXED_AMOUNT', 20000, 50000,
   'Giặt Sấy Tự Động 24/7 Tân Xã', 'Tặng 1 Mẻ Sấy Khô Miễn Phí',
   '2026-12-31 23:59:59', 'USED', '2026-10-21 20:15:00', '2026-10-21 17:00:00'),

  (8, 14, 4, 'DINGTEA20', 'RT-2026-OCT-008', 100, 'PERCENT', 20, 45000,
   'DingTea Trà Sữa Hòa Lạc', 'Giảm 20% Toàn Bộ Menu Đồ Uống Size L',
   '2026-12-31 23:59:59', 'AVAILABLE', NULL, '2026-10-23 10:15:00');\n\n`;

// 7. GENERATE ANALYTICS EVENTS (PAGE_VIEW, VIEW_LISTING, SEARCH)
sql += `-- 7. INSERT ANALYTICS EVENTS (Lưu lượng truy cập & tương tác 15 ngày qua)
INSERT INTO analytics_event (
  user_id, session_id, event_type, entity_type, entity_id, metadata_json, created_at
) VALUES
`;

const events = [];
const searchQueries = [
  'phòng tân xã', 'studio hòa lạc', 'phòng trọ gần fpt', 'đhqg hà nội',
  'bình yên thạch thất', 'phòng khép kín', 'ban công thoáng', 'gác xép',
  'chung cư mini hòa lạc', 'phòng giá rẻ 2tr', 'phòng trọ có điều hòa',
  'ở ghép fpt', 'pass đồ trọ'
];

const pages = ['/', '/rooms', '/secondhand', '/community', '/roommate', '/services'];

// Daily targets across 15 days (09/10 to 23/10)
const dailyPlan = [
  { day: '2026-10-09', pv: 24, lv: 16, s: 7 },
  { day: '2026-10-10', pv: 28, lv: 20, s: 9 }, // Saturday
  { day: '2026-10-11', pv: 32, lv: 22, s: 10 }, // Sunday
  { day: '2026-10-12', pv: 26, lv: 18, s: 8 },
  { day: '2026-10-13', pv: 25, lv: 17, s: 7 },
  { day: '2026-10-14', pv: 23, lv: 15, s: 6 },
  { day: '2026-10-15', pv: 27, lv: 19, s: 8 },
  { day: '2026-10-16', pv: 29, lv: 21, s: 9 },
  { day: '2026-10-17', pv: 35, lv: 25, s: 12 }, // Saturday
  { day: '2026-10-18', pv: 34, lv: 24, s: 11 }, // Sunday
  { day: '2026-10-19', pv: 25, lv: 17, s: 7 },
  { day: '2026-10-20', pv: 26, lv: 18, s: 8 },
  { day: '2026-10-21', pv: 28, lv: 20, s: 9 },
  { day: '2026-10-22', pv: 30, lv: 21, s: 10 },
  { day: '2026-10-23', pv: 27, lv: 19, s: 8 }, // Today
];

let sessionCounter = 100;

dailyPlan.forEach((plan, dayIndex) => {
  const dayStr = plan.day;
  // Distinct sessions for this day
  const sessionsThisDay = [];
  const numSessions = 14 + (dayIndex % 5);
  for (let s = 0; s < numSessions; s++) {
    sessionCounter++;
    const sessId = `sess_202610_${sessionCounter}`;
    const userId = s < 10 ? (4 + ((dayIndex * 7 + s) % 56)) : null; // active student user or guest
    sessionsThisDay.push({ sessId, userId });
  }

  // 1. PAGE_VIEW events
  for (let p = 0; p < plan.pv; p++) {
    const sess = sessionsThisDay[p % sessionsThisDay.length];
    const hour = 7 + Math.floor((p * 15) / plan.pv);
    const minute = (p * 7) % 60;
    const timeStr = `${dayStr} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String((p * 13) % 60).padStart(2, '0')}`;
    const page = pages[p % pages.length];
    events.push({
      userId: sess.userId,
      sessionId: sess.sessId,
      eventType: 'PAGE_VIEW',
      entityType: 'PAGE',
      entityId: null,
      meta: JSON.stringify({ path: page, title: 'UniHome' }),
      createdAt: timeStr
    });
  }

  // 2. VIEW_LISTING events
  for (let v = 0; v < plan.lv; v++) {
    const sess = sessionsThisDay[(v + 2) % sessionsThisDay.length];
    const hour = 8 + Math.floor((v * 14) / plan.lv);
    const minute = (v * 11) % 60;
    const timeStr = `${dayStr} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String((v * 17) % 60).padStart(2, '0')}`;
    const listingId = 1 + ((dayIndex * 3 + v) % 27); // listings 1 to 27
    events.push({
      userId: sess.userId,
      sessionId: sess.sessId,
      eventType: 'VIEW_LISTING',
      entityType: 'LISTING',
      entityId: listingId,
      meta: JSON.stringify({ listingId, source: 'search_results' }),
      createdAt: timeStr
    });
  }

  // 3. SEARCH events
  for (let s = 0; s < plan.s; s++) {
    const sess = sessionsThisDay[(s + 4) % sessionsThisDay.length];
    const hour = 9 + Math.floor((s * 12) / plan.s);
    const minute = (s * 19) % 60;
    const timeStr = `${dayStr} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String((s * 23) % 60).padStart(2, '0')}`;
    const query = searchQueries[(dayIndex + s) % searchQueries.length];
    events.push({
      userId: sess.userId,
      sessionId: sess.sessId,
      eventType: 'SEARCH',
      entityType: 'SEARCH',
      entityId: null,
      meta: JSON.stringify({ query, resultsCount: 8 }),
      createdAt: timeStr
    });
  }
});

const eventValues = events.map(e => {
  const uVal = e.userId ? e.userId : 'NULL';
  const eIdVal = e.entityId ? e.entityId : 'NULL';
  const metaEscaped = e.meta.replace(/'/g, "\\'");
  return `  (${uVal}, '${e.sessionId}', '${e.eventType}', '${e.entityType}', ${eIdVal}, '${metaEscaped}', '${e.createdAt}')`;
});

sql += eventValues.join(',\n') + ';\n';

const outPath = path.resolve(__dirname, '..', 'database', 'seed_analytics_and_engagement.sql');
fs.writeFileSync(outPath, sql, 'utf8');
console.log(`Successfully generated SQL script with ${events.length} analytics events, 28 favorites, 16 conversations, 8 redemptions at ${outPath}`);
