-- ==============================================================================
-- UniHome: Seed 30 Realistic VIP Bills & 80+ Community Chat Messages (09/10 - 23/10/2026)
-- Target: TiDB Cloud / MySQL
-- Modest Realistic Revenue: 913,000 VND (13 x 10k, 10 x 29k, 5 x 59k, 2 x 99k)
-- ==============================================================================

USE unihome;

-- 1. CẬP NHẬT 30 TÀI KHOẢN VIP ENTITLEMENT & HIỆU ỨNG SKIN Ô CHAT
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

-- 2. TẠO 30 BẢN GHI HÓA ĐƠN THANH TOÁN (PAYMENT) VỚI TRẠNG THÁI PAID
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
  (40, 'PAY-BOOST-261023081500-030', 10000, 'PACKAGE_DIRECT', 'PAID', 'LISTING', 1, 6, 'https://img.vietqr.io/image/970436-0000000000-compact2.png?amount=10000&addInfo=PAY-BOOST-261023081500-030&accountName=UNIHOME', '2026-10-23 08:15:00', '2026-10-23 08:15:00');

-- 3. TẠO 30 BẢN GHI BIẾN ĐỘNG SỐ DƯ VÍ / DỊCH VỤ (WALLET_TRANSACTION)
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
  (40, 'DEBIT', -10000, 0, 'PACKAGE', 6, 'Thanh toán gói Đẩy tin (BOOST) qua VietQR ngân hàng', '2026-10-23 08:15:00');

