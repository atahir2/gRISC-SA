# gRISC Self-Assessment Toolkit

A web-based toolkit for assessing the sustainability maturity of research infrastructures, digital infrastructures, and data centres.
The system enables structured self-assessment, generates actionable improvement plans, and produces professional reports to support sustainability planning and certification readiness.

---

## Overview

The gRISC Self-Assessment toolkit is designed to transform static sustainability questionnaires into an interactive, data-driven platform.

It allows organisations to:

* evaluate sustainability practices across multiple themes
* identify capability gaps and improvement priorities
* generate structured action plans
* interpret readiness levels
* produce stakeholder-ready reports

The tool supports internal decision-making as well as preparation for sustainability standards alignment and future certification frameworks.

---

## Key Features

* **Structured Self-Assessment**

  * Multi-theme questionnaire covering governance, energy, monitoring, circularity, water, and lifecycle

* **Scoring & Interpretation Engine**

  * Capability levels (Level 1–3)
  * Gap analysis and readiness interpretation
  * Priority classification (High / Medium / Low)

* **Action Plan Generation**

  * Automatically derived recommendations
  * Implementation prioritisation (Immediate → Consolidate)
  * Effort estimation

* **Interactive Dashboard**

  * Theme-wise performance overview
  * Priority distribution
  * Visual readiness indicators

* **Professional Report Export**

  * Structured PDF report
  * Interpretation, summaries, and detailed action plans
  * Suitable for stakeholder review and baseline discussions

---

## Tech Stack

* **Frontend:** Next.js (App Router), React
* **Styling:** Tailwind CSS
* **Backend / DB:** Supabase
* **Data Model:** JSON-based questionnaire + relational persistence
* **Export:** HTML-based PDF rendering

---

## Architecture Overview

The system follows a modular architecture:

### 1. Static Questionnaire Layer

* Defined in JSON
* Contains themes, scope items, questions, and answer options

### 2. Runtime Assessment Layer

* Stores user responses and scope selections
* Managed via Supabase

### 3. SAQ Engine

Located in `src/lib/saq/engine/`

* `scoring.ts` → calculates capability scores
* `results.ts` → builds aggregated results
* `actions.ts` → generates action plans
* `interpretation.ts` → produces readiness insights

### 4. UI Layer

* Assessment flow (step-based)
* Dashboard and analytics
* Report view

### 5. Report & Export Layer

* Report page acts as source of truth
* PDF generated from rendered HTML (preserving layout and styling)

---

## Project Structure (Simplified)

```
src/
  app/saq/
    assessment/
    dashboard/
    report/

  components/saq/

  lib/
    saq/
      engine/
      utils/
      questionnaire.data.json
    supabase/

docs/
.cursor/rules/
```

---

## Getting Started

### 1. Install dependencies

```
npm install
```

### 2. Configure environment

Create a `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

### 3. Run the development server

```
npm run dev
```

Open:

```
http://localhost:3000
```

---

## Development Guidelines

* Business logic must remain inside `src/lib/saq/engine/`
* Do not persist derived results (scores, actions) in the database
* The report page must remain the single source of truth for PDF export
* UI components should consume engine outputs, not reimplement logic

---

## Documentation & Project Memory

This project includes a structured documentation layer:

* `docs/SAQ_PROJECT_CONTEXT.md` → project overview
* `docs/SAQ_ARCHITECTURE.md` → technical design
* `docs/SAQ_DEVELOPMENT_WORKFLOW.md` → development guidance
* `.cursor/rules/` → AI-assisted development rules

These ensure consistency across development and enable easier onboarding for contributors.

---

## Use Cases

* Sustainability self-assessment for research infrastructures
* Internal benchmarking and improvement planning
* Supporting sustainability reporting and transparency
* Preparing for certification baseline development

---

## Contact

For collaboration, research integration, or contributions, please reach out to Adnan (a.tahir2@uva.nl)
