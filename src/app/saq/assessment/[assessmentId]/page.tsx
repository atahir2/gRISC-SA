import { Suspense } from "react";
import { AssessmentLayout } from "@/components/saq/AssessmentLayout";

interface PageProps {
  params: Promise<{ assessmentId: string }>;
}

export default async function SaqAssessmentPage({ params }: PageProps) {
  const { assessmentId } = await params;
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50">
          <div className="mx-auto max-w-5xl px-4 py-16 text-center text-slate-600">Loading…</div>
        </main>
      }
    >
      <AssessmentLayout assessmentId={assessmentId} />
    </Suspense>
  );
}
