import { AssessmentDashboard } from "@/components/saq/AssessmentDashboard";

interface PageProps {
  params: Promise<{ assessmentId: string }>;
}

export default async function DashboardPage({ params }: PageProps) {
  const { assessmentId } = await params;
  return <AssessmentDashboard assessmentId={assessmentId} />;
}
