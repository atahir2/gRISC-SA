import { ReactNode } from "react";

const summaryIcons: Record<
  string,
  (className: string) => JSX.Element
> = {
  completion: (c) => (
    <svg className={c} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  targets: (c) => (
    <svg className={c} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  questions: (c) => (
    <svg className={c} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  ),
  gaps: (c) => (
    <svg className={c} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  actions: (c) => (
    <svg className={c} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
};

interface ReportSummaryCardProps {
  label: string;
  value: ReactNode;
  className?: string;
  icon?: keyof typeof summaryIcons;
}

export function ReportSummaryCard({
  label,
  value,
  className = "",
  icon,
}: ReportSummaryCardProps) {
  const IconWrap = icon && summaryIcons[icon] ? (
    <span className="mt-0.5 shrink-0 text-slate-500">
      {summaryIcons[icon]("h-4 w-4")}
    </span>
  ) : null;

  return (
    <div
      className={`saq-summary-card rounded-lg border border-slate-200 bg-slate-50/50 px-4 py-3 print:py-2 print:text-sm ${className}`}
    >
      <div className={IconWrap ? "flex items-start gap-2" : ""}>
        {IconWrap}
        <div className={IconWrap ? "min-w-0 flex-1" : ""}>
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 print:text-[10px]">
            {label}
          </dt>
          <dd className="mt-0.5 font-semibold tabular-nums text-slate-900 print:text-sm saq-summary-value">
            {value}
          </dd>
        </div>
      </div>
    </div>
  );
}
