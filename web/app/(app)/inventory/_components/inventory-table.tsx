"use client";

import { useState } from "react";
import { MoreHorizontalIcon } from "lucide-react";
import type { DocumentStatus, PublicInventoryCount } from "@radarstock/contracts";

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

import { CancelInventoryDialog } from "./cancel-inventory-dialog";
import { ConfirmInventoryDialog } from "./confirm-inventory-dialog";
import { EditInventoryDialog } from "./edit-inventory-dialog";

type InventoryTableProps = {
  data?: PublicInventoryCount[];
  total: number;
  page: number;
  pageSize: number;
  canWrite?: boolean;
};

type RowDialog =
  | { type: "edit"; inventory: PublicInventoryCount }
  | { type: "confirm"; inventory: PublicInventoryCount }
  | { type: "cancel"; inventory: PublicInventoryCount }
  | null;

const statusLabel: Record<DocumentStatus, string> = {
  draft: "Rascunho",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
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

function formatDate(value: Date | string | null) {
  if (!value) {
    return displayValue(null);
  }
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return displayValue(null);
  }
  return dateFormatter.format(date);
}

function countVariances(inventory: PublicInventoryCount) {
  return inventory.items.filter(
    (item) => item.countedQty > 0 && item.variance !== 0,
  ).length;
}

export function InventoryTable({
  data = [],
  total,
  page,
  pageSize,
  canWrite = true,
}: InventoryTableProps) {
  const [dialog, setDialog] = useState<RowDialog>(null);

  return (
    <ListPanel
      title="Lista de inventários"
      totalCount={total}
      page={page}
      pageSize={pageSize}
      searchPlaceholder="Buscar por código..."
      searchParam="code"
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
                Divergências
              </th>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Status
              </th>
              <th className="px-4 py-2 text-center font-mono text-xs font-semibold tracking-wide uppercase">
                Responsável
              </th>
              {canWrite ? (
                <th className="px-4 py-2 text-center text-xs font-semibold tracking-wide uppercase">
                  <span className="sr-only">Ações</span>
                </th>
              ) : null}
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
                {canWrite ? (
                  <td className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      aria-label="Ações do inventário"
                      disabled
                    >
                      <MoreHorizontalIcon />
                    </Button>
                  </td>
                ) : null}
              </tr>
            ) : (
              data.map((inventory) => (
                <tr key={inventory.id} className="border-t-2 border-border">
                  <td className="px-4 py-3 text-center font-mono font-semibold">
                    {displayValue(inventory.code)}
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-xs">
                    {formatDate(inventory.countedAt ?? inventory.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {displayValue(inventory.warehouseName)}
                  </td>
                  <td className="px-4 py-3 text-center font-mono">
                    {inventory.items.length}
                  </td>
                  <td className="px-4 py-3 text-center font-mono">
                    {countVariances(inventory)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={inventory.status} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {displayValue(inventory.createdByName)}
                  </td>
                  {canWrite ? (
                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          data-testid={`inventory-actions-${inventory.id}`}
                          aria-label={`Ações de ${inventory.code}`}
                          className="inline-flex size-7 items-center justify-center rounded-md hover:bg-muted"
                        >
                          <MoreHorizontalIcon className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-44">
                          <DropdownMenuItem
                            disabled={inventory.status !== "draft"}
                            onClick={() => setDialog({ type: "edit", inventory })}
                            data-testid={`inventory-edit-${inventory.id}`}
                          >
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            disabled={inventory.status !== "draft"}
                            onClick={() =>
                              setDialog({ type: "confirm", inventory })
                            }
                            data-testid={`inventory-confirm-${inventory.id}`}
                          >
                            Confirmar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            disabled={inventory.status === "cancelled"}
                            onClick={() =>
                              setDialog({ type: "cancel", inventory })
                            }
                            data-testid={`inventory-cancel-${inventory.id}`}
                          >
                            Cancelar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {dialog?.type === "edit" ? (
        <EditInventoryDialog
          key={dialog.inventory.id}
          inventory={dialog.inventory}
          onClose={() => setDialog(null)}
        />
      ) : null}
      {dialog?.type === "confirm" ? (
        <ConfirmInventoryDialog
          key={dialog.inventory.id}
          inventory={dialog.inventory}
          onClose={() => setDialog(null)}
        />
      ) : null}
      {dialog?.type === "cancel" ? (
        <CancelInventoryDialog
          key={dialog.inventory.id}
          inventory={dialog.inventory}
          onClose={() => setDialog(null)}
        />
      ) : null}
    </ListPanel>
  );
}
