"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PAGE_SIZE,
  paginatedProductsSchema,
  paginatedStockMovementsSchema,
  paginatedWarehousesSchema,
  stockMovementsSummarySchema,
  type PublicProduct,
  type PublicStockMovement,
  type PublicWarehouse,
} from "@radarstock/contracts";
import { PlusIcon } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

import { CreateMovementSheet } from "./create-movement-sheet";
import {
  MovementsMetrics,
  type MovementsMetricsData,
} from "./movements-metrics";
import { MovementsTable } from "./movements-table";

type MovementsSheet = { type: "create" } | null;

async function readErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message ?? "Não foi possível concluir a operação.";
  } catch {
    return "Não foi possível concluir a operação.";
  }
}

function buildMovementsQuery(page: number, name: string) {
  const query = new URLSearchParams({ page: String(page) });
  const trimmedName = name.trim();
  if (trimmedName !== "") {
    query.set("name", trimmedName);
  }
  return query.toString();
}

async function fetchAllActiveProducts() {
  const items: PublicProduct[] = [];
  let page = 1;
  let total = Number.POSITIVE_INFINITY;

  while (items.length < total) {
    const response = await fetch(`/api/products?page=${page}`);
    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }
    const data = paginatedProductsSchema.parse(await response.json());
    total = data.total;
    items.push(...data.items);
    if (data.items.length === 0) {
      break;
    }
    page += 1;
  }

  return items.filter((product) => product.status === "active");
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

export function MovementsView() {
  const [movements, setMovements] = useState<PublicStockMovement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedName, setAppliedName] = useState("");
  const [metrics, setMetrics] = useState<MovementsMetricsData | null>(null);
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [warehouses, setWarehouses] = useState<PublicWarehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sheet, setSheet] = useState<MovementsSheet>(null);

  const loadMovements = useCallback(async (nextPage: number, name: string) => {
    setLoadError(null);
    const response = await fetch(
      `/api/movements?${buildMovementsQuery(nextPage, name)}`,
    );
    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }
    const data = paginatedStockMovementsSchema.parse(await response.json());
    setMovements(data.items);
    setTotal(data.total);
    setPage(data.page);
  }, []);

  const loadSummary = useCallback(async () => {
    const response = await fetch("/api/movements/summary");
    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }
    const data = stockMovementsSummarySchema.parse(await response.json());
    setMetrics(data);
  }, []);

  const loadOptions = useCallback(async () => {
    const [nextProducts, nextWarehouses] = await Promise.all([
      fetchAllActiveProducts(),
      fetchAllActiveWarehouses(),
    ]);
    setProducts(nextProducts);
    setWarehouses(nextWarehouses);
  }, []);

  const refreshAfterMutation = useCallback(async () => {
    await Promise.all([loadMovements(page, appliedName), loadSummary()]);
  }, [appliedName, loadMovements, loadSummary, page]);

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      setLoading(true);
      try {
        await Promise.all([
          loadMovements(1, ""),
          loadSummary(),
          loadOptions(),
        ]);
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar as movimentações.",
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
  }, [loadMovements, loadOptions, loadSummary]);

  async function handlePageChange(nextPage: number) {
    try {
      await loadMovements(nextPage, appliedName);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar as movimentações.",
      );
    }
  }

  async function handleSearchSubmit() {
    const nextName = searchInput.trim();
    setAppliedName(nextName);
    try {
      await loadMovements(1, nextName);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar as movimentações.",
      );
    }
  }

  async function handleCreated(_created: PublicStockMovement) {
    setSheet(null);
    await refreshAfterMutation();
  }

  return (
    <>
      <PageHeader
        category="Operação"
        title="Movimentações"
        description="Registre entradas, saídas, transferências e ajustes de estoque."
        action={
          <Button
            type="button"
            data-testid="new-movement"
            onClick={() => setSheet({ type: "create" })}
          >
            <PlusIcon data-icon="inline-start" />
            Nova movimentação
          </Button>
        }
      />
      {loading ? (
        <p
          className="text-sm text-muted-foreground"
          data-testid="movements-loading"
        >
          Carregando movimentações...
        </p>
      ) : loadError ? (
        <p role="alert" className="text-sm text-destructive">
          {loadError}
        </p>
      ) : (
        <>
          <MovementsMetrics data={metrics} />
          <MovementsTable
            data={movements}
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            searchValue={searchInput}
            onPageChange={handlePageChange}
            onSearchChange={setSearchInput}
            onSearchSubmit={handleSearchSubmit}
          />
        </>
      )}
      {sheet?.type === "create" ? (
        <CreateMovementSheet
          products={products}
          warehouses={warehouses}
          onClose={() => setSheet(null)}
          onCreated={handleCreated}
        />
      ) : null}
    </>
  );
}
