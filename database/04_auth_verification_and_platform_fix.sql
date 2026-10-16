-- ================================================================
-- UniHome Migration 04: Auth Verification, Social Login, Ads & Platform Fix
-- MySQL 8.0+ / 9.0+
-- Idempotent and safe migration for existing rrmsdb database
-- ================================================================

USE rrmsdb;
SET NAMES utf8mb4;

DROP PROCEDURE IF EXISTS unihome_add_col_if_missing;
DELIMITER ;;
CREATE PROCEDURE unihome_add_col_if_missing(IN t_name VARCHAR(64), IN c_name VARCHAR(64), IN c_def TEXT)
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = DATABASE() AND table_name = t_name AND column_name = c_name
  ) THEN
    SET @s = CONCAT('ALTER TABLE ', t_name, ' ADD COLUMN ', c_name, ' ', c_def);
    PREPARE stmt FROM @s;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
  END IF;
END;;
DELIMITER ;

-- 1. Extend users table for email & phone verification and social logins
CALL unihome_add_col_if_missing('users', 'email_verified', 'BIT(1) NOT NULL DEFAULT b\'0\'');
CALL unihome_add_col_if_missing('users', 'email_verified_at', 'DATETIME NULL');
CALL unihome_add_col_if_missing('users', 'phone_verified', 'BIT(1) NOT NULL DEFAULT b\'0\'');
CALL unihome_add_col_if_missing('users', 'phone_verified_at', 'DATETIME NULL');
CALL unihome_add_col_if_missing('users', 'auth_provider', 'VARCHAR(50) NOT NULL DEFAULT \'LOCAL\'');
CALL unihome_add_col_if_missing('users', 'facebook_sub', 'VARCHAR(255) NULL');

-- Create unique index on facebook_sub if not existing
SET @exist_fb_idx := (
  SELECT COUNT(1) FROM information_schema.statistics
  WHERE table_schema = DATABASE() AND table_name = 'users' AND index_name = 'uq_users_facebook_sub'
);
SET @sql_fb_idx := IF(@exist_fb_idx = 0, 'ALTER TABLE users ADD UNIQUE KEY uq_users_facebook_sub (facebook_sub);', 'SELECT 1;');
PREPARE stmt_fb FROM @sql_fb_idx;
EXECUTE stmt_fb;
DEALLOCATE PREPARE stmt_fb;

-- Mark existing active demo accounts as verified so existing test users work seamlessly
UPDATE users
SET email_verified = b'1',
    email_verified_at = IFNULL(email_verified_at, NOW()),
    phone_verified = b'1',
    phone_verified_at = IFNULL(phone_verified_at, NOW()),
    auth_provider = IF(google_sub IS NOT NULL, 'GOOGLE', 'LOCAL')
WHERE status = 'ACTIVE' OR email LIKE '%@unihome.vn';

-- 2. Create verification_code table for secure OTP management
CREATE TABLE IF NOT EXISTS verification_code (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  channel VARCHAR(20) NOT NULL, -- EMAIL, PHONE
  purpose VARCHAR(50) NOT NULL, -- REGISTER, RESET_PASSWORD, CHANGE_PHONE, CHANGE_EMAIL
  code_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_verify_code_lookup (user_id, channel, purpose, expires_at),
  CONSTRAINT fk_verify_code_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Extend advertisement table for professional ad campaigns
CALL unihome_add_col_if_missing('advertisement', 'campaign_name', 'VARCHAR(255) NULL');
CALL unihome_add_col_if_missing('advertisement', 'advertiser_name', 'VARCHAR(255) NULL');
CALL unihome_add_col_if_missing('advertisement', 'description', 'TEXT NULL');
CALL unihome_add_col_if_missing('advertisement', 'target_type', 'VARCHAR(50) NOT NULL DEFAULT \'EXTERNAL\'');
CALL unihome_add_col_if_missing('advertisement', 'priority', 'INT NOT NULL DEFAULT 0');
CALL unihome_add_col_if_missing('advertisement', 'impressions', 'BIGINT NOT NULL DEFAULT 0');
CALL unihome_add_col_if_missing('advertisement', 'created_by', 'BIGINT NULL');
CALL unihome_add_col_if_missing('advertisement', 'note', 'TEXT NULL');
CALL unihome_add_col_if_missing('advertisement', 'updated_at', 'DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');

DROP PROCEDURE IF EXISTS unihome_add_col_if_missing;

-- Seed default campaign names for existing demo ads if needed
UPDATE advertisement
SET campaign_name = IFNULL(campaign_name, title),
    advertiser_name = IFNULL(advertiser_name, 'Đối tác UniHome'),
    target_type = IFNULL(target_type, 'EXTERNAL'),
    status = 'ACTIVE'
WHERE status = 'SCHEDULED' AND (start_at IS NULL OR start_at <= NOW());
