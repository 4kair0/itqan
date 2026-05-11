-- ============================================
-- Fix: Expand notifications table constraints
-- - Add missing categories: general, session, announcement, fiqh, account
-- - Add link column as alias (code uses link, DB has action_url)
-- - Add dedup_key column for idempotent inserts
-- ============================================

-- Drop old category constraint and add expanded one.
-- Combines NEW's 013-agent-b-fixes ('course') with OLD's additions ('fiqh', 'session', 'announcement', 'account').
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_category_check;
ALTER TABLE notifications ADD CONSTRAINT notifications_category_check
  CHECK (category IN ('recitation', 'booking', 'review', 'system', 'message', 'general', 'session', 'announcement', 'fiqh', 'account', 'course'));

-- Add link column that maps to action_url for code compatibility
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS link TEXT;

-- Add dedup_key for idempotent notifications
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS dedup_key VARCHAR(255);
CREATE UNIQUE INDEX IF NOT EXISTS idx_notifications_dedup
  ON notifications(user_id, dedup_key) WHERE dedup_key IS NOT NULL;
