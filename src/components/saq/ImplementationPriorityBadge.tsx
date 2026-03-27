type ImplPriority =
  | "Immediate"
  | "Urgent"
  | "Planned"
  | "Low Priority"
  | "No Action Needed";

interface ImplementationPriorityBadgeProps {
  value: ImplPriority | undefined;
  className?: string;
}

const styles: Record<ImplPriority, string> = {
  Immediate: "bg-red-50 text-red-800 border-red-200",
  Urgent: "bg-amber-50 text-amber-800 border-amber-200",
  Planned: "bg-blue-50 text-blue-800 border-blue-200",
  "Low Priority": "bg-slate-100 text-slate-700 border-slate-200",
  "No Action Needed": "bg-slate-50 text-slate-500 border-slate-200",
};

export function ImplementationPriorityBadge({
  value,
  className = "",
}: ImplementationPriorityBadgeProps) {
  if (!value) {
    return (
      <span
        className={`inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-400 ${className}`}
      >
        —
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[value]} ${className}`}
    >
      {value}
    </span>
  );
}
