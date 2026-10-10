-- ========================================================
-- Migration 10: Fix PackagePlan Schema and Descriptions
-- Idempotent, safe migration for rrmsdb
-- ========================================================

SET @dbname = DATABASE();

-- 1. Ensure applies_to exists
SET @col_applies_to = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'package_plan' AND COLUMN_NAME = 'applies_to'
);
SET @sql_applies_to = IF(@col_applies_to = 0,
    'ALTER TABLE package_plan ADD COLUMN applies_to VARCHAR(255) NOT NULL DEFAULT ''ROOM,SECOND_HAND,SERVICE'';',
    'SELECT ''Column applies_to already exists'' AS msg;'
);
PREPARE stmt_applies_to FROM @sql_applies_to;
EXECUTE stmt_applies_to;
DEALLOCATE PREPARE stmt_applies_to;

-- 2. Ensure description exists
SET @col_desc = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'package_plan' AND COLUMN_NAME = 'description'
);
SET @sql_desc = IF(@col_desc = 0,
    'ALTER TABLE package_plan ADD COLUMN description TEXT NULL;',
    'SELECT ''Column description already exists'' AS msg;'
);
PREPARE stmt_desc FROM @sql_desc;
EXECUTE stmt_desc;
DEALLOCATE PREPARE stmt_desc;

-- 3. Ensure product_type exists
SET @col_pt = (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = @dbname AND TABLE_NAME = 'package_plan' AND COLUMN_NAME = 'product_type'
);
SET @sql_pt = IF(@col_pt = 0,
    'ALTER TABLE package_plan ADD COLUMN product_type VARCHAR(50) NOT NULL DEFAULT ''LISTING'';',
    'SELECT ''Column product_type already exists'' AS msg;'
);
PREPARE stmt_pt FROM @sql_pt;
EXECUTE stmt_pt;
DEALLOCATE PREPARE stmt_pt;

-- 4. Update descriptions for existing plans
UPDATE package_plan 
SET description = 'Đăng tin miễn phí tiêu chuẩn, hiển thị trong danh sách tìm kiếm thông thường.' 
WHERE code = 'FREE';

UPDATE package_plan 
SET description = 'Tin VIP 3 ưu tiên hiển thị trên tin thường, gắn nhãn VIP đồng, tăng 3x lượt xem.' 
WHERE code = 'VIP3';

UPDATE package_plan 
SET description = 'Tin VIP 2 hiển thị vị trí nổi bật, gắn nhãn VIP bạc, tặng kèm 1 lượt đẩy tin, tăng 5x tiếp cận.' 
WHERE code = 'VIP2';

UPDATE package_plan 
SET description = 'Tin VIP 1 hiển thị đầu trang chuyên mục, nhãn VIP vàng nổi bật, tặng 3 lượt đẩy tin, tăng 10x tương tác.' 
WHERE code = 'VIP1';

UPDATE package_plan 
SET description = 'Gói nổi bật trang chủ và đầu mọi danh mục, huy hiệu kim cương, ưu tiên hiển thị tối đa.' 
WHERE code = 'FEATURED';

UPDATE package_plan 
SET description = 'Đẩy tin ngay lập tức lên đầu danh sách tìm kiếm như tin vừa mới đăng.' 
WHERE code = 'BOOST';
