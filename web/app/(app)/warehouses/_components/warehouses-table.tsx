"use client";

import { MoreHorizontalIcon } from "lucide-react";
import type { PublicWarehouse, WarehouseStatus } from "@radarstock/contracts";

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

type WarehousesTableProps = {
  data?: PublicWarehouse[];
  total: number;
  page: number;
  pageSize: number;
  searchValue: string;
  onPageChange: (page: number) => void;
  onSearchChange: (value: string) => void;
  onSearchSubmit: () => void;
  onEdit?: (warehouse: PublicWarehouse) => void;
  onDelete?: (warehouse: PublicWarehouse) => void;
};

const statusLabel: Record<WarehouseStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
};

function formatCapacity(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return displayValue(null);
  }
  return value.toLocaleString("pt-BR");
}

function StatusBadge({ status }: { status: WarehouseStatus | null }) {
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

export function WarehousesTable({
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
}: WarehousesTableProps) {
  return (
    <ListPanel
      title="Lista de galpões"
      totalCount={total}
      page={page}
      pageSize={pageSize}
      onPageChange={onPageChange}
      searchPlaceholder="Buscar galpão..."
      searchValue={searchValue}
      onSearchChange={onSearchChange}
      onSearchSubmit={onSearchSubmit}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted text-foreground">
            <tr>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Galpão
              </th>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Endereço
              </th>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Capacidade
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
                <td className="px-4 py-3">
                  <StatusBadge status={null} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Ações do galpão"
                    disabled
                  >
                    <MoreHorizontalIcon />
                  </Button>
                </td>
              </tr>
            ) : (
              data.map((warehouse) => (
                <tr key={warehouse.id} className="border-t-2 border-border">
                  <td className="px-4 py-3">
                    <div className="space-y-0.5">
                      <p className="font-semibold">
                        {displayValue(warehouse.name)}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        {displayValue(warehouse.code)}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center text-muted-foreground">
                    {displayValue(warehouse.address)}
                  </td>
                  <td className="px-4 py-3 text-center font-mono">
                    {formatCapacity(warehouse.capacity)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={warehouse.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        data-testid={`warehouse-actions-${warehouse.id}`}
                        aria-label={`Ações de ${warehouse.name}`}
                        className="inline-flex size-7 items-center justify-center rounded-md hover:bg-muted"
                      >
                        <MoreHorizontalIcon className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-44">
                        <DropdownMenuItem
                          onClick={() => onEdit?.(warehouse)}
                          data-testid={`warehouse-edit-${warehouse.id}`}
                        >
                          Alterar dados
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => onDelete?.(warehouse)}
                          data-testid={`warehouse-delete-${warehouse.id}`}
                        >
                          Desativar galpão
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
