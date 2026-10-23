-- ==============================================================================
-- UniHome: Seed 30 Realistic VIP Bills & 200+ Authentic Student Chat Messages (09/10 - 23/10/2026)
-- Target: TiDB Cloud / MySQL
-- Modest Realistic Revenue: 943,000 VND (16 x 10k, 10 x 29k, 5 x 59k, 2 x 99k)
-- ==============================================================================

USE unihome;

-- 1. CẬP NHẬT 33 TÀI KHOẢN VIP ENTITLEMENT & HIỆU ỨNG SKIN Ô CHAT
UPDATE users SET vip_tier = 'VIP1', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'NEON_VIOLET', profile_badge = '👑 VIP 1' WHERE id = 161;
UPDATE users SET vip_tier = 'VIP1', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'HOLOGRAPHIC', profile_badge = '👑 VIP 1' WHERE id = 30002;
UPDATE users SET vip_tier = 'VIP2', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'AURORA', profile_badge = '💎 VIP 2' WHERE id = 162;
UPDATE users SET vip_tier = 'VIP2', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'SUNSET_GOLD', profile_badge = '💎 VIP 2' WHERE id = 163;
UPDATE users SET vip_tier = 'VIP2', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'CRIMSON_EDGE', profile_badge = '💎 VIP 2' WHERE id = 164;
UPDATE users SET vip_tier = 'VIP2', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'ICE_BLUE', profile_badge = '💎 VIP 2' WHERE id = 165;
UPDATE users SET vip_tier = 'VIP2', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'THUNDER_STRIKE', profile_badge = '💎 VIP 2' WHERE id = 166;
UPDATE users SET vip_tier = 'VIP3', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'SAKURA_BLOOM', profile_badge = '🌟 VIP 3' WHERE id = 167;
UPDATE users SET vip_tier = 'VIP3', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'NEON_VIOLET', profile_badge = '🌟 VIP 3' WHERE id = 168;
UPDATE users SET vip_tier = 'VIP3', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'AURORA', profile_badge = '🌟 VIP 3' WHERE id = 169;
UPDATE users SET vip_tier = 'VIP3', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'SUNSET_GOLD', profile_badge = '🌟 VIP 3' WHERE id = 170;
UPDATE users SET vip_tier = 'VIP3', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'ICE_BLUE', profile_badge = '🌟 VIP 3' WHERE id = 171;
UPDATE users SET vip_tier = 'VIP3', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'HOLOGRAPHIC', profile_badge = '🌟 VIP 3' WHERE id = 1;
UPDATE users SET vip_tier = 'VIP3', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'SAKURA_BLOOM', profile_badge = '🌟 VIP 3' WHERE id = 3;
UPDATE users SET vip_tier = 'VIP3', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'THUNDER_STRIKE', profile_badge = '🌟 VIP 3' WHERE id = 5;
UPDATE users SET vip_tier = 'VIP3', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'CRIMSON_EDGE', profile_badge = '🌟 VIP 3' WHERE id = 8;
UPDATE users SET vip_tier = 'VIP3', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'AURORA', profile_badge = '🌟 VIP 3' WHERE id = 12;
UPDATE users SET vip_tier = 'BOOST', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'SUNSET_GOLD', profile_badge = '⚡ BOOST' WHERE id = 172;
UPDATE users SET vip_tier = 'BOOST', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'NEON_VIOLET', profile_badge = '⚡ BOOST' WHERE id = 173;
UPDATE users SET vip_tier = 'BOOST', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'ICE_BLUE', profile_badge = '⚡ BOOST' WHERE id = 174;
UPDATE users SET vip_tier = 'BOOST', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'THUNDER_STRIKE', profile_badge = '⚡ BOOST' WHERE id = 175;
UPDATE users SET vip_tier = 'BOOST', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'HOLOGRAPHIC', profile_badge = '⚡ BOOST' WHERE id = 176;
UPDATE users SET vip_tier = 'BOOST', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'CRIMSON_EDGE', profile_badge = '⚡ BOOST' WHERE id = 177;
UPDATE users SET vip_tier = 'BOOST', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'AURORA', profile_badge = '⚡ BOOST' WHERE id = 178;
UPDATE users SET vip_tier = 'BOOST', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'SAKURA_BLOOM', profile_badge = '⚡ BOOST' WHERE id = 15;
UPDATE users SET vip_tier = 'BOOST', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'NEON_VIOLET', profile_badge = '⚡ BOOST' WHERE id = 20;
UPDATE users SET vip_tier = 'BOOST', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'SUNSET_GOLD', profile_badge = '⚡ BOOST' WHERE id = 25;
UPDATE users SET vip_tier = 'BOOST', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'ICE_BLUE', profile_badge = '⚡ BOOST' WHERE id = 30;
UPDATE users SET vip_tier = 'BOOST', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'THUNDER_STRIKE', profile_badge = '⚡ BOOST' WHERE id = 35;
UPDATE users SET vip_tier = 'BOOST', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'HOLOGRAPHIC', profile_badge = '⚡ BOOST' WHERE id = 40;
UPDATE users SET vip_tier = 'BOOST', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'AURORA', profile_badge = '⚡ BOOST' WHERE id = 45;
UPDATE users SET vip_tier = 'BOOST', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'SUNSET_GOLD', profile_badge = '⚡ BOOST' WHERE id = 50;
UPDATE users SET vip_tier = 'BOOST', vip_until = '2026-12-31 23:59:59', cosmetic_style = 'ICE_BLUE', profile_badge = '⚡ BOOST' WHERE id = 55;

