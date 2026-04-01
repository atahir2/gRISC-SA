-- Phase 1 multi-user: profiles, assessment ownership, RLS for authenticated users.
-- Replaces anon-wide-open policies from 20250310100000_saq_rls_policies.sql.

-- ---------------------------------------------------------------------------
-- profiles (linked to auth.users)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NULL,
  organisation_name TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'User profile; one row per auth user.';

CREATE INDEX IF NOT EXISTS idx_profiles_id ON public.profiles(id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'profiles_updated_at'
  ) THEN
    CREATE TRIGGER profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- New user → profile row (auth.users insert)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    NULLIF(TRIM(NEW.raw_user_meta_data->>'full_name'), '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Assessment ownership
-- ---------------------------------------------------------------------------
ALTER TABLE public.assessments
  ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Existing rows without an owner cannot satisfy RLS; remove them before NOT NULL.
DELETE FROM public.assessments WHERE owner_user_id IS NULL;

ALTER TABLE public.assessments
  ALTER COLUMN owner_user_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_assessments_owner_user_id ON public.assessments(owner_user_id);

COMMENT ON COLUMN public.assessments.owner_user_id IS 'Auth user who owns this assessment; enforced by RLS.';

-- ---------------------------------------------------------------------------
-- profiles RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- ---------------------------------------------------------------------------
-- Replace SAQ table policies: authenticated + ownership only
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow anon full access to assessments" ON public.assessments;
DROP POLICY IF EXISTS "Allow anon full access to assessment_scope_selections" ON public.assessment_scope_selections;
DROP POLICY IF EXISTS "Allow anon full access to assessment_answers" ON public.assessment_answers;
DROP POLICY IF EXISTS "Allow anon full access to assessment_action_items" ON public.assessment_action_items;

DROP POLICY IF EXISTS "Users own assessments select" ON public.assessments;
DROP POLICY IF EXISTS "Users own assessments insert" ON public.assessments;
DROP POLICY IF EXISTS "Users own assessments update" ON public.assessments;
DROP POLICY IF EXISTS "Users own assessments delete" ON public.assessments;

CREATE POLICY "Users own assessments select"
  ON public.assessments
  FOR SELECT
  TO authenticated
  USING (owner_user_id = auth.uid());

CREATE POLICY "Users own assessments insert"
  ON public.assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Users own assessments update"
  ON public.assessments
  FOR UPDATE
  TO authenticated
  USING (owner_user_id = auth.uid())
  WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Users own assessments delete"
  ON public.assessments
  FOR DELETE
  TO authenticated
  USING (owner_user_id = auth.uid());

DROP POLICY IF EXISTS "Users own scope selections" ON public.assessment_scope_selections;

CREATE POLICY "Users own scope selections"
  ON public.assessment_scope_selections
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id = assessment_scope_selections.assessment_id
        AND a.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id = assessment_scope_selections.assessment_id
        AND a.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users own answers" ON public.assessment_answers;

CREATE POLICY "Users own answers"
  ON public.assessment_answers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id = assessment_answers.assessment_id
        AND a.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id = assessment_answers.assessment_id
        AND a.owner_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users own action items" ON public.assessment_action_items;

CREATE POLICY "Users own action items"
  ON public.assessment_action_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id = assessment_action_items.assessment_id
        AND a.owner_user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.assessments a
      WHERE a.id = assessment_action_items.assessment_id
        AND a.owner_user_id = auth.uid()
    )
  );
