import { Suspense } from "react";
import {
  listStockMovementsQuerySchema,
  paginatedStockMovementsSchema,
  stockMovementsSummarySchema,
  type ListStockMovementsQuery,
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

import { MovementsMetrics } from "./_components/movements-metrics";
import { MovementsTable } from "./_components/movements-table";
import { NewMovementButton } from "./_components/new-movement-button";

function buildMovementsPath(query: ListStockMovementsQuery) {
  const params = new URLSearchParams({ page: String(query.page) });
  if (query.name) {
    params.set("name", query.name);
  }
  return `/movements?${params.toString()}`;
}

async function NewMovementAction() {
  const [products, warehouses] = await Promise.all([
    getActiveProducts(),
    getActiveWarehouses(),
  ]);
  return <NewMovementButton products={products} warehouses={warehouses} />;
}

async function MovementsMetricsSection() {
  const summary = await fetchFromApi(
    "/movements/summary",
    stockMovementsSummarySchema,
  );
  return <MovementsMetrics data={summary} />;
}

async function MovementsTableSection({
  query,
}: {
  query: ListStockMovementsQuery;
}) {
  const movements = await fetchFromApi(
    buildMovementsPath(query),
    paginatedStockMovementsSchema,
  );

  return (
    <MovementsTable
      data={movements.items}
      total={movements.total}
      page={movements.page}
      pageSize={movements.pageSize}
    />
  );
}

export default async function MovementsPage({ searchParams }: PageProps) {
  const query = parseSearchParams(
    listStockMovementsQuerySchema,
    await searchParams,
  );

  return (
    <div className="space-y-4">
      <PageHeader
        category="Operação"
        title="Movimentações"
        description="Registre entradas, saídas, transferências e ajustes de estoque."
        action={
          <Suspense
            fallback={
              <Button type="button" disabled>
                <PlusIcon data-icon="inline-start" />
                Nova movimentação
              </Button>
            }
          >
            <NewMovementAction />
          </Suspense>
        }
      />
      <SectionErrorBoundary title="Indicadores indisponíveis">
        <Suspense fallback={<MetricsSkeleton />}>
          <MovementsMetricsSection />
        </Suspense>
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Lista de movimentações indisponível">
        <Suspense fallback={<TablePanelSkeleton />}>
          <MovementsTableSection query={query} />
        </Suspense>
      </SectionErrorBoundary>
    </div>
  );
}
