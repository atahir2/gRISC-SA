export function ReadinessLegend() {
  return (
    <div className="saq-readiness-legend saq-export-break-after mt-3 rounded border border-slate-200 bg-slate-50/60 px-4 py-2.5 text-xs text-slate-600 print:py-2 print:text-[11px]">
      <span className="font-semibold text-slate-700">Readiness levels:</span>{" "}
      <span className="text-rose-700 font-medium">Early</span> = foundational practices not yet established;{" "}
      <span className="text-amber-700 font-medium">Developing</span> = partial implementation / baseline emerging;{" "}
      <span className="text-emerald-700 font-medium">Advanced</span> = strong maturity and operational integration.
    </div>
  );
}
