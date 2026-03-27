interface ReportHeaderProps {
  organisationName: string;
  assessmentId: string;
  createdAt: Date | null;
  updatedAt: Date | null;
  /** Used by parent to toggle export layout; styling is driven by .saq-export-mode on container */
  exportMode?: boolean;
}

export function ReportHeader({
  organisationName,
  assessmentId,
  createdAt,
  updatedAt,
}: ReportHeaderProps) {
  const formatDate = (d: Date) =>
    d.toLocaleDateString(undefined, { dateStyle: "medium" });

  return (
    <header className="report-header border-b border-slate-300 pb-6 print:pb-4">
      <h1 className="report-title text-2xl font-semibold text-slate-900 print:text-xl">
        Sustainability Self-Assessment Report
      </h1>
      <p className="report-subtitle mt-1 text-sm text-slate-600 print:text-xs">
        Prepared for sustainability baseline review and stakeholder discussion.
      </p>
      <dl className="report-meta-list mt-4 grid grid-cols-1 gap-x-4 gap-y-1 text-sm print:mt-3 print:text-xs sm:grid-cols-2">
        <div>
          <dt className="inline font-medium text-slate-700">Organisation:</dt>
          <dd className="inline text-slate-900"> {organisationName}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-slate-700">Assessment ID:</dt>
          <dd className="inline font-mono text-slate-700"> {assessmentId}</dd>
        </div>
        <div>
          <dt className="inline font-medium text-slate-700">Created:</dt>
          <dd className="inline text-slate-900">
            {createdAt ? formatDate(createdAt) : "—"}
          </dd>
        </div>
        <div>
          <dt className="inline font-medium text-slate-700">Updated:</dt>
          <dd className="inline text-slate-900">
            {updatedAt ? formatDate(updatedAt) : "—"}
          </dd>
        </div>
      </dl>
    </header>
  );
}
