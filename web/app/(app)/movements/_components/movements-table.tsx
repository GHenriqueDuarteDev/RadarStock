"use client";

import type {
  PublicStockMovement,
  StockMovementType,
} from "@radarstock/contracts";

import { ListPanel } from "@/components/list-panel";
import { Badge } from "@/components/ui/badge";
import { displayValue } from "@/lib/utils";

type MovementsTableProps = {
  data?: PublicStockMovement[];
  total: number;
  page: number;
  pageSize: number;
  searchValue: string;
  onPageChange: (page: number) => void;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
};

const typeLabel: Record<StockMovementType, string> = {
  in: "Entrada",
  out: "Saída",
  transfer: "Transferência",
  adjustment: "Ajuste",
};

const typeVariant = {
  in: "entrada",
  out: "saida",
  transfer: "default",
  adjustment: "pending",
} as const;

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function TypeBadge({ type }: { type: StockMovementType | null }) {
  if (!type) {
    return (
      <span className="font-mono text-xs text-muted-foreground">
        {displayValue(null)}
      </span>
    );
  }

  return <Badge variant={typeVariant[type]}>{typeLabel[type]}</Badge>;
}

function formatCreatedAt(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return displayValue(null);
  }
  return dateFormatter.format(date);
}

export function MovementsTable({
  data = [],
  total,
  page,
  pageSize,
  searchValue,
  onPageChange,
  onSearchChange,
  onSearchSubmit,
}: MovementsTableProps) {
  return (
    <ListPanel
      title="Lista de movimentações"
      totalCount={total}
      page={page}
      pageSize={pageSize}
      onPageChange={onPageChange}
      searchPlaceholder="Buscar por produto..."
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-foreground">
            <tr>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Data
              </th>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Produto
              </th>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Tipo
              </th>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Qtd
              </th>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Origem
              </th>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Destino
              </th>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Responsável
              </th>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Nota
              </th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr className="border-t-2 border-border">
                <td className="px-4 py-3 text-center">
                  {displayValue(null)}
                </td>
                <td className="px-4 py-3">
                  <div className="space-y-0.5">
                    <p className="font-semibold">{displayValue(null)}</p>
                    <p className="font-mono text-xs text-muted-foreground">
                      {displayValue(null)}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <TypeBadge type={null} />
                </td>
                <td className="px-4 py-3 text-center font-mono">
                  {displayValue(null)}
                </td>
                <td className="px-4 py-3 text-center">
                  {displayValue(null)}
                </td>
                <td className="px-4 py-3 text-center">
                  {displayValue(null)}
                </td>
                <td className="px-4 py-3 text-center">
                  {displayValue(null)}
                </td>
                <td className="px-4 py-3 text-center">
                  {displayValue(null)}
                </td>
              </tr>
            ) : (
              data.map((movement) => (
                <tr key={movement.id} className="border-t-2 border-border">
                  <td className="px-4 py-3 text-center font-mono text-xs">
                    {formatCreatedAt(movement.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <p className="font-semibold">
                        {displayValue(movement.productName)}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {displayValue(movement.productSku)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <TypeBadge type={movement.type} />
                  </td>
                  <td className="px-4 py-3 text-center font-mono">
                    {movement.quantity.toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {displayValue(movement.fromWarehouseName)}
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {displayValue(movement.toWarehouseName)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {displayValue(movement.userName)}
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {displayValue(movement.note)}
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
