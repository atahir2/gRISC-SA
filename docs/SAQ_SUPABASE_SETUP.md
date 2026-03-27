# SAQ Supabase persistence setup

The Sustainability Self-Assessment (SAQ) tool persists runtime data in Supabase:

- **assessments** — one row per assessment (id, organisation name, timestamps)
- **assessment_scope_selections** — per-assessment scope and target capability (assessment_id, scope_id, in_scope, target_capability)
- **assessment_answers** — per-assessment question answers (assessment_id, question_id, selected_score)
- **assessment_action_items** — action metadata only (effort_required, leader, deadline, status, remarks); priorities are derived by the engine

Static questionnaire configuration stays in the app (`questionnaire.data.json`); only runtime state is stored in the database.

For architecture boundaries and workflow conventions, also see:

- `docs/SAQ_ARCHITECTURE.md`
- `docs/SAQ_DEVELOPMENT_WORKFLOW.md`

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Create a new project (or use an existing one).
3. In **Project Settings → API**, note:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 2. Run the migration

Apply the SAQ schema in one of these ways.

### Option A: Supabase Dashboard (SQL Editor)

1. In your project, open **SQL Editor**.
2. Copy the contents of `supabase/migrations/20250310000000_create_saq_runtime_tables.sql`.
3. Paste and run the script.

### Option B: Supabase CLI (linked project)

```bash
# From project root
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

(`project-ref` is in the project URL or in **Project Settings → General**.)

---

## 3. Configure the app

1. Copy the example env file:
   ```bash
   cp env.example .env.local
   ```
2. Edit `.env.local` and set:
   - `NEXT_PUBLIC_SUPABASE_URL` — your project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your anon public key

Restart the Next.js dev server after changing env vars.

---

## 4. Verify

- Open the SAQ landing page and **Start a new assessment** (enter an organisation name).
- You should be redirected to `/saq/assessment/[id]`.
- Complete scope, questionnaire, and action plan; use **Next** / **Back**. Status should show “Saving…” then “Saved”.
- Return to the SAQ landing; the new assessment should appear in **Your assessments**. Opening it should load the saved scope, answers, and action metadata.

---

## Tables overview

| Table                         | Purpose                                                                 |
|------------------------------|-------------------------------------------------------------------------|
| `assessments`                | One row per assessment run (id, organisation_name, created_at, updated_at). |
| `assessment_scope_selections`| One row per scope item per assessment; UNIQUE(assessment_id, scope_id). |
| `assessment_answers`         | One row per question per assessment; UNIQUE(assessment_id, question_id). |
| `assessment_action_items`    | Action metadata per question per assessment; UNIQUE(assessment_id, question_id). |

All child tables use `ON DELETE CASCADE` so deleting an assessment removes its scope, answers, and action items.

---

## Optional: Row Level Security (RLS)

The migration does not enable RLS. For multi-tenant or authenticated use you can add policies later (e.g. by `auth.uid()` or organisation). The app currently uses the **anon** key; ensure the key has access to these tables or switch to a service role for server-side calls if needed.
