type CapabilityScore = 1 | 2 | 3;

interface CapabilitySelectorProps {
  value: CapabilityScore | undefined;
  onChange: (score: CapabilityScore) => void;
  /** Show "Not answered" state when value is undefined */
  showNotAnswered?: boolean;
  label?: string;
  className?: string;
}

const LEVELS: { score: CapabilityScore; label: string }[] = [
  { score: 1, label: "1" },
  { score: 2, label: "2" },
  { score: 3, label: "3" },
];

export function CapabilitySelector({
  value,
  onChange,
  showNotAnswered = true,
  label = "Capability level",
  className = "",
}: CapabilitySelectorProps) {
  return (
    <div className={className}>
      <span className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
      </span>
      <div className="flex flex-wrap items-center gap-2">
        {LEVELS.map(({ score, label: l }) => {
          const isSelected = value === score;
          return (
            <button
              key={score}
              type="button"
              onClick={() => onChange(score)}
              className={`inline-flex min-w-[2.5rem] items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 ${
                isSelected
                  ? "border-emerald-600 bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600"
                  : "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50"
              }`}
            >
              {l}
            </button>
          );
        })}
        {showNotAnswered && value === undefined && (
          <span className="text-xs italic text-slate-400">Not answered yet</span>
        )}
      </div>
    </div>
  );
}
