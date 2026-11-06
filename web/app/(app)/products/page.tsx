import { Suspense } from "react";
import {
  listProductsQuerySchema,
  paginatedProductsSchema,
  productsSummarySchema,
  publicCategorySchema,
  type ListProductsQuery,
} from "@radarstock/contracts";
import { z } from "zod";

import { parseSearchParams, type PageProps } from "@/app/_lib/search-params";
import { fetchFromApi } from "@/app/_lib/server-api";
import { PageHeader } from "@/components/page-header";
import { SectionErrorBoundary } from "@/components/section-error";
import {
  MetricsSkeleton,
  TablePanelSkeleton,
} from "@/components/section-skeletons";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

import { NewProductButton } from "./_components/new-product-button";
import { ProductsMetrics } from "./_components/products-metrics";
import { ProductsTable } from "./_components/products-table";

const categoriesListSchema = z.array(publicCategorySchema);

function getCategories() {
  return fetchFromApi("/categories", categoriesListSchema);
}

function buildProductsPath(query: ListProductsQuery) {
  const params = new URLSearchParams({ page: String(query.page) });
  if (query.name) {
    params.set("name", query.name);
  }
  return `/products?${params.toString()}`;
}

async function NewProductAction() {
  const categories = await getCategories();
  return <NewProductButton categories={categories} />;
}

async function ProductsMetricsSection() {
  const summary = await fetchFromApi(
    "/products/summary",
    productsSummarySchema,
  );
  return <ProductsMetrics data={summary} />;
}

async function ProductsTableSection({ query }: { query: ListProductsQuery }) {
  const [products, categories] = await Promise.all([
    fetchFromApi(buildProductsPath(query), paginatedProductsSchema),
    getCategories(),
  ]);

  return (
    <ProductsTable
      data={products.items}
      total={products.total}
      page={products.page}
      pageSize={products.pageSize}
      categories={categories}
    />
  );
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const query = parseSearchParams(listProductsQuerySchema, await searchParams);

  return (
    <div className="space-y-4">
      <PageHeader
        category="Catálogo"
        title="Produtos"
        description="Gerencie seu catálogo, preços e status dos produtos."
        action={
          <Suspense
            fallback={
              <Button type="button" disabled>
                <PlusIcon data-icon="inline-start" />
                Novo produto
              </Button>
            }
          >
            <NewProductAction />
          </Suspense>
        }
      />
      <SectionErrorBoundary title="Indicadores indisponíveis">
        <Suspense fallback={<MetricsSkeleton />}>
          <ProductsMetricsSection />
        </Suspense>
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Lista de produtos indisponível">
        <Suspense fallback={<TablePanelSkeleton />}>
          <ProductsTableSection query={query} />
        </Suspense>
      </SectionErrorBoundary>
    </div>
  );
}
