import { ReactNode } from "react";

interface DashboardSectionProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  /** Optional: use "large" for the main overview section to improve hierarchy */
  titleSize?: "default" | "large";
}

export function DashboardSection({
  title,
  subtitle,
  children,
  className = "",
  titleSize = "default",
}: DashboardSectionProps) {
  const titleClass =
    titleSize === "large"
      ? "text-xl font-semibold text-slate-900"
      : "text-lg font-semibold text-slate-900";
  return (
    <section className={className}>
      <header className="mb-4">
        <h2 className={titleClass}>{title}</h2>
        {subtitle && (
          <p className="mt-0.5 text-sm text-slate-600">{subtitle}</p>
        )}
      </header>
      {children}
    </section>
  );
}
