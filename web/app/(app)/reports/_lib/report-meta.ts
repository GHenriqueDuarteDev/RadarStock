import type { ReportId } from "@radarstock/contracts";

import {
  firstValue,
  type RawSearchParams,
} from "@/app/_lib/search-params";

export const reportTitles: Record<ReportId, string> = {
  "stock-position": "Posição de estoque",
  "low-stock": "Estoque baixo",
  "warehouse-occupancy": "Ocupação de galpões",
  movements: "Movimentações",
  sales: "Vendas",
  receipts: "Recebimentos",
};

export const reportDescriptions: Record<ReportId, string> = {
  "stock-position": "Saldo atual por produto e galpão, com valor a custo.",
  "low-stock": "Produtos com quantidade total abaixo do estoque mínimo.",
  "warehouse-occupancy": "Quantidade ocupada versus capacidade cadastrada.",
  movements: "Entradas, saídas, transferências e ajustes no período.",
  sales: "Vendas registradas no período, com totais e status.",
  receipts: "Recebimentos no período, com custo e fornecedor.",
};

export const supportsPeriod: Record<ReportId, boolean> = {
  "stock-position": false,
  "low-stock": false,
  "warehouse-occupancy": false,
  movements: true,
  sales: true,
  receipts: true,
};

export type ReportFilters = {
  from: string;
  to: string;
  type: string;
  status: string;
  includeZero: boolean;
  onlyPositive: boolean;
};

export function defaultPeriodIso() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

function parseBoolean(value: string | undefined, fallback: boolean) {
  if (value === undefined) {
    return fallback;
  }
  return value === "true" || value === "1";
}

export function resolveReportFilters(
  reportId: ReportId,
  raw: RawSearchParams,
): ReportFilters {
  const period = defaultPeriodIso();
  return {
    from: firstValue(raw.from) ?? (supportsPeriod[reportId] ? period.from : ""),
    to: firstValue(raw.to) ?? (supportsPeriod[reportId] ? period.to : ""),
    type: firstValue(raw.type) ?? "",
    status: firstValue(raw.status) ?? "",
    includeZero: parseBoolean(firstValue(raw.includeZero), true),
    onlyPositive: parseBoolean(firstValue(raw.onlyPositive), true),
  };
}

export function buildReportQueryString(
  reportId: ReportId,
  filters: ReportFilters,
) {
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

  if (
    (reportId === "sales" ||
      reportId === "receipts" ||
      reportId === "warehouse-occupancy") &&
    filters.status
  ) {
    query.set("status", filters.status);
  }

  if (reportId === "low-stock") {
    query.set("includeZero", String(filters.includeZero));
  }

  if (reportId === "stock-position") {
    query.set("onlyPositive", String(filters.onlyPositive));
  }

  return query.toString();
}
