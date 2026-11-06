"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PAGE_SIZE,
  paginatedProductsSchema,
  paginatedReceiptsSchema,
  paginatedWarehousesSchema,
  receiptsSummarySchema,
  type PublicProduct,
  type PublicReceipt,
  type PublicWarehouse,
} from "@radarstock/contracts";
import { PlusIcon } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

import { CancelReceiptDialog } from "./cancel-receipt-dialog";
import { CreateReceiptSheet } from "./create-receipt-sheet";
import {
  ReceiptsMetrics,
  type ReceiptsMetricsData,
} from "./receipts-metrics";
import { ReceiptsTable } from "./receipts-table";

type ReceiptsSheet =
  | { type: "create" }
  | { type: "cancel"; receipt: PublicReceipt }
  | null;

async function readErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message ?? "Não foi possível concluir a operação.";
  } catch {
    return "Não foi possível concluir a operação.";
  }
}

function buildReceiptsQuery(page: number, code: string) {
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

export function ReceiptsView() {
  const [receipts, setReceipts] = useState<PublicReceipt[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedCode, setAppliedCode] = useState("");
  const [metrics, setMetrics] = useState<ReceiptsMetricsData | null>(null);
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [warehouses, setWarehouses] = useState<PublicWarehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sheet, setSheet] = useState<ReceiptsSheet>(null);

  const loadReceipts = useCallback(async (nextPage: number, code: string) => {
    setLoadError(null);
    const response = await fetch(
      `/api/receipts?${buildReceiptsQuery(nextPage, code)}`,
    );
    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }
    const data = paginatedReceiptsSchema.parse(await response.json());
    setReceipts(data.items);
    setTotal(data.total);
    setPage(data.page);
  }, []);

  const loadSummary = useCallback(async () => {
    const response = await fetch("/api/receipts/summary");
    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }
    const data = receiptsSummarySchema.parse(await response.json());
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
    await Promise.all([loadReceipts(page, appliedCode), loadSummary()]);
  }, [appliedCode, loadReceipts, loadSummary, page]);

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      setLoading(true);
      try {
        await Promise.all([
          loadReceipts(1, ""),
          loadSummary(),
          loadOptions(),
        ]);
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar os recebimentos.",
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
  }, [loadOptions, loadReceipts, loadSummary]);

  async function handlePageChange(nextPage: number) {
    try {
      await loadReceipts(nextPage, appliedCode);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar os recebimentos.",
      );
    }
  }

  async function handleSearchSubmit() {
    const nextCode = searchInput.trim();
    setAppliedCode(nextCode);
    try {
      await loadReceipts(1, nextCode);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar os recebimentos.",
      );
    }
  }

  async function handleCreated(_created: PublicReceipt) {
    setSheet(null);
    await refreshAfterMutation();
  }

  async function handleCancelled(_cancelled: PublicReceipt) {
    setSheet(null);
    await refreshAfterMutation();
  }

  return (
    <>
      <PageHeader
        category="Operação"
        title="Recebimentos"
        description="Registre entradas de mercadoria com aumento automático de estoque."
        action={
          <Button
            type="button"
            data-testid="new-receipt"
            onClick={() => setSheet({ type: "create" })}
          >
            <PlusIcon data-icon="inline-start" />
            Novo recebimento
          </Button>
        }
      />
      {loading ? (
        <p
          className="text-sm text-muted-foreground"
          data-testid="receipts-loading"
        >
          Carregando recebimentos...
        </p>
      ) : loadError ? (
        <p role="alert" className="text-sm text-destructive">
          {loadError}
        </p>
      ) : (
        <>
          <ReceiptsMetrics data={metrics} />
          <ReceiptsTable
            data={receipts}
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            searchValue={searchInput}
            onPageChange={handlePageChange}
            onSearchChange={setSearchInput}
            onSearchSubmit={handleSearchSubmit}
            onCancel={(receipt) => setSheet({ type: "cancel", receipt })}
          />
        </>
      )}
      {sheet?.type === "create" ? (
        <CreateReceiptSheet
          products={products}
          warehouses={warehouses}
          onClose={() => setSheet(null)}
          onCreated={handleCreated}
        />
      ) : null}
      {sheet?.type === "cancel" ? (
        <CancelReceiptDialog
          key={sheet.receipt.id}
          receipt={sheet.receipt}
          onClose={() => setSheet(null)}
          onCancelled={handleCancelled}
        />
      ) : null}
    </>
  );
}
