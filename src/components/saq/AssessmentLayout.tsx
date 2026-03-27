"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AssessmentStepper } from "./AssessmentStepper";
import { ScopeGoalsStep } from "./ScopeGoalsStep";
import { QuestionnaireStep } from "./QuestionnaireStep";
import { ResultsStep } from "./ResultsStep";
import { ActionPlanStep } from "./ActionPlanStep";
import { getQuestionnaireConfig } from "@/src/lib/saq/questionnaire.repository";
import type {
  ScopeSelection,
  AssessmentAnswer,
} from "@/src/lib/saq/engine/results";
import { buildAssessmentResults } from "@/src/lib/saq/engine/results";
import { buildActionPlan, type ExistingActionMetadata } from "@/src/lib/saq/engine/actions";
import type { EffortRequired } from "@/src/lib/saq/engine/scoring";
import {
  getAssessmentById,
  loadScopeSelections,
  loadAnswers,
  loadActionMetadata,
  saveScopeSelections,
  saveAnswers,
  saveActionMetadata,
  type ActionMetadata,
} from "@/src/lib/saq/assessment.repository";

const STEPS = ["Scope & Goals", "Questionnaire", "Results", "Action Plan"] as const;

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface AssessmentLayoutProps {
  assessmentId?: string;
}

export function AssessmentLayout({ assessmentId }: AssessmentLayoutProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(!!assessmentId);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [assessmentName, setAssessmentName] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [currentStep, setCurrentStep] = useState(0);

  const { themes, scopeItems, questions } = useMemo(
    () => getQuestionnaireConfig(),
    []
  );

  const [scopeSelections, setScopeSelections] = useState<ScopeSelection[]>([]);
  const [answers, setAnswers] = useState<AssessmentAnswer[]>([]);
  const [effortByQuestionId, setEffortByQuestionId] = useState<
    Record<string, EffortRequired>
  >({});
  const [actionMetadataByQuestionId, setActionMetadataByQuestionId] = useState<
    Record<string, ExistingActionMetadata>
  >({});

  useEffect(() => {
    if (!assessmentId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [assessment, scope, ans, meta] = await Promise.all([
          getAssessmentById(assessmentId),
          loadScopeSelections(assessmentId),
          loadAnswers(assessmentId),
          loadActionMetadata(assessmentId),
        ]);
        if (cancelled) return;
        if (!assessment) {
          setLoadError("Assessment not found.");
          setLoading(false);
          return;
        }
        setAssessmentName(assessment.organisationName);
        // Merge loaded scope with all scope items so we have one entry per scope (full persistence)
        const scopeByScopeId = new Map(scope.map((s) => [s.scopeId, s]));
        const mergedScope = scopeItems.map((si) => {
          const loaded = scopeByScopeId.get(si.id);
          return loaded
            ? { ...loaded, assessmentId }
            : { assessmentId, scopeId: si.id, inScope: false, targetCapability: undefined as 1 | 2 | 3 | undefined };
        });
        setScopeSelections(mergedScope);
        setAnswers(ans.map((a) => ({ ...a, assessmentId })));
        const effort: Record<string, EffortRequired> = {};
        const metadata: Record<string, ExistingActionMetadata> = {};
        for (const [qId, m] of Object.entries(meta) as [string, ActionMetadata][]) {
          if (m.effortRequired) effort[qId] = m.effortRequired;
          metadata[qId] = {
            leader: m.leader,
            deadline: m.deadline,
            status: m.status,
            remarks: m.remarks,
          };
        }
        setEffortByQuestionId(effort);
        setActionMetadataByQuestionId(metadata);
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : "Failed to load assessment.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [assessmentId]);

  const persistScope = useCallback(async () => {
    if (!assessmentId) return;
    setSaveStatus("saving");
    try {
      await saveScopeSelections(assessmentId, scopeSelections);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
    }
  }, [assessmentId, scopeSelections]);

  const persistAnswers = useCallback(async () => {
    if (!assessmentId) return;
    setSaveStatus("saving");
    try {
      await saveAnswers(assessmentId, answers);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
    }
  }, [assessmentId, answers]);

  const persistActionMetadata = useCallback(async () => {
    if (!assessmentId) return;
    setSaveStatus("saving");
    try {
      const combined: Record<string, ActionMetadata> = {};
      for (const [qId, effort] of Object.entries(effortByQuestionId)) {
        combined[qId] = { ...actionMetadataByQuestionId[qId], effortRequired: effort };
      }
      for (const [qId, m] of Object.entries(actionMetadataByQuestionId)) {
        if (!combined[qId]) combined[qId] = m;
      }
      await saveActionMetadata(assessmentId, combined);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
    }
  }, [assessmentId, effortByQuestionId, actionMetadataByQuestionId]);

  const assessmentResults = useMemo(
    () => buildAssessmentResults(scopeSelections, answers),
    [scopeSelections, answers]
  );

  const actionPlan = useMemo(
    () =>
      buildActionPlan(assessmentResults, effortByQuestionId, actionMetadataByQuestionId),
    [assessmentResults, effortByQuestionId, actionMetadataByQuestionId]
  );

  const inScopeCount = scopeSelections.filter((s) => s.inScope).length;
  const totalQuestions = assessmentResults.summary.totalQuestions;
  const answeredQuestions = assessmentResults.summary.answeredQuestions;
  const completionPct =
    totalQuestions === 0 ? 0 : Math.round((answeredQuestions / totalQuestions) * 100);

  const canProceedToResults = inScopeCount > 0;
  const canProceedToActionPlan = totalQuestions > 0;

  const canGoNext =
    currentStep === STEPS.length - 1
      ? true
      : currentStep === 0
      ? canProceedToResults
      : currentStep === 1
      ? totalQuestions === 0 || answeredQuestions > 0
      : currentStep === 2
      ? canProceedToActionPlan
      : true;

  const canGoBack = currentStep > 0;

  const blockReason =
    currentStep === 0 && !canProceedToResults
      ? "Select at least one scope item as in scope to continue."
      : currentStep === 1 && totalQuestions > 0 && answeredQuestions === 0
      ? "Answer at least one question to continue."
      : currentStep === 2 && !canProceedToActionPlan
      ? "Complete the questionnaire to view the action plan."
      : null;

  const goNext = useCallback(() => {
    const next = currentStep + 1;
    if (next >= STEPS.length) {
      if (assessmentId) {
        persistActionMetadata().then(() =>
          router.push(`/saq/dashboard/${assessmentId}`)
        );
      } else {
        router.push("/saq");
      }
      return;
    }
    if (assessmentId) {
      if (currentStep === 0) persistScope().then(() => setCurrentStep(next));
      else if (currentStep === 1) persistAnswers().then(() => setCurrentStep(next));
      else setCurrentStep(next);
    } else {
      setCurrentStep(next);
    }
  }, [assessmentId, currentStep, persistScope, persistAnswers, persistActionMetadata, router]);

  const goBack = useCallback(() => {
    const prev = Math.max(0, currentStep - 1);
    if (assessmentId && currentStep === 1) {
      persistScope().then(() => setCurrentStep(prev));
    } else if (assessmentId && currentStep === 2) {
      persistAnswers().then(() => setCurrentStep(prev));
    } else {
      setCurrentStep(prev);
    }
  }, [assessmentId, currentStep, persistScope, persistAnswers]);

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-16 text-center">
          <p className="text-slate-600">Loading assessment…</p>
        </div>
      </main>
    );
  }

  if (loadError && assessmentId) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-16">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            {loadError}
          </div>
          <button
            type="button"
            onClick={() => router.push("/saq")}
            className="mt-4 text-sm font-medium text-emerald-600 hover:underline"
          >
            Back to SAQ
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            Sustainability Self-Assessment
          </h1>
          <p className="mt-1 text-sm text-slate-600 sm:text-base">
            Prepare a certification baseline for your Research Infrastructure by defining scope, answering the questionnaire, and reviewing results and recommended actions.
          </p>
          {assessmentName && (
            <p className="mt-2 text-sm font-medium text-slate-700">
              Assessment: {assessmentName}
            </p>
          )}
          {assessmentId && (
            <div className="mt-2 flex items-center gap-2 text-sm text-slate-500">
              {saveStatus === "saving" && <span>Saving…</span>}
              {saveStatus === "saved" && <span className="text-emerald-600">Saved</span>}
              {saveStatus === "error" && <span className="text-red-600">Save failed</span>}
            </div>
          )}
        </header>

        <div className="mb-6 flex flex-wrap items-center gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Step
            </span>
            <span className="font-semibold text-slate-900">
              {currentStep + 1} of {STEPS.length}
            </span>
            <span className="text-sm text-slate-600">— {STEPS[currentStep]}</span>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div>
              <span className="text-slate-500">In-scope questions: </span>
              <span className="font-medium text-slate-900">{totalQuestions}</span>
            </div>
            <div>
              <span className="text-slate-500">Answered: </span>
              <span className="font-medium text-slate-900">{answeredQuestions}</span>
            </div>
            <div>
              <span className="text-slate-500">Completion: </span>
              <span className="font-semibold text-emerald-700">{completionPct}%</span>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-4 py-3 sm:px-6">
            <AssessmentStepper currentStep={currentStep} steps={STEPS} />
          </div>

          <div className="px-4 py-6 sm:px-6 sm:py-8">
            {currentStep === 0 && (
              <ScopeGoalsStep
                themes={themes}
                scopeItems={scopeItems}
                scopeSelections={scopeSelections}
                onChange={setScopeSelections}
              />
            )}
            {currentStep === 1 && (
              <QuestionnaireStep
                themes={themes}
                scopeItems={scopeItems}
                questions={questions}
                scopeSelections={scopeSelections}
                answers={answers}
                onChange={setAnswers}
              />
            )}
            {currentStep === 2 && (
              <ResultsStep assessmentResults={assessmentResults} />
            )}
            {currentStep === 3 && (
              <ActionPlanStep
                actionPlan={actionPlan}
                onEffortChange={(questionId, effort) =>
                  setEffortByQuestionId((prev) => ({
                    ...prev,
                    [questionId]: effort,
                  }))
                }
                onActionMetadataChange={(questionId, patch) =>
                  setActionMetadataByQuestionId((prev) => ({
                    ...prev,
                    [questionId]: { ...prev[questionId], ...patch },
                  }))
                }
              />
            )}

            {blockReason && (
              <p className="mt-4 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
                {blockReason}
              </p>
            )}

            <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
              <button
                type="button"
                disabled={!canGoBack}
                onClick={goBack}
                className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Back
              </button>
              <span className="text-sm text-slate-500">
                Step {currentStep + 1} of {STEPS.length}
              </span>
              <button
                type="button"
                disabled={!canGoNext}
                onClick={goNext}
                className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {currentStep === STEPS.length - 1 ? "Finish" : "Next"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