-- 4. TẠO CÁC TIN NHẮN TÁN GẪU CỘNG ĐỒNG THỰC TẾ (09/10 - 23/10/2026)
INSERT INTO community_message (channel_id, user_id, sender_id, message_type, content, reply_to_id, reply_to_message_id, status, moderation_status, is_system_message, created_at) VALUES
  (1, 2, 2, 'TEXT', 'Chào mọi người ạ, e là sinh viên năm nhất FPT mới nhập học, rất vui đc làm quen với cả nhà!', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-09 08:35:10'),
  (1, 167, 167, 'TEXT', 'Chào cháu, chào mừng cháu lên Hòa Lạc nhé! Cần hỏi gì trọ hay xe cộ cháu cứ nhắn lên đây mọi người chỉ cho.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-09 08:42:00'),
  (1, 4, 4, 'TEXT', 'Mn ơi cho e hỏi quanh trường FPT có chỗ nào photo in ấn tài liệu rẻ k ạ?', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-09 10:15:30'),
  (1, 7, 7, 'TEXT', 'Ở ngay cổng số 2 có tiệm in Sinh Viên đó b, in 2 mặt tầm 300đ/tờ nha.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-09 10:22:15'),
  (1, 172, 172, 'TEXT', 'Bên nhà bác trọ ở Thôn 1 Tân Xã vừa có bạn sv trả phòng về quê, phòng 22m2 khép kín sạch đẹp, cháu nào chưa có phòng thì ới bác nhé.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-09 16:32:00'),
  (1, 11, 11, 'TEXT', 'Giá phòng bên bác bn 1 tháng thế ạ? Có điều hòa nóng lạnh k bác?', 5, 5, 'ACTIVE', 'APPROVED', 0, '2026-10-09 16:45:20'),
  (1, 172, 172, 'TEXT', 'Phòng 2tr6 cháu nhé, đầy đủ điều hòa, nóng lạnh, wifi riêng, có chỗ nấu ăn ban công thoáng.', 6, 6, 'ACTIVE', 'APPROVED', 0, '2026-10-09 16:50:10'),
  (1, 9, 9, 'TEXT', 'Mọi người cho e hỏi trọ Thôn 1 hay Thôn 3 Tân Xã bên nào tiện xe bus 74 hơn ạ?', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-10 09:12:40'),
  (1, 162, 162, 'TEXT', 'Thôn 1 đi bộ ra điểm đón bus ở cổng trường FPT gần hơn cháu nhé, tầm 5 phút đi bộ thôi.', 8, 8, 'ACTIVE', 'APPROVED', 0, '2026-10-10 09:20:00'),
  (1, 13, 13, 'TEXT', 'Đúng r đó b, nhưng Thôn 3 thì yên tĩnh hơn với giá phòng mềm hơn khoảng 200k - 300k so với Thôn 1.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-10 09:28:15'),
  (1, 18, 18, 'TEXT', 'E chuẩn bị chuyển trọ có thừa 1 tủ lạnh mini Casper 93L còn dùng rất tốt, pass lại 850k cho b nào cần quanh Hòa Lạc ạ.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-10 14:18:30'),
  (1, 22, 22, 'TEXT', 'Tủ lạnh dùng lâu chưa b ơi? Có bớt k ạ e ở bên ĐHQG.', 11, 11, 'ACTIVE', 'APPROVED', 0, '2026-10-10 14:30:10'),
  (1, 18, 18, 'TEXT', 'Mình mua đc 8 tháng thôi b, máy chạy êm tiết kiệm điện. B qua lấy fix b 800k tròn nhé.', 12, 12, 'ACTIVE', 'APPROVED', 0, '2026-10-10 14:38:00'),
  (1, 173, 173, 'TEXT', 'Bác chủ trọ Thôn 2 chúc các bạn sinh viên cuối tuần vui vẻ nhé!', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-10 19:15:00'),
  (1, 168, 168, 'TEXT', 'Sáng chủ nhật đẹp trời, có bạn nào đang tìm trọ quanh khu công nghệ cao k nhỉ?', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-11 08:50:20'),
  (1, 26, 26, 'TEXT', 'E cần tìm phòng cho 2 người ở ghép tầm 2tr5 - 3tr khu Thạch Hòa bác ơi.', 15, 15, 'ACTIVE', 'APPROVED', 0, '2026-10-11 09:05:00'),
  (1, 29, 29, 'TEXT', 'Mn cho e hỏi tiền điện ở Hòa Lạc các trọ thường tính bn 1 số vậy mn, e sợ bị hớ tiền điện.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-11 15:40:10'),
  (1, 32, 32, 'TEXT', 'Mặt bằng chung là 3.8k - 4k/số b nha, có đồng hồ điện riêng. Chỗ nào tính trên 4.5k thì nên hỏi kỹ.', 17, 17, 'ACTIVE', 'APPROVED', 0, '2026-10-11 15:52:00'),
  (1, 30002, 30002, 'TEXT', 'Web UniHome đợt này mượt phết mn nhỉ, lướt tìm phòng với lọc giá nhanh ghê.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-11 20:10:00'),
  (1, 174, 174, 'TEXT', 'Đầu tuần mới chúc các bạn học tập tốt. Nhà bác vừa lắp thêm camera an ninh ở nhà xe nhé các cháu yên tâm gửi xe.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-12 08:25:00'),
  (1, 161, 161, 'TEXT', 'Chủ trọ Tân Xã xin chào cả nhà, khu nhà bác 16 phòng hiện còn 2 phòng tầng 3 thoáng mát, có thang máy nhé.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-12 10:30:00'),
  (1, 36, 36, 'TEXT', 'Ôi sao ô chat của bác chủ trọ có viền tím neon phát sáng chuyển màu đẹp thế ạ??', 21, 21, 'ACTIVE', 'APPROVED', 0, '2026-10-12 10:35:10'),
  (1, 161, 161, 'TEXT', 'Bác vừa đăng ký gói VIP 1 đẩy tin trên web đấy cháu, nó tự động kích hoạt hiệu ứng khung chat VIP cho bác luôn.', 22, 22, 'ACTIVE', 'APPROVED', 0, '2026-10-12 10:40:00'),
  (1, 41, 41, 'TEXT', 'Xịn thế, nhìn nổi bật hẳn luôn á bác!', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-12 10:42:15'),
  (1, 175, 175, 'TEXT', 'Bác vừa đẩy tin xong thấy bài nhảy lên đầu trang luôn, tiện lợi ghê.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-12 15:00:20'),
  (1, 163, 163, 'TEXT', 'Bác chủ trọ Thôn 1 chào các cháu. Bác có hỗ trợ làm tạm trú tạm vắng đầy đủ cho sinh viên nhé.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-13 09:35:00'),
  (1, 44, 44, 'TEXT', 'Bác ơi thủ tục làm tạm trú cần chuẩn bị những giấy tờ gì ạ?', 26, 26, 'ACTIVE', 'APPROVED', 0, '2026-10-13 09:42:10'),
  (1, 163, 163, 'TEXT', 'Chỉ cần CCCD gắn chip với ảnh chụp hợp đồng thuê phòng là bác gửi công an xã làm trên VNeID luôn cháu nhé.', 27, 27, 'ACTIVE', 'APPROVED', 0, '2026-10-13 09:50:00'),
  (1, 48, 48, 'TEXT', 'Có b nào pass lại quạt cây lửng k ạ, phòng e đang hơi nóng.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-13 14:15:30'),
  (1, 169, 169, 'TEXT', 'Nhà bác thừa 1 cái quạt Senko cháu qua ngõ 4 bác để lại 100k cho nhé.', 29, 29, 'ACTIVE', 'APPROVED', 0, '2026-10-13 15:25:00'),
  (1, 51, 51, 'TEXT', 'Mn ơi cho e hỏi làm sao để bật tính năng tìm bạn ở ghép thế ạ? E cập nhật hồ sơ rồi mà k thấy hiện danh sách gợi ý.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-14 09:20:00'),
  (1, 54, 54, 'TEXT', 'B vào mục ''Ghép phòng'' trên thanh menu, điền thói quen ngủ nghỉ với tầm giá là hệ thống AI tự chấm điểm match % đó b.', 31, 31, 'ACTIVE', 'APPROVED', 0, '2026-10-14 09:32:00'),
  (1, 170, 170, 'TEXT', 'Khu nhà trọ bác cũng nhiều bạn ghép phòng hợp tính nhau ở vui vẻ lắm.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-14 10:10:00'),
  (1, 58, 58, 'TEXT', 'Mình pass lại bàn gấp học bài 50k vs giá phơi đồ inox 120k, ai lấy qua ngõ trọ Minh Anh lấy giúp mình nhé.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-14 16:45:10'),
  (1, 62, 62, 'TEXT', 'Bàn gấp còn mới k b ơi, cho e xin ảnh vào ib với ạ.', 34, 34, 'ACTIVE', 'APPROVED', 0, '2026-10-14 17:05:00'),
  (1, 176, 176, 'TEXT', 'Tối nay quanh FPT có quán lẩu nào ngon mn chỉ bác với, dẫn cháu gái đi ăn sinh nhật.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-14 21:05:00'),
  (1, 65, 65, 'TEXT', 'Quán lẩu nướng 88 ở đường gom đại lộ Thăng Long ngon bổ rẻ bác ơi!', 36, 36, 'ACTIVE', 'APPROVED', 0, '2026-10-14 21:12:00'),
  (1, 177, 177, 'TEXT', 'Bác vừa nạp gói Đẩy tin qua mã QR VietQR, quét xong cái là hệ thống tự duyệt ngay trong 5 giây, nhanh thật.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-15 09:45:00'),
  (1, 68, 68, 'TEXT', 'Dạ đúng r bác, web này tích hợp thanh toán tự động tiện lắm k phải đợi ai duyệt tay.', 38, 38, 'ACTIVE', 'APPROVED', 0, '2026-10-15 09:55:00'),
  (1, 164, 164, 'TEXT', 'Chào buổi chiều cả nhà, trọ bên Thạch Hòa còn 1 phòng tầng 2 có ban công lộng gió nhé.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-15 16:10:00'),
  (1, 72, 72, 'TEXT', 'Có chỗ để xe máy k chung chủ k bác?', 40, 40, 'ACTIVE', 'APPROVED', 0, '2026-10-15 16:20:00'),
  (1, 164, 164, 'TEXT', 'Có khóa vân tay cổng riêng, giờ giấc 24/24 tự do cháu nhé.', 41, 41, 'ACTIVE', 'APPROVED', 0, '2026-10-15 16:28:00'),
  (1, 171, 171, 'TEXT', 'Khung chat màu băng thanh xanh ngọc này nhìn mát mắt ghê mn.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-15 19:18:00'),
  (1, 1, 1, 'TEXT', 'Hôm nay mình nạp thử gói VIP 3 có 29k mà đc mở khóa skin lăng kính hologram xịn xò quá này mn haha!', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-16 09:35:00'),
  (1, 76, 76, 'TEXT', 'Đẹp xỉu b ơi, nhìn viền chuyển sắc chuyển động mê thật sự.', 44, 44, 'ACTIVE', 'APPROVED', 0, '2026-10-16 09:42:00'),
  (1, 81, 81, 'TEXT', 'Cho e hỏi có xe bus nào chạy thẳng từ bến xe Mỹ Đình lên trường FPT Hòa Lạc k ạ?', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-16 14:10:00'),
  (1, 84, 84, 'TEXT', 'Có xe bus 74 hoặc 107 từ Kim Mã b nha, đi tầm 45-50 phút là tới cổng trường r á.', 46, 46, 'ACTIVE', 'APPROVED', 0, '2026-10-16 14:22:00'),
  (1, 178, 178, 'TEXT', 'Xe 74 cứ 15 phút 1 chuyến nhé các cháu, đi lại rất thuận tiện.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-16 17:20:00'),
  (1, 15, 15, 'TEXT', 'E pass lại bộ nồi cơm điện Cuckoo 1.8L còn bảo hành 4 tháng giá 350k nhé mn.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-17 11:10:00'),
  (1, 88, 88, 'TEXT', 'Nồi còn nấu cơm ngon k b? Nắp có bị hở k ạ?', 49, 49, 'ACTIVE', 'APPROVED', 0, '2026-10-17 11:25:00'),
  (1, 15, 15, 'TEXT', 'Nồi ngon lành nguyên vẹn b nha, mình đổi sang nồi đa năng nên dư pass lại thui.', 50, 50, 'ACTIVE', 'APPROVED', 0, '2026-10-17 11:32:00'),
  (1, 30002, 30002, 'TEXT', 'Mọi người có ai cần tư vấn tìm phòng trọ hay ghép bạn thì cứ nhắn lên sảnh nhé, cộng đồng UniHome hỗ trợ nhiệt tình lắm!', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-17 15:45:00'),
  (1, 92, 92, 'TEXT', 'Cảm ơn a, web này hữu ích cho sinh viên tụi e thật sự.', 52, 52, 'ACTIVE', 'APPROVED', 0, '2026-10-17 16:02:00'),
  (1, 165, 165, 'TEXT', 'Chào buổi sáng chủ nhật cả nhà! Chúc các cháu sinh viên có ngày nghỉ cuối tuần vui vẻ.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-18 11:28:00'),
  (1, 3, 3, 'TEXT', 'Hôm nay e vừa match đc bạn cùng phòng trên web, gu âm nhạc với giờ ngủ y xì nhau luôn mn ạ, chuẩn đét!', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-18 14:15:00'),
  (1, 96, 96, 'TEXT', 'Chúc mừng b nha, e cũng đang đợi bạn nữ nào match đây hehe.', 55, 55, 'ACTIVE', 'APPROVED', 0, '2026-10-18 14:25:00'),
  (1, 5, 5, 'TEXT', 'Hiệu ứng tia chớp hoàng kim này nhìn chiến ghê các bác ⚡', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-18 20:50:00'),
  (1, 20, 20, 'TEXT', 'Đầu tuần mới chúc mn tràn đầy năng lượng. E pass xe đạp cào cào đi học giá 350k nha.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-19 08:55:00'),
  (1, 101, 101, 'TEXT', 'Xe còn chắc chắn k b, lốp có bị xẹp k ạ?', 58, 58, 'ACTIVE', 'APPROVED', 0, '2026-10-19 09:10:00'),
  (1, 20, 20, 'TEXT', 'Xe ngon lành b ơi, vừa thay săm mới tuần trước, qua KTX trường xem xe nhé.', 59, 59, 'ACTIVE', 'APPROVED', 0, '2026-10-19 09:18:00'),
  (1, 25, 25, 'TEXT', 'Bác chủ trọ nào còn phòng đơn dưới 2tr quanh ngõ 1 Tân Xã k ới e với ạ.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-19 15:35:00'),
  (1, 162, 162, 'TEXT', 'Dãy nhà bác có phòng 1tr8 đấy cháu, phòng 18m2 vệ sinh riêng, có gác xép để đồ.', 61, 61, 'ACTIVE', 'APPROVED', 0, '2026-10-19 15:45:00'),
  (1, 8, 8, 'TEXT', 'Nhân ngày 20/10 chúc toàn thể các bạn nữ và các cô/bác chủ trọ trên UniHome luôn xinh đẹp và hạnh phúc nhé! 💐', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-20 10:20:00'),
  (1, 166, 166, 'TEXT', 'Cảm ơn cháu nhiều nhé! Bác chủ trọ chúc các bạn nữ sinh viên luôn chăm ngoan học giỏi.', 63, 63, 'ACTIVE', 'APPROVED', 0, '2026-10-20 18:45:00'),
  (1, 108, 108, 'TEXT', 'Dễ thương quá, cảm ơn mọi người nhiều ạ!', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-20 19:00:00'),
  (1, 30, 30, 'TEXT', 'Pass lại giáo trình C++ với cấu trúc dữ liệu cho b nào sv năm 1 IT nhé, free luôn bạn nào cần qua lấy.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-21 11:50:00'),
  (1, 112, 112, 'TEXT', 'E xin với ạ! E vừa nhập học kỳ 1 đang cần sách này, tks b nhiều!', 66, 66, 'ACTIVE', 'APPROVED', 0, '2026-10-21 12:05:00'),
  (1, 12, 12, 'TEXT', 'Hiệu ứng cực quang phương bắc này lung linh ghê, nhìn khung chat sang chảnh hẳn.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-21 16:55:00'),
  (1, 115, 115, 'TEXT', 'Mn ơi trọ ở Hòa Lạc có hay bị mất nước k ạ? E thấy có bạn kêu mất nước đợt trước.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-22 10:15:00'),
  (1, 161, 161, 'TEXT', 'Bên Tân Xã các nhà trọ đều có téc nước dự phòng 3000L đến 5000L kèm máy bơm tự động nên không lo mất nước đâu cháu nhé.', 69, 69, 'ACTIVE', 'APPROVED', 0, '2026-10-22 10:25:00'),
  (1, 35, 35, 'TEXT', 'Mình pass lại gương đứng toàn thân có bánh xe di chuyển giá 120k b nào cần ib nhé.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-22 14:25:00'),
  (1, 120, 120, 'TEXT', 'Gương có bị nứt mẻ gì k b? Có fix 100k đc k ạ.', 71, 71, 'ACTIVE', 'APPROVED', 0, '2026-10-22 14:38:00'),
  (1, 35, 35, 'TEXT', 'Gương mới tinh b nha, ok fix 100k qua ngõ 2 lấy giúp mình.', 72, 72, 'ACTIVE', 'APPROVED', 0, '2026-10-22 14:45:00'),
  (1, 40, 40, 'TEXT', 'Sáng sớm mát mẻ chúc cả nhà UniHome ngày mới nhiều niềm vui!', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-23 08:20:00'),
  (1, 30002, 30002, 'TEXT', 'Sắp tới web có thêm tính năng xem video phòng 360 độ nữa đấy mn, tìm phòng khỏi lo ảnh ảo.', NULL, NULL, 'ACTIVE', 'APPROVED', 0, '2026-10-23 08:35:10'),
  (1, 125, 125, 'TEXT', 'Uầy có video 360 luôn hả a? Thế thì đỉnh quá đỡ mất công chạy đi xem từng phòng!', 75, 75, 'ACTIVE', 'APPROVED', 0, '2026-10-23 08:40:00'),
  (1, 163, 163, 'TEXT', 'Bác cũng đang nhờ quay video các phòng trọ nhà bác để đưa lên cho các cháu xem trực quan đây.', 76, 76, 'ACTIVE', 'APPROVED', 0, '2026-10-23 08:45:30');

-- 5. TẠO REACTION CẢM XÚC SINH ĐỘNG (LIKE, HEART, FIRE, LAUGH)
INSERT INTO community_message_reaction (message_id, user_id, reaction_type, created_at) VALUES
  (1, 167, 'HEART', '2026-10-09 08:45:00'),
  (1, 4, 'LIKE', '2026-10-09 08:50:00'),
  (11, 22, 'LIKE', '2026-10-10 14:20:00'),
  (11, 7, 'FIRE', '2026-10-10 14:25:00'),
  (21, 36, 'WOW', '2026-10-12 10:36:00'),
  (21, 41, 'HEART', '2026-10-12 10:45:00'),
  (43, 76, 'LAUGH', '2026-10-16 09:40:00'),
  (43, 84, 'FIRE', '2026-10-16 09:45:00'),
  (54, 96, 'HEART', '2026-10-18 14:20:00'),
  (63, 108, 'HEART', '2026-10-20 10:25:00'),
  (63, 166, 'LIKE', '2026-10-20 18:46:00'),
  (74, 125, 'FIRE', '2026-10-23 08:38:00'),
  (75, 125, 'HEART', '2026-10-23 08:42:00');
