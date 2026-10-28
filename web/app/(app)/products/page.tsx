import Link from "next/link";
import { PlusIcon } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";

import { ProductsMetrics } from "./_components/products-metrics";
import { ProductsTable } from "./_components/products-table";

export default function ProductsPage() {
  return (
    <div className="space-y-4">
      <PageHeader
        category="Catálogo"
        title="Produtos"
        description="Gerencie seu catálogo, preços e níveis de estoque."
        action={
          <Button render={<Link href="/products/new" />}>
            <PlusIcon data-icon="inline-start" />
            Novo produto
          </Button>
        }
      />
      <ProductsMetrics />
      <ProductsTable />
    </div>
  );
}
