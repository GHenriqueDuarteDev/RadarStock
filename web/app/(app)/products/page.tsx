import { Suspense } from "react";
import {
  hasPermission,
  listProductsQuerySchema,
  paginatedProductsSchema,
  productsSummarySchema,
  publicCategorySchema,
  type ListProductsQuery,
} from "@radarstock/contracts";
import { z } from "zod";

import { parseSearchParams, type PageProps } from "@/app/_lib/search-params";
import { fetchFromApi, getCurrentUser } from "@/app/_lib/server-api";
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

async function ProductsTableSection({
  query,
  canWrite,
}: {
  query: ListProductsQuery;
  canWrite: boolean;
}) {
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
      canWrite={canWrite}
    />
  );
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const [rawParams, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);
  const query = parseSearchParams(listProductsQuerySchema, rawParams);
  const canWrite = hasPermission(user?.role, "products.write");

  return (
    <div className="space-y-4">
      <PageHeader
        category="Catálogo"
        title="Produtos"
        description="Gerencie seu catálogo, preços e status dos produtos."
        action={
          canWrite ? (
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
          ) : null
        }
      />
      <SectionErrorBoundary title="Indicadores indisponíveis">
        <Suspense fallback={<MetricsSkeleton />}>
          <ProductsMetricsSection />
        </Suspense>
      </SectionErrorBoundary>
      <SectionErrorBoundary title="Lista de produtos indisponível">
        <Suspense fallback={<TablePanelSkeleton />}>
          <ProductsTableSection query={query} canWrite={canWrite} />
        </Suspense>
      </SectionErrorBoundary>
    </div>
  );
}
