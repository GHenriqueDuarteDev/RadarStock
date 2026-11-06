import { Suspense } from "react";
import {
  listWarehousesQuerySchema,
  paginatedWarehousesSchema,
  warehousesSummarySchema,
  type ListWarehousesQuery,
} from "@radarstock/contracts";
import { PlusIcon } from "lucide-react";

import { parseSearchParams, type PageProps } from "@/app/_lib/search-params";
import { fetchFromApi } from "@/app/_lib/server-api";
import { PageHeader } from "@/components/page-header";
import { SectionErrorBoundary } from "@/components/section-error";
import {
  MetricsSkeleton,
  TablePanelSkeleton,
} from "@/components/section-skeletons";
import { Button } from "@/components/ui/button";

import { NewWarehouseButton } from "./_components/new-warehouse-button";
import { WarehousesMetrics } from "./_components/warehouses-metrics";
import { WarehousesTable } from "./_components/warehouses-table";

function buildWarehousesPath(query: ListWarehousesQuery) {
  const params = new URLSearchParams({ page: String(query.page) });
  if (query.name) {
    params.set("name", query.name);
  }
  return `/warehouses?${params.toString()}`;
}

async function WarehousesMetricsSection() {
  const summary = await fetchFromApi(
    "/warehouses/summary",
    warehousesSummarySchema,
  );
  return <WarehousesMetrics data={summary} />;
}

async function WarehousesTableSection({
  query,
}: {
  query: ListWarehousesQuery;
}) {
  const warehouses = await fetchFromApi(
    buildWarehousesPath(query),
    paginatedWarehousesSchema,
  );

  return (
    <WarehousesTable
      data={warehouses.items}
      total={warehouses.total}
      page={warehouses.page}
      pageSize={warehouses.pageSize}
    />
  );
}

export default async function WarehousesPage({ searchParams }: PageProps) {
  const query = parseSearchParams(
    listWarehousesQuerySchema,
    await searchParams,
  );

  return (
    <div className="space-y-4">
      <PageHeader
        category="Operação"
        title="Galpões"
        description="Gerencie locais de armazenagem, códigos e capacidade."
        action={
          <Suspense
            fallback={
              <Button type="button" disabled>
                <PlusIcon data-icon="inline-start" />
                Novo galpão
              </Button>
            }
          >
            <NewWarehouseButton />
          </Suspense>
        }
      />
      <SectionErrorBoundary title="Indicadores indisponíveis">
        <Suspense fallback={<MetricsSkeleton />}>
          <WarehousesMetricsSection />
        </Suspense>
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Lista de galpões indisponível">
        <Suspense fallback={<TablePanelSkeleton />}>
          <WarehousesTableSection query={query} />
        </Suspense>
      </SectionErrorBoundary>
    </div>
  );
}
