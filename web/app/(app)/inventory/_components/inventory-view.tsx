"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PAGE_SIZE,
  inventoryCountsSummarySchema,
  paginatedInventoryCountsSchema,
  paginatedWarehousesSchema,
  type PublicInventoryCount,
  type PublicWarehouse,
} from "@radarstock/contracts";
import { PlusIcon } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

import { CancelInventoryDialog } from "./cancel-inventory-dialog";
import { ConfirmInventoryDialog } from "./confirm-inventory-dialog";
import { CreateInventoryDialog } from "./create-inventory-dialog";
import { EditInventoryDialog } from "./edit-inventory-dialog";
import {
  InventoryMetrics,
  type InventoryMetricsData,
} from "./inventory-metrics";
import { InventoryTable } from "./inventory-table";

type InventoryDialog =
  | { type: "create" }
  | { type: "edit"; inventory: PublicInventoryCount }
  | { type: "confirm"; inventory: PublicInventoryCount }
  | { type: "cancel"; inventory: PublicInventoryCount }
  | null;

async function readErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message ?? "Não foi possível concluir a operação.";
  } catch {
    return "Não foi possível concluir a operação.";
  }
}

function buildInventoryQuery(page: number, code: string) {
  const query = new URLSearchParams({ page: String(page) });
  const trimmedCode = code.trim();
  if (trimmedCode !== "") {
    query.set("code", trimmedCode);
  }
  return query.toString();
}

async function fetchAllActiveWarehouses() {
  const items: PublicWarehouse[] = [];
  let page = 1;
  let total = Number.POSITIVE_INFINITY;

  while (items.length < total) {
    const response = await fetch(`/api/warehouses?page=${page}`);
    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }
    const data = paginatedWarehousesSchema.parse(await response.json());
    total = data.total;
    items.push(...data.items);
    if (data.items.length === 0) {
      break;
    }
    page += 1;
  }

  return items.filter((warehouse) => warehouse.status === "active");
}

export function InventoryView() {
  const [inventories, setInventories] = useState<PublicInventoryCount[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedCode, setAppliedCode] = useState("");
  const [metrics, setMetrics] = useState<InventoryMetricsData | null>(null);
  const [warehouses, setWarehouses] = useState<PublicWarehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dialog, setDialog] = useState<InventoryDialog>(null);

  const loadInventories = useCallback(
    async (nextPage: number, code: string) => {
      setLoadError(null);
      const response = await fetch(
        `/api/inventory?${buildInventoryQuery(nextPage, code)}`,
      );
      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }
      const data = paginatedInventoryCountsSchema.parse(await response.json());
      setInventories(data.items);
      setTotal(data.total);
      setPage(data.page);
    },
    [],
  );

  const loadSummary = useCallback(async () => {
    const response = await fetch("/api/inventory/summary");
    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }
    const data = inventoryCountsSummarySchema.parse(await response.json());
    setMetrics(data);
  }, []);

  const loadOptions = useCallback(async () => {
    const nextWarehouses = await fetchAllActiveWarehouses();
    setWarehouses(nextWarehouses);
  }, []);

  const refreshAfterMutation = useCallback(async () => {
    await Promise.all([loadInventories(page, appliedCode), loadSummary()]);
  }, [appliedCode, loadInventories, loadSummary, page]);

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      setLoading(true);
      try {
        await Promise.all([
          loadInventories(1, ""),
          loadSummary(),
          loadOptions(),
        ]);
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar os inventários.",
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
  }, [loadInventories, loadOptions, loadSummary]);

  async function handlePageChange(nextPage: number) {
    try {
      await loadInventories(nextPage, appliedCode);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar os inventários.",
      );
    }
  }

  async function handleSearchSubmit() {
    const nextCode = searchInput.trim();
    setAppliedCode(nextCode);
    try {
      await loadInventories(1, nextCode);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar os inventários.",
      );
    }
  }

  async function handleCreated(inventory: PublicInventoryCount) {
    await refreshAfterMutation();
    setDialog({ type: "edit", inventory });
  }

  async function handleMutated() {
    setDialog(null);
    await refreshAfterMutation();
  }

  return (
    <>
      <PageHeader
        category="Operação"
        title="Inventário"
        description="Abra a contagem por galpão, registre o físico e confirme para ajustar os saldos."
        action={
          <Button
            type="button"
            data-testid="new-inventory"
            onClick={() => setDialog({ type: "create" })}
          >
            <PlusIcon data-icon="inline-start" />
            Novo inventário
          </Button>
        }
      />
      {loading ? (
        <p
          className="text-sm text-muted-foreground"
          data-testid="inventory-loading"
        >
          Carregando inventários...
        </p>
      ) : loadError ? (
        <p role="alert" className="text-sm text-destructive">
          {loadError}
        </p>
      ) : (
        <>
          <InventoryMetrics data={metrics} />
          <InventoryTable
            data={inventories}
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            searchValue={searchInput}
            onPageChange={handlePageChange}
            onSearchChange={setSearchInput}
            onSearchSubmit={handleSearchSubmit}
            onEdit={(inventory) => setDialog({ type: "edit", inventory })}
            onConfirm={(inventory) =>
              setDialog({ type: "confirm", inventory })
            }
            onCancel={(inventory) => setDialog({ type: "cancel", inventory })}
          />
        </>
      )}
      {dialog?.type === "create" ? (
        <CreateInventoryDialog
          warehouses={warehouses}
          onClose={() => setDialog(null)}
          onCreated={handleCreated}
        />
      ) : null}
      {dialog?.type === "edit" ? (
        <EditInventoryDialog
          key={dialog.inventory.id}
          inventory={dialog.inventory}
          onClose={() => setDialog(null)}
          onSaved={handleMutated}
        />
      ) : null}
      {dialog?.type === "confirm" ? (
        <ConfirmInventoryDialog
          key={dialog.inventory.id}
          inventory={dialog.inventory}
          onClose={() => setDialog(null)}
          onConfirmed={handleMutated}
        />
      ) : null}
      {dialog?.type === "cancel" ? (
        <CancelInventoryDialog
          key={dialog.inventory.id}
          inventory={dialog.inventory}
          onClose={() => setDialog(null)}
          onCancelled={handleMutated}
        />
      ) : null}
    </>
  );
}
