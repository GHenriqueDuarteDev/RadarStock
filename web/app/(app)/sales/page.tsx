import { Suspense } from "react";
import {
  listSalesQuerySchema,
  paginatedSalesSchema,
  salesSummarySchema,
  type ListSalesQuery,
} from "@radarstock/contracts";
import { PlusIcon } from "lucide-react";

import { getActiveProducts, getActiveWarehouses } from "@/app/_lib/lookups";
import { parseSearchParams, type PageProps } from "@/app/_lib/search-params";
import { fetchFromApi } from "@/app/_lib/server-api";
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

async function SalesTableSection({ query }: { query: ListSalesQuery }) {
  const sales = await fetchFromApi(buildSalesPath(query), paginatedSalesSchema);

  return (
    <SalesTable
      data={sales.items}
      total={sales.total}
      page={sales.page}
      pageSize={sales.pageSize}
    />
  );
}

export default async function SalesPage({ searchParams }: PageProps) {
  const query = parseSearchParams(listSalesQuerySchema, await searchParams);

  return (
    <div className="space-y-4">
      <PageHeader
        category="Operação"
        title="Vendas"
        description="Registre vendas confirmadas com baixa automática de estoque."
        action={
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
        }
      />
      <SectionErrorBoundary title="Indicadores indisponíveis">
        <Suspense fallback={<MetricsSkeleton />}>
          <SalesMetricsSection />
        </Suspense>
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Lista de vendas indisponível">
        <Suspense fallback={<TablePanelSkeleton />}>
          <SalesTableSection query={query} />
        </Suspense>
      </SectionErrorBoundary>
    </div>
  );
}
