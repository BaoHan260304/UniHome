-- ================================================================
-- UniHome - Full database schema (clean install)
-- MySQL 8.0+
-- This schema matches the UniHome-Complete backend and the final
-- business model: moderated room listings, verification, matching,
-- chat, wallet/QR payments, services, second-hand marketplace,
-- blog/Q&A, advertising and administration/audit.
-- ================================================================

CREATE DATABASE IF NOT EXISTS rrmsdb
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
USE rrmsdb;
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------- ACCOUNT ------------------------------
CREATE TABLE IF NOT EXISTS users (
  id BIGINT NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(255) NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'TENANT',
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  phone VARCHAR(50) NULL,
  avatar_url LONGTEXT NULL,
  bio TEXT NULL,
  dob VARCHAR(50) NULL,
  gender VARCHAR(50) NULL,
  school_name VARCHAR(255) NULL,
  facebook_url VARCHAR(500) NULL,
  zalo_url VARCHAR(500) NULL,
  other_social_url VARCHAR(500) NULL,
  home_lat DOUBLE NULL,
  home_lng DOUBLE NULL,
  matching_radius_km INT NOT NULL DEFAULT 5,
  is_looking_for_roommate BIT(1) NOT NULL DEFAULT b'0',
  characteristics TEXT NULL,
  matching_bio TEXT NULL,
  preferred_gender VARCHAR(50) NULL,
  google_sub VARCHAR(255) NULL,
  facebook_sub VARCHAR(255) NULL,
  auth_provider VARCHAR(50) NOT NULL DEFAULT 'LOCAL',
  email_verified BIT(1) NOT NULL DEFAULT b'0',
  email_verified_at DATETIME NULL,
  phone_verified BIT(1) NOT NULL DEFAULT b'0',
  phone_verified_at DATETIME NULL,
  created_at DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME NULL,
  -- legacy columns retained only so the original project data can be imported
  post_limit INT NOT NULL DEFAULT 3,
  package_expiry_date VARCHAR(255) NULL,
  current_package VARCHAR(255) NULL DEFAULT 'Mặc định',
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email),
  UNIQUE KEY uq_users_google_sub (google_sub),
  UNIQUE KEY uq_users_facebook_sub (facebook_sub),
  KEY idx_users_role_status (role, status),
  KEY idx_users_school (school_name)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS verification_code (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  channel VARCHAR(20) NOT NULL,
  purpose VARCHAR(50) NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_verify_code_lookup (user_id, channel, purpose, expires_at),
  CONSTRAINT fk_verify_code_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS auth_session (
  token VARCHAR(255) NOT NULL,
  user_id BIGINT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (token),
  KEY idx_auth_user (user_id),
  KEY idx_auth_expires (expires_at),
  CONSTRAINT fk_auth_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS password_reset_token (
  token VARCHAR(255) NOT NULL,
  user_id BIGINT NOT NULL,
  expires_at DATETIME NOT NULL,
  used BIT(1) NOT NULL DEFAULT b'0',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (token),
  KEY idx_reset_user (user_id),
  KEY idx_reset_expires (expires_at),
  CONSTRAINT fk_reset_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------- PROPERTY / ROOM -------------------------
CREATE TABLE IF NOT EXISTS property (
  id BIGINT NOT NULL AUTO_INCREMENT,
  landlord_id BIGINT NOT NULL,
  name VARCHAR(255) NULL,
  province VARCHAR(255) NULL,
  district VARCHAR(255) NULL,
  ward VARCHAR(255) NULL,
  street VARCHAR(255) NULL,
  latitude DOUBLE NULL,
  longitude DOUBLE NULL,
  price BIGINT NULL,
  area DOUBLE NULL,
  deposit BIGINT NULL,
  electricity_price BIGINT NULL,
  water_price BIGINT NULL,
  internet_price BIGINT NULL,
  parking_fee BIGINT NULL,
  other_fees BIGINT NULL,
  furniture VARCHAR(255) NULL,
  property_type VARCHAR(100) NULL,
  post_type VARCHAR(100) NULL,
  poster_relationship VARCHAR(50) NOT NULL DEFAULT 'OWNER',
  total_rooms INT NULL,
  available_rooms INT NULL,
  total_floors INT NULL,
  floor_text VARCHAR(100) NULL,
  max_occupants INT NULL,
  nearest_school VARCHAR(255) NULL,
  nearest_school_distance_km DOUBLE NULL,
  amenities TEXT NULL,
  rules TEXT NULL,
  contact_phone VARCHAR(50) NULL,
  contact_zalo VARCHAR(500) NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  availability VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
  last_availability_confirmed_at DATETIME NULL,
  description TEXT NULL,
  image_url LONGTEXT NULL,
  auto_drafted BIT(1) NOT NULL DEFAULT b'0',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_property_landlord (landlord_id),
  KEY idx_property_location (province, district, ward),
  KEY idx_property_price (price),
  KEY idx_property_availability (availability),
  KEY idx_property_school (nearest_school),
  CONSTRAINT fk_property_landlord FOREIGN KEY (landlord_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS room (
  id BIGINT NOT NULL AUTO_INCREMENT,
  property_id BIGINT NULL,
  room_number VARCHAR(100) NULL,
  floor_number INT NULL,
  max_occupants INT NULL,
  price BIGINT NULL,
  area DOUBLE NULL,
  status VARCHAR(50) NULL,
  description TEXT NULL,
  image_url LONGTEXT NULL,
  PRIMARY KEY (id),
  KEY idx_room_property (property_id),
  KEY idx_room_status (status),
  CONSTRAINT fk_room_property FOREIGN KEY (property_id) REFERENCES property(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ------------------------- LISTING -------------------------------
CREATE TABLE IF NOT EXISTS listing (
  id BIGINT NOT NULL AUTO_INCREMENT,
  property_id BIGINT NOT NULL,
  landlord_id BIGINT NOT NULL,
  title VARCHAR(255) NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  package_tier VARCHAR(50) NOT NULL DEFAULT 'FREE',
  package_priority INT NOT NULL DEFAULT 0,
  package_until DATETIME NULL,
  boost_until DATETIME NULL,
  published_at DATETIME NULL,
  archived_at DATETIME NULL,
  last_confirmed_at DATETIME NULL,
  freshness_due_at DATETIME NULL,
  view_count BIGINT NOT NULL DEFAULT 0,
  interest_count BIGINT NOT NULL DEFAULT 0,
  revision_note TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_listing_status (status),
  KEY idx_listing_property (property_id),
  KEY idx_listing_landlord (landlord_id),
  KEY idx_listing_rank (status, package_priority, boost_until, published_at),
  KEY idx_listing_freshness (freshness_due_at),
  CONSTRAINT fk_listing_property FOREIGN KEY (property_id) REFERENCES property(id) ON DELETE CASCADE,
  CONSTRAINT fk_listing_landlord FOREIGN KEY (landlord_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS moderation_action (
  id BIGINT NOT NULL AUTO_INCREMENT,
  listing_id BIGINT NOT NULL,
  moderator_id BIGINT NOT NULL,
  action VARCHAR(50) NOT NULL,
  reason TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_mod_listing (listing_id, created_at),
  KEY idx_mod_moderator (moderator_id),
  CONSTRAINT fk_mod_listing FOREIGN KEY (listing_id) REFERENCES listing(id) ON DELETE CASCADE,
  CONSTRAINT fk_mod_user FOREIGN KEY (moderator_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS verification_record (
  id BIGINT NOT NULL AUTO_INCREMENT,
  property_id BIGINT NULL,
  listing_id BIGINT NULL,
  verifier_id BIGINT NULL,
  level VARCHAR(50) NOT NULL DEFAULT 'CONTENT_REVIEWED',
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  room_exists BIT(1) NOT NULL DEFAULT b'0',
  location_verified BIT(1) NOT NULL DEFAULT b'0',
  media_verified BIT(1) NOT NULL DEFAULT b'0',
  price_verified BIT(1) NOT NULL DEFAULT b'0',
  utility_verified BIT(1) NOT NULL DEFAULT b'0',
  amenity_verified BIT(1) NOT NULL DEFAULT b'0',
  availability_verified BIT(1) NOT NULL DEFAULT b'0',
  note TEXT NULL,
  evidence_urls LONGTEXT NULL,
  verified_at DATETIME NULL,
  expires_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_verify_listing (listing_id, status),
  KEY idx_verify_property (property_id),
  KEY idx_verify_expiry (expires_at),
  CONSTRAINT fk_verify_property FOREIGN KEY (property_id) REFERENCES property(id) ON DELETE CASCADE,
  CONSTRAINT fk_verify_listing FOREIGN KEY (listing_id) REFERENCES listing(id) ON DELETE CASCADE,
  CONSTRAINT fk_verify_user FOREIGN KEY (verifier_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS favorite (
  id BIGINT NOT NULL AUTO_INCREMENT,
  listing_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_favorite (listing_id, user_id),
  KEY idx_favorite_user (user_id),
  CONSTRAINT fk_favorite_listing FOREIGN KEY (listing_id) REFERENCES listing(id) ON DELETE CASCADE,
  CONSTRAINT fk_favorite_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS listing_interest (
  id BIGINT NOT NULL AUTO_INCREMENT,
  listing_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  matching_enabled BIT(1) NOT NULL DEFAULT b'0',
  status VARCHAR(50) NOT NULL DEFAULT 'INTERESTED',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_interest (listing_id, user_id),
  KEY idx_interest_match_pool (listing_id, matching_enabled, status),
  KEY idx_interest_user (user_id),
  CONSTRAINT fk_interest_listing FOREIGN KEY (listing_id) REFERENCES listing(id) ON DELETE CASCADE,
  CONSTRAINT fk_interest_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------- MATCHING -----------------------------
CREATE TABLE IF NOT EXISTS matching_profile (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  enabled BIT(1) NOT NULL DEFAULT b'0',
  gender VARCHAR(50) NULL,
  school_name VARCHAR(255) NULL,
  latitude DOUBLE NULL,
  longitude DOUBLE NULL,
  radius_km INT NOT NULL DEFAULT 5,
  budget_min BIGINT NULL,
  budget_max BIGINT NULL,
  move_in_date VARCHAR(50) NULL,
  sleep_schedule VARCHAR(100) NULL,
  cleanliness_level INT NULL,
  smoking VARCHAR(100) NULL,
  pets VARCHAR(100) NULL,
  cooking VARCHAR(100) NULL,
  noise_preference VARCHAR(100) NULL,
  guest_frequency VARCHAR(100) NULL,
  study_work_schedule VARCHAR(255) NULL,
  expense_style VARCHAR(100) NULL,
  communication_style VARCHAR(100) NULL,
  intro TEXT NULL,
  facebook_url VARCHAR(500) NULL,
  zalo_url VARCHAR(500) NULL,
  other_social_url VARCHAR(500) NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_matching_user (user_id),
  KEY idx_matching_enabled_gender (enabled, gender),
  KEY idx_matching_school (school_name),
  CONSTRAINT fk_matching_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Optional persistence for score snapshots/history. The current backend can recompute live,
-- while this table preserves history when the UI later chooses to store a match result.
CREATE TABLE IF NOT EXISTS match_result (
  id BIGINT NOT NULL AUTO_INCREMENT,
  requester_id BIGINT NOT NULL,
  candidate_id BIGINT NOT NULL,
  listing_id BIGINT NULL,
  mode VARCHAR(50) NOT NULL DEFAULT 'SAME_ROOM',
  score INT NOT NULL,
  distance_km DOUBLE NULL,
  strengths TEXT NULL,
  conflicts TEXT NULL,
  ai_explanation TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_match_requester (requester_id, created_at),
  KEY idx_match_listing (listing_id, score),
  CONSTRAINT fk_match_requester FOREIGN KEY (requester_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_match_candidate FOREIGN KEY (candidate_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_match_listing FOREIGN KEY (listing_id) REFERENCES listing(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------- SOCIAL / CHAT ---------------------------
CREATE TABLE IF NOT EXISTS follow (
  id BIGINT NOT NULL AUTO_INCREMENT,
  follower_id BIGINT NOT NULL,
  following_id BIGINT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_follow (follower_id, following_id),
  KEY idx_follow_following (following_id),
  CONSTRAINT fk_follow_follower FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_follow_following FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS conversation (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user1_id BIGINT NOT NULL,
  user2_id BIGINT NOT NULL,
  context_type VARCHAR(50) NULL,
  context_id BIGINT NULL,
  context_title VARCHAR(255) NULL,
  context_image LONGTEXT NULL,
  context_price VARCHAR(100) NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_conv_user1 (user1_id, updated_at),
  KEY idx_conv_user2 (user2_id, updated_at),
  CONSTRAINT fk_conv_user1 FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_conv_user2 FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS message (
  id BIGINT NOT NULL AUTO_INCREMENT,
  conversation_id BIGINT NOT NULL,
  sender_id BIGINT NOT NULL,
  content TEXT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'TEXT',
  sent_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at DATETIME NULL,
  is_recalled BIT(1) NOT NULL DEFAULT b'0',
  recalled_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_message_conv (conversation_id, sent_at),
  KEY idx_message_sender (sender_id),
  CONSTRAINT fk_message_conv FOREIGN KEY (conversation_id) REFERENCES conversation(id) ON DELETE CASCADE,
  CONSTRAINT fk_message_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS review (
  id BIGINT NOT NULL AUTO_INCREMENT,
  property_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  rating INT NULL,
  accuracy_rating INT NULL,
  price_transparency_rating INT NULL,
  utility_transparency_rating INT NULL,
  landlord_communication_rating INT NULL,
  comment TEXT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'VISIBLE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_review_property (property_id, status, created_at),
  KEY idx_review_user (user_id),
  CONSTRAINT fk_review_property FOREIGN KEY (property_id) REFERENCES property(id) ON DELETE CASCADE,
  CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS report (
  id BIGINT NOT NULL AUTO_INCREMENT,
  reporter_id BIGINT NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id BIGINT NOT NULL,
  reason_code VARCHAR(100) NOT NULL,
  details TEXT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
  handled_by BIGINT NULL,
  resolution TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_report_status (status, created_at),
  KEY idx_report_target (target_type, target_id),
  CONSTRAINT fk_report_reporter FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_report_handler FOREIGN KEY (handled_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------- WALLET / PAYMENT ------------------------
CREATE TABLE IF NOT EXISTS package_plan (
  id BIGINT NOT NULL AUTO_INCREMENT,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  product_type VARCHAR(50) NOT NULL DEFAULT 'LISTING',
  applies_to VARCHAR(255) NOT NULL DEFAULT 'ROOM,SECOND_HAND,SERVICE',
  price BIGINT NOT NULL DEFAULT 0,
  duration_days INT NOT NULL DEFAULT 15,
  priority INT NOT NULL DEFAULT 0,
  featured BIT(1) NOT NULL DEFAULT b'0',
  boost_credits INT NOT NULL DEFAULT 0,
  active BIT(1) NOT NULL DEFAULT b'1',
  benefits TEXT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_plan_code (code),
  KEY idx_plan_product_active (product_type, active, priority)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payment (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  code VARCHAR(100) NOT NULL,
  amount BIGINT NOT NULL,
  type VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
  reference_type VARCHAR(50) NULL,
  reference_id BIGINT NULL,
  plan_id BIGINT NULL,
  qr_url TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paid_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_payment_code (code),
  KEY idx_payment_user (user_id, created_at),
  KEY idx_payment_status (status, created_at),
  KEY idx_payment_plan (plan_id),
  CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
  CONSTRAINT fk_payment_plan FOREIGN KEY (plan_id) REFERENCES package_plan(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS wallet_transaction (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  type VARCHAR(50) NOT NULL,
  amount BIGINT NOT NULL,
  balance_after BIGINT NOT NULL,
  reference_type VARCHAR(50) NULL,
  reference_id BIGINT NULL,
  description VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_wallet_user (user_id, created_at),
  CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS expense (
  id BIGINT NOT NULL AUTO_INCREMENT,
  category VARCHAR(100) NULL,
  amount BIGINT NOT NULL,
  description VARCHAR(500) NULL,
  created_by BIGINT NULL,
  expense_date DATE NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_expense_date (expense_date),
  CONSTRAINT fk_expense_user FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- ----------------------- SERVICE ECOSYSTEM -----------------------
CREATE TABLE IF NOT EXISTS service_listing (
  id BIGINT NOT NULL AUTO_INCREMENT,
  provider_id BIGINT NOT NULL,
  category VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  price_from BIGINT NULL,
  province VARCHAR(255) NULL,
  district VARCHAR(255) NULL,
  latitude DOUBLE NULL,
  longitude DOUBLE NULL,
  phone VARCHAR(50) NULL,
  zalo_url VARCHAR(500) NULL,
  image_url LONGTEXT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'PENDING_REVIEW',
  featured BIT(1) NOT NULL DEFAULT b'0',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_service_category_location (category, province, district),
  KEY idx_service_provider (provider_id),
  KEY idx_service_status (status, featured),
  CONSTRAINT fk_service_provider FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------- SECOND-HAND MARKETPLACE -------------------
CREATE TABLE IF NOT EXISTS second_hand_listing (
  id BIGINT NOT NULL AUTO_INCREMENT,
  seller_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NULL,
  price BIGINT NULL,
  condition_text VARCHAR(255) NULL,
  province VARCHAR(255) NULL,
  district VARCHAR(255) NULL,
  description TEXT NULL,
  image_url LONGTEXT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  expires_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_second_seller (seller_id),
  KEY idx_second_search (status, category, price),
  KEY idx_second_location (province, district),
  KEY idx_second_expiry (expires_at),
  CONSTRAINT fk_second_seller FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS marketplace_comment (
  id BIGINT NOT NULL AUTO_INCREMENT,
  listing_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  parent_id BIGINT NULL,
  content TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'VISIBLE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_market_comment_listing (listing_id, created_at),
  KEY idx_market_comment_user (user_id),
  CONSTRAINT fk_market_comment_listing FOREIGN KEY (listing_id) REFERENCES second_hand_listing(id) ON DELETE CASCADE,
  CONSTRAINT fk_market_comment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_market_comment_parent FOREIGN KEY (parent_id) REFERENCES marketplace_comment(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- -------------------------- CONTENT ------------------------------
CREATE TABLE IF NOT EXISTS blog_post (
  id BIGINT NOT NULL AUTO_INCREMENT,
  author_id BIGINT NULL,
  category VARCHAR(100) NULL,
  title VARCHAR(255) NOT NULL,
  summary TEXT NULL,
  content LONGTEXT NULL,
  cover_image LONGTEXT NULL,
  tags VARCHAR(500) NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'DRAFT',
  reading_minutes INT NOT NULL DEFAULT 5,
  published_at DATETIME NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_blog_status_date (status, published_at),
  KEY idx_blog_category (category),
  CONSTRAINT fk_blog_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS question (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100) NULL,
  accepted_answer_id BIGINT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'VISIBLE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_question_user (user_id),
  KEY idx_question_category_status (category, status),
  CONSTRAINT fk_question_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS answer (
  id BIGINT NOT NULL AUTO_INCREMENT,
  question_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'VISIBLE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_answer_question (question_id, created_at),
  KEY idx_answer_user (user_id),
  CONSTRAINT fk_answer_question FOREIGN KEY (question_id) REFERENCES question(id) ON DELETE CASCADE,
  CONSTRAINT fk_answer_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ---------------------- ADVERTISEMENT ----------------------------
CREATE TABLE IF NOT EXISTS advertisement (
  id BIGINT NOT NULL AUTO_INCREMENT,
  campaign_name VARCHAR(255) NULL,
  advertiser_name VARCHAR(255) NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  banner_image LONGTEXT NOT NULL,
  destination_url VARCHAR(1000) NOT NULL,
  target_type VARCHAR(50) NOT NULL DEFAULT 'EXTERNAL',
  placement VARCHAR(100) NOT NULL,
  priority INT NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'SCHEDULED',
  start_at DATETIME NULL,
  end_at DATETIME NULL,
  impressions BIGINT NOT NULL DEFAULT 0,
  click_count BIGINT NOT NULL DEFAULT 0,
  created_by BIGINT NULL,
  note TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_ad_active (status, placement, start_at, end_at),
  KEY idx_ad_priority (placement, priority DESC)
) ENGINE=InnoDB;

-- --------------------- NOTIFICATION / AUDIT ----------------------
CREATE TABLE IF NOT EXISTS notification (
  id BIGINT NOT NULL AUTO_INCREMENT,
  message TEXT NULL,
  property_id BIGINT NULL,
  receiver_id BIGINT NULL,
  sender_id BIGINT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'UNREAD',
  type VARCHAR(100) NULL,
  reference_id BIGINT NULL,
  reference_type VARCHAR(100) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_notification_receiver (receiver_id, status, created_at),
  KEY idx_notification_sender (sender_id),
  KEY idx_notification_property (property_id),
  CONSTRAINT fk_notification_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_notification_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_notification_property FOREIGN KEY (property_id) REFERENCES property(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGINT NOT NULL AUTO_INCREMENT,
  actor_id BIGINT NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(100) NULL,
  target_id BIGINT NULL,
  details TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_created (created_at),
  KEY idx_audit_actor (actor_id, created_at),
  KEY idx_audit_target (target_type, target_id),
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- --------------------- REFERENCE / SEED DATA ---------------------
INSERT INTO package_plan(code,name,product_type,price,duration_days,priority,featured,boost_credits,active,benefits)
VALUES
 ('FREE','Tin thường','LISTING',0,15,0,b'0',0,b'1','Đăng miễn phí; sau 15 ngày cần xác nhận lại tình trạng phòng.'),
 ('VIP3','Tin VIP 3','LISTING',29000,5,20,b'0',0,b'1','Ưu tiên trong nhóm kết quả phù hợp; huy hiệu VIP 3.'),
 ('VIP2','Tin VIP 2','LISTING',59000,10,35,b'0',1,b'1','Ưu tiên cao hơn VIP 3; 1 lượt đẩy tin.'),
 ('VIP1','Tin VIP 1','LISTING',99000,15,50,b'1',2,b'1','Nổi bật trong nhóm kết quả phù hợp; 2 lượt đẩy tin.'),
 ('FEATURED','Tin VIP Nổi bật','LISTING',149000,30,70,b'1',4,b'1','Vị trí nổi bật trong nhóm kết quả phù hợp; 4 lượt đẩy tin.'),
 ('BOOST','Đẩy tin','LISTING',10000,1,30,b'0',0,b'1','Tăng ưu tiên tạm thời; không thay đổi độ phù hợp.')
ON DUPLICATE KEY UPDATE
 name=VALUES(name), product_type=VALUES(product_type), price=VALUES(price),
 duration_days=VALUES(duration_days), priority=VALUES(priority),
 featured=VALUES(featured), boost_credits=VALUES(boost_credits),
 active=VALUES(active), benefits=VALUES(benefits);

-- ----------------- LOYALTY, REWARDS & ADVANCED PLATFORM ------------
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

CREATE TABLE IF NOT EXISTS reward_account (
  user_id BIGINT NOT NULL,
  balance BIGINT NOT NULL DEFAULT 0,
  lifetime_earned BIGINT NOT NULL DEFAULT 0,
  lifetime_spent BIGINT NOT NULL DEFAULT 0,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id),
  CONSTRAINT fk_reward_account_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS reward_transaction (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  type VARCHAR(30) NOT NULL,
  source VARCHAR(50) NOT NULL,
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

CREATE TABLE IF NOT EXISTS user_reward_task (
  id BIGINT NOT NULL AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  task_code VARCHAR(50) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'CLAIMED',
  claimed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_reward_task (user_id, task_code),
  KEY idx_user_task_user (user_id),
  CONSTRAINT fk_urt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_urt_task FOREIGN KEY (task_code) REFERENCES reward_task(task_code) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS partner (
  id BIGINT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
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

CREATE TABLE IF NOT EXISTS voucher (
  id BIGINT NOT NULL AUTO_INCREMENT,
  partner_id BIGINT NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL DEFAULT 'ALL',
  description TEXT NULL,
  image_url TEXT NULL,
  discount_type VARCHAR(50) NOT NULL DEFAULT 'PERCENT',
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
  code_mode VARCHAR(50) NOT NULL DEFAULT 'GENERATED_UNIQUE',
  shared_code VARCHAR(100) NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_voucher_partner (partner_id),
  KEY idx_voucher_status (status, category),
  KEY idx_voucher_cost (points_cost),
  CONSTRAINT fk_voucher_partner FOREIGN KEY (partner_id) REFERENCES partner(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS voucher_code_pool (
  id BIGINT NOT NULL AUTO_INCREMENT,
  voucher_id BIGINT NOT NULL,
  code VARCHAR(100) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
  assigned_to_user_id BIGINT NULL,
  assigned_at DATETIME NULL,
  used_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_voucher_code_pool (voucher_id, code),
  KEY idx_vcode_status (voucher_id, status),
  CONSTRAINT fk_vcode_voucher FOREIGN KEY (voucher_id) REFERENCES voucher(id) ON DELETE CASCADE
) ENGINE=InnoDB;

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
  status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE',
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

CREATE TABLE IF NOT EXISTS post_promotion (
  id BIGINT NOT NULL AUTO_INCREMENT,
  target_type VARCHAR(50) NOT NULL,
  target_id BIGINT NOT NULL,
  owner_user_id BIGINT NOT NULL,
  plan_id BIGINT NOT NULL,
  priority INT NOT NULL DEFAULT 0,
  start_at DATETIME NOT NULL,
  end_at DATETIME NOT NULL,
  boost_until DATETIME NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_promo_target (target_type, target_id),
  KEY idx_promo_owner (owner_user_id),
  KEY idx_promo_status (status, end_at)
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;
