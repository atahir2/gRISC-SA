-- RLS policies for SAQ tables.
-- Run this in the Supabase SQL Editor if you get "row-level security policy" errors.
-- These policies allow the anon key to read/write SAQ data (no auth required).
-- For production with auth, replace with policies that restrict by auth.uid() or organisation.

-- Enable RLS only if not already enabled (avoids error on re-run)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'assessments') THEN
    RETURN;
  END IF;
  ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
  NULL; -- already enabled or table missing
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'assessment_scope_selections') THEN
    RETURN;
  END IF;
  ALTER TABLE assessment_scope_selections ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'assessment_answers') THEN
    RETURN;
  END IF;
  ALTER TABLE assessment_answers ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'assessment_action_items') THEN
    RETURN;
  END IF;
  ALTER TABLE assessment_action_items ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Drop existing policies if present (so this migration is re-runnable)
DROP POLICY IF EXISTS "Allow anon full access to assessments" ON assessments;
DROP POLICY IF EXISTS "Allow anon full access to assessment_scope_selections" ON assessment_scope_selections;
DROP POLICY IF EXISTS "Allow anon full access to assessment_answers" ON assessment_answers;
DROP POLICY IF EXISTS "Allow anon full access to assessment_action_items" ON assessment_action_items;

-- ---------------------------------------------------------------------------
-- assessments
-- ---------------------------------------------------------------------------
CREATE POLICY "Allow anon full access to assessments"
  ON assessments
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- assessment_scope_selections
-- ---------------------------------------------------------------------------
CREATE POLICY "Allow anon full access to assessment_scope_selections"
  ON assessment_scope_selections
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- assessment_answers
-- ---------------------------------------------------------------------------
CREATE POLICY "Allow anon full access to assessment_answers"
  ON assessment_answers
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- ---------------------------------------------------------------------------
-- assessment_action_items
-- ---------------------------------------------------------------------------
CREATE POLICY "Allow anon full access to assessment_action_items"
  ON assessment_action_items
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
