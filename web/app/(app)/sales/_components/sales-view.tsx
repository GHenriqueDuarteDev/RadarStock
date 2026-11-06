"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PAGE_SIZE,
  paginatedProductsSchema,
  paginatedSalesSchema,
  paginatedWarehousesSchema,
  salesSummarySchema,
  type PublicProduct,
  type PublicSale,
  type PublicWarehouse,
} from "@radarstock/contracts";
import { PlusIcon } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

import { CancelSaleDialog } from "./cancel-sale-dialog";
import { CreateSaleSheet } from "./create-sale-sheet";
import { SalesMetrics, type SalesMetricsData } from "./sales-metrics";
import { SalesTable } from "./sales-table";

type SalesSheet =
  | { type: "create" }
  | { type: "cancel"; sale: PublicSale }
  | null;

async function readErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message ?? "Não foi possível concluir a operação.";
  } catch {
    return "Não foi possível concluir a operação.";
  }
}

function buildSalesQuery(page: number, code: string) {
  const query = new URLSearchParams({ page: String(page) });
  const trimmedCode = code.trim();
  if (trimmedCode !== "") {
    query.set("code", trimmedCode);
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

export function SalesView() {
  const [sales, setSales] = useState<PublicSale[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedCode, setAppliedCode] = useState("");
  const [metrics, setMetrics] = useState<SalesMetricsData | null>(null);
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [warehouses, setWarehouses] = useState<PublicWarehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sheet, setSheet] = useState<SalesSheet>(null);

  const loadSales = useCallback(async (nextPage: number, code: string) => {
    setLoadError(null);
    const response = await fetch(
      `/api/sales?${buildSalesQuery(nextPage, code)}`,
    );
    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }
    const data = paginatedSalesSchema.parse(await response.json());
    setSales(data.items);
    setTotal(data.total);
    setPage(data.page);
  }, []);

  const loadSummary = useCallback(async () => {
    const response = await fetch("/api/sales/summary");
    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }
    const data = salesSummarySchema.parse(await response.json());
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
    await Promise.all([loadSales(page, appliedCode), loadSummary()]);
  }, [appliedCode, loadSales, loadSummary, page]);

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      setLoading(true);
      try {
        await Promise.all([loadSales(1, ""), loadSummary(), loadOptions()]);
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar as vendas.",
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
  }, [loadOptions, loadSales, loadSummary]);

  async function handlePageChange(nextPage: number) {
    try {
      await loadSales(nextPage, appliedCode);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar as vendas.",
      );
    }
  }

  async function handleSearchSubmit() {
    const nextCode = searchInput.trim();
    setAppliedCode(nextCode);
    try {
      await loadSales(1, nextCode);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar as vendas.",
      );
    }
  }

  async function handleCreated(_created: PublicSale) {
    setSheet(null);
    await refreshAfterMutation();
  }

  async function handleCancelled(_cancelled: PublicSale) {
    setSheet(null);
    await refreshAfterMutation();
  }

  return (
    <>
      <PageHeader
        category="Operação"
        title="Vendas"
        description="Registre vendas confirmadas com baixa automática de estoque."
        action={
          <Button
            type="button"
            data-testid="new-sale"
            onClick={() => setSheet({ type: "create" })}
          >
            <PlusIcon data-icon="inline-start" />
            Nova venda
          </Button>
        }
      />
      {loading ? (
        <p
          className="text-sm text-muted-foreground"
          data-testid="sales-loading"
        >
          Carregando vendas...
        </p>
      ) : loadError ? (
        <p role="alert" className="text-sm text-destructive">
          {loadError}
        </p>
      ) : (
        <>
          <SalesMetrics data={metrics} />
          <SalesTable
            data={sales}
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            searchValue={searchInput}
            onPageChange={handlePageChange}
            onSearchChange={setSearchInput}
            onSearchSubmit={handleSearchSubmit}
            onCancel={(sale) => setSheet({ type: "cancel", sale })}
          />
        </>
      )}
      {sheet?.type === "create" ? (
        <CreateSaleSheet
          products={products}
          warehouses={warehouses}
          onClose={() => setSheet(null)}
          onCreated={handleCreated}
        />
      ) : null}
      {sheet?.type === "cancel" ? (
        <CancelSaleDialog
          key={sheet.sale.id}
          sale={sheet.sale}
          onClose={() => setSheet(null)}
          onCancelled={handleCancelled}
        />
      ) : null}
    </>
  );
}
