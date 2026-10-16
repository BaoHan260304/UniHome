-- UniHome legacy -> full schema migration helper
-- Run AFTER importing rrmsdb_backup_original.sql.
-- Then run 01_extend_rrmsdb.sql first. This file tightens remaining structures
-- and adds tables/columns that make the database equivalent to a clean full install.
USE rrmsdb;
SET NAMES utf8mb4;

-- Money types: convert the old floating values to integer VND-compatible columns.
-- Existing values are preserved by MySQL conversion.
ALTER TABLE property
  MODIFY COLUMN price BIGINT NULL,
  MODIFY COLUMN electricity_price BIGINT NULL,
  MODIFY COLUMN water_price BIGINT NULL;

-- Old room table is retained but linked to property for future per-floor/per-unit data.
ALTER TABLE room
  ADD COLUMN IF NOT EXISTS property_id BIGINT NULL,
  ADD COLUMN IF NOT EXISTS floor_number INT NULL,
  ADD COLUMN IF NOT EXISTS max_occupants INT NULL;

-- Add missing indexes safely where MySQL permits CREATE INDEX IF NOT EXISTS only on newer versions;
-- use information_schema checks via prepared statements for broad MySQL 8 compatibility.
SET @sql = IF((SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='property' AND index_name='idx_property_location')=0,
 'CREATE INDEX idx_property_location ON property(province,district,ward)', 'SELECT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='property' AND index_name='idx_property_price')=0,
 'CREATE INDEX idx_property_price ON property(price)', 'SELECT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='listing' AND index_name='idx_listing_rank')=0,
 'CREATE INDEX idx_listing_rank ON listing(status,package_priority,boost_until,published_at)', 'SELECT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;
SET @sql = IF((SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema=DATABASE() AND table_name='listing_interest' AND index_name='idx_interest_match_pool')=0,
 'CREATE INDEX idx_interest_match_pool ON listing_interest(listing_id,matching_enabled,status)', 'SELECT 1'); PREPARE s FROM @sql; EXECUTE s; DEALLOCATE PREPARE s;

CREATE TABLE IF NOT EXISTS match_result (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
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
  KEY idx_match_requester(requester_id,created_at),
  KEY idx_match_listing(listing_id,score),
  CONSTRAINT fk_match_requester FOREIGN KEY(requester_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_match_candidate FOREIGN KEY(candidate_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_match_listing FOREIGN KEY(listing_id) REFERENCES listing(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Seed/update listing packages.
INSERT INTO package_plan(code,name,product_type,price,duration_days,priority,featured,boost_credits,active,benefits)
VALUES
 ('FREE','Tin thường','LISTING',0,15,0,b'0',0,b'1','Đăng miễn phí; sau 15 ngày cần xác nhận lại tình trạng phòng.'),
 ('VIP3','Tin VIP 3','LISTING',29000,5,20,b'0',0,b'1','Ưu tiên trong nhóm kết quả phù hợp; huy hiệu VIP 3.'),
 ('VIP2','Tin VIP 2','LISTING',59000,10,35,b'0',1,b'1','Ưu tiên cao hơn VIP 3; 1 lượt đẩy tin.'),
 ('VIP1','Tin VIP 1','LISTING',99000,15,50,b'1',2,b'1','Nổi bật trong nhóm kết quả phù hợp; 2 lượt đẩy tin.'),
 ('FEATURED','Tin VIP Nổi bật','LISTING',149000,30,70,b'1',4,b'1','Vị trí nổi bật trong nhóm kết quả phù hợp; 4 lượt đẩy tin.'),
 ('BOOST','Đẩy tin','LISTING',10000,1,30,b'0',0,b'1','Tăng ưu tiên tạm thời; không thay đổi độ phù hợp.')
ON DUPLICATE KEY UPDATE
 name=VALUES(name), price=VALUES(price), duration_days=VALUES(duration_days),
 priority=VALUES(priority), featured=VALUES(featured), boost_credits=VALUES(boost_credits),
 active=VALUES(active), benefits=VALUES(benefits);

-- Existing old Property records should have a Listing record after 01_extend_rrmsdb.sql.
-- Any missing records are backfilled here as a safety net.
INSERT INTO listing(property_id, landlord_id, title, status, package_tier, package_priority,
                    published_at, last_confirmed_at, freshness_due_at, view_count, interest_count,
                    created_at, updated_at)
SELECT p.id, p.landlord_id, p.name,
       CASE WHEN UPPER(COALESCE(p.status,''))='DRAFT' THEN 'DRAFT' ELSE 'ACTIVE' END,
       'FREE',0,
       CASE WHEN UPPER(COALESCE(p.status,''))='DRAFT' THEN NULL ELSE NOW() END,
       NOW(),DATE_ADD(NOW(),INTERVAL 15 DAY),0,0,NOW(),NOW()
FROM property p
WHERE p.landlord_id IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM listing l WHERE l.property_id=p.id);
