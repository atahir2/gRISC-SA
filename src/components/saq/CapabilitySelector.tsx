type CapabilityScore = 1 | 2 | 3;

interface CapabilitySelectorProps {
  value: CapabilityScore | undefined;
  onChange: (score: CapabilityScore | undefined) => void;
  /** Show "Not answered" state when value is undefined */
  showNotAnswered?: boolean;
  label?: string;
  className?: string;
  disabled?: boolean;
}

const LEVELS: { score: CapabilityScore; label: string }[] = [
  { score: 1, label: "1" },
  { score: 2, label: "2" },
  { score: 3, label: "3" },
];

const CAPABILITY_MEANING: Record<CapabilityScore, { title: string; description: string }> = {
  1: {
    title: "Level 1: Initial / Ad hoc",
    description: "Awareness is minimal, and practices are largely unstructured.",
  },
  2: {
    title: "Level 2: Developing / Partial",
    description: "Some measures exist, but they are inconsistent or not formalised.",
  },
  3: {
    title: "Level 3: Established / Assured",
    description:
      "The RI is confident that the topic is systematically addressed with well-defined practices.",
  },
};

export function CapabilitySelector({
  value,
  onChange,
  showNotAnswered = true,
  label = "Current Capability level",
  className = "",
  disabled = false,
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
              disabled={disabled}
              onClick={() => !disabled && onChange(value === score ? undefined : score)}
              className={`inline-flex min-w-[2.5rem] items-center justify-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 ${
                disabled
                  ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
                  : isSelected
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
      {value !== undefined && (
        <div className="mt-2 max-w-sm rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-xs text-slate-700">
          <p className="font-medium text-slate-800">{CAPABILITY_MEANING[value].title}</p>
          <p className="mt-0.5">{CAPABILITY_MEANING[value].description}</p>
        </div>
      )}
    </div>
  );
}
