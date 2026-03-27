export function EmptyAssessmentsState() {
  return (
    <div
      className="rounded-xl border border-dashed border-slate-300 bg-slate-50/80 py-12 px-6 text-center"
      role="status"
      aria-label="No assessments yet"
    >
      <p className="text-sm font-medium text-slate-700">
        No assessments yet
      </p>
      <p className="mt-1.5 max-w-md mx-auto text-sm text-slate-500">
        Use <strong>&quot;Start a new assessment&quot;</strong> above to create your first assessment.
        You can then evaluate your sustainability maturity, identify gaps, and build a prioritised
        action plan for certification, standards alignment, or internal planning.
      </p>
    </div>
  );
}
