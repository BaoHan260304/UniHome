-- ================================================================
-- UniHome Migration 05: Platform Experience, Media, Analytics, Loyalty & Rewards
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

-- 1. Property extensions: media JSON, 360 panorama, video, verification evidence
CALL unihome_add_col_if_missing('property', 'media_json', 'LONGTEXT NULL');
CALL unihome_add_col_if_missing('property', 'verification_evidence_json', 'LONGTEXT NULL');
CALL unihome_add_col_if_missing('property', 'panorama_count', 'INT NOT NULL DEFAULT 0');
CALL unihome_add_col_if_missing('property', 'video_count', 'INT NOT NULL DEFAULT 0');

-- 2. Users extensions: terms of service consent, preferred search location, contact visibility
CALL unihome_add_col_if_missing('users', 'terms_version', 'VARCHAR(50) NULL');
CALL unihome_add_col_if_missing('users', 'terms_accepted_at', 'DATETIME NULL');
CALL unihome_add_col_if_missing('users', 'privacy_version', 'VARCHAR(50) NULL');
CALL unihome_add_col_if_missing('users', 'privacy_accepted_at', 'DATETIME NULL');
CALL unihome_add_col_if_missing('users', 'preferred_location_name', 'VARCHAR(255) NULL');
CALL unihome_add_col_if_missing('users', 'preferred_lat', 'DOUBLE NULL');
CALL unihome_add_col_if_missing('users', 'preferred_lng', 'DOUBLE NULL');
CALL unihome_add_col_if_missing('users', 'contact_visibility', 'VARCHAR(50) NOT NULL DEFAULT \'LOGIN_REQUIRED\'');

-- 3. Service Listing extensions: gallery, pricing tiers, business hours, FAQ
CALL unihome_add_col_if_missing('service_listing', 'gallery_json', 'LONGTEXT NULL');
CALL unihome_add_col_if_missing('service_listing', 'service_area', 'VARCHAR(255) NULL');
CALL unihome_add_col_if_missing('service_listing', 'pricing_tiers_json', 'TEXT NULL');
CALL unihome_add_col_if_missing('service_listing', 'add_on_fees_json', 'TEXT NULL');
CALL unihome_add_col_if_missing('service_listing', 'business_hours', 'VARCHAR(255) NULL');
CALL unihome_add_col_if_missing('service_listing', 'response_time', 'VARCHAR(100) NULL');
CALL unihome_add_col_if_missing('service_listing', 'faq_json', 'TEXT NULL');
CALL unihome_add_col_if_missing('service_listing', 'terms', 'TEXT NULL');

-- 4. Second hand listing extensions: gallery JSON
CALL unihome_add_col_if_missing('second_hand_listing', 'gallery_json', 'LONGTEXT NULL');

DROP PROCEDURE IF EXISTS unihome_add_col_if_missing;

