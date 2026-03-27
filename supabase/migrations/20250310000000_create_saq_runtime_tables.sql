-- SAQ runtime tables: assessments, scope selections, answers, action metadata.
-- Static questionnaire config remains in application (questionnaire.data.json).

-- ---------------------------------------------------------------------------
-- assessments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organisation_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE assessments IS 'SAQ assessment runs; one per organisation/run.';

-- ---------------------------------------------------------------------------
-- assessment_scope_selections
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assessment_scope_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  scope_id TEXT NOT NULL,
  in_scope BOOLEAN NOT NULL DEFAULT false,
  target_capability SMALLINT NULL CHECK (target_capability IN (1, 2, 3)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(assessment_id, scope_id)
);

CREATE INDEX IF NOT EXISTS idx_assessment_scope_selections_assessment_id
  ON assessment_scope_selections(assessment_id);

COMMENT ON TABLE assessment_scope_selections IS 'Per-assessment scope and target capability; scope_id references static questionnaire.';

-- ---------------------------------------------------------------------------
-- assessment_answers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assessment_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  selected_score SMALLINT NULL CHECK (selected_score IN (1, 2, 3)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(assessment_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_assessment_answers_assessment_id
  ON assessment_answers(assessment_id);

COMMENT ON TABLE assessment_answers IS 'Per-assessment question answers; question_id references static questionnaire.';

-- ---------------------------------------------------------------------------
-- assessment_action_items (metadata only; improvement priority etc. are derived)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assessment_action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  effort_required TEXT NULL CHECK (effort_required IN ('Low', 'Medium', 'High')),
  leader TEXT NULL,
  deadline DATE NULL,
  status TEXT NULL CHECK (status IN ('Planned', 'In Progress', 'Completed')),
  remarks TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(assessment_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_assessment_action_items_assessment_id
  ON assessment_action_items(assessment_id);

COMMENT ON TABLE assessment_action_items IS 'Persisted action metadata (effort, leader, deadline, status, remarks); priorities are engine-derived.';

-- ---------------------------------------------------------------------------
-- updated_at trigger (reusable)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'assessments_updated_at'
  ) THEN
    CREATE TRIGGER assessments_updated_at
      BEFORE UPDATE ON assessments
      FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'assessment_scope_selections_updated_at'
  ) THEN
    CREATE TRIGGER assessment_scope_selections_updated_at
      BEFORE UPDATE ON assessment_scope_selections
      FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'assessment_answers_updated_at'
  ) THEN
    CREATE TRIGGER assessment_answers_updated_at
      BEFORE UPDATE ON assessment_answers
      FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'assessment_action_items_updated_at'
  ) THEN
    CREATE TRIGGER assessment_action_items_updated_at
      BEFORE UPDATE ON assessment_action_items
      FOR EACH ROW EXECUTE PROCEDURE set_updated_at();
  END IF;
END $$;