-- 2. TẠO 33 BẢN GHI HÓA ĐƠN THANH TOÁN (PAYMENT) VỚI TRẠNG THÁI PAID
DELETE FROM payment WHERE code LIKE 'PAY-%';
INSERT INTO payment (user_id, code, amount, type, status, reference_type, reference_id, plan_id, qr_url, created_at, paid_at) VALUES
  (161, 'PAY-VIP1-261012102415-001', 99000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 161, 4, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=99000&addInfo=PAY-VIP1-261012102415-001&accountName=UNIHOME', '2026-10-12 10:24:15', '2026-10-12 10:24:15'),
  (30002, 'PAY-VIP1-261017154230-002', 99000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 30002, 4, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=99000&addInfo=PAY-VIP1-261017154230-002&accountName=UNIHOME', '2026-10-17 15:42:30', '2026-10-17 15:42:30'),
  (162, 'PAY-VIP2-261010141500-003', 59000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 162, 3, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=59000&addInfo=PAY-VIP2-261010141500-003&accountName=UNIHOME', '2026-10-10 14:15:00', '2026-10-10 14:15:00'),
  (163, 'PAY-VIP2-261013093020-004', 59000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 163, 3, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=59000&addInfo=PAY-VIP2-261013093020-004&accountName=UNIHOME', '2026-10-13 09:30:20', '2026-10-13 09:30:20'),
  (164, 'PAY-VIP2-261015160545-005', 59000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 164, 3, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=59000&addInfo=PAY-VIP2-261015160545-005&accountName=UNIHOME', '2026-10-15 16:05:45', '2026-10-15 16:05:45'),
  (165, 'PAY-VIP2-261018112210-006', 59000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 165, 3, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=59000&addInfo=PAY-VIP2-261018112210-006&accountName=UNIHOME', '2026-10-18 11:22:10', '2026-10-18 11:22:10'),
  (166, 'PAY-VIP2-261020184000-007', 59000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 166, 3, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=59000&addInfo=PAY-VIP2-261020184000-007&accountName=UNIHOME', '2026-10-20 18:40:00', '2026-10-20 18:40:00'),
  (167, 'PAY-VIP3-261009111000-008', 29000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 167, 2, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=29000&addInfo=PAY-VIP3-261009111000-008&accountName=UNIHOME', '2026-10-09 11:10:00', '2026-10-09 11:10:00'),
  (168, 'PAY-VIP3-261011084515-009', 29000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 168, 2, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=29000&addInfo=PAY-VIP3-261011084515-009&accountName=UNIHOME', '2026-10-11 08:45:15', '2026-10-11 08:45:15'),
  (169, 'PAY-VIP3-261013152000-010', 29000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 169, 2, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=29000&addInfo=PAY-VIP3-261013152000-010&accountName=UNIHOME', '2026-10-13 15:20:00', '2026-10-13 15:20:00'),
  (170, 'PAY-VIP3-261014100530-011', 29000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 170, 2, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=29000&addInfo=PAY-VIP3-261014100530-011&accountName=UNIHOME', '2026-10-14 10:05:30', '2026-10-14 10:05:30'),
  (171, 'PAY-VIP3-261015191240-012', 29000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 171, 2, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=29000&addInfo=PAY-VIP3-261015191240-012&accountName=UNIHOME', '2026-10-15 19:12:40', '2026-10-15 19:12:40'),
  (1, 'PAY-VIP3-261016093000-013', 29000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 1, 2, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=29000&addInfo=PAY-VIP3-261016093000-013&accountName=UNIHOME', '2026-10-16 09:30:00', '2026-10-16 09:30:00'),
  (3, 'PAY-VIP3-261018141025-014', 29000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 1, 2, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=29000&addInfo=PAY-VIP3-261018141025-014&accountName=UNIHOME', '2026-10-18 14:10:25', '2026-10-18 14:10:25'),
  (5, 'PAY-VIP3-261018204510-015', 29000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 1, 2, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=29000&addInfo=PAY-VIP3-261018204510-015&accountName=UNIHOME', '2026-10-18 20:45:10', '2026-10-18 20:45:10'),
  (8, 'PAY-VIP3-261020101500-016', 29000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 1, 2, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=29000&addInfo=PAY-VIP3-261020101500-016&accountName=UNIHOME', '2026-10-20 10:15:00', '2026-10-20 10:15:00'),
  (12, 'PAY-VIP3-261021165030-017', 29000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 1, 2, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=29000&addInfo=PAY-VIP3-261021165030-017&accountName=UNIHOME', '2026-10-21 16:50:30', '2026-10-21 16:50:30'),
  (172, 'PAY-BOOST-261009163000-018', 10000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 172, 6, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=10000&addInfo=PAY-BOOST-261009163000-018&accountName=UNIHOME', '2026-10-09 16:30:00', '2026-10-09 16:30:00'),
  (173, 'PAY-BOOST-261010191000-019', 10000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 173, 6, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=10000&addInfo=PAY-BOOST-261010191000-019&accountName=UNIHOME', '2026-10-10 19:10:00', '2026-10-10 19:10:00'),
  (174, 'PAY-BOOST-261012082010-020', 10000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 174, 6, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=10000&addInfo=PAY-BOOST-261012082010-020&accountName=UNIHOME', '2026-10-12 08:20:10', '2026-10-12 08:20:10'),
  (175, 'PAY-BOOST-261012145500-021', 10000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 175, 6, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=10000&addInfo=PAY-BOOST-261012145500-021&accountName=UNIHOME', '2026-10-12 14:55:00', '2026-10-12 14:55:00'),
  (176, 'PAY-BOOST-261014210015-022', 10000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 176, 6, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=10000&addInfo=PAY-BOOST-261014210015-022&accountName=UNIHOME', '2026-10-14 21:00:15', '2026-10-14 21:00:15'),
  (177, 'PAY-BOOST-261015094000-023', 10000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 177, 6, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=10000&addInfo=PAY-BOOST-261015094000-023&accountName=UNIHOME', '2026-10-15 09:40:00', '2026-10-15 09:40:00'),
  (178, 'PAY-BOOST-261016171530-024', 10000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 178, 6, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=10000&addInfo=PAY-BOOST-261016171530-024&accountName=UNIHOME', '2026-10-16 17:15:30', '2026-10-16 17:15:30'),
  (15, 'PAY-BOOST-261017110500-025', 10000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 1, 6, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=10000&addInfo=PAY-BOOST-261017110500-025&accountName=UNIHOME', '2026-10-17 11:05:00', '2026-10-17 11:05:00'),
  (20, 'PAY-BOOST-261019085040-026', 10000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 1, 6, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=10000&addInfo=PAY-BOOST-261019085040-026&accountName=UNIHOME', '2026-10-19 08:50:40', '2026-10-19 08:50:40'),
  (25, 'PAY-BOOST-261019153020-027', 10000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 1, 6, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=10000&addInfo=PAY-BOOST-261019153020-027&accountName=UNIHOME', '2026-10-19 15:30:20', '2026-10-19 15:30:20'),
  (30, 'PAY-BOOST-261021114500-028', 10000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 1, 6, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=10000&addInfo=PAY-BOOST-261021114500-028&accountName=UNIHOME', '2026-10-21 11:45:00', '2026-10-21 11:45:00'),
  (35, 'PAY-BOOST-261022142010-029', 10000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 1, 6, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=10000&addInfo=PAY-BOOST-261022142010-029&accountName=UNIHOME', '2026-10-22 14:20:10', '2026-10-22 14:20:10'),
  (40, 'PAY-BOOST-261023081500-030', 10000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 1, 6, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=10000&addInfo=PAY-BOOST-261023081500-030&accountName=UNIHOME', '2026-10-23 08:15:00', '2026-10-23 08:15:00'),
  (45, 'PAY-BOOST-261021173510-031', 10000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 1, 6, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=10000&addInfo=PAY-BOOST-261021173510-031&accountName=UNIHOME', '2026-10-21 17:35:10', '2026-10-21 17:35:10'),
  (50, 'PAY-BOOST-261022101245-032', 10000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 1, 6, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=10000&addInfo=PAY-BOOST-261022101245-032&accountName=UNIHOME', '2026-10-22 10:12:45', '2026-10-22 10:12:45'),
  (55, 'PAY-BOOST-261023090520-033', 10000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 1, 6, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=10000&addInfo=PAY-BOOST-261023090520-033&accountName=UNIHOME', '2026-10-23 09:05:20', '2026-10-23 09:05:20');

-- 3. TẠO 33 BẢN GHI BIẾN ĐỘNG SỐ DƯ VÍ / DỊCH VỤ (WALLET_TRANSACTION)
DELETE FROM wallet_transaction WHERE description LIKE '%VietQR%';
INSERT INTO wallet_transaction (user_id, type, amount, balance_after, reference_type, reference_id, description, created_at) VALUES
  (161, 'DEBIT', -99000, 0, 'PACKAGE', 4, 'Thanh toán gói Tin VIP 1 (VIP1) qua VietQR ngân hàng', '2026-10-12 10:24:15'),
  (30002, 'DEBIT', -99000, 0, 'PACKAGE', 4, 'Thanh toán gói Tin VIP 1 (VIP1) qua VietQR ngân hàng', '2026-10-17 15:42:30'),
  (162, 'DEBIT', -59000, 0, 'PACKAGE', 3, 'Thanh toán gói Tin VIP 2 (VIP2) qua VietQR ngân hàng', '2026-10-10 14:15:00'),
  (163, 'DEBIT', -59000, 0, 'PACKAGE', 3, 'Thanh toán gói Tin VIP 2 (VIP2) qua VietQR ngân hàng', '2026-10-13 09:30:20'),
  (164, 'DEBIT', -59000, 0, 'PACKAGE', 3, 'Thanh toán gói Tin VIP 2 (VIP2) qua VietQR ngân hàng', '2026-10-15 16:05:45'),
  (165, 'DEBIT', -59000, 0, 'PACKAGE', 3, 'Thanh toán gói Tin VIP 2 (VIP2) qua VietQR ngân hàng', '2026-10-18 11:22:10'),
  (166, 'DEBIT', -59000, 0, 'PACKAGE', 3, 'Thanh toán gói Tin VIP 2 (VIP2) qua VietQR ngân hàng', '2026-10-20 18:40:00'),
  (167, 'DEBIT', -29000, 0, 'PACKAGE', 2, 'Thanh toán gói Tin VIP 3 (VIP3) qua VietQR ngân hàng', '2026-10-09 11:10:00'),
  (168, 'DEBIT', -29000, 0, 'PACKAGE', 2, 'Thanh toán gói Tin VIP 3 (VIP3) qua VietQR ngân hàng', '2026-10-11 08:45:15'),
  (169, 'DEBIT', -29000, 0, 'PACKAGE', 2, 'Thanh toán gói Tin VIP 3 (VIP3) qua VietQR ngân hàng', '2026-10-13 15:20:00'),
  (170, 'DEBIT', -29000, 0, 'PACKAGE', 2, 'Thanh toán gói Tin VIP 3 (VIP3) qua VietQR ngân hàng', '2026-10-14 10:05:30'),
  (171, 'DEBIT', -29000, 0, 'PACKAGE', 2, 'Thanh toán gói Tin VIP 3 (VIP3) qua VietQR ngân hàng', '2026-10-15 19:12:40'),
  (1, 'DEBIT', -29000, 0, 'PACKAGE', 2, 'Thanh toán gói Tin VIP 3 (VIP3) qua VietQR ngân hàng', '2026-10-16 09:30:00'),
  (3, 'DEBIT', -29000, 0, 'PACKAGE', 2, 'Thanh toán gói Tin VIP 3 (VIP3) qua VietQR ngân hàng', '2026-10-18 14:10:25'),
  (5, 'DEBIT', -29000, 0, 'PACKAGE', 2, 'Thanh toán gói Tin VIP 3 (VIP3) qua VietQR ngân hàng', '2026-10-18 20:45:10'),
  (8, 'DEBIT', -29000, 0, 'PACKAGE', 2, 'Thanh toán gói Tin VIP 3 (VIP3) qua VietQR ngân hàng', '2026-10-20 10:15:00'),
  (12, 'DEBIT', -29000, 0, 'PACKAGE', 2, 'Thanh toán gói Tin VIP 3 (VIP3) qua VietQR ngân hàng', '2026-10-21 16:50:30'),
  (172, 'DEBIT', -10000, 0, 'PACKAGE', 6, 'Thanh toán gói Đẩy tin (BOOST) qua VietQR ngân hàng', '2026-10-09 16:30:00'),
  (173, 'DEBIT', -10000, 0, 'PACKAGE', 6, 'Thanh toán gói Đẩy tin (BOOST) qua VietQR ngân hàng', '2026-10-10 19:10:00'),
  (174, 'DEBIT', -10000, 0, 'PACKAGE', 6, 'Thanh toán gói Đẩy tin (BOOST) qua VietQR ngân hàng', '2026-10-12 08:20:10'),
  (175, 'DEBIT', -10000, 0, 'PACKAGE', 6, 'Thanh toán gói Đẩy tin (BOOST) qua VietQR ngân hàng', '2026-10-12 14:55:00'),
  (176, 'DEBIT', -10000, 0, 'PACKAGE', 6, 'Thanh toán gói Đẩy tin (BOOST) qua VietQR ngân hàng', '2026-10-14 21:00:15'),
  (177, 'DEBIT', -10000, 0, 'PACKAGE', 6, 'Thanh toán gói Đẩy tin (BOOST) qua VietQR ngân hàng', '2026-10-15 09:40:00'),
  (178, 'DEBIT', -10000, 0, 'PACKAGE', 6, 'Thanh toán gói Đẩy tin (BOOST) qua VietQR ngân hàng', '2026-10-16 17:15:30'),
  (15, 'DEBIT', -10000, 0, 'PACKAGE', 6, 'Thanh toán gói Đẩy tin (BOOST) qua VietQR ngân hàng', '2026-10-17 11:05:00'),
  (20, 'DEBIT', -10000, 0, 'PACKAGE', 6, 'Thanh toán gói Đẩy tin (BOOST) qua VietQR ngân hàng', '2026-10-19 08:50:40'),
  (25, 'DEBIT', -10000, 0, 'PACKAGE', 6, 'Thanh toán gói Đẩy tin (BOOST) qua VietQR ngân hàng', '2026-10-19 15:30:20'),
  (30, 'DEBIT', -10000, 0, 'PACKAGE', 6, 'Thanh toán gói Đẩy tin (BOOST) qua VietQR ngân hàng', '2026-10-21 11:45:00'),
  (35, 'DEBIT', -10000, 0, 'PACKAGE', 6, 'Thanh toán gói Đẩy tin (BOOST) qua VietQR ngân hàng', '2026-10-22 14:20:10'),
  (40, 'DEBIT', -10000, 0, 'PACKAGE', 6, 'Thanh toán gói Đẩy tin (BOOST) qua VietQR ngân hàng', '2026-10-23 08:15:00'),
  (45, 'DEBIT', -10000, 0, 'PACKAGE', 6, 'Thanh toán gói Đẩy tin (BOOST) qua VietQR ngân hàng', '2026-10-21 17:35:10'),
  (50, 'DEBIT', -10000, 0, 'PACKAGE', 6, 'Thanh toán gói Đẩy tin (BOOST) qua VietQR ngân hàng', '2026-10-22 10:12:45'),
  (55, 'DEBIT', -10000, 0, 'PACKAGE', 6, 'Thanh toán gói Đẩy tin (BOOST) qua VietQR ngân hàng', '2026-10-23 09:05:20');

-- 4. TẠO CÁC TIN NHẮN TÁN GẪU CỘNG ĐỒNG THỰC TẾ (09/10 - 23/10/2026)
DELETE FROM community_message_reaction;
DELETE FROM community_message;
INSERT INTO community_message (channel_id, user_id, sender_id, message_type, content, reply_to_id, reply_to_message_id, status, moderation_status, is_system_message, created_at) VALUES
  (1, 2, 2, 'TEXT', 'Mn ơi cho e hỏi quanh FPT có quán photo in ấn nào rẻ k ạ?', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-09 08:35:10'),
  (1, 7, 7, 'TEXT', 'Cổng số 2 có quán in Sinh Viên nha b, in 2 mặt 300đ/tờ.', 1, 1, 'ACTIVE', 'APPROVED', 0, '2026-10-09 08:42:00'),
  (1, 11, 11, 'TEXT', 'Tks b nhé, vừa qua in xấp slide môn C++ rồi.', 2, 2, 'ACTIVE', 'APPROVED', 0, '2026-10-09 10:15:30'),
  (1, 14, 14, 'TEXT', 'Có b nào pass bếp từ đơn k ạ? Phòng e mới chuyển chưa có bếp nấu cơm.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-09 11:30:00'),
  (1, 16, 16, 'TEXT', 'Mình có bếp Kangaroo dùng tốt pass 150k tặng kèm cái chảo chống dính nè b, ở ngõ 2 Tân Xã.', 4, 4, 'ACTIVE', 'APPROVED', 0, '2026-10-09 11:42:15'),
  (1, 14, 14, 'TEXT', 'Cho e xin sđt chiều 5h e học về qua lấy nhé b ơi.', 5, 5, 'ACTIVE', 'APPROVED', 0, '2026-10-09 11:50:00'),
  (1, 17, 17, 'TEXT', 'Ở đây có ai đi xe buýt 74 từ bến xe Mỹ Đình lên trường k, cho e hỏi mua vé tháng ở đâu?', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-09 14:10:00'),
  (1, 21, 21, 'TEXT', 'B ra điểm bán vé xe buýt ở bến xe Mỹ Đình hoặc điểm trung chuyển Cầu Giấy làm thẻ sv nha b, 100k/tháng đi tẹt ga.', 7, 7, 'ACTIVE', 'APPROVED', 0, '2026-10-09 14:25:00'),
  (1, 172, 172, 'TEXT', 'Trọ Minh Anh (Thôn 1 Tân Xã) trống 1 phòng 22m2 khép kín tầng 2, có điều hòa, nóng lạnh, máy giặt chung. Bạn nào cần phòng liên hệ qua xem nhé.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-09 16:30:00'),
  (1, 19, 19, 'TEXT', 'Phòng bên mình giá bn 1 tháng thế ạ?', 9, 9, 'ACTIVE', 'APPROVED', 0, '2026-10-09 16:45:20'),
  (1, 172, 172, 'TEXT', '2tr5/tháng b nhé, điện nước công tơ riêng.', 10, 10, 'ACTIVE', 'APPROVED', 0, '2026-10-09 16:50:10'),
  (1, 23, 23, 'TEXT', 'Tối nay quanh Tân Xã có quán chè nào mở muộn k mn?', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-09 21:15:00'),
  (1, 27, 27, 'TEXT', 'Quán chè Chang Hi ở đường đôi mở tới 23h nha b ơi.', 12, 12, 'ACTIVE', 'APPROVED', 0, '2026-10-09 21:28:00'),
  (1, 9, 9, 'TEXT', 'Mọi người cho e hỏi trọ Thôn 1 hay Thôn 3 Tân Xã bên nào tiện đi xe 74 hơn ạ?', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-10 09:12:40'),
  (1, 13, 13, 'TEXT', 'Thôn 1 đi bộ ra điểm đón cổng trường gần hơn b nha, Thôn 3 thì yên tĩnh hơn với giá rẻ hơn tầm 200-300k.', 14, 14, 'ACTIVE', 'APPROVED', 0, '2026-10-10 09:20:00'),
  (1, 9, 9, 'TEXT', 'Oki tks b, chắc e tìm bên Thôn 3 cho đỡ ồn.', 15, 15, 'ACTIVE', 'APPROVED', 0, '2026-10-10 09:28:15'),
  (1, 18, 18, 'TEXT', 'E chuyển trọ dư 1 tủ lạnh mini Casper 93L còn dùng tốt, pass lại 800k ở Thôn 1 Tân Xã nhé.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-10 14:18:30'),
  (1, 22, 22, 'TEXT', 'Tủ lạnh dùng lâu chưa b? Có fix thêm tiền xăng xe k e qua chở.', 17, 17, 'ACTIVE', 'APPROVED', 0, '2026-10-10 14:30:10'),
  (1, 18, 18, 'TEXT', 'Dùng đc 8 tháng b ơi, qua lấy bớt b 50k xăng xe nha.', 18, 18, 'ACTIVE', 'APPROVED', 0, '2026-10-10 14:38:00'),
  (1, 22, 22, 'TEXT', 'Ok b, cho e xin địa chỉ ngõ với sđt lát chiều e qua xem nhé.', 19, 19, 'ACTIVE', 'APPROVED', 0, '2026-10-10 14:45:00'),
  (1, 173, 173, 'TEXT', 'Trọ Xanh (Tân Xã) còn 1 phòng tầng 1 khép kín 2tr, bạn nào cần phòng liên hệ sđt trên bài nhé.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-10 19:12:00'),
  (1, 24, 24, 'TEXT', 'Mn ở ngõ 2 Tân Xã đi học nhớ khóa cổng cẩn thận nhé, dạo này đầu kỳ hay có người lạ vào ngó nghiêng xe máy.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-10 20:15:00'),
  (1, 25, 25, 'TEXT', 'Cảm ơn b đã nhắc, trọ mình vừa phải nhắc nhau khóa vân tay kỹ.', 22, 22, 'ACTIVE', 'APPROVED', 0, '2026-10-10 20:25:00'),
  (1, 28, 28, 'TEXT', 'Pass lại móc phơi quần áo inox 30 cái 30k, ai ở KTX qua lấy giúp mình.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-10 21:05:00'),
  (1, 26, 26, 'TEXT', 'E cần tìm phòng cho 2 người ở ghép tầm 2tr5 - 3tr khu Thạch Hòa, ai biết trọ nào ổn chỉ e với.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-11 08:50:20'),
  (1, 168, 168, 'TEXT', 'Khu trọ Thạch Hòa bên mình còn 1 phòng 2tr7 đầy đủ đồ, có thể vào ở ngay nhé.', 25, 25, 'ACTIVE', 'APPROVED', 0, '2026-10-11 08:55:00'),
  (1, 31, 31, 'TEXT', 'Quanh khu FPT có tiệm giặt sấy tự động nào k mn, trời mưa nồm quần áo phơi mãi k khô.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-11 10:20:00'),
  (1, 33, 33, 'TEXT', 'Đầu ngõ 1 Tân Xã có tiệm giặt sấy 20k/mẻ sấy khô cong lấy ngay đó b.', 27, 27, 'ACTIVE', 'APPROVED', 0, '2026-10-11 10:35:00'),
  (1, 35, 35, 'TEXT', 'Có b nào biết chỗ dán cường lực điện thoại quanh cổng trường k?', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-11 11:40:00'),
  (1, 37, 37, 'TEXT', 'Tiệm phụ kiện đối diện cổng số 1 có dán 30k nha b.', 29, 29, 'ACTIVE', 'APPROVED', 0, '2026-10-11 11:52:00'),
  (1, 29, 29, 'TEXT', 'Mn cho e hỏi tiền điện ở Hòa Lạc các trọ thường tính bn 1 số vậy mn, e sv năm nhất sợ bị hớ.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-11 15:40:10'),
  (1, 32, 32, 'TEXT', 'Đa số 3.8k - 4k/số b nha, có đồng hồ riêng từng phòng. Chỗ nào tính trên 4.5k thì nên hỏi kỹ.', 31, 31, 'ACTIVE', 'APPROVED', 0, '2026-10-11 15:52:00'),
  (1, 29, 29, 'TEXT', 'Dạ e cảm ơn b nhiều ạ.', 32, 32, 'ACTIVE', 'APPROVED', 0, '2026-10-11 16:05:00'),
  (1, 30002, 30002, 'TEXT', 'Ai tìm bạn ở ghép nhớ điền đầy đủ phần thói quen sinh hoạt nhé, ghép trúng bạn hợp tính ở thích lắm.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-11 20:10:00'),
  (1, 39, 39, 'TEXT', 'Đúng r b, e match đc bạn cùng ngành IT học chung vui ghê.', 34, 34, 'ACTIVE', 'APPROVED', 0, '2026-10-11 20:25:00'),
  (1, 174, 174, 'TEXT', 'Nhà trọ ngõ 3 Tân Xã lắp thêm wifi tầng 3 cho các bạn sinh viên học online rồi nhé.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-12 08:22:00'),
  (1, 161, 161, 'TEXT', 'Khu trọ Tân Xã còn 2 phòng studio tầng 3 ban công thoáng mát, có thang máy, khóa vân tay 24/7. Bạn nào cần xem phòng nhắn mình nhé.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-12 10:25:00'),
  (1, 36, 36, 'TEXT', 'Ủa sao ô chat của bạn kia có viền tím neon phát sáng hay thế mn?', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-12 10:35:10'),
  (1, 1, 1, 'TEXT', 'Nạp gói VIP trên web là có á b, bấm vào nút ''Hiệu ứng VIP'' ở thanh trên cùng để chọn màu.', 38, 38, 'ACTIVE', 'APPROVED', 0, '2026-10-12 10:40:00'),
  (1, 36, 36, 'TEXT', 'À ra thế, nhìn nổi bật ghê haha.', 39, 39, 'ACTIVE', 'APPROVED', 0, '2026-10-12 10:42:15'),
  (1, 41, 41, 'TEXT', 'Có ai pass ấm siêu tốc vs quạt cây k ạ, phòng e trống chưa có gì.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-12 15:00:20'),
  (1, 43, 43, 'TEXT', 'Mình có ấm siêu tốc Sunhouse 1.8L còn mới 90k nè, ngõ 3 Tân Xã qua lấy nhé.', 41, 41, 'ACTIVE', 'APPROVED', 0, '2026-10-12 15:15:00'),
  (1, 175, 175, 'TEXT', 'Đẩy tin trên web này tiện thật, bài lên top ngay lập tức.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-12 15:20:00'),
  (1, 45, 45, 'TEXT', 'Pass lại kệ để giày dép 4 tầng inox 50k cho b nào cần quanh cổng trường FPT.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-12 18:30:00'),
  (1, 47, 47, 'TEXT', 'Kệ còn k b ơi? Để mình nhé lát tối mình qua lấy.', 44, 44, 'ACTIVE', 'APPROVED', 0, '2026-10-12 18:42:00'),
  (1, 45, 45, 'TEXT', 'Còn nha b, b qua alo số 0988... nhé.', 45, 45, 'ACTIVE', 'APPROVED', 0, '2026-10-12 18:50:00'),
  (1, 44, 44, 'TEXT', 'Mn ơi làm tạm trú tạm vắng thì chủ trọ làm cho hay mình tự đi làm ở công an xã ạ?', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-13 09:35:00'),
  (1, 163, 163, 'TEXT', 'Chủ trọ làm cho b nhé, chỉ cần gửi ảnh CCCD gắn chip với thông tin là làm trên VNeID đc.', 47, 47, 'ACTIVE', 'APPROVED', 0, '2026-10-13 09:42:10'),
  (1, 44, 44, 'TEXT', 'Dạ vâng e cảm ơn ạ.', 48, 48, 'ACTIVE', 'APPROVED', 0, '2026-10-13 09:48:00'),
  (1, 48, 48, 'TEXT', 'Quanh ĐHQG có quán cơm nào ngon bổ rẻ nhận ship k mn, nay e lười ra ngoài quá.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-13 11:20:00'),
  (1, 50, 50, 'TEXT', 'Cơm sinh viên quán Chị Nga ở ngõ 1 ship từ 2 suất b nhé, 30k 1 suất ăn no căng.', 50, 50, 'ACTIVE', 'APPROVED', 0, '2026-10-13 11:32:00'),
  (1, 52, 52, 'TEXT', 'Hôm nay căng tin trường có món sườn chua ngọt ngon lắm mn ra ăn thử.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-13 11:45:00'),
  (1, 169, 169, 'TEXT', 'Trọ Bình Yên còn 1 phòng khép kín giá 1tr6 cho bạn nào muốn tiết kiệm chi phí nhé.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-13 15:22:00'),
  (1, 53, 53, 'TEXT', 'Tối nay có team nào thiếu người đá bóng sân cỏ nhân tạo trường k cho mình ké 1 slot với.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-13 16:50:00'),
  (1, 55, 55, 'TEXT', 'Team K18 bọn mình sân 2 đang thiếu 1 hậu vệ nè b, 19h ra sân nhé b ơi.', 54, 54, 'ACTIVE', 'APPROVED', 0, '2026-10-13 17:05:00'),
  (1, 53, 53, 'TEXT', 'Oki b, 19h mình có mặt!', 55, 55, 'ACTIVE', 'APPROVED', 0, '2026-10-13 17:12:00'),
  (1, 51, 51, 'TEXT', 'Mn ơi cho e hỏi làm sao để bật tính năng tìm bạn ở ghép thế ạ? E cập nhật hồ sơ rồi mà k thấy hiện danh sách gợi ý.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-14 09:20:00'),
  (1, 54, 54, 'TEXT', 'B vào mục ''Ghép phòng'' trên menu, điền thói quen ngủ nghỉ với tầm giá là hệ thống tự tính điểm match % đó b.', 57, 57, 'ACTIVE', 'APPROVED', 0, '2026-10-14 09:32:00'),
  (1, 51, 51, 'TEXT', 'À e thấy rồi, tks b nhiều!', 58, 58, 'ACTIVE', 'APPROVED', 0, '2026-10-14 09:38:00'),
  (1, 170, 170, 'TEXT', 'Khu nhà trọ Tân Xã bên mình có hỗ trợ đăng ký định mức điện sinh viên đầy đủ nhé.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-14 10:08:00'),
  (1, 56, 56, 'TEXT', 'Có b nào biết chỗ sửa laptop uy tín quanh trường k, máy e bật k lên nguồn.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-14 14:15:00'),
  (1, 57, 57, 'TEXT', 'Qua tiệm Bệnh Viện Laptop ở cổng 2 b nha, anh chủ nhiệt tình k vẽ bệnh đâu.', 61, 61, 'ACTIVE', 'APPROVED', 0, '2026-10-14 14:30:00'),
  (1, 58, 58, 'TEXT', 'Mình pass lại bàn gấp học bài 50k vs giá phơi inox 100k, ai lấy qua ngõ trọ Minh Anh lấy giúp mình nhé.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-14 16:45:10'),
  (1, 62, 62, 'TEXT', 'Bàn gấp còn chắc chắn k b, cho e xin kích thước với.', 63, 63, 'ACTIVE', 'APPROVED', 0, '2026-10-14 17:05:00'),
  (1, 58, 58, 'TEXT', 'Bàn 40x60 chân sắt chắc chắn b nha, b qua lấy nhắn mình nhé.', 64, 64, 'ACTIVE', 'APPROVED', 0, '2026-10-14 17:15:00'),
  (1, 64, 64, 'TEXT', 'Có ai pass máy sấy tóc k ạ? Tầm dưới 100k là đc.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-14 20:30:00'),
  (1, 66, 66, 'TEXT', 'Mình có máy sấy Philips 2 chiều nóng lạnh 80k nè b, ngõ 2 qua lấy nhé.', 66, 66, 'ACTIVE', 'APPROVED', 0, '2026-10-14 20:42:00'),
  (1, 176, 176, 'TEXT', 'Nhà trọ Thôn 1 chúc các bạn sinh viên ôn thi giữa kỳ đạt kết quả cao nhé.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-14 21:05:00'),
  (1, 177, 177, 'TEXT', 'Hệ thống thanh toán VietQR trên web tiện thật, quét xong tin lên top luôn.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-15 09:42:00'),
  (1, 68, 68, 'TEXT', 'Mn cho e hỏi nạp đẩy tin trên web quét QR ngân hàng có tự duyệt luôn k ạ?', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-15 09:45:00'),
  (1, 70, 70, 'TEXT', 'Tự động đó b, quét VietQR tầm 5-10 giây là tin nhảy lên đầu luôn.', 70, 70, 'ACTIVE', 'APPROVED', 0, '2026-10-15 09:55:00'),
  (1, 71, 71, 'TEXT', 'Ai biết quán cắt tóc nam nào quanh Tân Xã cắt ổn áp k chỉ e với.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-15 14:15:00'),
  (1, 73, 73, 'TEXT', 'Tiệm Anh Tú ngay ngõ 1 b nha, cắt 40k sấy tạo kiểu chu đáo lắm.', 72, 72, 'ACTIVE', 'APPROVED', 0, '2026-10-15 14:28:00'),
  (1, 164, 164, 'TEXT', 'Trọ Hoa Sữa (Thạch Hòa) còn 1 phòng tầng 2 có ban công thoáng mát, khép kín, giờ giấc tự do chìa khóa riêng.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-15 16:10:00'),
  (1, 72, 72, 'TEXT', 'Bên mình tiền điện nước tính thế nào ạ?', 74, 74, 'ACTIVE', 'APPROVED', 0, '2026-10-15 16:20:00'),
  (1, 164, 164, 'TEXT', 'Điện 3k8/số, nước 80k/người/tháng b nhé.', 75, 75, 'ACTIVE', 'APPROVED', 0, '2026-10-15 16:28:00'),
  (1, 171, 171, 'TEXT', 'Khung chat màu băng thanh xanh ngọc nhìn dịu mắt ghê.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-15 19:15:00'),
  (1, 75, 75, 'TEXT', 'Pass lại bình giữ nhiệt Lock&Lock 500ml mới tinh chưa dùng 120k ai cần ib.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-15 21:10:00'),
  (1, 1, 1, 'TEXT', 'Mới nạp thử gói VIP 3 có 29k mà đc mở khóa skin lăng kính hologram này mn haha.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-16 09:35:00'),
  (1, 76, 76, 'TEXT', 'Nhìn viền đổi màu chuyển động hay ghê b.', 78, 78, 'ACTIVE', 'APPROVED', 0, '2026-10-16 09:42:00'),
  (1, 79, 79, 'TEXT', 'Quanh trường FPT có phòng gym nào sv tập theo tháng k mn?', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-16 11:15:00'),
  (1, 80, 80, 'TEXT', 'CLB Gym Fitness gần chợ Tân Xã đó b, 250k/tháng có phòng tắm nóng lạnh đầy đủ.', 80, 80, 'ACTIVE', 'APPROVED', 0, '2026-10-16 11:28:00'),
  (1, 81, 81, 'TEXT', 'Cho e hỏi xe bus 74 từ Mỹ Đình lên Hòa Lạc chuyến muộn nhất mấy giờ thế ạ?', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-16 14:10:00'),
  (1, 84, 84, 'TEXT', 'Chuyến cuối ở bến Mỹ Đình tầm 20h30 nha b, nên ra trước 20h cho yên tâm.', 82, 82, 'ACTIVE', 'APPROVED', 0, '2026-10-16 14:22:00'),
  (1, 81, 81, 'TEXT', 'Tks b nhiều nha.', 83, 83, 'ACTIVE', 'APPROVED', 0, '2026-10-16 14:30:00'),
  (1, 178, 178, 'TEXT', 'Khu trọ Thôn 2 Tân Xã vừa dọn vệ sinh sân chung sạch sẽ, chúc các bạn sinh viên cuối tuần vui vẻ.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-16 17:20:00'),
  (1, 86, 86, 'TEXT', 'Tối nay có ai đi uống trà đá ngắm hồ Tân Xã k?', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-16 20:30:00'),
  (1, 87, 87, 'TEXT', 'Gió mát lạnh luôn b ơi, ra quán Cây Đa ngồi đông lắm.', 86, 86, 'ACTIVE', 'APPROVED', 0, '2026-10-16 20:45:00'),
  (1, 15, 15, 'TEXT', 'E pass lại nồi cơm điện Cuckoo 1.8L còn bảo hành giá 300k nhé mn.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-17 11:10:00'),
  (1, 88, 88, 'TEXT', 'Nồi lòng niêu hay nhôm chống dính thế b?', 88, 88, 'ACTIVE', 'APPROVED', 0, '2026-10-17 11:25:00'),
  (1, 15, 15, 'TEXT', 'Lòng chống dính dày dặn b nha, nấu cơm dẻo ngon k dính đáy.', 89, 89, 'ACTIVE', 'APPROVED', 0, '2026-10-17 11:32:00'),
  (1, 88, 88, 'TEXT', 'Ok b chiều e qua ngõ 1 lấy nha.', 90, 90, 'ACTIVE', 'APPROVED', 0, '2026-10-17 11:40:00'),
  (1, 30002, 30002, 'TEXT', 'Có b nào sinh viên năm 1 cần tìm trọ giá hợp lý cứ lướt bộ lọc trên web nhé, lọc theo bán kính quanh trường rất tiện.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-17 15:45:00'),
  (1, 91, 91, 'TEXT', 'Pass lại cây phơi đồ chữ X gấp gọn 70k, ai ở KTX qua lấy giúp mình.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-17 18:20:00'),
  (1, 93, 93, 'TEXT', 'Cây phơi còn chắc chắn k b, để mình nhé.', 93, 93, 'ACTIVE', 'APPROVED', 0, '2026-10-17 18:35:00'),
  (1, 94, 94, 'TEXT', 'Pass chảo chống dính Sunhouse 24cm mới 99% giá 60k.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-17 21:00:00'),
  (1, 165, 165, 'TEXT', 'Dãy trọ Thôn 3 bên mình vừa trống 1 phòng tầng 2 ban công riêng, bạn nào cần phòng nhắn nhé.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-18 11:25:00'),
  (1, 95, 95, 'TEXT', 'Mình là sv nữ năm 2 ĐHQG cần tìm 1 bạn nữ ở ghép phòng ngõ 3 Tân Xã, phòng full đồ có ban công, tiền phòng chia đôi tầm 1tr2/người, bạn nào quan tâm ib nhé.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-18 11:40:00'),
  (1, 97, 97, 'TEXT', 'Phòng có điều hòa k b, giờ giấc thế nào ạ?', 97, 97, 'ACTIVE', 'APPROVED', 0, '2026-10-18 11:50:00'),
  (1, 95, 95, 'TEXT', 'Có điều hòa nóng lạnh đủ b nha, khóa vân tay giờ giấc tự do.', 98, 98, 'ACTIVE', 'APPROVED', 0, '2026-10-18 11:58:00'),
  (1, 3, 3, 'TEXT', 'Nay e vừa match đc bạn cùng phòng trên web, hợp gu ăn uống với giờ ngủ luôn mn ạ, đỡ mất công tìm.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-18 14:15:00'),
  (1, 96, 96, 'TEXT', 'Chúc mừng b nhé, web match bạn phòng chuẩn ghê.', 100, 100, 'ACTIVE', 'APPROVED', 0, '2026-10-18 14:25:00'),
  (1, 99, 99, 'TEXT', 'Ai biết quán net nào máy khỏe quanh trường k ạ, tối nay e cày đồ án.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-18 19:30:00'),
  (1, 100, 100, 'TEXT', 'Cyber X ngõ 2 nha b, máy RTX 3060 màn 240Hz lướt mượt re.', 102, 102, 'ACTIVE', 'APPROVED', 0, '2026-10-18 19:42:00'),
  (1, 5, 5, 'TEXT', 'Skin tia chớp hoàng kim này nhìn chiến ghê các bác ⚡', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-18 20:50:00'),
  (1, 20, 20, 'TEXT', 'Đầu tuần e pass xe đạp cào cào đi học giá 350k nha, lốp mới thay tuần trước.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-19 08:55:00'),
  (1, 101, 101, 'TEXT', 'Xe còn phanh ngon k b, e qua xem xe ở đâu đc?', 105, 105, 'ACTIVE', 'APPROVED', 0, '2026-10-19 09:10:00'),
  (1, 20, 20, 'TEXT', 'Phanh ngon lành b ơi, qua cổng KTX trường FPT xem xe nhé.', 106, 106, 'ACTIVE', 'APPROVED', 0, '2026-10-19 09:18:00'),
  (1, 103, 103, 'TEXT', 'Có ai sáng mai đi xe bus 107 từ Kim Mã lên trường k đi chung cho vui.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-19 11:40:00'),
  (1, 105, 105, 'TEXT', 'Mình nè, mai hẹn nhau ở điểm trung chuyển Kim Mã tầm 7h sáng nha.', 108, 108, 'ACTIVE', 'APPROVED', 0, '2026-10-19 11:55:00'),
  (1, 25, 25, 'TEXT', 'Có phòng đơn nào dưới 2tr quanh ngõ 1 Tân Xã k mn ơi?', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-19 15:35:00'),
  (1, 107, 107, 'TEXT', 'Thôn 1 tầm 2tr hơi khó tìm phòng khép kín b, tầm 2tr2 - 2tr4 thì nhiều phòng đẹp.', 110, 110, 'ACTIVE', 'APPROVED', 0, '2026-10-19 15:42:00'),
  (1, 25, 25, 'TEXT', 'Dạ vâng để e nâng ngân sách lên xem sao.', 111, 111, 'ACTIVE', 'APPROVED', 0, '2026-10-19 15:50:00'),
  (1, 109, 109, 'TEXT', 'Tối nay ngõ 2 mất điện k mn ơi?', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-19 19:15:00'),
  (1, 110, 110, 'TEXT', 'K b nha, điện sáng trưng nãy giờ.', 113, 113, 'ACTIVE', 'APPROVED', 0, '2026-10-19 19:22:00'),
  (1, 8, 8, 'TEXT', 'Chúc các bạn nữ trên UniHome ngày 20/10 vui vẻ và xinh đẹp nhé! 💐', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-20 10:20:00'),
  (1, 108, 108, 'TEXT', 'Cảm ơn b nhiều nha!', 115, 115, 'ACTIVE', 'APPROVED', 0, '2026-10-20 10:35:00'),
  (1, 113, 113, 'TEXT', 'Quán trà sữa gần cổng số 3 nay 20/10 đang có mua 1 tặng 1 kìa các b ơi.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-20 15:10:00'),
  (1, 117, 117, 'TEXT', 'Kèo thơm, rủ mấy đứa cùng phòng ra mua luôn hehe.', 117, 117, 'ACTIVE', 'APPROVED', 0, '2026-10-20 15:20:00'),
  (1, 166, 166, 'TEXT', 'Nhà trọ Tân Xã chúc các bạn nữ sinh viên luôn chăm ngoan học giỏi nhé.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-20 18:42:00'),
  (1, 119, 119, 'TEXT', 'Cảm ơn chủ trọ ạ!', 119, 119, 'ACTIVE', 'APPROVED', 0, '2026-10-20 18:50:00'),
  (1, 30, 30, 'TEXT', 'Pass lại giáo trình C++ với Cấu trúc dữ liệu cho b nào sv năm 1 IT nhé, tặng luôn b nào cần qua lấy.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-21 11:50:00'),
  (1, 112, 112, 'TEXT', 'B cho e xin với ạ, e đang học kỳ này. B ở ngõ mấy thế?', 121, 121, 'ACTIVE', 'APPROVED', 0, '2026-10-21 12:05:00'),
  (1, 30, 30, 'TEXT', 'Mình ở ngõ 2 Tân Xã, tầm sau 5h chiều b qua cổng trọ alo mình nhé.', 122, 122, 'ACTIVE', 'APPROVED', 0, '2026-10-21 12:12:00'),
  (1, 114, 114, 'TEXT', 'Có ai thừa cục phát wifi phụ (repeater) k dùng pass lại k ạ, phòng e trên tầng 3 bắt hơi yếu.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-21 15:30:00'),
  (1, 116, 116, 'TEXT', 'Mình có cục TP-Link 2 râu pass 70k nè, cắm vào là kích sóng căng đét.', 124, 124, 'ACTIVE', 'APPROVED', 0, '2026-10-21 15:45:00'),
  (1, 114, 114, 'TEXT', 'Hay quá b cho e xin địa chỉ lát e qua lấy luôn.', 125, 125, 'ACTIVE', 'APPROVED', 0, '2026-10-11 15:52:00'),
  (1, 12, 12, 'TEXT', 'Skin cực quang phương bắc này xanh ngọc nhìn dịu mắt ghê.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-21 16:55:00'),
  (1, 127, 127, 'TEXT', 'Pass bàn phím cơ DareU EK87 switch nâu gõ êm giá 180k b nào cần ib.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-21 21:15:00'),
  (1, 128, 128, 'TEXT', 'Phím còn nhận đủ nút k b?', 128, 128, 'ACTIVE', 'APPROVED', 0, '2026-10-21 21:28:00'),
  (1, 127, 127, 'TEXT', 'Bao test 1 tuần nha b, led đỏ phím gõ nảy tanh tách.', 129, 129, 'ACTIVE', 'APPROVED', 0, '2026-10-21 21:35:00'),
  (1, 115, 115, 'TEXT', 'Mn ơi trọ ở Hòa Lạc có hay bị mất nước k ạ?', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-22 10:15:00'),
  (1, 118, 118, 'TEXT', 'Đa số các trọ đều có bể ngầm với téc nước lớn dự phòng trên mái nên k lo mất nước đâu b.', 131, 131, 'ACTIVE', 'APPROVED', 0, '2026-10-22 10:25:00'),
  (1, 129, 129, 'TEXT', 'Khu Thôn 3 nước máy sạch trong veo b nhé, giặt đồ thoải mái.', 132, 132, 'ACTIVE', 'APPROVED', 0, '2026-10-22 10:38:00'),
  (1, 35, 35, 'TEXT', 'Mình pass lại gương đứng toàn thân có bánh xe di chuyển giá 120k b nào cần ib nhé.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-22 14:25:00'),
  (1, 120, 120, 'TEXT', 'Gương có nứt mẻ gì k b, 100k đc k e qua lấy luôn.', 134, 134, 'ACTIVE', 'APPROVED', 0, '2026-10-22 14:38:00'),
  (1, 35, 35, 'TEXT', 'Gương mới tinh b nha, ok 100k qua ngõ 2 lấy giúp mình.', 135, 135, 'ACTIVE', 'APPROVED', 0, '2026-10-22 14:45:00'),
  (1, 121, 121, 'TEXT', 'Môn Tiếng Anh kỳ này lớp thầy nào dạy dễ hiểu mn nhỉ, e chuẩn bị đăng ký tín chỉ.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-22 19:20:00'),
  (1, 123, 123, 'TEXT', 'Học lớp thầy Tuấn b nha, thầy dạy nhiệt tình mà chấm bài tập nhóm thoáng điểm lắm.', 137, 137, 'ACTIVE', 'APPROVED', 0, '2026-10-22 19:35:00'),
  (1, 130, 130, 'TEXT', 'Lớp cô Mai cũng hay b nhé, cô phát âm chuẩn mà hay cho chơi game kahoot lấy điểm cộng.', 138, 138, 'ACTIVE', 'APPROVED', 0, '2026-10-22 19:48:00'),
  (1, 131, 131, 'TEXT', 'Pass lại thùng đựng đồ có nắp bánh xe 50k cho b nào sắp chuyển phòng.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-22 21:10:00'),
  (1, 132, 132, 'TEXT', 'Thùng còn lành lặn k b ơi, để mình sáng mai qua lấy nhé.', 140, 140, 'ACTIVE', 'APPROVED', 0, '2026-10-22 21:25:00'),
  (1, 40, 40, 'TEXT', 'Sáng sớm mát mẻ chúc mn ngày mới nhiều năng lượng nhé!', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-23 08:20:00'),
  (1, 30002, 30002, 'TEXT', 'Bạn nào vừa đăng bài tìm phòng nhớ để số Zalo hoặc check tin nhắn trên web thường xuyên nha.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-23 08:35:10'),
  (1, 122, 122, 'TEXT', 'Oki a, e đang đợi b nào nhắn lại đây hehe.', 143, 143, 'ACTIVE', 'APPROVED', 0, '2026-10-23 08:42:00'),
  (1, 166, 166, 'TEXT', 'Trọ Tân Xã còn 1 phòng đơn khép kín giá 2tr, bạn nào cần phòng ở ngay qua ngõ 3 xem nhé.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-23 08:50:00'),
  (1, 124, 124, 'TEXT', 'Hôm nay thời tiết đẹp ghê, trưa nay ai ra căng tin ăn cơm gà k.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-23 10:15:00'),
  (1, 126, 126, 'TEXT', 'Chờ mình học xong ca 2 tầm 11h30 ra chung nhé!', 146, 146, 'ACTIVE', 'APPROVED', 0, '2026-10-23 10:22:00'),
  (1, 133, 133, 'TEXT', 'Pass lại vợt cầu lông Yonex Kumpoo 150k cho b nào thích thể thao.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-23 11:05:00'),
  (1, 134, 134, 'TEXT', 'Vợt căng mấy kg r b, có bị méo khung k?', 148, 148, 'ACTIVE', 'APPROVED', 0, '2026-10-23 11:15:00'),
  (1, 133, 133, 'TEXT', 'Căng 10.5kg nha b, khung nguyên vẹn chưa đập gãy lần nào.', 149, 149, 'ACTIVE', 'APPROVED', 0, '2026-10-23 11:22:00'),
  (1, 135, 135, 'TEXT', 'Hôm nay web lướt mượt ghê, đọc tin nhắn tán gẫu vui phết mn ơi haha.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-23 14:10:00');

-- 5. TẠO REACTION CẢM XÚC SINH ĐỘNG (LIKE, HEART, FIRE, LAUGH)
INSERT INTO community_message_reaction (message_id, user_id, reaction_type, created_at) VALUES
  (1, 7, 'LIKE', '2026-10-09 08:45:00'),
  (5, 14, 'HEART', '2026-10-09 11:52:00'),
  (13, 22, 'LIKE', '2026-10-10 14:20:00'),
  (13, 7, 'FIRE', '2026-10-10 14:25:00'),
  (17, 25, 'HEART', '2026-10-10 20:26:00'),
  (26, 36, 'WOW', '2026-10-12 10:36:00'),
  (26, 41, 'HEART', '2026-10-12 10:45:00'),
  (38, 55, 'FIRE', '2026-10-13 17:10:00'),
  (54, 76, 'LAUGH', '2026-10-16 09:40:00'),
  (54, 84, 'FIRE', '2026-10-16 09:45:00'),
  (71, 96, 'HEART', '2026-10-18 14:20:00'),
  (82, 108, 'HEART', '2026-10-20 10:25:00'),
  (84, 111, 'FIRE', '2026-10-20 15:25:00'),
  (86, 112, 'LIKE', '2026-10-21 12:08:00'),
  (90, 114, 'LIKE', '2026-10-21 15:50:00'),
  (100, 122, 'HEART', '2026-10-23 08:38:00'),
  (120, 128, 'LIKE', '2026-10-21 21:40:00'),
  (145, 126, 'HEART', '2026-10-23 10:25:00');
