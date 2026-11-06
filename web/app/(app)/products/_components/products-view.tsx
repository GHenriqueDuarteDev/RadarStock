"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PAGE_SIZE,
  paginatedProductsSchema,
  productsSummarySchema,
  publicCategorySchema,
  type PublicCategory,
  type PublicProduct,
} from "@radarstock/contracts";
import { PlusIcon } from "lucide-react";
import { z } from "zod";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

import { CreateProductSheet } from "./create-product-sheet";
import { DeleteProductDialog } from "./delete-product-dialog";
import { EditProductSheet } from "./edit-product-sheet";
import { ProductsMetrics, type ProductsMetricsData } from "./products-metrics";
import { ProductsTable } from "./products-table";

const categoriesListSchema = z.array(publicCategorySchema);

type ProductsSheet =
  | { type: "create" }
  | { type: "edit"; product: PublicProduct }
  | { type: "delete"; product: PublicProduct }
  | null;

async function readErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message ?? "Não foi possível concluir a operação.";
  } catch {
    return "Não foi possível concluir a operação.";
  }
}

function buildProductsQuery(page: number, name: string) {
  const query = new URLSearchParams({ page: String(page) });
  const trimmedName = name.trim();
  if (trimmedName !== "") {
    query.set("name", trimmedName);
  }
  return query.toString();
}

export function ProductsView() {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [appliedName, setAppliedName] = useState("");
  const [metrics, setMetrics] = useState<ProductsMetricsData | null>(null);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sheet, setSheet] = useState<ProductsSheet>(null);

  const loadProducts = useCallback(async (nextPage: number, name: string) => {
    setLoadError(null);
    const response = await fetch(
      `/api/products?${buildProductsQuery(nextPage, name)}`,
    );
    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }
    const data = paginatedProductsSchema.parse(await response.json());
    setProducts(data.items);
    setTotal(data.total);
    setPage(data.page);
  }, []);

  const loadSummary = useCallback(async () => {
    const response = await fetch("/api/products/summary");
    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }
    const data = productsSummarySchema.parse(await response.json());
    setMetrics(data);
  }, []);

  const loadCategories = useCallback(async () => {
    const response = await fetch("/api/categories");
    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }
    const data = categoriesListSchema.parse(await response.json());
    setCategories(data);
  }, []);

  const refreshAfterMutation = useCallback(async () => {
    await Promise.all([loadProducts(page, appliedName), loadSummary()]);
  }, [appliedName, loadProducts, loadSummary, page]);

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      setLoading(true);
      try {
        await Promise.all([
          loadProducts(1, ""),
          loadSummary(),
          loadCategories(),
        ]);
      } catch (err) {
        if (!cancelled) {
          setLoadError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar os produtos.",
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
  }, [loadCategories, loadProducts, loadSummary]);

  async function handlePageChange(nextPage: number) {
    try {
      await loadProducts(nextPage, appliedName);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar os produtos.",
      );
    }
  }

  async function handleSearchSubmit() {
    const nextName = searchInput.trim();
    setAppliedName(nextName);
    try {
      await loadProducts(1, nextName);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar os produtos.",
      );
    }
  }

  async function handleCreated(_created: PublicProduct) {
    setSheet(null);
    await refreshAfterMutation();
  }

  async function handleSaved(_updated: PublicProduct) {
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
        category="Catálogo"
        title="Produtos"
        description="Gerencie seu catálogo, preços e status dos produtos."
        action={
          <Button
            type="button"
            data-testid="new-product"
            onClick={() => setSheet({ type: "create" })}
          >
            <PlusIcon data-icon="inline-start" />
            Novo produto
          </Button>
        }
      />
      {loading ? (
        <p
          className="text-sm text-muted-foreground"
          data-testid="products-loading"
        >
          Carregando produtos...
        </p>
      ) : loadError ? (
        <p role="alert" className="text-sm text-destructive">
          {loadError}
        </p>
      ) : (
        <>
          <ProductsMetrics data={metrics} />
          <ProductsTable
            data={products}
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            searchValue={searchInput}
            onPageChange={handlePageChange}
            onSearchChange={setSearchInput}
            onSearchSubmit={handleSearchSubmit}
            onEdit={(product) => setSheet({ type: "edit", product })}
            onDelete={(product) => setSheet({ type: "delete", product })}
          />
        </>
      )}
      {sheet?.type === "create" ? (
        <CreateProductSheet
          categories={categories}
          onClose={() => setSheet(null)}
          onCreated={handleCreated}
        />
      ) : null}
      {sheet?.type === "edit" ? (
        <EditProductSheet
          key={sheet.product.id}
          product={sheet.product}
          categories={categories}
          onClose={() => setSheet(null)}
          onSaved={handleSaved}
        />
      ) : null}
      {sheet?.type === "delete" ? (
        <DeleteProductDialog
          key={sheet.product.id}
          product={sheet.product}
          onClose={() => setSheet(null)}
          onDeleted={handleDeleted}
        />
      ) : null}
    </>
  );
}
