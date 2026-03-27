interface StrategicRecommendationsCardProps {
  recommendations: string[];
}

const TAGS = ["Immediate", "Short term", "Medium term", "Consolidate"] as const;

export function StrategicRecommendationsCard({
  recommendations,
}: StrategicRecommendationsCardProps) {
  if (recommendations.length === 0) return null;

  return (
    <div className="saq-strategic-card saq-export-break-after rounded-xl border border-sky-200 bg-sky-50/70 px-5 py-4 shadow-sm">
      <h3 className="text-sm font-semibold text-sky-900">
        Strategic recommendations
      </h3>
      <p className="mt-1 text-xs text-sky-900/80">
        Suggested next steps to strengthen the sustainability baseline and prepare for
        certification, standards alignment, or regulatory reporting.
      </p>
      <ul className="mt-3 space-y-2.5 text-sm text-slate-900">
        {recommendations.map((item, idx) => {
          const tag = TAGS[Math.min(idx, TAGS.length - 1)];
          return (
            <li key={idx} className="flex flex-wrap items-baseline gap-2 leading-relaxed">
              <span className="shrink-0 inline-flex items-center rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sky-800">
                {tag}
              </span>
              <span className="min-w-0">{item}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

