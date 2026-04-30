import { Suspense } from "react";
import { AssessmentDashboard } from "@/components/saq/AssessmentDashboard";

interface PageProps {
  params: Promise<{ assessmentId: string }>;
}

export default async function DashboardPage({ params }: PageProps) {
  const { assessmentId } = await params;
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50">
          <div className="mx-auto max-w-6xl px-4 py-16 text-center text-slate-600">Loading…</div>
        </main>
      }
    >
      <AssessmentDashboard assessmentId={assessmentId} />
    </Suspense>
  );
}
