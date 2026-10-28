import {
  AlertTriangleIcon,
  BarChart3Icon,
  PackageIcon,
  ShoppingCartIcon,
} from "lucide-react";

import { MetricCard, MetricCards } from "@/components/metric-cards";

type DashboardMetricsData = {
  activeProducts: number | null;
  stockValue: number | null;
  lowStock: number | null;
  periodSales: number | null;
};

type DashboardMetricsProps = {
  data?: DashboardMetricsData | null;
};

export function DashboardMetrics({ data = null }: DashboardMetricsProps) {
  return (
    <MetricCards>
      <MetricCard
        label="Produtos ativos"
        value={data?.activeProducts}
        icon={PackageIcon}
        hint="-- período"
      />
      <MetricCard
        label="Valor em estoque"
        value={data?.stockValue}
        icon={BarChart3Icon}
        hint="-- período"
      />
      <MetricCard
        label="Estoque baixo"
        value={data?.lowStock}
        icon={AlertTriangleIcon}
        hint="-- período"
      />
      <MetricCard
        label="Vendas no período"
        value={data?.periodSales}
        icon={ShoppingCartIcon}
        hint="-- período"
      />
    </MetricCards>
  );
}
