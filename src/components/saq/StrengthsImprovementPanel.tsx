interface StrengthsImprovementPanelProps {
  strengths: string[];
  improvementAreas: string[];
}

function refineImprovementBullet(text: string, idx: number): string {
  // UI-only wording refinement to reduce repetitive templated phrases.
  // Keeps the same meaning but makes bullets easier to scan in reports.
  const patterns = [
    "needs stronger policy integration and clearer ownership.",
    "would benefit from more structured monitoring and KPIs.",
    "remains underdeveloped in operational practice and routines.",
    "needs stronger lifecycle integration and consistent implementation.",
    "requires a clearer roadmap to close priority gaps.",
  ];

  const m = text.match(/^(.+?) requires further attention/i);
  if (!m) return text;
  const theme = m[1].trim();
  return `${theme} — ${patterns[idx % patterns.length]}`;
}

export function StrengthsImprovementPanel({
  strengths,
  improvementAreas,
}: StrengthsImprovementPanelProps) {
  return (
    <div className="saq-strengths-panel saq-export-break-after grid gap-4 md:grid-cols-2">
      {/* Strengths */}
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-5 py-4 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-emerald-900">
          Strengths
        </h3>
        <p className="saq-strengths-desc mt-1 text-xs text-emerald-900/80">
          Areas where the organisation is building a stronger sustainability baseline.
        </p>
        <ul className="mt-2 space-y-1.5 text-sm text-emerald-950">
          {strengths.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white">
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Improvement areas */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-5 py-4 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-900">
          Improvement areas
        </h3>
        <p className="mt-1 text-xs text-amber-900/80">
          Themes and topics that require additional focus to reach the desired maturity.
        </p>
        <ul className="mt-2 space-y-1.5 text-sm text-amber-950">
          {improvementAreas.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="mt-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white">
                !
              </span>
              <span>{refineImprovementBullet(item, idx)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

