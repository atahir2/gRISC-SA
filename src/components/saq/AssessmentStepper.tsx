interface AssessmentStepperProps {
  currentStep: number;
  steps: readonly string[];
}

export function AssessmentStepper({ currentStep, steps }: AssessmentStepperProps) {
  return (
    <nav aria-label="Assessment progress">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-3 text-sm">
        {steps.map((label, index) => {
          const isActive = index === currentStep;
          const isComplete = index < currentStep;
          const isUpcoming = index > currentStep;
          return (
            <li
              key={label}
              className="flex flex-1 min-w-0 items-center gap-2"
            >
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors ${
                    isComplete
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : isActive
                      ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                      : isUpcoming
                      ? "border-slate-200 bg-slate-50 text-slate-400"
                      : "border-slate-300 text-slate-500"
                  }`}
                >
                  {isComplete ? "✓" : index + 1}
                </span>
                <span
                  className={`hidden font-medium sm:inline ${
                    isActive ? "text-slate-900" : isComplete ? "text-slate-700" : "text-slate-500"
                  }`}
                >
                  {label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-1 h-0.5 flex-1 min-w-[1rem] sm:mx-2 ${
                    isComplete ? "bg-emerald-200" : "bg-slate-200"
                  }`}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
