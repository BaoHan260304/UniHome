-- UniHome V2 migration for MySQL 8.0.46+
-- 1) Import rrmsdb_backup_original.sql first if you are starting from the submitted project.
-- 2) Run this file once.
-- 3) Spring Boot still uses ddl-auto=update, so any future columns added in code are synchronized automatically.
USE rrmsdb;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS bio TEXT NULL,
  ADD COLUMN IF NOT EXISTS school_name VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS facebook_url VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS zalo_url VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS other_social_url VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS home_lat DOUBLE NULL,
  ADD COLUMN IF NOT EXISTS home_lng DOUBLE NULL,
  ADD COLUMN IF NOT EXISTS matching_radius_km INT DEFAULT 5,
  ADD COLUMN IF NOT EXISTS google_sub VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS created_at DATETIME NULL,
  ADD COLUMN IF NOT EXISTS last_login_at DATETIME NULL;

ALTER TABLE property
  ADD COLUMN IF NOT EXISTS latitude DOUBLE NULL,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE NULL,
  ADD COLUMN IF NOT EXISTS deposit BIGINT NULL,
  ADD COLUMN IF NOT EXISTS internet_price BIGINT NULL,
  ADD COLUMN IF NOT EXISTS parking_fee BIGINT NULL,
  ADD COLUMN IF NOT EXISTS other_fees BIGINT NULL,
  ADD COLUMN IF NOT EXISTS property_type VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS total_floors INT NULL,
  ADD COLUMN IF NOT EXISTS floor_text VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS max_occupants INT NULL,
  ADD COLUMN IF NOT EXISTS nearest_school VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS nearest_school_distance_km DOUBLE NULL,
  ADD COLUMN IF NOT EXISTS amenities TEXT NULL,
  ADD COLUMN IF NOT EXISTS rules TEXT NULL,
  ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS contact_zalo VARCHAR(500) NULL,
  ADD COLUMN IF NOT EXISTS availability VARCHAR(50) DEFAULT 'AVAILABLE',
  ADD COLUMN IF NOT EXISTS last_availability_confirmed_at DATETIME NULL,
  ADD COLUMN IF NOT EXISTS created_at DATETIME NULL,
  ADD COLUMN IF NOT EXISTS updated_at DATETIME NULL;

