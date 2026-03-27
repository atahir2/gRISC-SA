import { buildAssessmentResults } from "./results";
import { buildActionPlan, ActionPlan } from "./actions";
import { CapabilityScore, EffortRequired } from "./scoring";

/**
 * Example wiring for the results engine and action plan engine.
 *
 * This module is intended for documentation / testing only and is not used
 * directly by the UI.
 */

// Example scope selections and answers for a small demo assessment.
const demoScopeSelections = [
  {
    assessmentId: "demo-assessment-actions",
    scopeId: "G1",
    inScope: true,
    targetCapability: 2 as CapabilityScore,
  },
  {
    assessmentId: "demo-assessment-actions",
    scopeId: "G2",
    inScope: true,
    targetCapability: 3 as CapabilityScore,
  },
] as const;

const demoAnswers = [
  {
    assessmentId: "demo-assessment-actions",
    questionId: "G1.1",
    selectedScore: 1 as CapabilityScore,
  },
  {
    assessmentId: "demo-assessment-actions",
    questionId: "G1.2",
    selectedScore: 2 as CapabilityScore,
  },
  {
    assessmentId: "demo-assessment-actions",
    questionId: "G2.1",
    selectedScore: 3 as CapabilityScore,
  },
] as const;

// Example effort estimates per question.
const demoEffortByQuestionId: Record<string, EffortRequired> = {
  "G1.1": "Low",
  "G1.2": "Medium",
  "G2.1": "High",
};

// Example metadata for existing / planned actions.
const demoExistingActionMetadata = {
  "G1.1": {
    leader: "Sustainability Officer",
    deadline: "2026-06-30",
    status: "Planned" as const,
    remarks: "Initial regulatory gap analysis to be commissioned.",
  },
  "G1.2": {
    leader: "Compliance Lead",
    deadline: "2026-09-30",
    status: "In Progress" as const,
    remarks: "Draft review completed; awaiting management sign-off.",
  },
};

export function buildDemoActionPlan(): ActionPlan {
  const results = buildAssessmentResults(
    [...demoScopeSelections],
    [...demoAnswers]
  );

  return buildActionPlan(
    results,
    demoEffortByQuestionId,
    demoExistingActionMetadata
  );
}

