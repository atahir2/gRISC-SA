import { Suspense } from "react";
import { AssessmentReport } from "@/components/saq/AssessmentReport";

interface PageProps {
  params: Promise<{ assessmentId: string }>;
}

export default async function ReportPage({ params }: PageProps) {
  const { assessmentId } = await params;
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center text-slate-600">Loading…</div>
        </main>
      }
    >
      <AssessmentReport assessmentId={assessmentId} />
    </Suspense>
  );
}
