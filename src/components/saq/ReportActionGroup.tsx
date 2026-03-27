import type { ActionItem } from "@/src/lib/saq/engine/actions";
import { ReportActionItemCard } from "./ReportActionItemCard";

interface ReportActionGroupProps {
  themeTitle: string;
  items: ActionItem[];
  exportMode?: boolean;
}

export function ReportActionGroup({ themeTitle, items, exportMode = false }: ReportActionGroupProps) {
  if (items.length === 0) return null;

  return (
    <section
      className="saq-action-group saq-export-break-after mt-5 break-inside-avoid print:mt-4"
      data-theme-title={themeTitle}
    >
      <h3 className="mb-2 text-sm font-semibold text-slate-900 print:text-xs">
        {themeTitle}
      </h3>
      <div className="saq-action-list space-y-4">
        {items.map((item) => (
          <ReportActionItemCard
            key={item.questionId}
            item={item}
            themeTitle={themeTitle}
            exportMode={exportMode}
          />
        ))}
      </div>
    </section>
  );
}

