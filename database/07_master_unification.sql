-- =====================================================================
-- UNiHOME DATABASE MIGRATION 07: MASTER ARCHITECTURE UNIFICATION
-- Safe migration: No DROP TABLE, preserves user data and production records.
-- =====================================================================

-- 1. Unify regular accounts to role 'USER' while preserving system admin roles
UPDATE users 
SET role = 'USER' 
WHERE role IN ('TENANT', 'LANDLORD', 'SERVICE_PROVIDER', 'tenant', 'landlord', 'manager');

-- 2. Add poster_relationship to property table if not exists
SET @exist_poster_rel = (
    SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'property' AND COLUMN_NAME = 'poster_relationship'
);
SET @sql_poster_rel = IF(@exist_poster_rel = 0,
    'ALTER TABLE property ADD COLUMN poster_relationship VARCHAR(50) NOT NULL DEFAULT ''OWNER'' AFTER post_type;',
    'SELECT ''poster_relationship column already exists'' AS msg;'
);
PREPARE stmt FROM @sql_poster_rel;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Add applies_to column to package_plan table if not exists
SET @exist_applies_to = (
    SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'package_plan' AND COLUMN_NAME = 'applies_to'
);
SET @sql_applies_to = IF(@exist_applies_to = 0,
    'ALTER TABLE package_plan ADD COLUMN applies_to VARCHAR(255) NOT NULL DEFAULT ''ROOM,SECOND_HAND,SERVICE'';',
    'SELECT ''applies_to column already exists'' AS msg;'
);
PREPARE stmt FROM @sql_applies_to;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Configure applicability for standard plans
UPDATE package_plan SET applies_to = 'ROOM,SECOND_HAND,SERVICE' WHERE code IN ('FREE', 'BOOST');
UPDATE package_plan SET applies_to = 'ROOM,SECOND_HAND' WHERE code IN ('VIP3', 'VIP2');
UPDATE package_plan SET applies_to = 'ROOM' WHERE code = 'VIP1';
UPDATE package_plan SET applies_to = 'ROOM,SERVICE' WHERE code = 'FEATURED';

-- 4. Add context fields to conversation table if not exists
SET @exist_ctx_title = (
    SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'conversation' AND COLUMN_NAME = 'context_title'
);
SET @sql_ctx_title = IF(@exist_ctx_title = 0,
    'ALTER TABLE conversation ADD COLUMN context_title VARCHAR(255) NULL, ADD COLUMN context_image LONGTEXT NULL, ADD COLUMN context_price VARCHAR(100) NULL;',
    'SELECT ''conversation context columns already exist'' AS msg;'
);
PREPARE stmt FROM @sql_ctx_title;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 5. Add message recall fields to message table if not exists
SET @exist_msg_recalled = (
    SELECT COUNT(*) FROM information_schema.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'message' AND COLUMN_NAME = 'is_recalled'
);
SET @sql_msg_recalled = IF(@exist_msg_recalled = 0,
    'ALTER TABLE message ADD COLUMN is_recalled BIT(1) NOT NULL DEFAULT b''0'', ADD COLUMN recalled_at DATETIME NULL;',
    'SELECT ''message is_recalled already exists'' AS msg;'
);
PREPARE stmt FROM @sql_msg_recalled;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 6. Generic Post Promotion table for universal promotion tracking across ROOM, SECOND_HAND, SERVICE
CREATE TABLE IF NOT EXISTS post_promotion (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    target_type VARCHAR(50) NOT NULL, -- ROOM, SECOND_HAND, SERVICE
    target_id BIGINT NOT NULL,
    owner_user_id BIGINT NOT NULL,
    plan_id BIGINT NOT NULL,
    priority INT NOT NULL DEFAULT 0,
    start_at DATETIME NOT NULL,
    end_at DATETIME NOT NULL,
    boost_until DATETIME NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_promo_target (target_type, target_id),
    INDEX idx_promo_owner (owner_user_id),
    INDEX idx_promo_status (status, end_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 7. Ensure welcome reward task exists
INSERT IGNORE INTO reward_task (task_code, title, description, points, action_url, is_active)
VALUES 
('ACCOUNT_CREATED', 'Chào mừng thành viên mới UniHome', 'Hoàn tất đăng ký tài khoản thành công để nhận điểm thưởng tân thủ', 100, '/rewards', 1)
ON DUPLICATE KEY UPDATE points = 100;
