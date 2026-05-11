-- ============================================
-- parent_children: ensure schema has columns required by OLD code
-- - 015-features-and-enhancements.sql (NEW) already creates parent_children
-- - 025-parent-features.sql adds invitation columns
-- This migration just ensures child_gender column and migrates legacy data
-- from parent_student_links if present.
-- ============================================

BEGIN;

-- Make sure the table exists (no-op if NEW's 015 already created it)
CREATE TABLE IF NOT EXISTS parent_children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relation VARCHAR(50),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(parent_id, child_id)
);

-- Gender column (OLD-only requirement: ولي الأمر يحدد جنس الابن عند الربط)
ALTER TABLE parent_children ADD COLUMN IF NOT EXISTS child_gender VARCHAR(10);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'parent_children_child_gender_check') THEN
    BEGIN
      ALTER TABLE parent_children
        ADD CONSTRAINT parent_children_child_gender_check
        CHECK (child_gender IS NULL OR child_gender IN ('male', 'female'));
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'child_gender CHECK skipped: %', SQLERRM;
    END;
  END IF;
END$$;

-- Indexes (idempotent)
CREATE INDEX IF NOT EXISTS idx_parent_children_parent_id ON parent_children(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_children_child_id ON parent_children(child_id);
CREATE INDEX IF NOT EXISTS idx_parent_children_child_status ON parent_children(child_id, status);
CREATE INDEX IF NOT EXISTS idx_parent_children_parent_status ON parent_children(parent_id, status);

-- Migrate data from legacy parent_student_links table if it still exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'parent_student_links') THEN
    INSERT INTO parent_children (parent_id, child_id, relation, status, created_at)
    SELECT parent_id, student_id,
      LOWER(relationship_type),
      CASE WHEN is_active THEN 'active' ELSE 'inactive' END,
      created_at
    FROM parent_student_links
    ON CONFLICT (parent_id, child_id) DO NOTHING;
  END IF;
END $$;

COMMIT;
