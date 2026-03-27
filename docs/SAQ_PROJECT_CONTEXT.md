# SAQ Architecture & Project Context

Quick reference for the **Sustainability Self-Assessment (SAQ) Tool** so a new session can understand the system without re-reading the whole codebase.

Related docs:

- `docs/SAQ_ARCHITECTURE.md` - concise technical architecture reference
- `docs/SAQ_DEVELOPMENT_WORKFLOW.md` - safe implementation workflow and memory usage
- `docs/SAQ_SUPABASE_SETUP.md` - persistence setup and runtime table bootstrap

---

## 0. Fast onboarding checklist

If you are new to this project and need to be productive quickly:

1. **Read this file (`SAQ_PROJECT_CONTEXT.md`)**  
   - Skim sections 1–3 to understand purpose and architecture.  
   - Refer back to sections 4–7 when you touch engine, questionnaire, or repositories.

2. **Run the app**  
   - Ensure Supabase is running and environment variables are set (see `docs/SAQ_SUPABASE_SETUP.md`).  
   - From the project root: `npm install` (once) and `npm run dev`.

3. **Explore the user workflow**  
   - Go to `/saq` in the browser.  
   - Create a new assessment and walk through: **Scope & goals → Questionnaire → Results → Action plan → Dashboard → Report/PDF**.  
   - Notice how results and action plans change live as you edit answers/scope.

4. **Understand the three core layers**  
   - Static questionnaire config: `src/lib/saq/questionnaire.data.json` + `questionnaire.repository.ts`.  
   - Runtime state types: `src/lib/saq/assessment.types.ts`.  
   - Engine: `src/lib/saq/engine/*` (pure functions for scoring, results, actions).

5. **Find the UI entry points**  
   - Landing and assessment management: `src/app/saq/page.tsx` → `SaqLanding`.  
   - Assessment flow: `src/app/saq/assessment/[assessmentId]/page.tsx` → `AssessmentLayout` and step components.  
   - Dashboard: `src/app/saq/dashboard/[assessmentId]/page.tsx` → `AssessmentDashboard`.  
   - Report/PDF: `src/app/saq/report/[assessmentId]/page.tsx` → `AssessmentReport`.

6. **Respect the key design rules** (see section 11 for details)  
   - Static questionnaire stays in JSON only (never in DB).  
   - Derived results are never stored in the database.  
   - UI always calls repositories + engine modules instead of duplicating logic.

With this checklist plus this file, you should have enough context to safely extend the UI, tweak the questionnaire, or add new views without breaking the core architecture.

---

## 1. Project purpose

The SAQ is a **Sustainability Self-Assessment tool** for **Research Infrastructures, digital infrastructures, datacenters, and organisations** that need to:

- evaluate their **sustainability maturity**
- assess capability levels across multiple themes
- identify **improvement gaps**
- generate **recommended actions**
- prioritise actions by **impact and effort**
- prepare a **structured sustainability baseline** for:
  - certification and audits
  - standards alignment
  - regulatory / directive readiness
  - internal sustainability planning

It is **not a certification system** itself. It helps organisations prepare for certification or standards-alignment pathways.

---

## 2. Technology stack

- **Next.js** (App Router)
- **React**
- **Tailwind CSS**
- **Supabase (PostgreSQL)** — persistence for assessments, scope, answers, action metadata; see `docs/SAQ_SUPABASE_SETUP.md`
- **PDF export** — `html2canvas` + `jsPDF` from a dedicated report page

---

## 3. Core architecture (high-level)

The system is intentionally split into three logical layers plus a repository layer:

| Layer | Description |
|-------|-------------|
| **Static questionnaire configuration** | Master themes, scope items, questions, and answer options. File-based only; never changed per user. |
| **Runtime assessment state** | Per-assessment data: assessments, scope selections, answers, and action metadata. Persisted in Supabase. |
| **SAQ engine modules** | Pure TypeScript modules for scoring, results, and action plan generation. No UI and no DB access. Consume static config + runtime state and produce derived results. |
| **Repository layer** | IO boundary that loads the static questionnaire and reads/writes runtime state to Supabase. UI never talks to Supabase directly. |

