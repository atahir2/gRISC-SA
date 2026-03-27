import {
  CapabilityScore,
  EffortRequired,
  getCapabilityPassStatus,
  getImplementationPriority,
  getImprovementPriority,
  getQuestionImprovementPriority,
  getRecommendedActionForScore,
  getTargetStatus,
  ImpactLevel,
  ImprovementPriority,
} from "./scoring";

/**
 * Small demo / self-test snippets for the scoring engine.
 * These are not executed automatically, but can be imported into
 * unit tests or story-like examples.
 */

export const scoringExamples = {
  basicImprovementPriority(): ImprovementPriority {
    const magnitude: ImpactLevel = "High";
    const likelihood: ImpactLevel = "Medium";
    return getImprovementPriority(magnitude, likelihood); // → "High"
  },

  passStatusExample(): void {
    const selected: CapabilityScore = 2;
    const threshold: CapabilityScore = 2;
    const inScope = true;
    const status = getCapabilityPassStatus(selected, threshold, inScope);
    // status === "Pass"
    void status;
  },

  targetStatusExample(): void {
    const selected: CapabilityScore = 2;
    const target: CapabilityScore = 3;
    const inScope = true;
    const status = getTargetStatus(selected, target, inScope);
    // status === "Below Target"
    void status;
  },

  implementationPriorityExample(): void {
    const priority: ImprovementPriority = "High";
    const effort: EffortRequired = "Low";
    const impl = getImplementationPriority(priority, effort);
    // impl === "Immediate"
    void impl;
  },

  recommendedActionExample(): string | undefined {
    const selected: CapabilityScore = 1;
    const options = [
      { score: 1 as CapabilityScore, recommendedAction: "Start tracking metrics." },
      { score: 2 as CapabilityScore, recommendedAction: "Formalise existing practices." },
      { score: 3 as CapabilityScore, recommendedAction: "Maintain and periodically review." },
    ];
    return getRecommendedActionForScore(selected, options);
  },

  questionImprovementPriorityExample(): ImprovementPriority | undefined {
    const selected: CapabilityScore = 1;
    const options = [
      {
        score: 1 as CapabilityScore,
        impactMagnitude: "High" as ImpactLevel,
        impactLikelihood: "High" as ImpactLevel,
      },
      {
        score: 2 as CapabilityScore,
        impactMagnitude: "Medium" as ImpactLevel,
        impactLikelihood: "Medium" as ImpactLevel,
      },
      {
        score: 3 as CapabilityScore,
        impactMagnitude: "Low" as ImpactLevel,
        impactLikelihood: "Low" as ImpactLevel,
      },
    ];

    return getQuestionImprovementPriority(options, selected);
  },
};