CREATE TABLE IF NOT EXISTS auth_session (
  token VARCHAR(255) PRIMARY KEY,
  user_id BIGINT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NULL,
  INDEX idx_auth_user(user_id),
  CONSTRAINT fk_auth_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_reset_token (
  token VARCHAR(255) PRIMARY KEY,
  user_id BIGINT NOT NULL,
  expires_at DATETIME NOT NULL,
  used BIT DEFAULT 0,
  created_at DATETIME NULL,
  INDEX idx_reset_user(user_id),
  CONSTRAINT fk_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS listing (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  property_id BIGINT NOT NULL,
  landlord_id BIGINT NOT NULL,
  title VARCHAR(255) NULL,
  status VARCHAR(50) DEFAULT 'DRAFT',
  package_tier VARCHAR(50) DEFAULT 'FREE',
  package_priority INT DEFAULT 0,
  package_until DATETIME NULL,
  boost_until DATETIME NULL,
  published_at DATETIME NULL,
  archived_at DATETIME NULL,
  last_confirmed_at DATETIME NULL,
  freshness_due_at DATETIME NULL,
  view_count BIGINT DEFAULT 0,
  interest_count BIGINT DEFAULT 0,
  revision_note TEXT NULL,
  created_at DATETIME NULL,
  updated_at DATETIME NULL,
  INDEX idx_listing_status(status),
  INDEX idx_listing_property(property_id),
  INDEX idx_listing_landlord(landlord_id),
  CONSTRAINT fk_listing_property FOREIGN KEY(property_id) REFERENCES property(id) ON DELETE CASCADE,
  CONSTRAINT fk_listing_landlord FOREIGN KEY(landlord_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS matching_profile (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL UNIQUE,
  enabled BIT DEFAULT 0,
  gender VARCHAR(50), school_name VARCHAR(255), latitude DOUBLE, longitude DOUBLE, radius_km INT DEFAULT 5,
  budget_min BIGINT, budget_max BIGINT, move_in_date VARCHAR(50),
  sleep_schedule VARCHAR(100), cleanliness_level INT, smoking VARCHAR(100), pets VARCHAR(100), cooking VARCHAR(100),
  noise_preference VARCHAR(100), guest_frequency VARCHAR(100), study_work_schedule VARCHAR(255), expense_style VARCHAR(100), communication_style VARCHAR(100),
  intro TEXT, facebook_url VARCHAR(500), zalo_url VARCHAR(500), other_social_url VARCHAR(500), updated_at DATETIME,
  CONSTRAINT fk_matching_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS listing_interest (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  listing_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  matching_enabled BIT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'INTERESTED',
  created_at DATETIME,
  UNIQUE KEY uq_interest(listing_id,user_id),
  CONSTRAINT fk_interest_listing FOREIGN KEY(listing_id) REFERENCES listing(id) ON DELETE CASCADE,
  CONSTRAINT fk_interest_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favorite (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  listing_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  created_at DATETIME,
  UNIQUE KEY uq_favorite(listing_id,user_id),
  CONSTRAINT fk_favorite_listing FOREIGN KEY(listing_id) REFERENCES listing(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorite_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS verification_record (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  property_id BIGINT, listing_id BIGINT, verifier_id BIGINT,
  level VARCHAR(50) DEFAULT 'CONTENT_REVIEWED', status VARCHAR(50) DEFAULT 'PENDING',
  room_exists BIT DEFAULT 0, location_verified BIT DEFAULT 0, media_verified BIT DEFAULT 0, price_verified BIT DEFAULT 0,
  utility_verified BIT DEFAULT 0, amenity_verified BIT DEFAULT 0, availability_verified BIT DEFAULT 0,
  note TEXT, evidence_urls LONGTEXT, verified_at DATETIME, expires_at DATETIME, created_at DATETIME,
  INDEX idx_verify_listing(listing_id)
);

CREATE TABLE IF NOT EXISTS moderation_action (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  listing_id BIGINT NOT NULL, moderator_id BIGINT NOT NULL, action VARCHAR(50), reason TEXT, created_at DATETIME,
  INDEX idx_mod_listing(listing_id)
);

CREATE TABLE IF NOT EXISTS review (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  property_id BIGINT NOT NULL, user_id BIGINT NOT NULL,
  rating INT, accuracy_rating INT, price_transparency_rating INT, utility_transparency_rating INT, landlord_communication_rating INT,
  comment TEXT, status VARCHAR(50) DEFAULT 'VISIBLE', created_at DATETIME,
  INDEX idx_review_property(property_id)
);

CREATE TABLE IF NOT EXISTS report (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  reporter_id BIGINT NOT NULL, target_type VARCHAR(50), target_id BIGINT, reason_code VARCHAR(100), details TEXT,
  status VARCHAR(50) DEFAULT 'OPEN', handled_by BIGINT NULL, resolution TEXT NULL, created_at DATETIME, resolved_at DATETIME
);

CREATE TABLE IF NOT EXISTS follow (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  follower_id BIGINT NOT NULL, following_id BIGINT NOT NULL, created_at DATETIME,
  UNIQUE KEY uq_follow(follower_id,following_id)
);

CREATE TABLE IF NOT EXISTS conversation (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user1_id BIGINT NOT NULL, user2_id BIGINT NOT NULL, context_type VARCHAR(50), context_id BIGINT DEFAULT 0,
  updated_at DATETIME, created_at DATETIME,
  INDEX idx_conv_user1(user1_id), INDEX idx_conv_user2(user2_id)
);

CREATE TABLE IF NOT EXISTS message (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  conversation_id BIGINT NOT NULL, sender_id BIGINT NOT NULL, content TEXT, type VARCHAR(50) DEFAULT 'TEXT', sent_at DATETIME, read_at DATETIME,
  INDEX idx_message_conv(conversation_id)
);

CREATE TABLE IF NOT EXISTS package_plan (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) NOT NULL UNIQUE, name VARCHAR(255), product_type VARCHAR(50) DEFAULT 'LISTING',
  price BIGINT DEFAULT 0, duration_days INT DEFAULT 15, priority INT DEFAULT 0, featured BIT DEFAULT 0, boost_credits INT DEFAULT 0,
  active BIT DEFAULT 1, benefits TEXT
);

CREATE TABLE IF NOT EXISTS payment (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL, code VARCHAR(100) UNIQUE, amount BIGINT NOT NULL, type VARCHAR(50), status VARCHAR(50) DEFAULT 'PENDING',
  reference_type VARCHAR(50), reference_id BIGINT, plan_id BIGINT NULL, qr_url TEXT, created_at DATETIME, paid_at DATETIME,
  INDEX idx_payment_user(user_id), INDEX idx_payment_status(status)
);

CREATE TABLE IF NOT EXISTS wallet_transaction (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL, type VARCHAR(50), amount BIGINT, balance_after BIGINT, reference_type VARCHAR(50), reference_id BIGINT,
  description VARCHAR(500), created_at DATETIME,
  INDEX idx_wallet_user(user_id)
);

CREATE TABLE IF NOT EXISTS service_listing (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  provider_id BIGINT NOT NULL, category VARCHAR(100), title VARCHAR(255), description TEXT, price_from BIGINT,
  province VARCHAR(255), district VARCHAR(255), latitude DOUBLE, longitude DOUBLE, phone VARCHAR(50), zalo_url VARCHAR(500), image_url LONGTEXT,
  status VARCHAR(50) DEFAULT 'PENDING_REVIEW', featured BIT DEFAULT 0, created_at DATETIME
);

CREATE TABLE IF NOT EXISTS second_hand_listing (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  seller_id BIGINT NOT NULL, title VARCHAR(255), category VARCHAR(100), price BIGINT, condition_text VARCHAR(255), province VARCHAR(255), district VARCHAR(255),
  description TEXT, image_url LONGTEXT, status VARCHAR(50) DEFAULT 'ACTIVE', expires_at DATETIME, created_at DATETIME,
  INDEX idx_second_status(status)
);

CREATE TABLE IF NOT EXISTS marketplace_comment (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  listing_id BIGINT NOT NULL, user_id BIGINT NOT NULL, parent_id BIGINT NULL, content TEXT, status VARCHAR(50) DEFAULT 'VISIBLE', created_at DATETIME
);

CREATE TABLE IF NOT EXISTS blog_post (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  author_id BIGINT, category VARCHAR(100), title VARCHAR(255), summary TEXT, content LONGTEXT, cover_image LONGTEXT, tags VARCHAR(500),
  status VARCHAR(50) DEFAULT 'DRAFT', reading_minutes INT DEFAULT 5, published_at DATETIME, updated_at DATETIME
);

CREATE TABLE IF NOT EXISTS question (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL, title VARCHAR(255), content TEXT, category VARCHAR(100), accepted_answer_id BIGINT NULL, status VARCHAR(50) DEFAULT 'VISIBLE', created_at DATETIME
);

CREATE TABLE IF NOT EXISTS answer (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  question_id BIGINT NOT NULL, user_id BIGINT NOT NULL, content TEXT, status VARCHAR(50) DEFAULT 'VISIBLE', created_at DATETIME
);

CREATE TABLE IF NOT EXISTS advertisement (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255), banner_image LONGTEXT, destination_url VARCHAR(1000), placement VARCHAR(100), status VARCHAR(50) DEFAULT 'SCHEDULED',
  start_at DATETIME, end_at DATETIME, click_count BIGINT DEFAULT 0, created_at DATETIME
);

CREATE TABLE IF NOT EXISTS expense (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(100), amount BIGINT, description VARCHAR(500), created_by BIGINT, expense_date DATE, created_at DATETIME
);

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  actor_id BIGINT, action VARCHAR(100), target_type VARCHAR(100), target_id BIGINT, details TEXT, created_at DATETIME,
  INDEX idx_audit_created(created_at)
);

-- Extend old notification table for the new notification center.
ALTER TABLE notification
  ADD COLUMN IF NOT EXISTS reference_id BIGINT NULL,
  ADD COLUMN IF NOT EXISTS reference_type VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS created_at DATETIME NULL;

-- Backward compatible listing records for the old properties.
INSERT INTO listing(property_id, landlord_id, title, status, package_tier, package_priority, published_at, last_confirmed_at, freshness_due_at, view_count, interest_count, created_at, updated_at)
SELECT p.id, p.landlord_id, p.name,
       CASE WHEN UPPER(COALESCE(p.status,''))='DRAFT' THEN 'DRAFT' ELSE 'ACTIVE' END,
       'FREE', 0, NOW(), NOW(), DATE_ADD(NOW(), INTERVAL 15 DAY), 0, 0, NOW(), NOW()
FROM property p
WHERE NOT EXISTS (SELECT 1 FROM listing l WHERE l.property_id=p.id);

-- Normalize original role names without deleting the old accounts.
UPDATE users SET role='LANDLORD' WHERE LOWER(role)='manager';
UPDATE users SET role='TENANT' WHERE LOWER(role)='tenant';
UPDATE users SET status='ACTIVE' WHERE status IS NULL OR status='';
