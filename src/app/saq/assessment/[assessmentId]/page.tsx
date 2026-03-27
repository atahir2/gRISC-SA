import { AssessmentLayout } from "@/components/saq/AssessmentLayout";

interface PageProps {
  params: Promise<{ assessmentId: string }>;
}

export default async function SaqAssessmentPage({ params }: PageProps) {
  const { assessmentId } = await params;
  return <AssessmentLayout assessmentId={assessmentId} />;
}
