import { Suspense } from "react";
import {
  hasPermission,
  inventoryCountsSummarySchema,
  listInventoryCountsQuerySchema,
  paginatedInventoryCountsSchema,
  type ListInventoryCountsQuery,
} from "@radarstock/contracts";
import { PlusIcon } from "lucide-react";

import { getActiveWarehouses } from "@/app/_lib/lookups";
import { parseSearchParams, type PageProps } from "@/app/_lib/search-params";
import { fetchFromApi, getCurrentUser } from "@/app/_lib/server-api";
import { PageHeader } from "@/components/page-header";
import { SectionErrorBoundary } from "@/components/section-error";
import {
  MetricsSkeleton,
  TablePanelSkeleton,
} from "@/components/section-skeletons";
import { Button } from "@/components/ui/button";

import { InventoryMetrics } from "./_components/inventory-metrics";
import { InventoryTable } from "./_components/inventory-table";
import { NewInventoryButton } from "./_components/new-inventory-button";

function buildInventoryPath(query: ListInventoryCountsQuery) {
  const params = new URLSearchParams({ page: String(query.page) });
  if (query.code) {
    params.set("code", query.code);
  }
  return `/inventory?${params.toString()}`;
}

async function NewInventoryAction() {
  const warehouses = await getActiveWarehouses();
  return <NewInventoryButton warehouses={warehouses} />;
}

async function InventoryMetricsSection() {
  const summary = await fetchFromApi(
    "/inventory/summary",
    inventoryCountsSummarySchema,
  );
  return <InventoryMetrics data={summary} />;
}

async function InventoryTableSection({
  query,
  canWrite,
}: {
  query: ListInventoryCountsQuery;
  canWrite: boolean;
}) {
  const inventories = await fetchFromApi(
    buildInventoryPath(query),
    paginatedInventoryCountsSchema,
  );

  return (
    <InventoryTable
      data={inventories.items}
      total={inventories.total}
      page={inventories.page}
      pageSize={inventories.pageSize}
      canWrite={canWrite}
    />
  );
}

export default async function InventoryPage({ searchParams }: PageProps) {
  const [rawParams, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);
  const query = parseSearchParams(listInventoryCountsQuerySchema, rawParams);
  const canWrite = hasPermission(user?.role, "inventory.write");

  return (
    <div className="space-y-4">
      <PageHeader
        category="Operação"
        title="Inventário"
        description="Abra a contagem por galpão, registre o físico e confirme para ajustar os saldos."
        action={
          canWrite ? (
            <Suspense
              fallback={
                <Button type="button" disabled>
                  <PlusIcon data-icon="inline-start" />
                  Novo inventário
                </Button>
              }
            >
              <NewInventoryAction />
            </Suspense>
          ) : null
        }
      />
      <SectionErrorBoundary title="Indicadores indisponíveis">
        <Suspense fallback={<MetricsSkeleton />}>
          <InventoryMetricsSection />
        </Suspense>
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Lista de inventários indisponível">
        <Suspense fallback={<TablePanelSkeleton />}>
          <InventoryTableSection query={query} canWrite={canWrite} />
        </Suspense>
      </SectionErrorBoundary>
    </div>
  );
}
