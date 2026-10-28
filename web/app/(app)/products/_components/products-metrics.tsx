import {
  AlertTriangleIcon,
  Grid2X2Icon,
  PackageIcon,
  PackageXIcon,
} from "lucide-react";

import { MetricCard, MetricCards } from "@/components/metric-cards";

type ProductsMetricsData = {
  total: number | null;
  lowStock: number | null;
  outOfStock: number | null;
  categories: number | null;
};

type ProductsMetricsProps = {
  data?: ProductsMetricsData | null;
};

export function ProductsMetrics({ data = null }: ProductsMetricsProps) {
  return (
    <MetricCards>
      <MetricCard
        label="Total de produtos"
        value={data?.total}
        icon={PackageIcon}
        hint="-- período"
      />
      <MetricCard
        label="Estoque baixo"
        value={data?.lowStock}
        icon={AlertTriangleIcon}
        hint="-- período"
      />
      <MetricCard
        label="Sem estoque"
        value={data?.outOfStock}
        icon={PackageXIcon}
        hint="-- período"
      />
      <MetricCard
        label="Categorias"
        value={data?.categories}
        icon={Grid2X2Icon}
        hint="-- período"
      />
    </MetricCards>
  );
}
