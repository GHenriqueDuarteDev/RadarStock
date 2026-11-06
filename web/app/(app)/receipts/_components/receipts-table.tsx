"use client";

import { useState } from "react";
import { MoreHorizontalIcon } from "lucide-react";
import type { DocumentStatus, PublicReceipt } from "@radarstock/contracts";

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

import { CancelReceiptDialog } from "./cancel-receipt-dialog";

type ReceiptsTableProps = {
  data?: PublicReceipt[];
  total: number;
  page: number;
  pageSize: number;
};

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

function formatReceivedAt(value: Date | string) {
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

export function ReceiptsTable({
  data = [],
  total,
  page,
  pageSize,
}: ReceiptsTableProps) {
  const [cancelReceipt, setCancelReceipt] = useState<PublicReceipt | null>(
    null,
  );

  return (
    <ListPanel
      title="Lista de recebimentos"
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
                Fornecedor
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
                    aria-label="Ações do recebimento"
                    disabled
                  >
                    <MoreHorizontalIcon />
                  </Button>
                </td>
              </tr>
            ) : (
              data.map((receipt) => (
                <tr key={receipt.id} className="border-t-2 border-border">
                  <td className="px-4 py-3 text-center font-mono font-semibold">
                    {displayValue(receipt.code)}
                  </td>
                  <td className="px-4 py-3 text-center font-mono text-xs">
                    {formatReceivedAt(receipt.receivedAt)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {displayValue(receipt.supplierName)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {displayValue(receipt.warehouseName)}
                  </td>
                  <td className="px-4 py-3 text-center font-mono">
                    {receipt.items.length}
                  </td>
                  <td className="px-4 py-3 text-center font-mono">
                    {formatCurrency(receipt.totalCost)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={receipt.status} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {displayValue(receipt.createdByName)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        data-testid={`receipt-actions-${receipt.id}`}
                        aria-label={`Ações de ${receipt.code}`}
                        className="inline-flex size-7 items-center justify-center rounded-md hover:bg-muted"
                      >
                        <MoreHorizontalIcon className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="min-w-44">
                        <DropdownMenuItem
                          variant="destructive"
                          disabled={receipt.status !== "confirmed"}
                          onClick={() => setCancelReceipt(receipt)}
                          data-testid={`receipt-cancel-${receipt.id}`}
                        >
                          Cancelar recebimento
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
      {cancelReceipt ? (
        <CancelReceiptDialog
          key={cancelReceipt.id}
          receipt={cancelReceipt}
          onClose={() => setCancelReceipt(null)}
        />
      ) : null}
    </ListPanel>
  );
}
