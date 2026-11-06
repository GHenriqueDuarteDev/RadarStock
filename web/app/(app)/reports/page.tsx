import { Suspense } from "react";
import { reportCatalogSchema } from "@radarstock/contracts";

import { fetchFromApi } from "@/app/_lib/server-api";
import { PageHeader } from "@/components/page-header";
import { SectionErrorBoundary } from "@/components/section-error";
import { ChartCardSkeleton } from "@/components/section-skeletons";

import { ReportsCatalog } from "./_components/reports-catalog";

async function ReportsCatalogSection() {
  const catalog = await fetchFromApi("/reports", reportCatalogSchema);
  return <ReportsCatalog items={catalog.items} />;
}

export default function ReportsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        category="Análise"
        title="Relatórios"
        description="Consulte e exporte a operação sem alterar cadastros."
      />
      <SectionErrorBoundary title="Catálogo indisponível">
        <Suspense
          fallback={
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <ChartCardSkeleton key={index} />
              ))}
            </div>
          }
        >
          <ReportsCatalogSection />
        </Suspense>
      </SectionErrorBoundary>
    </div>
  );
}
