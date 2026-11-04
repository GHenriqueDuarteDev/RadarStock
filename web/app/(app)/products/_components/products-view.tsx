"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  publicCategorySchema,
  publicProductSchema,
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

const productsListSchema = z.array(publicProductSchema);
const categoriesListSchema = z.array(publicCategorySchema);

type ProductsSheet =
  | { type: "create" }
  | { type: "edit"; product: PublicProduct }
  | { type: "delete"; product: PublicProduct }
  | null;

function computeMetrics(
  products: PublicProduct[],
  categoriesCount: number,
): ProductsMetricsData {
  return {
    total: products.length,
    active: products.filter((product) => product.status === "active").length,
    inactive: products.filter((product) => product.status === "inactive")
      .length,
    categories: categoriesCount,
  };
}

async function readErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message ?? "Não foi possível concluir a operação.";
  } catch {
    return "Não foi possível concluir a operação.";
  }
}

export function ProductsView() {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [categories, setCategories] = useState<PublicCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sheet, setSheet] = useState<ProductsSheet>(null);

  const loadData = useCallback(async () => {
    setLoadError(null);

    const [productsResponse, categoriesResponse] = await Promise.all([
      fetch("/api/products"),
      fetch("/api/categories"),
    ]);

    if (!productsResponse.ok) {
      throw new Error(await readErrorMessage(productsResponse));
    }
    if (!categoriesResponse.ok) {
      throw new Error(await readErrorMessage(categoriesResponse));
    }

    const productsData = productsListSchema.parse(
      await productsResponse.json(),
    );
    const categoriesData = categoriesListSchema.parse(
      await categoriesResponse.json(),
    );

    setProducts(productsData);
    setCategories(categoriesData);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initialLoad() {
      setLoading(true);
      try {
        await loadData();
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
  }, [loadData]);

  const metrics = useMemo(
    () => computeMetrics(products, categories.length),
    [products, categories.length],
  );

  function handleCreated(created: PublicProduct) {
    setProducts((current) => [created, ...current]);
    setSheet(null);
  }

  function handleSaved(updated: PublicProduct) {
    setProducts((current) =>
      current.map((product) =>
        product.id === updated.id ? updated : product,
      ),
    );
    setSheet(null);
  }

  function handleDeleted(id: string) {
    setProducts((current) =>
      current.map((product) =>
        product.id === id
          ? { ...product, status: "inactive" as const }
          : product,
      ),
    );
    setSheet(null);
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
            data={products.map((product) => ({
              ...product,
              stockQuantity: null,
            }))}
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
