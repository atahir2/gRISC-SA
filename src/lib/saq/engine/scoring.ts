/**
 * Core scoring and prioritisation logic for the Sustainability Self-Assessment (SAQ).
 *
 * This module is intentionally UI-agnostic and side-effect free: all functions are
 * pure and operate only on their inputs.
 */

// ---------------------------------------------------------------------------
// Basic types
// ---------------------------------------------------------------------------

/**
 * Qualitative impact levels used for magnitude and likelihood.
 */
export type ImpactLevel = "High" | "Medium" | "Low";

/**
 * Capability score levels taken from the questionnaire answer options.
 */
export type CapabilityScore = 1 | 2 | 3;

/**
 * Overall improvement priority derived from impact magnitude and likelihood.
 */
export type ImprovementPriority = "High" | "Medium" | "Low";

/**
 * Effort required to implement a given action.
 */
export type EffortRequired = "Low" | "Medium" | "High";

/**
 * High-level implementation priority bucket, used for action planning.
 */
export type ImplementationPriority =
  | "Immediate"
  | "Urgent"
  | "Planned"
  | "Low Priority"
  | "No Action Needed";

/**
 * Status of whether a capability target has been met.
 */
export type TargetStatus = "Met" | "Below Target" | "No Target";

/**
 * Simple pass/fail status for capability thresholds.
 */
export type PassStatus = "Pass" | "Fail" | "Not Applicable";

// ---------------------------------------------------------------------------
// Core scoring functions
// ---------------------------------------------------------------------------

/**
 * Compute an improvement priority from impact magnitude and likelihood.
 *
 * Rules:
 * - High + High → High
 * - High + Medium → High
 * - Medium + High → High
 * - Medium + Medium → Medium
 * - all other combinations → Low
 */
export function getImprovementPriority(
  impactMagnitude: ImpactLevel,
  impactLikelihood: ImpactLevel
): ImprovementPriority {
  const m = impactMagnitude;
  const l = impactLikelihood;

  if (
    (m === "High" && l === "High") ||
    (m === "High" && l === "Medium") ||
    (m === "Medium" && l === "High")
  ) {
    return "High";
  }

  if (m === "Medium" && l === "Medium") {
    return "Medium";
  }

  return "Low";
}

/**
 * Determine pass/fail status for a capability threshold.
 *
 * Rules:
 * - if inScope is false → "Not Applicable"
 * - if selectedScore is undefined → "Fail"
 * - if selectedScore >= threshold → "Pass"
 * - else → "Fail"
 */
export function getCapabilityPassStatus(
  selectedScore: CapabilityScore | undefined,
  threshold: CapabilityScore,
  inScope: boolean
): PassStatus {
  if (!inScope) {
    return "Not Applicable";
  }

  if (selectedScore === undefined) {
    return "Fail";
  }

  return selectedScore >= threshold ? "Pass" : "Fail";
}

/**
 * Determine the status of a target capability in relation to the selected score.
 *
 * Rules:
 * - if inScope is false → "Not Applicable"
 * - if targetCapability is undefined → "No Target"
 * - if selectedScore is defined and selectedScore >= targetCapability → "Met"
 * - otherwise → "Below Target"
 */
export function getTargetStatus(
  selectedScore: CapabilityScore | undefined,
  targetCapability: CapabilityScore | undefined,
  inScope: boolean
): TargetStatus | "Not Applicable" {
  if (!inScope) {
    return "Not Applicable";
  }

  if (targetCapability === undefined) {
    return "No Target";
  }

  if (selectedScore !== undefined && selectedScore >= targetCapability) {
    return "Met";
  }

  return "Below Target";
}

/**
 * Compute an implementation priority from improvement priority and effort.
 *
 * Matrix:
 * - High + Low → Immediate
 * - High + Medium → Urgent
 * - High + High → Planned
 *
 * - Medium + Low → Urgent
 * - Medium + Medium → Planned
 * - Medium + High → Low Priority
 *
 * - Low + Low → Planned
 * - Low + Medium → Low Priority
 * - Low + High → No Action Needed
 */
export function getImplementationPriority(
  improvementPriority: ImprovementPriority,
  effortRequired: EffortRequired
): ImplementationPriority {
  const p = improvementPriority;
  const e = effortRequired;

  if (p === "High") {
    if (e === "Low") return "Immediate";
    if (e === "Medium") return "Urgent";
    return "Planned"; // High + High
  }

  if (p === "Medium") {
    if (e === "Low") return "Urgent";
    if (e === "Medium") return "Planned";
    return "Low Priority"; // Medium + High
  }

  // p === "Low"
  if (e === "Low") return "Planned";
  if (e === "Medium") return "Low Priority";
  return "No Action Needed"; // Low + High
}

/**
 * Resolve the recommended action text for a given selected capability score.
 *
 * Rules:
 * - return the recommendedAction corresponding to the selected score
 * - if selectedScore is undefined, return undefined
 */
export function getRecommendedActionForScore(
  selectedScore: CapabilityScore | undefined,
  answerOptions: { score: CapabilityScore; recommendedAction: string }[]
): string | undefined {
  if (selectedScore === undefined) {
    return undefined;
  }

  const match = answerOptions.find(
    (opt) => opt.score === selectedScore
  );

  return match?.recommendedAction;
}

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Compute improvement priority for a question based on the selected answer option.
 *
 * Rules:
 * - find the answer option matching selectedScore
 * - compute improvement priority from its magnitude and likelihood
 * - if selectedScore is undefined, return undefined
 */
export function getQuestionImprovementPriority(
  answerOptions: {
    score: CapabilityScore;
    impactMagnitude: ImpactLevel;
    impactLikelihood: ImpactLevel;
  }[],
  selectedScore: CapabilityScore | undefined
): ImprovementPriority | undefined {
  if (selectedScore === undefined) {
    return undefined;
  }

  const match = answerOptions.find(
    (opt) => opt.score === selectedScore
  );

  if (!match) {
    return undefined;
  }

  return getImprovementPriority(
    match.impactMagnitude,
    match.impactLikelihood
  );
}

