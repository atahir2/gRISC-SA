import Link from "next/link";
import type { Assessment } from "@/src/lib/saq/assessment.types";

interface AssessmentListCardProps {
  assessment: Assessment;
}

function formatDate(value: Date | string | undefined): string {
  if (!value) return "—";
  const d = value instanceof Date ? value : new Date(value);
  return d.toLocaleDateString(undefined, { dateStyle: "medium" });
}

export function AssessmentListCard({ assessment }: AssessmentListCardProps) {
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md hover:border-slate-300">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-slate-900 truncate">
            {assessment.organisationName}
          </h3>
          <p className="mt-1.5 text-xs text-slate-500">
            {assessment.updatedAt
              ? <>Last updated {formatDate(assessment.updatedAt)} · Created {formatDate(assessment.createdAt)}</>
              : <>Created {formatDate(assessment.createdAt)}</>
            }
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
          <Link
            href={`/saq/assessment/${assessment.id}`}
            className="inline-flex items-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Open / Resume
          </Link>
          <Link
            href={`/saq/dashboard/${assessment.id}`}
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Dashboard
          </Link>
          <Link
            href={`/saq/report/${assessment.id}`}
            className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Report
          </Link>
          <Link
            href={`/saq/report/${assessment.id}`}
            className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Export PDF
          </Link>
        </div>
      </div>
    </li>
  );
}
