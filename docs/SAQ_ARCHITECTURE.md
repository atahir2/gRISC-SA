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
  - `assessments`
  - `assessment_scope_selections`
  - `assessment_answers`
  - `assessment_action_items`
- IO boundary: `src/lib/saq/assessment.repository.ts`
- Holds only per-assessment state (scope, answers, and action metadata).

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
- The report page is the source composition for PDF export behavior.

## Core Data Flow

1. Load questionnaire config from static JSON.
2. Load runtime assessment data from Supabase via repository.
3. Compute derived outputs in memory through engine modules.
4. Render assessment/dashboard/report views from those outputs.
5. Persist only runtime edits (scope/answers/action metadata), not derived results.

## Persistence Model and Boundaries

- **Persisted**: runtime state required to reconstruct an assessment.
- **Not persisted**: derived summaries, priorities, and interpretation outputs.
- UI must not bypass repositories for direct DB access.
- UI must not duplicate engine formulas or priority logic.

## Folder Structure (Practical View)

- `src/lib/saq/` - domain types, repositories, engine
- `src/lib/supabase/` - Supabase client and generated DB types
- `src/components/saq/` - SAQ feature components
- `src/app/saq/` - route entry points (landing, assessment, dashboard, report)
- `supabase/migrations/` - runtime schema migrations
- `docs/` - human reference docs
- `.cursor/rules/` - Cursor-native rule memory

For implementation process and update habits, see `docs/SAQ_DEVELOPMENT_WORKFLOW.md` (this file stays architecture-focused).

## Dashboard, Report, and Export Relationship

- Dashboard and report reuse the same engine outputs for consistency.
- Report emphasizes print/PDF readability and stakeholder communication.
- Export pipeline (html2canvas/jsPDF) is a presentation concern; it must not alter engine or persistence logic.
