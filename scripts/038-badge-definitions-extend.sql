-- ============================================
-- Badge Definitions & Achievement System (NON-DESTRUCTIVE)
-- ============================================
-- NEW codebase's 015-features-and-enhancements.sql creates `badge_definitions`
-- with `badge_type` PK. The OLD codebase needed an UUID-id table with `badge_key`.
-- This migration adds the OLD-style columns to whatever shape currently exists
-- and reconciles `badges` row references — WITHOUT dropping the table.
-- ============================================

BEGIN;

-- 1. Ensure the table exists (matches OLD shape if NEW migration was skipped).
CREATE TABLE IF NOT EXISTS badge_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  badge_key VARCHAR(50) UNIQUE,
  badge_name VARCHAR(100),
  badge_description TEXT,
  badge_icon VARCHAR(10) DEFAULT '🏆',
  badge_image_url TEXT,
  badge_color VARCHAR(20) DEFAULT '#F59E0B',
  points_awarded INTEGER DEFAULT 0,
  criteria_type VARCHAR(30),
  criteria_value INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  category VARCHAR(30) DEFAULT 'achievement',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add ANY missing columns idempotently (handles both NEW and OLD starting shapes).
ALTER TABLE badge_definitions ADD COLUMN IF NOT EXISTS badge_key         VARCHAR(50);
ALTER TABLE badge_definitions ADD COLUMN IF NOT EXISTS badge_name        VARCHAR(100);
ALTER TABLE badge_definitions ADD COLUMN IF NOT EXISTS badge_description TEXT;
ALTER TABLE badge_definitions ADD COLUMN IF NOT EXISTS badge_icon        VARCHAR(10) DEFAULT '🏆';
ALTER TABLE badge_definitions ADD COLUMN IF NOT EXISTS badge_image_url   TEXT;
ALTER TABLE badge_definitions ADD COLUMN IF NOT EXISTS badge_color       VARCHAR(20) DEFAULT '#F59E0B';
ALTER TABLE badge_definitions ADD COLUMN IF NOT EXISTS points_awarded    INTEGER DEFAULT 0;
ALTER TABLE badge_definitions ADD COLUMN IF NOT EXISTS criteria_type     VARCHAR(30) DEFAULT 'manual';
ALTER TABLE badge_definitions ADD COLUMN IF NOT EXISTS criteria_value    INTEGER DEFAULT 0;
ALTER TABLE badge_definitions ADD COLUMN IF NOT EXISTS is_active         BOOLEAN DEFAULT TRUE;
ALTER TABLE badge_definitions ADD COLUMN IF NOT EXISTS display_order     INTEGER DEFAULT 0;
ALTER TABLE badge_definitions ADD COLUMN IF NOT EXISTS category          VARCHAR(30) DEFAULT 'achievement';
ALTER TABLE badge_definitions ADD COLUMN IF NOT EXISTS updated_at        TIMESTAMPTZ DEFAULT NOW();

-- If NEW migration was applied, copy badge_type → badge_key for OLD-style code paths.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='badge_definitions' AND column_name='badge_type'
  ) THEN
    UPDATE badge_definitions
       SET badge_key = badge_type
     WHERE badge_key IS NULL AND badge_type IS NOT NULL;
  END IF;
END$$;

-- Backfill badge_name from NEW's `name` column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='badge_definitions' AND column_name='name'
  ) THEN
    UPDATE badge_definitions SET badge_name = name WHERE badge_name IS NULL AND name IS NOT NULL;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='badge_definitions' AND column_name='description'
  ) THEN
    UPDATE badge_definitions SET badge_description = description WHERE badge_description IS NULL AND description IS NOT NULL;
  END IF;
END$$;

-- Unique constraint on badge_key (needed for ON CONFLICT)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'badge_definitions_badge_key_key'
  ) THEN
    BEGIN
      ALTER TABLE badge_definitions ADD CONSTRAINT badge_definitions_badge_key_key UNIQUE(badge_key);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'badge_definitions UNIQUE(badge_key) skipped: %', SQLERRM;
    END;
  END IF;
END$$;

