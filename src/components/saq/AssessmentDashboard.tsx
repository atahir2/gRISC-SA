"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getQuestionnaireConfig } from "@/src/lib/saq/questionnaire.repository";
import { buildAssessmentResults } from "@/src/lib/saq/engine/results";
import { buildActionPlan, type ExistingActionMetadata } from "@/src/lib/saq/engine/actions";
import { buildAssessmentInterpretation } from "@/src/lib/saq/engine/interpretation";
import {
  getAssessmentAccess,
  loadScopeSelections,
  loadAnswers,
  loadActionMetadata,
} from "@/src/lib/saq/assessment.repository";
import type { AssessmentRole } from "@/src/lib/saq/permissions";
import { AssessmentVersionsPanel } from "./AssessmentVersionsPanel";
import { useAssessmentVersionRoute } from "./useAssessmentVersionRoute";
import type { ScopeSelection, AssessmentAnswer } from "@/src/lib/saq/engine/results";
import type { EffortRequired } from "@/src/lib/saq/engine/scoring";
import { DashboardSummaryCard } from "./DashboardSummaryCard";
import { DashboardSection } from "./DashboardSection";
import { DashboardInfoBanner } from "./DashboardInfoBanner";
import { MetricBar } from "./MetricBar";
import { ThemePerformanceCard } from "./ThemePerformanceCard";
import { PriorityCountCard } from "./PriorityCountCard";
import { ReadinessHeroCard } from "./ReadinessHeroCard";
import { StrengthsImprovementPanel } from "./StrengthsImprovementPanel";
import { ThemeReadinessSnapshot } from "./ThemeReadinessSnapshot";
import { StrategicRecommendationsCard } from "./StrategicRecommendationsCard";

interface AssessmentDashboardProps {
  assessmentId: string;
}