-- 5. User Block Table
CREATE TABLE IF NOT EXISTS user_block (
  id BIGINT NOT NULL AUTO_INCREMENT,
  blocker_id BIGINT NOT NULL,
  blocked_id BIGINT NOT NULL,
  reason VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_block (blocker_id, blocked_id),
  KEY idx_user_block_blocker (blocker_id),
  KEY idx_user_block_blocked (blocked_id),
  CONSTRAINT fk_user_block_blocker FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_block_blocked FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Conversation Participant Settings (Mute, Hide for self)
CREATE TABLE IF NOT EXISTS conversation_participant_setting (
  id BIGINT NOT NULL AUTO_INCREMENT,
  conversation_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  is_muted BIT(1) NOT NULL DEFAULT b'0',
  is_hidden BIT(1) NOT NULL DEFAULT b'0',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_conv_user_setting (conversation_id, user_id),
  CONSTRAINT fk_cps_conversation FOREIGN KEY (conversation_id) REFERENCES conversation(id) ON DELETE CASCADE,
  CONSTRAINT fk_cps_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Analytics Event Tracking
CREATE TABLE IF NOT EXISTS analytics_event (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NULL,
  session_id VARCHAR(100) NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NULL,
  entity_id BIGINT NULL,
  metadata_json TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_analytics_type_date (event_type, created_at),
  KEY idx_analytics_user (user_id, created_at),
  KEY idx_analytics_entity (entity_type, entity_id),
  KEY idx_analytics_created (created_at)
) ENGINE=InnoDB;

-- 8. Loyalty: Reward Account (Points balance)
CREATE TABLE IF NOT EXISTS reward_account (
  user_id BIGINT NOT NULL,
  balance BIGINT NOT NULL DEFAULT 0,
  lifetime_earned BIGINT NOT NULL DEFAULT 0,
  lifetime_spent BIGINT NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_reward_account_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. Loyalty: Reward Transaction Ledger
CREATE TABLE IF NOT EXISTS reward_transaction (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  type VARCHAR(30) NOT NULL, -- EARN, SPEND, EXPIRE, ADJUST
  source VARCHAR(50) NOT NULL, -- DAILY_CHECKIN, TASK, VOUCHER_REDEEM, ADMIN_ADJUST
  points BIGINT NOT NULL,
  balance_after BIGINT NOT NULL DEFAULT 0,
  reference_type VARCHAR(50) NULL,
  reference_id VARCHAR(100) NULL,
  description TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_reward_tx_user (user_id, created_at),
  KEY idx_reward_tx_type (type, created_at),
  CONSTRAINT fk_reward_tx_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Loyalty: Daily Check-in with 7-day streak
CREATE TABLE IF NOT EXISTS daily_checkin (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  checkin_date DATE NOT NULL,
  streak_day INT NOT NULL DEFAULT 1,
  points_awarded BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_checkin_date (user_id, checkin_date),
  KEY idx_checkin_user (user_id, checkin_date),
  CONSTRAINT fk_checkin_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 11. Loyalty: Reward Task Definition
CREATE TABLE IF NOT EXISTS reward_task (
  task_code VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  points BIGINT NOT NULL,
  action_url VARCHAR(255) NULL,
  is_active BIT(1) NOT NULL DEFAULT b'1',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (task_code)
) ENGINE=InnoDB;

-- Seed default reward tasks
INSERT IGNORE INTO reward_task (task_code, title, description, points, action_url, is_active) VALUES
('ACCOUNT_CREATED', 'Tạo tài khoản UniHome', 'Bắt đầu hành trình thuê phòng an tâm', 100, '/profile', b'1'),
('EMAIL_VERIFIED', 'Xác thực Email', 'Xác thực hộp thư để bảo vệ tài khoản', 300, '/verify-otp', b'1'),
('PHONE_VERIFIED', 'Xác thực Số điện thoại', 'Xác thực số điện thoại để trao đổi an toàn', 300, '/verify-otp', b'1'),
('PROFILE_COMPLETED', 'Hoàn thiện Hồ sơ cá nhân', 'Điền ngày sinh, trường học, giới thiệu bản thân', 200, '/tenant/profile', b'1'),
('AVATAR_UPLOADED', 'Cập nhật Ảnh đại diện', 'Tải lên ảnh chân dung rõ nét', 100, '/tenant/profile', b'1'),
('MATCHING_PROFILE_COMPLETED', 'Thiết lập Hồ sơ Matching', 'Bật tìm bạn cùng phòng và chọn tiêu chí', 200, '/tenant/matching', b'1'),
('FIRST_ROOM_FAVORITE', 'Lưu tin phòng đầu tiên', 'Đánh dấu tin phòng trọ ưng ý', 50, '/', b'1'),
('FIRST_ROOM_INTEREST', 'Bấm quan tâm phòng trọ', 'Theo dõi phòng và ứng viên cùng thuê', 50, '/', b'1'),
('FIRST_CHAT_STARTED', 'Bắt đầu cuộc trò chuyện đầu tiên', 'Chat với chủ trọ hoặc người cùng phòng', 50, '/chat', b'1'),
('FIRST_VALID_REVIEW', 'Gửi đánh giá phòng/khu trọ', 'Đóng góp nhận xét khách quan cho cộng đồng', 100, '/', b'1');

-- 12. User Reward Task Completion & Claim Record
CREATE TABLE IF NOT EXISTS user_reward_task (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  task_code VARCHAR(50) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'CLAIMED', -- COMPLETED, CLAIMED
  claimed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_reward_task (user_id, task_code),
  KEY idx_user_task_user (user_id),
  CONSTRAINT fk_urt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_urt_task FOREIGN KEY (task_code) REFERENCES reward_task(task_code) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 13. Partner Table
CREATE TABLE IF NOT EXISTS partner (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL, -- MOVING, FOOD, COFFEE, FURNITURE, INTERNET, CLEANING, TAXI, OTHER
  logo_url TEXT NULL,
  description TEXT NULL,
  contact_email VARCHAR(255) NULL,
  contact_phone VARCHAR(50) NULL,
  website_url VARCHAR(500) NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_partner_category (category, status)
) ENGINE=InnoDB;

-- 14. Voucher Table
CREATE TABLE IF NOT EXISTS voucher (
  id BIGINT NOT NULL AUTO_INCREMENT,
  partner_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'ALL',
  description TEXT NULL,
  image_url TEXT NULL,
  discount_type VARCHAR(50) NOT NULL DEFAULT 'PERCENT', -- PERCENT, FIXED_AMOUNT
  discount_value BIGINT NOT NULL,
  min_order BIGINT NOT NULL DEFAULT 0,
  points_cost BIGINT NOT NULL DEFAULT 100,
  total_stock INT NOT NULL DEFAULT 100,
  remaining_stock INT NOT NULL DEFAULT 100,
  limit_per_user INT NOT NULL DEFAULT 1,
  start_at DATETIME NULL,
  end_at DATETIME NULL,
  terms TEXT NULL,
  usage_instructions TEXT NULL,
  code_mode VARCHAR(50) NOT NULL DEFAULT 'GENERATED_UNIQUE', -- SHARED_CODE, GENERATED_UNIQUE, PARTNER_CODE_POOL
  shared_code VARCHAR(100) NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE', -- DRAFT, SCHEDULED, ACTIVE, PAUSED, EXPIRED, ARCHIVED
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_voucher_partner (partner_id),
  KEY idx_voucher_status (status, category),
  KEY idx_voucher_cost (points_cost),
  CONSTRAINT fk_voucher_partner FOREIGN KEY (partner_id) REFERENCES partner(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 15. Partner Code Pool
CREATE TABLE IF NOT EXISTS voucher_code_pool (
  id BIGINT NOT NULL AUTO_INCREMENT,
  voucher_id BIGINT NOT NULL,
  code VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE, ASSIGNED, USED, EXPIRED
  assigned_to_user_id BIGINT NULL,
  assigned_at DATETIME NULL,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_voucher_code_pool (voucher_id, code),
  KEY idx_vcode_status (voucher_id, status),
  CONSTRAINT fk_vcode_voucher FOREIGN KEY (voucher_id) REFERENCES voucher(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 16. Voucher Redemption Table
CREATE TABLE IF NOT EXISTS voucher_redemption (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  voucher_id BIGINT NOT NULL,
  voucher_code VARCHAR(100) NOT NULL,
  redemption_token VARCHAR(100) NOT NULL,
  points_spent BIGINT NOT NULL,
  discount_type VARCHAR(50) NOT NULL,
  discount_value BIGINT NOT NULL,
  min_order BIGINT NOT NULL DEFAULT 0,
  partner_name VARCHAR(255) NULL,
  voucher_title VARCHAR(255) NULL,
  expires_at DATETIME NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE', -- AVAILABLE, USED, EXPIRED, CANCELLED
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_voucher_redemption_token (redemption_token),
  KEY idx_redemption_user (user_id, status),
  KEY idx_redemption_voucher (voucher_id),
  KEY idx_redemption_code (voucher_code),
  CONSTRAINT fk_vred_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_vred_voucher FOREIGN KEY (voucher_id) REFERENCES voucher(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Ensure reward accounts exist for all existing users
INSERT IGNORE INTO reward_account (user_id, balance, lifetime_earned, lifetime_spent)
SELECT id, 500, 500, 0 FROM users;
