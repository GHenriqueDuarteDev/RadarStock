import { Suspense } from "react";
import {
  hasPermission,
  listSalesQuerySchema,
  paginatedSalesSchema,
  salesSummarySchema,
  type ListSalesQuery,
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

import { NewSaleButton } from "./_components/new-sale-button";
import { SalesMetrics } from "./_components/sales-metrics";
import { SalesTable } from "./_components/sales-table";

function buildSalesPath(query: ListSalesQuery) {
  const params = new URLSearchParams({ page: String(query.page) });
  if (query.code) {
    params.set("code", query.code);
  }
  return `/sales?${params.toString()}`;
}

async function NewSaleAction() {
  const [products, warehouses] = await Promise.all([
    getActiveProducts(),
    getActiveWarehouses(),
  ]);
  return <NewSaleButton products={products} warehouses={warehouses} />;
}

async function SalesMetricsSection() {
  const summary = await fetchFromApi("/sales/summary", salesSummarySchema);
  return <SalesMetrics data={summary} />;
}

async function SalesTableSection({
  query,
  canWrite,
}: {
  query: ListSalesQuery;
  canWrite: boolean;
}) {
  const sales = await fetchFromApi(buildSalesPath(query), paginatedSalesSchema);

  return (
    <SalesTable
      data={sales.items}
      total={sales.total}
      page={sales.page}
      pageSize={sales.pageSize}
      canWrite={canWrite}
    />
  );
}

export default async function SalesPage({ searchParams }: PageProps) {
  const [rawParams, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);
  const query = parseSearchParams(listSalesQuerySchema, rawParams);
  const canWrite = hasPermission(user?.role, "sales.write");

  return (
    <div className="space-y-4">
      <PageHeader
        category="Operação"
        title="Vendas"
        description="Registre vendas confirmadas com baixa automática de estoque."
        action={
          canWrite ? (
            <Suspense
              fallback={
                <Button type="button" disabled>
                  <PlusIcon data-icon="inline-start" />
                  Nova venda
                </Button>
              }
            >
              <NewSaleAction />
            </Suspense>
          ) : null
        }
      />
      <SectionErrorBoundary title="Indicadores indisponíveis">
        <Suspense fallback={<MetricsSkeleton />}>
          <SalesMetricsSection />
        </Suspense>
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Lista de vendas indisponível">
        <Suspense fallback={<TablePanelSkeleton />}>
          <SalesTableSection query={query} canWrite={canWrite} />
        </Suspense>
      </SectionErrorBoundary>
    </div>
  );
}
