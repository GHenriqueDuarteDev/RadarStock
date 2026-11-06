import { ReportView } from "../_components/report-view";

type ReportPageProps = {
  params: Promise<{ reportId: string }>;
};

export default async function ReportPage({ params }: ReportPageProps) {
  const { reportId } = await params;

  return (
    <div className="space-y-4">
      <ReportView reportId={reportId} />
    </div>
  );
}
