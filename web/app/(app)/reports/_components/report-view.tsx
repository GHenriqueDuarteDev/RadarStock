"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  reportIdSchema,
  reportPreviewSchema,
  type ReportExportFormat,
  type ReportId,
  type ReportPreview,
} from "@radarstock/contracts";
import { ArrowLeftIcon, DownloadIcon } from "lucide-react";

import { PageHeader } from "@/components/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "cn";
import { displayValue } from "@/lib/utils";

type ReportViewProps = {
  reportId: string;
};

type FiltersState = {
  from: string;
  to: string;
  type: string;
  status: string;
  warehouseStatus: string;
  includeZero: boolean;
  onlyPositive: boolean;
};

const reportTitles: Record<ReportId, string> = {
  "stock-position": "Posição de estoque",
  "low-stock": "Estoque baixo",
  "warehouse-occupancy": "Ocupação de galpões",
  movements: "Movimentações",
  sales: "Vendas",
  receipts: "Recebimentos",
};

const reportDescriptions: Record<ReportId, string> = {
  "stock-position": "Saldo atual por produto e galpão, com valor a custo.",
  "low-stock": "Produtos com quantidade total abaixo do estoque mínimo.",
  "warehouse-occupancy": "Quantidade ocupada versus capacidade cadastrada.",
  movements: "Entradas, saídas, transferências e ajustes no período.",
  sales: "Vendas registradas no período, com totais e status.",
  receipts: "Recebimentos no período, com custo e fornecedor.",
};

const supportsPeriod: Record<ReportId, boolean> = {
  "stock-position": false,
  "low-stock": false,
  "warehouse-occupancy": false,
  movements: true,
  sales: true,
  receipts: true,
};

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

function defaultPeriod() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);
  const toIso = to.toISOString().slice(0, 10);
  const fromIso = from.toISOString().slice(0, 10);
  return { from: fromIso, to: toIso };
}

function initialFilters(): FiltersState {
  const period = defaultPeriod();
  return {
    from: period.from,
    to: period.to,
    type: "",
    status: "",
    warehouseStatus: "",
    includeZero: true,
    onlyPositive: true,
  };
}

async function readErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message ?? "Não foi possível carregar o relatório.";
  } catch {
    return "Não foi possível carregar o relatório.";
  }
}

function buildQuery(reportId: ReportId, filters: FiltersState) {
  const query = new URLSearchParams();

  if (supportsPeriod[reportId]) {
    if (filters.from) {
      query.set("from", filters.from);
    }
    if (filters.to) {
      query.set("to", filters.to);
    }
  }

  if (reportId === "movements" && filters.type) {
    query.set("type", filters.type);
  }

  if ((reportId === "sales" || reportId === "receipts") && filters.status) {
    query.set("status", filters.status);
  }

  if (reportId === "warehouse-occupancy" && filters.warehouseStatus) {
    query.set("status", filters.warehouseStatus);
  }

  if (reportId === "low-stock") {
    query.set("includeZero", String(filters.includeZero));
  }

  if (reportId === "stock-position") {
    query.set("onlyPositive", String(filters.onlyPositive));
  }

  return query;
}

function formatDateValue(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return displayValue(null);
  }
  return dateTimeFormatter.format(date);
}

function selectClassName() {
  return cn(
    "h-11 w-full min-w-0 rounded-none border-2 border-foreground bg-card px-3 py-2 font-mono text-sm shadow-[inset_1px_1px_0_0_rgba(0,0,0,0.25),inset_-1px_-1px_0_0_rgba(255,255,255,0.55)] outline-none focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary",
  );
}