export function AssessmentDashboard({ assessmentId }: AssessmentDashboardProps) {
  const {
    versions,
    versionsLoading,
    versionError,
    effectiveVersionId,
    currentVersion,
    reloadVersions,
    navigateToVersion,
  } = useAssessmentVersionRoute(assessmentId);

  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assessmentName, setAssessmentName] = useState<string | null>(null);
  const [myRole, setMyRole] = useState<AssessmentRole | null>(null);
  const [createdAt, setCreatedAt] = useState<Date | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [scopeSelections, setScopeSelections] = useState<ScopeSelection[]>([]);
  const [answers, setAnswers] = useState<AssessmentAnswer[]>([]);
  const [effortByQuestionId, setEffortByQuestionId] = useState<
    Record<string, EffortRequired>
  >({});
  const [actionMetadataByQuestionId, setActionMetadataByQuestionId] = useState<
    Record<string, ExistingActionMetadata>
  >({});

  const { scopeItems } = useMemo(() => getQuestionnaireConfig(), []);

  const loadData = useCallback(async () => {
    if (!effectiveVersionId || versionsLoading) return;
    setDataLoading(true);
    setError(null);
    try {
      const access = await getAssessmentAccess(assessmentId);
      if (!access) {
        setError("Assessment not found.");
        return;
      }
      setMyRole(access.myRole);
      const assessment = access.assessment;
      const [scope, ans, meta] = await Promise.all([
        loadScopeSelections(assessmentId, effectiveVersionId),
        loadAnswers(assessmentId, effectiveVersionId),
        loadActionMetadata(assessmentId, effectiveVersionId),
      ]);
      setAssessmentName(assessment.organisationName);
      setCreatedAt(assessment.createdAt instanceof Date ? assessment.createdAt : new Date(assessment.createdAt));
      setUpdatedAt(assessment.updatedAt instanceof Date ? assessment.updatedAt : new Date(assessment.updatedAt as string));
      const scopeByScopeId = new Map(scope.map((s) => [s.scopeId, s]));
      const mergedScope = scopeItems.map((si) => {
        const loaded = scopeByScopeId.get(si.id);
        return loaded
          ? { ...loaded, assessmentId }
          : {
              assessmentId,
              scopeId: si.id,
              inScope: false,
              targetCapability: undefined as 1 | 2 | 3 | undefined,
            };
      });
      setScopeSelections(mergedScope);
      setAnswers(ans.map((a) => ({ ...a, assessmentId })));
      const effort: Record<string, EffortRequired> = {};
      const metadata: Record<string, ExistingActionMetadata> = {};
      for (const [qId, m] of Object.entries(meta)) {
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
      setError(e instanceof Error ? e.message : "Failed to load assessment.");
    } finally {
      setDataLoading(false);
    }
  }, [assessmentId, scopeItems, effectiveVersionId, versionsLoading]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const combinedError = versionError || error;
  const loading =
    versionsLoading ||
    dataLoading ||
    (!!assessmentId && !effectiveVersionId && !versionError);

  const assessmentResults = useMemo(
    () => buildAssessmentResults(scopeSelections, answers),
    [scopeSelections, answers]
  );

  const actionPlan = useMemo(
    () =>
      buildActionPlan(assessmentResults, effortByQuestionId, actionMetadataByQuestionId),
    [assessmentResults, effortByQuestionId, actionMetadataByQuestionId]
  );

  const interpretation = useMemo(
    () => buildAssessmentInterpretation(assessmentResults, actionPlan),
    [assessmentResults, actionPlan]
  );

  const summary = assessmentResults.summary;
  const actionSummary = actionPlan.summary;
  const isCompleted =
    summary.totalQuestions > 0 &&
    summary.answeredQuestions === summary.totalQuestions;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-slate-200 bg-white p-12 shadow-sm text-center">
            <p className="text-slate-700 font-medium">Loading dashboard…</p>
            <p className="mt-1 text-sm text-slate-500">Fetching your assessment data.</p>
            <div className="mx-auto mt-6 h-1.5 w-40 max-w-full animate-pulse rounded-full bg-slate-200" />
          </div>
        </div>
      </main>
    );
  }

  if (combinedError) {
    return (
      <main className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800">
            <p className="font-medium">Could not load assessment</p>
            <p className="mt-1 text-sm">{combinedError}</p>
            <Link
              href="/saq"
              className="mt-4 inline-flex items-center rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm hover:bg-red-50"
            >
              Back to SAQ
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const formatDate = (d: Date) => d.toLocaleDateString(undefined, { dateStyle: "medium" });

  return (
    <main className="min-h-screen bg-slate-50 pb-12">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <Link
                href="/saq"
                className="text-xs font-medium text-slate-500 hover:text-slate-700"
              >
                ← Back to assessments
              </Link>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">
                  {assessmentName}
                </h1>
                <span
                  className={
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide " +
                    (isCompleted
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-amber-50 text-amber-800 border border-amber-200")
                  }
                >
                  {isCompleted ? "Completed" : "In progress"}
                </span>
              </div>
              <p className="mt-1 text-sm text-slate-600">
                Sustainability Self-Assessment — key metrics and progress for this assessment.
              </p>
              <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-0 text-xs text-slate-500">
                <span>Created {createdAt ? formatDate(createdAt) : "—"}</span>
                <span>Updated {updatedAt ? formatDate(updatedAt) : "—"}</span>
                {currentVersion && (
                  <span>
                    Version v{currentVersion.versionNumber} ({currentVersion.status})
                  </span>
                )}
              </dl>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Quick actions
              </span>
              <div className="flex flex-wrap gap-2">
                <Link
                  href={
                    effectiveVersionId
                      ? `/saq/assessment/${assessmentId}?versionId=${effectiveVersionId}`
                      : `/saq/assessment/${assessmentId}`
                  }
                  className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  Resume assessment
                </Link>
                <Link
                  href={
                    effectiveVersionId
                      ? `/saq/report/${assessmentId}?versionId=${effectiveVersionId}`
                      : `/saq/report/${assessmentId}`
                  }
                  className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  View report
                </Link>
                <Link
                  href={
                    effectiveVersionId
                      ? `/saq/report/${assessmentId}?versionId=${effectiveVersionId}`
                      : `/saq/report/${assessmentId}`
                  }
                  className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  Export PDF
                </Link>
              </div>
            </div>
          </div>
        </header>

        {myRole && effectiveVersionId && (
          <div className="mb-6">
            <AssessmentVersionsPanel
              assessmentId={assessmentId}
              myRole={myRole}
              versions={versions}
              currentVersion={currentVersion}
              currentVersionId={effectiveVersionId}
              onVersionsChanged={reloadVersions}
              onSelectVersion={navigateToVersion}
            />
          </div>
        )}

        {/* Contextual note */}
        <div className="mb-4">
          <DashboardInfoBanner />
        </div>

        {/* Assessment interpretation */}
        <section className="mb-10 space-y-5">
          <ReadinessHeroCard interpretation={interpretation} summary={summary} />
          <StrengthsImprovementPanel
            strengths={interpretation.strengths}
            improvementAreas={interpretation.improvementAreas}
          />
          <ThemeReadinessSnapshot themes={assessmentResults.themeResults} />
          <StrategicRecommendationsCard
            recommendations={interpretation.strategicRecommendations}
          />
        </section>

        {/* Top summary cards */}
        <DashboardSection
          title="At a glance"
          subtitle="Key metrics for this assessment. Use these to track progress and prioritise next steps."
          className="mb-10"
          titleSize="large"
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <DashboardSummaryCard
            label="In-scope items"
            value={summary.inScopeCount}
            accent="default"
          />
          <DashboardSummaryCard
            label="Total questions"
            value={summary.totalQuestions}
          />
          <DashboardSummaryCard
            label="Answered"
            value={summary.answeredQuestions}
          />
          <DashboardSummaryCard
            label="Completion"
            value={`${Math.round(summary.completionRate)}%`}
            accent="primary"
          />
          <DashboardSummaryCard
            label="Targets met"
            value={summary.targetMetCount}
          />
          <DashboardSummaryCard
            label="Action items"
            value={actionSummary.totalActionItems}
          />
          </div>
        </DashboardSection>

        {/* Priority summary */}
        <DashboardSection
          title="Priority summary"
          subtitle="Improvement priorities across the assessment. Focus on high-priority items first for certification or standards alignment."
          className="mb-12"
        >
          <div className="flex flex-wrap gap-4">
            <PriorityCountCard level="High" count={summary.highPriorityCount} />
            <PriorityCountCard level="Medium" count={summary.mediumPriorityCount} />
            <PriorityCountCard level="Low" count={summary.lowPriorityCount} />
          </div>
        </DashboardSection>

        {/* Capability summary */}
        <div className="border-t border-slate-200 pt-10 mb-12">
          <DashboardSection
            title="Capability summary"
            subtitle="Number of questions meeting each pass level (1–3). Higher levels indicate stronger capability."
            className="mb-0"
          >
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <MetricBar
                label="Pass level 1"
                value={summary.passLevel1Count}
                max={summary.totalQuestions}
                variant="emerald"
              />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <MetricBar
                label="Pass level 2"
                value={summary.passLevel2Count}
                max={summary.totalQuestions}
                variant="emerald"
              />
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <MetricBar
                label="Pass level 3"
                value={summary.passLevel3Count}
                max={summary.totalQuestions}
                variant="emerald"
              />
            </div>
          </div>
        </DashboardSection>
        </div>

        {/* Theme performance */}
        <DashboardSection
          title="Theme performance"
          subtitle="Completion and results by sustainability theme. Identifies which areas need more attention."
          className="mb-12"
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {assessmentResults.themeResults.map((tr) => (
              <ThemePerformanceCard
                key={tr.themeId}
                themeTitle={tr.themeTitle}
                summary={tr.summary}
              />
            ))}
          </div>
        </DashboardSection>

        {/* Action plan overview */}
        <DashboardSection
          title="Action plan overview"
          subtitle="Recommended actions by implementation priority. Use the full action plan in the assessment flow for details."
          className="mb-12"
        >
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              <div className="rounded-lg bg-red-50 px-4 py-3">
                <span className="text-xs font-medium uppercase text-red-700">
                  Immediate
                </span>
                <p className="text-xl font-bold text-red-800">
                  {actionSummary.immediateCount}
                </p>
              </div>
              <div className="rounded-lg bg-amber-50 px-4 py-3">
                <span className="text-xs font-medium uppercase text-amber-700">
                  Urgent
                </span>
                <p className="text-xl font-bold text-amber-800">
                  {actionSummary.urgentCount}
                </p>
              </div>
              <div className="rounded-lg bg-sky-50 px-4 py-3">
                <span className="text-xs font-medium uppercase text-sky-700">
                  Planned
                </span>
                <p className="text-xl font-bold text-sky-800">
                  {actionSummary.plannedCount}
                </p>
              </div>
              <div className="rounded-lg bg-slate-100 px-4 py-3">
                <span className="text-xs font-medium uppercase text-slate-600">
                  Low priority
                </span>
                <p className="text-xl font-bold text-slate-800">
                  {actionSummary.lowPriorityImplementationCount}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 px-4 py-3">
                <span className="text-xs font-medium uppercase text-slate-500">
                  No action needed
                </span>
                <p className="text-xl font-bold text-slate-700">
                  {actionSummary.noActionNeededCount}
                </p>
              </div>
            </div>
          </div>
        </DashboardSection>

        <p className="text-center text-sm text-slate-500">
          <Link href="/saq" className="text-emerald-600 hover:underline">
            Back to SAQ
          </Link>
        </p>
      </div>
    </main>
  );
}
