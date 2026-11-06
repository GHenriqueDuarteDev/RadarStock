"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { ReportId } from "@radarstock/contracts";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "cn";

import {
  buildReportQueryString,
  supportsPeriod,
  type ReportFilters,
} from "../_lib/report-meta";
import { ReportExportButtons } from "./report-export-buttons";

type ReportFiltersFormProps = {
  reportId: ReportId;
  filters: ReportFilters;
};

function selectClassName() {
  return cn(
    "h-11 w-full min-w-0 rounded-none border-2 border-foreground bg-card px-3 py-2 font-mono text-sm shadow-[inset_1px_1px_0_0_rgba(0,0,0,0.25),inset_-1px_-1px_0_0_rgba(255,255,255,0.55)] outline-none focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary",
  );
}

export function ReportFiltersForm({
  reportId,
  filters,
}: ReportFiltersFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const query = buildReportQueryString(reportId, filters);

  function replaceFilters(next: ReportFilters) {
    const search = buildReportQueryString(reportId, next);
    startTransition(() => {
      router.replace(
        search.length > 0
          ? `/reports/${reportId}?${search}`
          : `/reports/${reportId}`,
      );
    });
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {supportsPeriod[reportId] ? (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="from">De</Label>
              <Input
                id="from"
                type="date"
                value={filters.from}
                disabled={pending}
                onChange={(event) =>
                  replaceFilters({ ...filters, from: event.target.value })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="to">Até</Label>
              <Input
                id="to"
                type="date"
                value={filters.to}
                disabled={pending}
                onChange={(event) =>
                  replaceFilters({ ...filters, to: event.target.value })
                }
              />
            </div>
          </>
        ) : null}

        {reportId === "movements" ? (
          <div className="space-y-1.5">
            <Label htmlFor="type">Tipo</Label>
            <select
              id="type"
              className={selectClassName()}
              value={filters.type}
              disabled={pending}
              onChange={(event) =>
                replaceFilters({ ...filters, type: event.target.value })
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

        {reportId === "sales" || reportId === "receipts" ? (
          <div className="space-y-1.5">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              className={selectClassName()}
              value={filters.status}
              disabled={pending}
              onChange={(event) =>
                replaceFilters({ ...filters, status: event.target.value })
              }
            >
              <option value="">Todos</option>
              <option value="draft">Rascunho</option>
              <option value="confirmed">Confirmado</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        ) : null}

        {reportId === "warehouse-occupancy" ? (
          <div className="space-y-1.5">
            <Label htmlFor="warehouseStatus">Status do galpão</Label>
            <select
              id="warehouseStatus"
              className={selectClassName()}
              value={filters.status}
              disabled={pending}
              onChange={(event) =>
                replaceFilters({ ...filters, status: event.target.value })
              }
            >
              <option value="">Todos</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
        ) : null}

        {reportId === "low-stock" ? (
          <label className="flex items-center gap-2 self-end pb-2 text-sm">
            <input
              type="checkbox"
              checked={filters.includeZero}
              disabled={pending}
              onChange={(event) =>
                replaceFilters({
                  ...filters,
                  includeZero: event.target.checked,
                })
              }
            />
            Incluir estoque zerado
          </label>
        ) : null}

        {reportId === "stock-position" ? (
          <label className="flex items-center gap-2 self-end pb-2 text-sm">
            <input
              type="checkbox"
              checked={filters.onlyPositive}
              disabled={pending}
              onChange={(event) =>
                replaceFilters({
                  ...filters,
                  onlyPositive: event.target.checked,
                })
              }
            />
            Somente quantidade &gt; 0
          </label>
        ) : null}
      </div>

      <ReportExportButtons reportId={reportId} query={query} />
    </div>
  );
}
