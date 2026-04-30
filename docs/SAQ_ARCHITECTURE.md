# SAQ Technical Architecture

This document explains how the Sustainability Self-Assessment (SAQ) tool is structured for safe long-term evolution.

## Project Purpose

The SAQ supports research infrastructures, datacenters, and organizations in building a sustainability readiness baseline.  
It helps users assess capability, identify gaps, prioritize improvements, and produce actionable planning outputs (dashboard + report/PDF).

## Architecture Layers

### 1) Static questionnaire layer

- Source: `src/lib/saq/questionnaire.data.json`
- Accessed through: `src/lib/saq/questionnaire.repository.ts`
- Contains themes, scope items, questions, and answer options.
- This layer is configuration only and is **not persisted in Supabase**.

### 2) Runtime assessment layer

- Persisted in Supabase runtime tables:
  - `profiles` (per auth user)
  - `assessments` (includes `owner_user_id`)
  - `assessment_collaborators` (shared access and roles)
  - `assessment_scope_selections`
  - `assessment_answers`
  - `assessment_action_items`
- IO boundary: `src/lib/saq/assessment.repository.ts`
- Holds per-assessment state (scope, answers, action metadata) and identity/access metadata (ownership, collaborators).
- **Access rules** live in SQL (RLS) and `src/lib/saq/permissions.ts`; not in the engine.

### 3) SAQ engine layer

- Location: `src/lib/saq/engine/`
- Key modules:
  - `scoring.ts` - scoring and priority helpers
  - `results.ts` - derived assessment summaries/results
  - `actions.ts` - action-plan derivation and implementation summaries
  - `interpretation.ts` - stakeholder-readable interpretation text
- Engine modules are pure and framework-agnostic.

### 4) Presentation layer

- Assessment flow UI: `src/app/saq/assessment/` + `src/components/saq/`
- Dashboard UI: `src/app/saq/dashboard/`
- Report/export UI: `src/app/saq/report/`
- The report route computes engine-derived data and uses `AssessmentReportPDF` to generate the PDF output.

## Core Data Flow

1. Authenticate (Supabase Auth) where routes require it; middleware protects assessment/dashboard/report routes.
2. Load questionnaire config from static JSON.
3. Load runtime assessment data from Supabase via repository (respecting ownership and collaborator access).
4. Compute derived outputs in memory through engine modules.
5. Render assessment/dashboard/report views from those outputs.
6. Persist only runtime edits (scope/answers/action metadata), not derived results.

## Persistence Model and Boundaries

- **Persisted**: runtime state required to reconstruct an assessment.
- **Not persisted**: derived summaries, priorities, and interpretation outputs.
- UI must not bypass repositories for direct DB access.
- UI must not duplicate engine formulas or priority logic.

## Folder Structure (Practical View)

- `src/lib/saq/` - domain types, repositories, engine, `permissions.ts`
- `src/lib/auth/` - auth helpers (safe redirects, site URL, error formatting)
- `src/lib/supabase/` - Supabase client and DB types
- `src/components/saq/` - SAQ feature components
- `src/components/auth/` - login/signup UI
- `src/app/saq/` - route entry points (landing, assessment, dashboard, report)
- `src/app/login/`, `src/app/signup/`, `src/app/auth/` - authentication routes
- `middleware.ts` - session refresh and route protection for workflow routes
- `supabase/migrations/` - runtime schema migrations
- `docs/` - human reference docs
- `.cursor/rules/` - Cursor-native rule memory

For implementation process and update habits, see `docs/SAQ_DEVELOPMENT_WORKFLOW.md` (this file stays architecture-focused).

## Dashboard, Report, and Export Relationship

- Dashboard and report reuse the same engine outputs for consistency.
- Report emphasizes print/PDF readability and stakeholder communication.
- Export pipeline uses `@react-pdf/renderer` (`AssessmentReportPDF`) and must not alter engine or persistence logic.
