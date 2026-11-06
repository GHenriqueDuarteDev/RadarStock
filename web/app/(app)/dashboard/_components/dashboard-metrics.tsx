import {
  AlertTriangleIcon,
  BarChart3Icon,
  PackageIcon,
  WarehouseIcon,
} from "lucide-react";
import type { DashboardMetrics } from "@radarstock/contracts";

import { MetricCard, MetricCards } from "@/components/metric-cards";

type DashboardMetricsProps = {
  data?: DashboardMetrics | null;
};

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return value;
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}

export function DashboardMetrics({ data = null }: DashboardMetricsProps) {
  return (
    <MetricCards>
      <MetricCard
        label="Produtos ativos"
        value={data?.activeProducts}
        icon={PackageIcon}
      />
      <MetricCard
        label="Valor em estoque"
        value={formatCurrency(data?.stockValue)}
        icon={BarChart3Icon}
      />
      <MetricCard
        label="Estoque baixo"
        value={data?.lowStock}
        icon={AlertTriangleIcon}
      />
      <MetricCard
        label="Galpões inativos"
        value={data?.inactiveWarehouses}
        icon={WarehouseIcon}
      />
    </MetricCards>
  );
}