function SummaryCards({ preview }: { preview: ReportPreview }) {
  const cards: Array<{ label: string; value: string }> = [];

  switch (preview.reportId) {
    case "stock-position":
      cards.push(
        { label: "Linhas", value: String(preview.summary.lineCount) },
        {
          label: "Quantidade",
          value: String(preview.summary.totalQuantity),
        },
        {
          label: "Valor",
          value: currencyFormatter.format(preview.summary.totalValue),
        },
      );
      break;
    case "low-stock":
      cards.push(
        { label: "Produtos", value: String(preview.summary.productCount) },
        {
          label: "Zerados",
          value: String(preview.summary.zeroStockCount),
        },
        {
          label: "Déficit total",
          value: String(preview.summary.totalDeficit),
        },
      );
      break;
    case "warehouse-occupancy":
      cards.push(
        {
          label: "Galpões",
          value: String(preview.summary.warehouseCount),
        },
        {
          label: "Ocupado",
          value: String(preview.summary.totalOccupied),
        },
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
        {
          label: "Movimentos",
          value: String(preview.summary.movementCount),
        },
        {
          label: "Quantidade",
          value: String(preview.summary.totalQuantity),
        },
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
                <tr key={`${row.productId}-${row.warehouseId}`} className="border-b border-foreground/20">
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
                <tr key={row.warehouseId} className="border-b border-foreground/20">
                  <td className="px-3 py-2">{row.warehouseName}</td>
                  <td className="px-3 py-2 font-mono text-xs">{row.warehouseCode}</td>
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
                  <td className="px-3 py-2">{formatDateValue(row.receivedAt)}</td>
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

export function ReportView({ reportId }: ReportViewProps) {
  const parsedId = reportIdSchema.safeParse(reportId);
  const validId = parsedId.success ? parsedId.data : null;

  const [filters, setFilters] = useState<FiltersState>(initialFilters);
  const [preview, setPreview] = useState<ReportPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState<ReportExportFormat | null>(null);
  const [error, setError] = useState<string | null>(null);

  const queryString = useMemo(() => {
    if (!validId) {
      return "";
    }
    return buildQuery(validId, filters).toString();
  }, [validId, filters]);

  const loadPreview = useCallback(async () => {
    if (!validId) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/reports/${validId}?${queryString}`,
      );
      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }
      const data = reportPreviewSchema.parse(await response.json());
      setPreview(data);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Não foi possível carregar o relatório.",
      );
      setPreview(null);
    } finally {
      setLoading(false);
    }
  }, [validId, queryString]);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  async function handleExport(format: ReportExportFormat) {
    if (!validId) {
      return;
    }
    setExporting(format);
    setError(null);
    try {
      const params = new URLSearchParams(queryString);
      params.set("format", format);
      const response = await fetch(
        `/api/reports/${validId}/export?${params.toString()}`,
      );
      if (!response.ok) {
        throw new Error(await readErrorMessage(response));
      }
      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition");
      const match = disposition?.match(/filename="?([^"]+)"?/);
      const filename = match?.[1] ?? `radarstock-${validId}.${format}`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (exportError) {
      setError(
        exportError instanceof Error
          ? exportError.message
          : "Não foi possível exportar o relatório.",
      );
    } finally {
      setExporting(null);
    }
  }

  if (!validId) {
    return (
      <div className="space-y-4">
        <PageHeader
          category="Análise"
          title="Relatório"
          description="Relatório não encontrado."
        />
        <Link href="/reports" className={cn(buttonVariants({ variant: "outline" }))}>
          <ArrowLeftIcon data-icon="inline-start" />
          Voltar ao catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <PageHeader
        category="Análise"
        title={reportTitles[validId]}
        description={reportDescriptions[validId]}
        action={
          <Link href="/reports" className={cn(buttonVariants({ variant: "outline" }))}>
            <ArrowLeftIcon data-icon="inline-start" />
            Catálogo
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {supportsPeriod[validId] ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="from">De</Label>
                  <Input
                    id="from"
                    type="date"
                    value={filters.from}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        from: event.target.value,
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="to">Até</Label>
                  <Input
                    id="to"
                    type="date"
                    value={filters.to}
                    onChange={(event) =>
                      setFilters((current) => ({
                        ...current,
                        to: event.target.value,
                      }))
                    }
                  />
                </div>
              </>
            ) : null}

            {validId === "movements" ? (
              <div className="space-y-1.5">
                <Label htmlFor="type">Tipo</Label>
                <select
                  id="type"
                  className={selectClassName()}
                  value={filters.type}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      type: event.target.value,
                    }))
                  }
                >
                  <option value="">Todos</option>
                  <option value="in">Entrada</option>
                  <option value="out">Saída</option>
                  <option value="transfer">Transferência</option>
                  <option value="adjustment">Ajuste</option>
                </select>
              </div>
            ) : null}

            {validId === "sales" || validId === "receipts" ? (
              <div className="space-y-1.5">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  className={selectClassName()}
                  value={filters.status}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      status: event.target.value,
                    }))
                  }
                >
                  <option value="">Todos</option>
                  <option value="draft">Rascunho</option>
                  <option value="confirmed">Confirmado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            ) : null}

            {validId === "warehouse-occupancy" ? (
              <div className="space-y-1.5">
                <Label htmlFor="warehouseStatus">Status do galpão</Label>
                <select
                  id="warehouseStatus"
                  className={selectClassName()}
                  value={filters.warehouseStatus}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      warehouseStatus: event.target.value,
                    }))
                  }
                >
                  <option value="">Todos</option>
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
            ) : null}

            {validId === "low-stock" ? (
              <label className="flex items-center gap-2 self-end pb-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.includeZero}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      includeZero: event.target.checked,
                    }))
                  }
                />
                Incluir estoque zerado
              </label>
            ) : null}

            {validId === "stock-position" ? (
              <label className="flex items-center gap-2 self-end pb-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.onlyPositive}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      onlyPositive: event.target.checked,
                    }))
                  }
                />
                Somente quantidade &gt; 0
              </label>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => void loadPreview()} disabled={loading}>
              Atualizar preview
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={exporting !== null}
              onClick={() => void handleExport("csv")}
            >
              <DownloadIcon data-icon="inline-start" />
              CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={exporting !== null}
              onClick={() => void handleExport("xlsx")}
            >
              <DownloadIcon data-icon="inline-start" />
              XLSX
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={exporting !== null}
              onClick={() => void handleExport("pdf")}
            >
              <DownloadIcon data-icon="inline-start" />
              PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando preview...</p>
      ) : null}

      {preview ? (
        <div className="space-y-3">
          <SummaryCards preview={preview} />
          <div className="flex items-center justify-between gap-2">
            <p className="font-mono text-xs text-muted-foreground uppercase">
              Preview {preview.rows.length} de {preview.totalRows} linhas
              {preview.truncated ? " (truncado)" : ""}
            </p>
          </div>
          <PreviewTable preview={preview} />
        </div>
      ) : null}
    </div>
  );
}
