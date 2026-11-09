import { Suspense } from "react";
import {
  hasPermission,
  listWarehousesQuerySchema,
  paginatedWarehousesSchema,
  warehousesSummarySchema,
  type ListWarehousesQuery,
} from "@radarstock/contracts";
import { PlusIcon } from "lucide-react";

import { parseSearchParams, type PageProps } from "@/app/_lib/search-params";
import { fetchFromApi, getCurrentUser } from "@/app/_lib/server-api";
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
  canWrite,
}: {
  query: ListWarehousesQuery;
  canWrite: boolean;
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
      canWrite={canWrite}
    />
  );
}

export default async function WarehousesPage({ searchParams }: PageProps) {
  const [rawParams, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);
  const query = parseSearchParams(listWarehousesQuerySchema, rawParams);
  const canWrite = hasPermission(user?.role, "warehouses.write");

  return (
    <div className="space-y-4">
      <PageHeader
        category="Operação"
        title="Galpões"
        description="Gerencie locais de armazenagem, códigos e capacidade."
        action={
          canWrite ? (
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
          ) : null
        }
      />
      <SectionErrorBoundary title="Indicadores indisponíveis">
        <Suspense fallback={<MetricsSkeleton />}>
          <WarehousesMetricsSection />
        </Suspense>
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Lista de galpões indisponível">
        <Suspense fallback={<TablePanelSkeleton />}>
          <WarehousesTableSection query={query} canWrite={canWrite} />
        </Suspense>
      </SectionErrorBoundary>
    </div>
  );
}
