import { ReactNode } from "react";

interface ReportSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function ReportSection({
  title,
  children,
  className = "",
}: ReportSectionProps) {
  return (
    <section className={`report-section saq-export-break-after mt-10 border-t border-slate-200 pt-6 print:mt-8 print:pt-4 ${className}`}>
      <h2 className="report-section-title mb-4 text-lg font-semibold tracking-tight text-slate-900 print:text-base print:mb-3">
        {title}
      </h2>
      {children}
    </section>
  );
}
