import { ReactNode } from "react";

interface DashboardSummaryCardProps {
  label: string;
  value: ReactNode;
  /** Optional accent for primary metrics */
  accent?: "primary" | "default";
  className?: string;
}

export function DashboardSummaryCard({
  label,
  value,
  accent = "default",
  className = "",
}: DashboardSummaryCardProps) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm ${className}`}
    >
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd
        className={`mt-1.5 font-semibold text-slate-900 ${
          accent === "primary" ? "text-2xl text-emerald-700" : "text-xl"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
