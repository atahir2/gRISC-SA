import { buildAssessmentResults, AssessmentResults } from "./results";
import { CapabilityScore } from "./scoring";

/**
 * Simple demo inputs for the results engine.
 *
 * These examples assume that the questionnaire configuration contains
 * scope items and questions with IDs like "G1", "G2", "G1.1", etc.,
 * as generated from the Excel workbook.
 */

export const exampleScopeSelections = [
  {
    assessmentId: "demo-assessment-1",
    scopeId: "G1",
    inScope: true,
    targetCapability: 2 as CapabilityScore,
  },
  {
    assessmentId: "demo-assessment-1",
    scopeId: "G2",
    inScope: true,
    targetCapability: 3 as CapabilityScore,
  },
  {
    assessmentId: "demo-assessment-1",
    scopeId: "E1",
    inScope: false,
  },
] as const;

export const exampleAnswers = [
  {
    assessmentId: "demo-assessment-1",
    questionId: "G1.1",
    selectedScore: 1 as CapabilityScore,
  },
  {
    assessmentId: "demo-assessment-1",
    questionId: "G1.2",
    selectedScore: 2 as CapabilityScore,
  },
  {
    assessmentId: "demo-assessment-1",
    questionId: "G2.1",
    selectedScore: 3 as CapabilityScore,
  },
] as const;

export function buildExampleAssessmentResults(): AssessmentResults {
  return buildAssessmentResults(
    [...exampleScopeSelections],
    [...exampleAnswers]
  );
}