-- 3. Update `badges` table to support badge_key + reference link.
ALTER TABLE badges DROP CONSTRAINT IF EXISTS badges_badge_type_check;
ALTER TABLE badges ADD COLUMN IF NOT EXISTS badge_definition_id UUID;
ALTER TABLE badges ADD COLUMN IF NOT EXISTS badge_key VARCHAR(50);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'badges_badge_definition_id_fkey'
  ) THEN
    BEGIN
      ALTER TABLE badges ADD CONSTRAINT badges_badge_definition_id_fkey
        FOREIGN KEY (badge_definition_id) REFERENCES badge_definitions(id) ON DELETE SET NULL;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'FK constraint skipped: %', SQLERRM;
    END;
  END IF;
END $$;

ALTER TABLE badges DROP CONSTRAINT IF EXISTS badges_user_id_badge_type_key;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'badges_user_id_badge_key_key'
  ) THEN
    BEGIN
      ALTER TABLE badges ADD CONSTRAINT badges_user_id_badge_key_key UNIQUE(user_id, badge_key);
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Unique constraint skipped: %', SQLERRM;
    END;
  END IF;
END $$;

-- Migrate existing badge records to use badge_key (idempotent).
UPDATE badges SET badge_key = badge_type WHERE badge_key IS NULL AND badge_type IS NOT NULL;

-- 4. Seed default badge definitions (idempotent — ON CONFLICT updates).
INSERT INTO badge_definitions (badge_key, badge_name, badge_description, badge_icon, badge_color, points_awarded, criteria_type, criteria_value, category, display_order)
VALUES
  ('first_recitation',    'أول تلاوة',       'سجّل تلاوتك الأولى على المنصة',         '🎤', '#10B981', 20,   'recitation_count', 1,   'recitation',   1),
  ('week_streak',         'أسبوع كامل',      '7 أيام Streak متواصلة',                 '🔥', '#F97316', 70,   'streak_days',      7,   'streak',       2),
  ('hafiz_juz_amma',      'حافظ جزء عم',     'أتقن جميع سور الجزء الثلاثين',          '📖', '#8B5CF6', 200,  'juz_memorized',    30,  'memorization', 3),
  ('hundred_recitations', 'مئة تلاوة',       'سجّل 100 تلاوة على المنصة',             '💯', '#3B82F6', 150,  'recitation_total', 100, 'recitation',   4),
  ('tajweed_master',      'متقن التجويد',    'اجتز مسار التجويد الكامل',              '⭐', '#EC4899', 300,  'tajweed_path',     1,   'mastery',      5),
  ('ramadan_badge',       'شهر رمضان',       'سجّل تلاوة كل يوم خلال شهر رمضان',      '🌙', '#6366F1', 250,  'ramadan',          30,  'special',      6),
  ('full_quran',          'الختمة الكاملة',  'أتقن القرآن كاملاً وحصلت على إجازة',    '👑', '#EAB308', 1000, 'quran_complete',   1,   'memorization', 7),
  ('star_of_halaqah',     'نجم الحلقة',      'الأعلى نقاطاً في حلقتك لمدة شهر',       '🌟', '#F59E0B', 180,  'top_student',      1,   'special',      8)
ON CONFLICT (badge_key) DO UPDATE SET
  badge_name        = COALESCE(EXCLUDED.badge_name, badge_definitions.badge_name),
  badge_description = COALESCE(EXCLUDED.badge_description, badge_definitions.badge_description),
  badge_icon        = COALESCE(EXCLUDED.badge_icon, badge_definitions.badge_icon),
  badge_color       = COALESCE(EXCLUDED.badge_color, badge_definitions.badge_color),
  points_awarded    = COALESCE(EXCLUDED.points_awarded, badge_definitions.points_awarded),
  criteria_type     = COALESCE(EXCLUDED.criteria_type, badge_definitions.criteria_type),
  criteria_value    = COALESCE(EXCLUDED.criteria_value, badge_definitions.criteria_value),
  category          = COALESCE(EXCLUDED.category, badge_definitions.category),
  display_order     = COALESCE(EXCLUDED.display_order, badge_definitions.display_order);

COMMIT;
