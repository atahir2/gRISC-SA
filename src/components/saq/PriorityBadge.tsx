type PriorityLevel = "High" | "Medium" | "Low";

interface PriorityBadgeProps {
  level: PriorityLevel;
  className?: string;
}

const styles: Record<PriorityLevel, string> = {
  High: "bg-red-50 text-red-800 border-red-200",
  Medium: "bg-amber-50 text-amber-800 border-amber-200",
  Low: "bg-slate-100 text-slate-700 border-slate-200",
};

export function PriorityBadge({ level, className = "" }: PriorityBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[level]} ${className}`}
    >
      {level}
    </span>
  );
}