Derived results (scores, priorities, summaries) are **always recomputed in memory** and never persisted.

---

## 4. Static questionnaire layer

**Location:** `src/lib/saq/questionnaire.data.json`

**Contents:**

- **themes** — High-level categories (e.g. Governance, Energy, Water).
- **scopeItems** — Topic areas under each theme (`id`, `themeId`, `code`, `label`).
- **questions** — One per requirement; each has `themeId`, `scopeId`, `code`, `text`, and optional metadata (lifecycle phase, dimension, metric, reference).
- **answerOptions** — Exactly three per question (scores **1–3**) with description, impact magnitude/likelihood, and suggested action text.

**Origin:** Derived from the GreenDIGIT Excel SAQ workbook (sheet `2-3. Assessment & Actions`). Columns D–O map to question and answer-option fields; column P is runtime answer only and is **not** in the static config.

**Access:** `src/lib/saq/questionnaire.repository.ts`

Key helpers:

- `getQuestionnaireConfig()`
- `getThemes()`, `getScopeItems()`, `getQuestions()`
- `getScopeItemsByTheme(themeId)`
- `getQuestionsByScope(scopeId)`
- `getQuestionById(questionId)`
- `getQuestionByCode(code)`

**Important rule:** the static questionnaire is **never stored in the database**.

---

## 5. Runtime assessment model

**Types:** `src/lib/saq/assessment.types.ts`

| Entity | Purpose |
|--------|---------|
| **Assessment** | One SAQ run: `id`, `organisationName`, `createdAt`, `updatedAt`. |
| **ScopeSelection** | Per scope item: `assessmentId`, `scopeId`, `inScope`, optional `targetCapability` (1–3). |
| **AssessmentAnswer** | Per question: `assessmentId`, `questionId`, `selectedScore` (1–3, optional if unanswered). |
| **ActionItem** (domain) | Captures action metadata: `effortRequired`, `leader`, `deadline`, `status`, `remarks`. Improvement/implementation priorities are **derived** by the engine. |

Only runtime state is persisted; everything else is recomputed from that state + the static questionnaire.

---

## 6. SAQ engine modules

**Location:** `src/lib/saq/engine/`

| Module | Responsibility |
|--------|----------------|
| `scoring.ts` | Pure helpers such as `getImprovementPriority()`, `getCapabilityPassStatus()`, `getTargetStatus()`, `getImplementationPriority()`, `getRecommendedActionForScore()`, `getQuestionImprovementPriority()`. Defines types like `CapabilityScore`, `ImpactLevel`, `PassStatus`, `TargetStatus`, etc. |
| `results.ts` | `buildAssessmentResults(scopeSelections, answers)` → per-theme, per-scope, and per-question results + overall summary (completion, pass levels, targets met, priority counts, theme summaries). |
| `actions.ts` | `buildActionPlan(results, effortByQuestionId, actionMetadataByQuestionId)` → structured, sorted action items derived from results + effort + metadata, plus aggregated summary (counts per implementation priority, etc.). |
| `scope.ts` | Scope-related helpers (in-scope maps, filters, etc.). |

All engine code is:

- **pure** (side-effect free)
- **UI-agnostic** (no React, no JSX)
- **DB-agnostic** (no Supabase imports)

Engine functions are reused from both the multi-step assessment flow, the dashboard, and the report to avoid duplicating logic.

---

## 7. Repository layer

**Location:** `src/lib/saq/`

- `questionnaire.repository.ts` — thin wrapper around `questionnaire.data.json` (see section 4).
- `assessment.repository.ts` — IO boundary for Supabase runtime tables.

`assessment.repository.ts` responsibilities:

- Create and list **assessments**.
- Save and load **scope selections** and **answers**.
- Save and load **action items / metadata** (effort, leader, deadline, status, remarks).
- Map between DB row types (from `supabase/database.types.ts`) and domain types from `assessment.types.ts`.

The UI only calls repository functions and never calls Supabase client APIs directly.

---

## 8. UI workflow & routes

### 8.1 Top-level routing

