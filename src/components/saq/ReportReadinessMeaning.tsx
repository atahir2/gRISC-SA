import type { ReadinessLevel } from "@/src/lib/saq/engine/interpretation";

interface ReportReadinessMeaningProps {
  readinessLevel: ReadinessLevel;
}

export function ReportReadinessMeaning({ readinessLevel }: ReportReadinessMeaningProps) {
  const meaning =
    readinessLevel === "Early"
      ? "Foundational sustainability practices are still limited or not yet established."
      : readinessLevel === "Developing"
      ? "A sustainability baseline exists, but important capability gaps remain."
      : "Sustainability practices are broadly embedded and supported by monitoring and governance.";

  return (
    <p className="mt-2 text-xs leading-relaxed text-slate-700 print:text-[11px]">
      <span className="font-semibold text-slate-900">What this means:</span>{" "}
      {meaning}
    </p>
  );
}

