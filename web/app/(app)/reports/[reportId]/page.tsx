import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  reportIdSchema,
  reportPreviewSchema,
} from "@radarstock/contracts";
import { ArrowLeftIcon } from "lucide-react";

import { type PageProps } from "@/app/_lib/search-params";
import { ApiRequestError, fetchFromApi } from "@/app/_lib/server-api";
import { PageHeader } from "@/components/page-header";
import { SectionErrorBoundary } from "@/components/section-error";
import {
  MetricsSkeleton,
  TablePanelSkeleton,
} from "@/components/section-skeletons";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "cn";

import { ReportFiltersForm } from "../_components/report-filters";
import { ReportPreview } from "../_components/report-preview";
import {
  buildReportQueryString,
  reportDescriptions,
  reportTitles,
  resolveReportFilters,
} from "../_lib/report-meta";

async function ReportPreviewSection({
  reportId,
  query,
}: {
  reportId: string;
  query: string;
}) {
  const path =
    query.length > 0 ? `/reports/${reportId}?${query}` : `/reports/${reportId}`;

  let preview;
  try {
    preview = await fetchFromApi(path, reportPreviewSchema);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return <ReportPreview preview={preview} />;
}

export default async function ReportPage({
  params,
  searchParams,
}: PageProps<{ reportId: string }>) {
  const { reportId } = await params;
  const parsedId = reportIdSchema.safeParse(reportId);
  if (!parsedId.success) {
    notFound();
  }

  const raw = await searchParams;
  const filters = resolveReportFilters(parsedId.data, raw);
  const query = buildReportQueryString(parsedId.data, filters);

  return (
    <div className="space-y-4">
      <PageHeader
        category="Análise"
        title={reportTitles[parsedId.data]}
        description={reportDescriptions[parsedId.data]}
        action={
          <Link
            href="/reports"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            <ArrowLeftIcon data-icon="inline-start" />
            Catálogo
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <ReportFiltersForm reportId={parsedId.data} filters={filters} />
        </CardContent>
      </Card>

      <SectionErrorBoundary title="Preview indisponível">
        <Suspense
          fallback={
            <div className="space-y-3">
              <MetricsSkeleton count={3} />
              <TablePanelSkeleton />
            </div>
          }
        >
          <ReportPreviewSection reportId={parsedId.data} query={query} />
        </Suspense>
      </SectionErrorBoundary>
    </div>
  );
}
