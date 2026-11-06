"use client";

import { MoreHorizontalIcon } from "lucide-react";
import type { PublicProduct, ProductStatus } from "@radarstock/contracts";

import { ListPanel } from "@/components/list-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { displayValue } from "@/lib/utils";

type ProductsTableProps = {
  data?: PublicProduct[];
  total: number;
  page: number;
  pageSize: number;
  searchValue: string;
  onPageChange: (page: number) => void;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onEdit?: (product: PublicProduct) => void;
  onDelete?: (product: PublicProduct) => void;
};

const statusLabel: Record<ProductStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
};

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return displayValue(value);
  }
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatStock(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return displayValue(null);
  }
  return `${value} un`;
}

function StatusBadge({ status }: { status: ProductStatus | null }) {
  if (!status) {
    return (
      <span className="font-mono text-xs text-muted-foreground">
        {displayValue(null)}
      </span>
    );
  }

  return (
    <Badge variant={status === "active" ? "success" : "destructive"}>
      {statusLabel[status]}
    </Badge>
  );
}

export function ProductsTable({
  data = [],
  total,
  page,
  pageSize,
  searchValue,
  onPageChange,
  onSearchChange,
  onSearchSubmit,
  onEdit,
  onDelete,
}: ProductsTableProps) {
  return (
    <ListPanel
      title="Lista de produtos"
      totalCount={total}
      page={page}
      pageSize={pageSize}
      onPageChange={onPageChange}
      searchPlaceholder="Buscar produto..."
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-foreground">
            <tr>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Produto
              </th>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Categoria
              </th>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Estoque
              </th>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Custo
              </th>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Preço de venda
              </th>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Status
              </th>
              <th className="px-4 py-2 text-center text-xs font-semibold tracking-wide uppercase">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr className="border-t-2 border-border">
                <td className="px-4 py-3">
                  <div className="space-y-0.5">
                    <p className="font-semibold">{displayValue(null)}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {displayValue(null)}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3">{displayValue(null)}</td>
                <td className="px-4 py-3 text-right font-mono">
                  {displayValue(null)}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {displayValue(null)}
                </td>
                <td className="px-4 py-3 text-right font-mono">
                  {displayValue(null)}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={null} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Ações do produto"
                    disabled
                  >
                    <MoreHorizontalIcon />
                  </Button>
                </td>
              </tr>
            ) : (
              data.map((product) => (
                <tr key={product.id} className="border-t-2 border-border">
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <p className="font-semibold">
                        {displayValue(product.name)}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {displayValue(product.sku)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {displayValue(product.category.name)}
                  </td>
                  <td className="px-4 py-3 text-center font-mono">
                    {formatStock(product.stockQuantity)}
                  </td>
                  <td className="px-4 py-3 text-center font-mono">
                    {formatCurrency(product.cost)}
                  </td>
                  <td className="px-4 py-3 text-center font-mono">
                    {formatCurrency(product.salePrice)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={product.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        data-testid={`product-actions-${product.id}`}
                        aria-label={`Ações de ${product.name}`}
                        className="inline-flex size-7 items-center justify-center rounded-md hover:bg-muted"
                      >
                        <MoreHorizontalIcon className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-44">
                        <DropdownMenuItem
                          onClick={() => onEdit?.(product)}
                          data-testid={`product-edit-${product.id}`}
                        >
                          Alterar dados
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onDelete?.(product)}
                          data-testid={`product-delete-${product.id}`}
                        >
                          Desativar produto
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </ListPanel>
  );
}
