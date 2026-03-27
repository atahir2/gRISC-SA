import { AssessmentReport } from "@/components/saq/AssessmentReport";

interface PageProps {
  params: Promise<{ assessmentId: string }>;
}

export default async function ReportPage({ params }: PageProps) {
  const { assessmentId } = await params;
  return <AssessmentReport assessmentId={assessmentId} />;
}