- `src/app/page.tsx` — redirects to `/saq`.
- `src/app/saq/page.tsx` — SAQ landing page (`SaqLanding`).
- `src/app/saq/assessment/[assessmentId]/page.tsx` — multi-step assessment flow for a given assessment.
- `src/app/saq/assessment/page.tsx` — redirect helper; goes back to `/saq`.
- `src/app/saq/dashboard/[assessmentId]/page.tsx` — dashboard overview for an assessment (`AssessmentDashboard`).
- `src/app/saq/report/[assessmentId]/page.tsx` — report page (`AssessmentReport`) with PDF export.

Global layout: `src/app/layout.tsx` (injects global styles and metadata).

### 8.2 Landing & assessment management

**Components:**

- `SaqLanding` — orchestrates the landing page:
  - Renders `WelcomeHero` (high-level introduction: what the tool is, who it is for, what it produces, how it helps).
  - Shows “How it works” cards (4 steps).
  - Provides “Start a new assessment” form (organisation name → creates assessment and routes into the flow).
  - Lists existing assessments via `AssessmentListCard` and `EmptyAssessmentsState`.
- `WelcomeHero` — communication-focused hero explaining:
  - what the SAQ is
  - who it is for
  - what outputs it provides (results overview, priority summary, action plan, PDF report)
  - how it helps build a sustainability baseline for certification, standards, regulations/directives, and internal planning.
- `HowItWorksCard` — small cards describing the 4-step process: Scope & Goals → Questionnaire → Results & Dashboard → Action Plan & Report.
- `AssessmentListCard` — displays each assessment (organisation name, created/updated dates, and quick actions: **Open / Resume**, **Dashboard**, **Report**, **Export PDF**).
- `EmptyAssessmentsState` — friendly message when no assessments exist yet.

### 8.3 Assessment flow (Scope → Questionnaire → Results → Action plan)

**Core components in `src/components/saq/`:**

| Component | Step | Role |
|-----------|------|------|
| `AssessmentLayout` | All | Orchestrates the multi-step flow for one `assessmentId`. Loads questionnaire config and runtime state, holds local step state, and coordinates saving via the repository. Reuses engine modules to compute results and action plans. |
| `AssessmentStepper` | All | Visual stepper for “Scope & goals → Questionnaire → Results → Action plan”. |
| `ScopeGoalsStep` | 1 | Shows themes/scope items and allows toggling `inScope` and setting `targetCapability` (1–3) per scope item. Uses the questionnaire repository. |
| `QuestionnaireStep` | 2 | Shows in-scope questions only; 1–3 capability selector per question (via `CapabilitySelector`). Displays progress (answered / total, %). |
| `ResultsStep` | 3 | Calls `buildAssessmentResults(...)` and shows summaries: completion, pass levels, targets met, priority counts, and theme summaries. |
| `ActionPlanStep` | 4 | Calls `buildActionPlan(...)` and presents a structured list of action items. Allows selecting effort and action metadata (leader, deadline, status, remarks); implementation priority badges are derived from the engine. |

Supporting UI primitives:

- `CapabilitySelector`, `PriorityBadge`, `ImplementationPriorityBadge`, `SummaryCard`, `SectionHeader`, etc.

The flow persists runtime state through `assessment.repository.ts` and never writes derived results to the database.

### 8.4 Dashboard

**Route:** `src/app/saq/dashboard/[assessmentId]/page.tsx` → `AssessmentDashboard`.

**AssessmentDashboard**:

- Loads:
  - assessment (name, created/updated)
  - scope selections
  - answers
  - action metadata
- Immediately calls:
  - `buildAssessmentResults(scopeSelections, answers)`
  - `buildActionPlan(assessmentResults, effortByQuestionId, actionMetadataByQuestionId)`
- Presents a read-only, high-level overview:
  - **At a glance** (via `DashboardSummaryCard` + `DashboardSection`)
    - in-scope items, total questions, answered questions
    - completion %, targets met
    - total action items
  - **Capability summary**
    - pass level 1 / 2 / 3 counts via `MetricBar`
  - **Priority summary**
    - high / medium / low priority counts via `PriorityCountCard`
  - **Theme performance**
    - per-theme cards via `ThemePerformanceCard` (completion & basic results)
  - **Action plan overview**
    - distribution of action items by implementation priority (Immediate, Urgent, Planned, Low priority, No action needed)
  - **Charts**
    - simple CSS-based bars for theme completion and priority distribution (no heavy charting library).

