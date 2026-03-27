type PriorityLevel = "High" | "Medium" | "Low";

interface PriorityCountCardProps {
  level: PriorityLevel;
  count: number;
  className?: string;
}

const styles: Record<PriorityLevel, { bg: string; text: string; border: string }> = {
  High: { bg: "bg-red-50", text: "text-red-800", border: "border-red-200" },
  Medium: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  Low: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200" },
};

export function PriorityCountCard({ level, count, className = "" }: PriorityCountCardProps) {
  const s = styles[level];
  return (
    <div
      className={`rounded-xl border px-4 py-3 ${s.bg} ${s.border} ${className}`}
    >
      <span className={`text-xs font-medium uppercase tracking-wide ${s.text}`}>
        {level} priority
      </span>
      <p className={`mt-1 text-2xl font-bold ${s.text}`}>{count}</p>
    </div>
  );
}
