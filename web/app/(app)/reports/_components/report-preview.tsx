import type { ReportPreview } from "@radarstock/contracts";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { displayValue } from "@/lib/utils";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDateValue(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return displayValue(null);
  }
  return dateTimeFormatter.format(date);
}

function SummaryCards({ preview }: { preview: ReportPreview }) {
  const cards: Array<{ label: string; value: string }> = [];

  switch (preview.reportId) {
    case "stock-position":
      cards.push(
        { label: "Linhas", value: String(preview.summary.lineCount) },
        { label: "Quantidade", value: String(preview.summary.totalQuantity) },
        {
          label: "Valor",
          value: currencyFormatter.format(preview.summary.totalValue),
        },
      );
      break;
    case "low-stock":
      cards.push(
        { label: "Produtos", value: String(preview.summary.productCount) },
        { label: "Zerados", value: String(preview.summary.zeroStockCount) },
        { label: "Déficit total", value: String(preview.summary.totalDeficit) },
      );
      break;
    case "warehouse-occupancy":
      cards.push(
        { label: "Galpões", value: String(preview.summary.warehouseCount) },
        { label: "Ocupado", value: String(preview.summary.totalOccupied) },
        {
          label: "Capacidade",
          value:
            preview.summary.totalCapacity === null
              ? displayValue(null)
              : String(preview.summary.totalCapacity),
        },
      );
      break;
    case "movements":
      cards.push(
        { label: "Movimentos", value: String(preview.summary.movementCount) },
        { label: "Quantidade", value: String(preview.summary.totalQuantity) },
        {
          label: "Período",
          value: `${formatDateValue(preview.summary.from)} — ${formatDateValue(preview.summary.to)}`,
        },
      );
      break;
    case "sales":
      cards.push(
        { label: "Vendas", value: String(preview.summary.saleCount) },
        {
          label: "Total",
          value: currencyFormatter.format(preview.summary.totalAmount),
        },
        {
          label: "Período",
          value: `${formatDateValue(preview.summary.from)} — ${formatDateValue(preview.summary.to)}`,
        },
      );
      break;
    case "receipts":
      cards.push(
        {
          label: "Recebimentos",
          value: String(preview.summary.receiptCount),
        },
        {
          label: "Custo",
          value: currencyFormatter.format(preview.summary.totalCost),
        },
        {
          label: "Período",
          value: `${formatDateValue(preview.summary.from)} — ${formatDateValue(preview.summary.to)}`,
        },
      );
      break;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.label} size="sm">
          <CardHeader>
            <CardTitle>{card.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-lg font-semibold">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PreviewTable({ preview }: { preview: ReportPreview }) {
  if (preview.rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Nenhum registro para os filtros atuais.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border-2 border-foreground bg-card">
      <table className="w-full text-left text-sm">
        <thead className="border-b-2 border-foreground bg-muted font-mono text-xs uppercase">
          {preview.reportId === "stock-position" ? (
            <tr>
              <th className="px-3 py-2">Produto</th>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Galpão</th>
              <th className="px-3 py-2">Qtd</th>
              <th className="px-3 py-2">Valor</th>
            </tr>
          ) : null}
          {preview.reportId === "low-stock" ? (
            <tr>
              <th className="px-3 py-2">Produto</th>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2">Mínimo</th>
              <th className="px-3 py-2">Atual</th>
              <th className="px-3 py-2">Déficit</th>
            </tr>
          ) : null}
          {preview.reportId === "warehouse-occupancy" ? (
            <tr>
              <th className="px-3 py-2">Galpão</th>
              <th className="px-3 py-2">Código</th>
              <th className="px-3 py-2">Capacidade</th>
              <th className="px-3 py-2">Ocupado</th>
              <th className="px-3 py-2">%</th>
            </tr>
          ) : null}
          {preview.reportId === "movements" ? (
            <tr>
              <th className="px-3 py-2">Data</th>
              <th className="px-3 py-2">Tipo</th>
              <th className="px-3 py-2">Produto</th>
              <th className="px-3 py-2">Qtd</th>
              <th className="px-3 py-2">Usuário</th>
            </tr>
          ) : null}
          {preview.reportId === "sales" ? (
            <tr>
              <th className="px-3 py-2">Código</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Galpão</th>
              <th className="px-3 py-2">Data</th>
              <th className="px-3 py-2">Total</th>
            </tr>
          ) : null}
          {preview.reportId === "receipts" ? (
            <tr>
              <th className="px-3 py-2">Código</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Galpão</th>
              <th className="px-3 py-2">Data</th>
              <th className="px-3 py-2">Custo</th>
            </tr>
          ) : null}
        </thead>
        <tbody>
          {preview.reportId === "stock-position"
            ? preview.rows.map((row) => (
                <tr
                  key={`${row.productId}-${row.warehouseId}`}
                  className="border-b border-foreground/20"
                >
                  <td className="px-3 py-2">{row.productName}</td>
                  <td className="px-3 py-2 font-mono text-xs">{row.productSku}</td>
                  <td className="px-3 py-2">{row.warehouseName}</td>
                  <td className="px-3 py-2">{row.quantity}</td>
                  <td className="px-3 py-2">
                    {currencyFormatter.format(row.stockValue)}
                  </td>
                </tr>
              ))
            : null}
          {preview.reportId === "low-stock"
            ? preview.rows.map((row) => (
                <tr key={row.productId} className="border-b border-foreground/20">
                  <td className="px-3 py-2">{row.productName}</td>
                  <td className="px-3 py-2 font-mono text-xs">{row.productSku}</td>
                  <td className="px-3 py-2">{row.minStock}</td>
                  <td className="px-3 py-2">{row.totalQuantity}</td>
                  <td className="px-3 py-2">{row.deficit}</td>
                </tr>
              ))
            : null}
          {preview.reportId === "warehouse-occupancy"
            ? preview.rows.map((row) => (
                <tr
                  key={row.warehouseId}
                  className="border-b border-foreground/20"
                >
                  <td className="px-3 py-2">{row.warehouseName}</td>
                  <td className="px-3 py-2 font-mono text-xs">
                    {row.warehouseCode}
                  </td>
                  <td className="px-3 py-2">{displayValue(row.capacity)}</td>
                  <td className="px-3 py-2">{row.occupiedQty}</td>
                  <td className="px-3 py-2">
                    {row.occupancyPercent === null
                      ? displayValue(null)
                      : `${row.occupancyPercent}%`}
                  </td>
                </tr>
              ))
            : null}
          {preview.reportId === "movements"
            ? preview.rows.map((row) => (
                <tr key={row.id} className="border-b border-foreground/20">
                  <td className="px-3 py-2">{formatDateValue(row.createdAt)}</td>
                  <td className="px-3 py-2">{row.type}</td>
                  <td className="px-3 py-2">{row.productName}</td>
                  <td className="px-3 py-2">{row.quantity}</td>
                  <td className="px-3 py-2">{row.userName}</td>
                </tr>
              ))
            : null}
          {preview.reportId === "sales"
            ? preview.rows.map((row) => (
                <tr key={row.id} className="border-b border-foreground/20">
                  <td className="px-3 py-2 font-mono text-xs">{row.code}</td>
                  <td className="px-3 py-2">{row.status}</td>
                  <td className="px-3 py-2">{row.warehouseName}</td>
                  <td className="px-3 py-2">{formatDateValue(row.soldAt)}</td>
                  <td className="px-3 py-2">
                    {currencyFormatter.format(row.totalAmount)}
                  </td>
                </tr>
              ))
            : null}
          {preview.reportId === "receipts"
            ? preview.rows.map((row) => (
                <tr key={row.id} className="border-b border-foreground/20">
                  <td className="px-3 py-2 font-mono text-xs">{row.code}</td>
                  <td className="px-3 py-2">{row.status}</td>
                  <td className="px-3 py-2">{row.warehouseName}</td>
                  <td className="px-3 py-2">
                    {formatDateValue(row.receivedAt)}
                  </td>
                  <td className="px-3 py-2">
                    {currencyFormatter.format(row.totalCost)}
                  </td>
                </tr>
              ))
            : null}
        </tbody>
      </table>
    </div>
  );
}

export function ReportPreview({ preview }: { preview: ReportPreview }) {
  return (
    <div className="space-y-3">
      <SummaryCards preview={preview} />
      <p className="font-mono text-xs text-muted-foreground uppercase">
        Preview {preview.rows.length} de {preview.totalRows} linhas
        {preview.truncated ? " (truncado)" : ""}
      </p>
      <PreviewTable preview={preview} />
    </div>
  );
}
