"use client";

import { MoreHorizontalIcon } from "lucide-react";
import type { DocumentStatus, PublicSale } from "@radarstock/contracts";

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

type SalesTableProps = {
  data?: PublicSale[];
  total: number;
  page: number;
  pageSize: number;
  searchValue: string;
  onPageChange: (page: number) => void;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onCancel?: (sale: PublicSale) => void;
};

const statusLabel: Record<DocumentStatus, string> = {
  draft: "Rascunho",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
};

const statusVariant = {
  draft: "default",
  confirmed: "success",
  cancelled: "destructive",
} as const;

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function StatusBadge({ status }: { status: DocumentStatus | null }) {
  if (!status) {
    return (
      <span className="font-mono text-xs text-muted-foreground">
        {displayValue(null)}
      </span>
    );
  }

  return (
    <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>
  );
}

function formatSoldAt(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return displayValue(null);
  }
  return dateFormatter.format(date);
}

function formatCurrency(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function SalesTable({
  data = [],
  total,
  page,
  pageSize,
  searchValue,
  onPageChange,
  onSearchChange,
  onSearchSubmit,
  onCancel,
}: SalesTableProps) {
  return (
    <ListPanel
      title="Lista de vendas"
      totalCount={total}
      page={page}
      pageSize={pageSize}
      onPageChange={onPageChange}
      searchPlaceholder="Buscar por código..."
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-foreground">
            <tr>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Código
              </th>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Data
              </th>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Galpão
              </th>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Itens
              </th>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Total
              </th>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Status
              </th>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Responsável
              </th>
              <th className="px-4 py-2 text-center text-xs font-semibold tracking-wide uppercase">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr className="border-t-2 border-border">
                <td className="px-4 py-3 text-center font-mono">
                  {displayValue(null)}
                </td>
                <td className="px-4 py-3 text-center">
                  {displayValue(null)}
                </td>
                <td className="px-4 py-3 text-center">
                  {displayValue(null)}
                </td>
                <td className="px-4 py-3 text-center font-mono">
                  {displayValue(null)}
                </td>
                <td className="px-4 py-3 text-center font-mono">
                  {displayValue(null)}
                </td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge status={null} />
                </td>
                <td className="px-4 py-3 text-center">
                  {displayValue(null)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Ações da venda"
                    disabled
                  >
                    <MoreHorizontalIcon />
                  </Button>
                </td>
              </tr>
            ) : (
              data.map((sale) => (
                <tr key={sale.id} className="border-t-2 border-border">
                  <td className="px-4 py-3 text-center font-mono font-semibold">
                    {displayValue(sale.code)}
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-xs">
                    {formatSoldAt(sale.soldAt)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {displayValue(sale.warehouseName)}
                  </td>
                  <td className="px-4 py-3 text-center font-mono">
                    {sale.items.length}
                  </td>
                  <td className="px-4 py-3 text-center font-mono">
                    {formatCurrency(sale.totalAmount)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={sale.status} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {displayValue(sale.createdByName)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        data-testid={`sale-actions-${sale.id}`}
                        aria-label={`Ações de ${sale.code}`}
                        className="inline-flex size-7 items-center justify-center rounded-md hover:bg-muted"
                      >
                        <MoreHorizontalIcon className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-44">
                        <DropdownMenuItem
                          variant="destructive"
                          disabled={sale.status !== "confirmed"}
                          onClick={() => onCancel?.(sale)}
                          data-testid={`sale-cancel-${sale.id}`}
                        >
                          Cancelar venda
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
