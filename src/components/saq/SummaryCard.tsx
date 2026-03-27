import { ReactNode } from "react";

interface SummaryCardProps {
  label: string;
  value: ReactNode;
  className?: string;
  /** Optional accent: "primary" for main metric (e.g. completion %) */
  accent?: "primary" | "default";
}

export function SummaryCard({
  label,
  value,
  className = "",
  accent = "default",
}: SummaryCardProps) {
  return (
    <div
      className={`rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm ${className}`}
    >
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd
        className={`mt-1 font-semibold text-slate-900 ${
          accent === "primary" ? "text-xl text-emerald-700" : "text-lg"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
