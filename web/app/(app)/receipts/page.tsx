import { Suspense } from "react";
import {
  hasPermission,
  listReceiptsQuerySchema,
  paginatedReceiptsSchema,
  receiptsSummarySchema,
  type ListReceiptsQuery,
} from "@radarstock/contracts";
import { PlusIcon } from "lucide-react";

import { getActiveProducts, getActiveWarehouses } from "@/app/_lib/lookups";
import { parseSearchParams, type PageProps } from "@/app/_lib/search-params";
import { fetchFromApi, getCurrentUser } from "@/app/_lib/server-api";
import { PageHeader } from "@/components/page-header";
import { SectionErrorBoundary } from "@/components/section-error";
import {
  MetricsSkeleton,
  TablePanelSkeleton,
} from "@/components/section-skeletons";
import { Button } from "@/components/ui/button";

import { NewReceiptButton } from "./_components/new-receipt-button";
import { ReceiptsMetrics } from "./_components/receipts-metrics";
import { ReceiptsTable } from "./_components/receipts-table";

function buildReceiptsPath(query: ListReceiptsQuery) {
  const params = new URLSearchParams({ page: String(query.page) });
  if (query.code) {
    params.set("code", query.code);
  }
  return `/receipts?${params.toString()}`;
}

async function NewReceiptAction() {
  const [products, warehouses] = await Promise.all([
    getActiveProducts(),
    getActiveWarehouses(),
  ]);
  return <NewReceiptButton products={products} warehouses={warehouses} />;
}

async function ReceiptsMetricsSection() {
  const summary = await fetchFromApi(
    "/receipts/summary",
    receiptsSummarySchema,
  );
  return <ReceiptsMetrics data={summary} />;
}

async function ReceiptsTableSection({
  query,
  canWrite,
}: {
  query: ListReceiptsQuery;
  canWrite: boolean;
}) {
  const receipts = await fetchFromApi(
    buildReceiptsPath(query),
    paginatedReceiptsSchema,
  );

  return (
    <ReceiptsTable
      data={receipts.items}
      total={receipts.total}
      page={receipts.page}
      pageSize={receipts.pageSize}
      canWrite={canWrite}
    />
  );
}

export default async function ReceiptsPage({ searchParams }: PageProps) {
  const [rawParams, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);
  const query = parseSearchParams(listReceiptsQuerySchema, rawParams);
  const canWrite = hasPermission(user?.role, "receipts.write");

  return (
    <div className="space-y-4">
      <PageHeader
        category="Operação"
        title="Recebimentos"
        description="Registre entradas de mercadoria com aumento automático de estoque."
        action={
          canWrite ? (
            <Suspense
              fallback={
                <Button type="button" disabled>
                  <PlusIcon data-icon="inline-start" />
                  Novo recebimento
                </Button>
              }
            >
              <NewReceiptAction />
            </Suspense>
          ) : null
        }
      />
      <SectionErrorBoundary title="Indicadores indisponíveis">
        <Suspense fallback={<MetricsSkeleton />}>
          <ReceiptsMetricsSection />
        </Suspense>
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Lista de recebimentos indisponível">
        <Suspense fallback={<TablePanelSkeleton />}>
          <ReceiptsTableSection query={query} canWrite={canWrite} />
        </Suspense>
      </SectionErrorBoundary>
    </div>
  );
}
