-- Migration 12: Allow NULL email for phone-only registered users
-- Safe, idempotent migration that preserves unique constraint and all existing data.

ALTER TABLE users MODIFY COLUMN email VARCHAR(255) NULL;
