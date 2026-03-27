# SAQ Development Workflow

This guide explains how to extend the SAQ safely while preserving architectural boundaries.

## How to Continue Development Safely

1. Clarify whether the change is:
   - business logic (engine),
   - persistence/repository,
   - or UI/report/export.
2. Implement in the correct layer first; avoid cross-layer shortcuts.
3. Reuse existing engine/repository APIs before adding new ones.
4. Validate impact across assessment flow, dashboard, and report.

## Where to Implement What

Layer definitions live in `docs/SAQ_ARCHITECTURE.md`; this section is intentionally execution-focused.

### Business logic

- Location: `src/lib/saq/engine/`
- Includes scoring, results derivation, action-plan derivation, interpretation logic.

### UI behavior and presentation

- Location: `src/components/saq/` and `src/app/saq/*`
- Includes layout, hierarchy, visual design, dashboard/report composition, PDF readability.

### Persistence and data access

- Location: `src/lib/saq/assessment.repository.ts`, `src/lib/supabase/`, `supabase/migrations/`
- Includes table writes/reads, row mapping, schema evolution.

## Common Mistakes to Avoid

- Duplicating scoring/prioritization rules in UI components.
- Storing derived metrics/results in runtime tables.
- Moving static questionnaire content into Supabase.
- Mixing Supabase row types directly into UI contracts.
- Making report/export changes that alter business logic outputs.

## Updating Memory and Docs After Milestones

After significant feature or architecture changes:

1. Update the relevant `.cursor/rules/*.mdc` rule first (concise behavioral guidance).
2. Update human docs in `docs/` for narrative explanation and onboarding.
3. Keep `docs/SAQ_PROJECT_CONTEXT.md` as the broad quick-reference anchor.
4. Update `docs/SAQ_SUPABASE_SETUP.md` only when setup/schema procedures change.

## How to Use This Memory Layer

- **Primary Cursor memory**: `.cursor/rules/*.mdc`  
  Use these for concise, implementation-focused constraints during coding sessions.
- **Human reference layer**: `docs/*.md`  
  Use these for onboarding, architecture understanding, and deeper explanation.
- Prefer linking between docs/rules rather than duplicating long text blocks.
