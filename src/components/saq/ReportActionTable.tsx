import type { ReactNode } from "react";
import type { ActionItem } from "@/src/lib/saq/engine/actions";

interface ReportActionTableProps {
  actionItems: ActionItem[];
  className?: string;
}

function cell(content: ReactNode, className = "") {
  return (
    <td
      className={`border border-slate-200 px-3 py-2 text-sm text-slate-800 print:px-2 print:py-1.5 print:text-xs ${className}`}
    >
      {content ?? "—"}
    </td>
  );
}

export function ReportActionTable({
  actionItems,
  className = "",
}: ReportActionTableProps) {
  if (actionItems.length === 0) {
    return (
      <p className="rounded border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 print:py-2">
        No action items.
      </p>
    );
  }

  return (
    <div
      className={`overflow-x-auto rounded border border-slate-200 print:overflow-visible print:border print:border-slate-300 ${className}`}
    >
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr className="bg-slate-100 print:bg-slate-100">
            <th className="border border-slate-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 print:px-2 print:py-1.5">
              Code
            </th>
            <th className="border border-slate-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 print:px-2 print:py-1.5">
              Question / action
            </th>
            <th className="border border-slate-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 print:px-2 print:py-1.5">
              Impr. priority
            </th>
            <th className="border border-slate-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 print:px-2 print:py-1.5">
              Impl. priority
            </th>
            <th className="border border-slate-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 print:px-2 print:py-1.5">
              Effort
            </th>
            <th className="border border-slate-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 print:px-2 print:py-1.5">
              Leader
            </th>
            <th className="border border-slate-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 print:px-2 print:py-1.5">
              Deadline
            </th>
            <th className="border border-slate-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 print:px-2 print:py-1.5">
              Status
            </th>
            <th className="border border-slate-200 px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-700 print:px-2 print:py-1.5">
              Remarks
            </th>
          </tr>
        </thead>
        <tbody>
          {actionItems.map((item) => (
            <tr key={item.questionId} className="print:break-inside-avoid">
              {cell(
                <span className="font-mono text-slate-700">{item.questionCode}</span>
              )}
              {cell(
                <div>
                  <div className="font-medium text-slate-900">
                    {item.questionText}
                  </div>
                  <div className="mt-0.5 text-slate-600">
                    {item.recommendedAction}
                  </div>
                </div>
              )}
              {cell(item.improvementPriority)}
              {cell(item.implementationPriority)}
              {cell(item.effortRequired)}
              {cell(item.leader)}
              {cell(item.deadline)}
              {cell(item.status)}
              {cell(item.remarks, "max-w-[12rem]")}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
