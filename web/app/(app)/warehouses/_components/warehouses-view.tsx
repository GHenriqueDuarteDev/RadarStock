"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PAGE_SIZE,
  paginatedWarehousesSchema,
  warehousesSummarySchema,
  type PublicWarehouse,
} from "@radarstock/contracts";
import { PlusIcon } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

import { CreateWarehouseSheet } from "./create-warehouse-sheet";
import { DeleteWarehouseDialog } from "./delete-warehouse-dialog";
import { EditWarehouseSheet } from "./edit-warehouse-sheet";
import {
  WarehousesMetrics,
  type WarehousesMetricsData,
} from "./warehouses-metrics";
import { WarehousesTable } from "./warehouses-table";

type WarehousesSheet =
  | { type: "create" }
  | { type: "edit"; warehouse: PublicWarehouse }
  | { type: "delete"; warehouse: PublicWarehouse }
  | null;

async function readErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message ?? "Não foi possível concluir a operação.";
  } catch {
    return "Não foi possível concluir a operação.";
  }
}

function buildWarehousesQuery(page: number, name: string) {
  const query = new URLSearchParams({ page: String(page) });
  const trimmedName = name.trim();
  if (trimmedName !== "") {
    query.set("name", trimmedName);
  }
  return query.toString();
}

export function WarehousesView() {
  const [warehouses, setWarehouses] = useState<PublicWarehouse[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedName, setAppliedName] = useState("");
  const [metrics, setMetrics] = useState<WarehousesMetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sheet, setSheet] = useState<WarehousesSheet>(null);

  const loadWarehouses = useCallback(async (nextPage: number, name: string) => {
    setLoadError(null);
    const response = await fetch(
      `/api/warehouses?${buildWarehousesQuery(nextPage, name)}`,
    );
    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }
    const data = paginatedWarehousesSchema.parse(await response.json());
    setWarehouses(data.items);
    setTotal(data.total);
    setPage(data.page);
  }, []);

  const loadSummary = useCallback(async () => {
    const response = await fetch("/api/warehouses/summary");
    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }
    const data = warehousesSummarySchema.parse(await response.json());
    setMetrics(data);
  }, []);

  const refreshAfterMutation = useCallback(async () => {
    await Promise.all([loadWarehouses(page, appliedName), loadSummary()]);
  }, [appliedName, loadSummary, loadWarehouses, page]);

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      setLoading(true);
      try {
        await Promise.all([loadWarehouses(1, ""), loadSummary()]);
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar os galpões.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void initialLoad();

    return () => {
      cancelled = true;
    };
  }, [loadSummary, loadWarehouses]);

  async function handlePageChange(nextPage: number) {
    try {
      await loadWarehouses(nextPage, appliedName);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar os galpões.",
      );
    }
  }

  async function handleSearchSubmit() {
    const nextName = searchInput.trim();
    setAppliedName(nextName);
    try {
      await loadWarehouses(1, nextName);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar os galpões.",
      );
    }
  }

  async function handleCreated(_created: PublicWarehouse) {
    setSheet(null);
    await refreshAfterMutation();
  }

  async function handleSaved(_updated: PublicWarehouse) {
    setSheet(null);
    await refreshAfterMutation();
  }

  async function handleDeleted(_id: string) {
    setSheet(null);
    await refreshAfterMutation();
  }

  return (
    <>
      <PageHeader
        category="Operação"
        title="Galpões"
        description="Gerencie locais de armazenagem, códigos e capacidade."
        action={
          <Button
            type="button"
            data-testid="new-warehouse"
            onClick={() => setSheet({ type: "create" })}
          >
            <PlusIcon data-icon="inline-start" />
            Novo galpão
          </Button>
        }
      />
      {loading ? (
        <p
          className="text-sm text-muted-foreground"
          data-testid="warehouses-loading"
        >
          Carregando galpões...
        </p>
      ) : loadError ? (
        <p role="alert" className="text-sm text-destructive">
          {loadError}
        </p>
      ) : (
        <>
          <WarehousesMetrics data={metrics} />
          <WarehousesTable
            data={warehouses}
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            searchValue={searchInput}
            onPageChange={handlePageChange}
            onSearchChange={setSearchInput}
            onSearchSubmit={handleSearchSubmit}
            onEdit={(warehouse) => setSheet({ type: "edit", warehouse })}
            onDelete={(warehouse) => setSheet({ type: "delete", warehouse })}
          />
        </>
      )}
      {sheet?.type === "create" ? (
        <CreateWarehouseSheet
          onClose={() => setSheet(null)}
          onCreated={handleCreated}
        />
      ) : null}
      {sheet?.type === "edit" ? (
        <EditWarehouseSheet
          key={sheet.warehouse.id}
          warehouse={sheet.warehouse}
          onClose={() => setSheet(null)}
          onSaved={handleSaved}
        />
      ) : null}
      {sheet?.type === "delete" ? (
        <DeleteWarehouseDialog
          key={sheet.warehouse.id}
          warehouse={sheet.warehouse}
          onClose={() => setSheet(null)}
          onDeleted={handleDeleted}
        />
      ) : null}
    </>
  );
}
