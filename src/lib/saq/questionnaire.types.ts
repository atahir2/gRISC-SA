/**
 * Static questionnaire configuration types (Layer 1).
 *
 * These types mirror the structure of `questionnaire.data.json` and should
 * remain stable and immutable at runtime.
 */

export type CapabilityScore = 1 | 2 | 3;

export type ImpactLevel = "High" | "Medium" | "Low";

export interface Theme {
  id: string;
  title: string;
  description?: string;
}

export interface ScopeItem {
  id: string;
  themeId: string;
  code: string;
  label: string;
}

export interface AnswerOption {
  score: CapabilityScore;
  description: string;
  impactMagnitude: ImpactLevel;
  impactLikelihood: ImpactLevel;
  recommendedAction: string;
}

export interface Question {
  id: string;
  themeId: string;
  scopeId: string;
  code: string;
  text: string;
  lifecyclePhase?: string;
  environmentalDimension?: string;
  associatedMetric?: string;
  reference?: string;
  answerOptions: AnswerOption[];
}

export interface QuestionnaireConfig {
  themes: Theme[];
  scopeItems: ScopeItem[];
  questions: Question[];
}

