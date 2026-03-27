import type { AssessmentResults } from "@/src/lib/saq/engine/results";
import { SectionHeader } from "./SectionHeader";
import { SummaryCard } from "./SummaryCard";
import { PriorityBadge } from "./PriorityBadge";

interface ResultsStepProps {
  assessmentResults: AssessmentResults;
}

export function ResultsStep({ assessmentResults }: ResultsStepProps) {
  const summary = assessmentResults.summary;

  if (summary.totalQuestions === 0) {
    return (
      <div className="space-y-6">
        <SectionHeader
          title="Results"
          subtitle="Summary and per-theme results from your assessment."
        />
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          No in-scope questions. Define scope in step 1 and complete the questionnaire to see results here.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Results"
        subtitle="Overall and per-theme completion, pass levels, targets met, and improvement priorities."
      />

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Overall summary
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          <SummaryCard
            label="Completion"
            value={`${summary.completionRate.toFixed(0)}%`}
            accent="primary"
          />
          <SummaryCard
            label="Questions answered"
            value={`${summary.answeredQuestions} / ${summary.totalQuestions}`}
          />
          <SummaryCard label="Targets met" value={summary.targetMetCount} />
          <SummaryCard
            label="Pass L1 / L2 / L3"
            value={`${summary.passLevel1Count} / ${summary.passLevel2Count} / ${summary.passLevel3Count}`}
          />
          <SummaryCard
            label="In-scope areas"
            value={`${summary.inScopeCount} / ${summary.totalScopes}`}
          />
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Priority (H / M / L)
            </dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              <PriorityBadge level="High" />
              <span className="font-semibold text-slate-900">
                {summary.highPriorityCount}
              </span>
              <PriorityBadge level="Medium" />
              <span className="font-semibold text-slate-900">
                {summary.mediumPriorityCount}
              </span>
              <PriorityBadge level="Low" />
              <span className="font-semibold text-slate-900">
                {summary.lowPriorityCount}
              </span>
            </dd>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          By theme
        </h3>
        {assessmentResults.themeResults.map((theme) => (
          <div
            key={theme.themeId}
            className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
              <h4 className="text-base font-semibold text-slate-900">
                {theme.themeTitle}
              </h4>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="text-slate-600">
                  {theme.summary.inScopeCount} / {theme.summary.totalScopes} in scope
                </span>
                <span className="font-semibold text-emerald-700">
                  {theme.summary.completionRate.toFixed(0)}% complete
                </span>
                <span className="text-slate-600">
                  {theme.summary.targetMetCount} targets met
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
              <SummaryCard
                label="Pass L1 / L2 / L3"
                value={`${theme.summary.passLevel1Count} / ${theme.summary.passLevel2Count} / ${theme.summary.passLevel3Count}`}
              />
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Priorities
                </dt>
                <dd className="mt-1 flex flex-wrap items-center gap-1.5 text-sm">
                  <PriorityBadge level="High" />
                  <span className="font-medium text-slate-900">
                    {theme.summary.highPriorityCount}
                  </span>
                  <PriorityBadge level="Medium" />
                  <span className="font-medium text-slate-900">
                    {theme.summary.mediumPriorityCount}
                  </span>
                  <PriorityBadge level="Low" />
                  <span className="font-medium text-slate-900">
                    {theme.summary.lowPriorityCount}
                  </span>
                </dd>
              </div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
