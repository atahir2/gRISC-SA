import type { ThemeResult } from "@/src/lib/saq/engine/results";

interface ThemeReadinessSnapshotProps {
  themes: ThemeResult[];
}

type ThemeReadinessLevel = "Early" | "Developing" | "Advanced";

function computeThemeReadiness(summary: ThemeResult["summary"]): {
  score: number;
  level: ThemeReadinessLevel;
} {
  const completion = summary.completionRate; // 0–100
  const high = summary.highPriorityCount;
  const med = summary.mediumPriorityCount;
  const low = summary.lowPriorityCount;
  const totalPriority = high + med + low || 1;
  const highShare = high / totalPriority; // 0–1

  // Simple, transparent heuristic:
  // - Base on completion, adjusted down when high-priority gaps dominate.
  //   score = 0.7 * completion + 0.3 * (100 - highShare * 100)
  const scoreRaw = 0.7 * completion + 0.3 * (100 - highShare * 100);
  const score = Math.max(0, Math.min(100, Math.round(scoreRaw)));

  let level: ThemeReadinessLevel;
  if (score < 40) level = "Early";
  else if (score < 70) level = "Developing";
  else level = "Advanced";

  return { score, level };
}

export function ThemeReadinessSnapshot({ themes }: ThemeReadinessSnapshotProps) {
  if (themes.length === 0) {
    return null;
  }

  return (
    <div className="saq-theme-snapshot saq-export-break-after rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-sm font-semibold text-slate-900">
        Theme readiness snapshot
      </h3>
      <p className="saq-theme-snapshot-desc mt-1 text-xs text-slate-600">
        Readiness per theme, combining completion and the balance of improvement priorities.
      </p>
      <div className="saq-theme-snapshot-list mt-4 space-y-3">
        {themes.map((tr) => {
          const { score, level } = computeThemeReadiness(tr.summary);
          const levelClasses =
            level === "Early"
              ? "bg-rose-50 text-rose-800 border-rose-100"
              : level === "Developing"
              ? "bg-amber-50 text-amber-800 border-amber-100"
              : "bg-emerald-50 text-emerald-800 border-emerald-100";

          return (
            <div key={tr.themeId} className="saq-theme-snapshot-row">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="truncate font-medium text-slate-800 max-w-[60%] saq-export-no-truncate">
                  {tr.themeTitle}
                </span>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="tabular-nums text-slate-700">{score}%</span>
                  <span
                    className={
                      "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide " +
                      levelClasses
                    }
                  >
                    {level}
                  </span>
                </div>
              </div>
              <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                <div
                  className={
                    "h-full rounded-full transition-all " +
                    (level === "Early"
                      ? "bg-rose-400"
                      : level === "Developing"
                      ? "bg-amber-400"
                      : "bg-emerald-500")
                  }
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

