interface MetricBarProps {
  label: string;
  value: number;
  max: number;
  /** Bar color variant */
  variant?: "emerald" | "slate" | "amber";
  showValue?: boolean;
  className?: string;
}

const variantStyles = {
  emerald: "bg-emerald-500",
  slate: "bg-slate-400",
  amber: "bg-amber-500",
};

export function MetricBar({
  label,
  value,
  max,
  variant = "emerald",
  showValue = true,
  className = "",
}: MetricBarProps) {
  const safeMax = max > 0 ? max : 1;
  const pct = Math.min(100, Math.round((value / safeMax) * 100));

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        {showValue && (
          <span className="tabular-nums text-slate-600">
            {value} / {max}
          </span>
        )}
      </div>
      <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all ${variantStyles[variant]}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}