UI helpers:

- `DashboardSection` — section wrapper with headings and optional “large” title size for the main overview section.
- `DashboardInfoBanner` — contextual paragraph explaining what the dashboard summarises and how to use it (tracking progress, stakeholder communication, baseline preparation).

The dashboard reuses the same engine outputs as the multi-step flow; it does **not** implement its own scoring logic.

### 8.5 Report & PDF export

**Route:** `src/app/saq/report/[assessmentId]/page.tsx` → `AssessmentReport`.

The report page:

- Reuses `buildAssessmentResults(...)` and `buildActionPlan(...)` to render a print-friendly summary:
  - header (organisation, dates)
  - summary metrics
  - per-theme sections
  - action table with priorities and effort
- Uses `html2canvas` + `jsPDF` to export the rendered report area as a PDF:
  - purely a **view/export layer** — no changes to engine or persistence.

UI helpers for the report:

- `ReportHeader`, `ReportSummaryCard`, `ReportThemeCard`, `ReportSection`, `ReportActionTable`, etc.

---

## 9. Supabase persistence

Runtime persistence is implemented via `assessment.repository.ts` and Supabase tables (see `supabase/migrations/...` and `docs/SAQ_SUPABASE_SETUP.md`):

- **assessments**
  - columns: `id`, `organisation_name`, `created_at`, `updated_at`
  - used for: creating, listing, and loading assessments for landing, dashboard, and report pages.
- **assessment_scope_selections**
  - columns: `assessment_id`, `scope_id`, `in_scope`, `target_capability`
  - when loading, scope selections are merged with the full scope list from the questionnaire so that all scope items are represented.
- **assessment_answers**
  - columns: `assessment_id`, `question_id`, `selected_score`
  - used to reconstruct `AssessmentAnswer[]` for engine calls.
- **assessment_action_items**
  - columns: `assessment_id`, `question_id`, `effort_required`, `leader`, `deadline`, `status`, `remarks`
  - used to persist action metadata and effort per question; the engine consumes this to derive implementation priority.

Only these runtime tables live in the database. The static questionnaire is **not** represented in Supabase.

---

## 10. Current capabilities (implemented)

- Scope selection (in-scope toggle, optional target capability 1–3 per scope item).
- Questionnaire answering (1–3 per question; only in-scope questions shown).
- Scoring (pass/target status, improvement priority, implementation priority) via engine modules.
- Results (overall and per-theme): completion, pass levels, targets met, priority counts, theme summaries.
- Action plan generation:
  - prioritised actions per question
  - effort and metadata persisted
  - implementation priority derived from scoring + effort.
- Multi-step assessment UI with stepper, validation, and persisted state.
- SAQ landing page with:
  - clear welcome/introduction (`WelcomeHero`)
  - “How it works” overview
  - “Start a new assessment” flow
  - assessment list/management section.
- Dashboard (`AssessmentDashboard`) with read-only metrics, theme performance, and action distribution.
- Report page (`AssessmentReport`) with HTML-based report and **PDF export**.

---

## 11. Important design rules

- **Static questionnaire is never stored in the database.**
  - Lives only in `questionnaire.data.json`, accessed via `questionnaire.repository.ts`.
- **Derived results are never persisted.**
  - Completion, pass levels, target status, improvement priority, implementation priority, and theme summaries are recomputed from scope selections + answers + action metadata + static questionnaire.
- **Only runtime state is stored in Supabase:**
  - assessments, scope selections, answers, and action metadata (effort, leader, deadline, status, remarks).
- **UI must reuse engine modules and repositories.**
  - Components call the questionnaire repository + engine functions instead of reimplementing scoring or results logic.
- **Engine layer stays pure and isolated.**
  - No React, no Supabase, no direct IO.

Keep these rules in mind when extending the system (new pages, charts, exports, etc.) so that the architecture remains consistent.
