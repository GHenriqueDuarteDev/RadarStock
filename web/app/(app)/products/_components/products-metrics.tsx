import {
  Grid2X2Icon,
  PackageIcon,
  PackageCheckIcon,
  PackageMinusIcon,
} from "lucide-react";

import { MetricCard, MetricCards } from "@/components/metric-cards";

export type ProductsMetricsData = {
  total: number | null;
  active: number | null;
  inactive: number | null;
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
      />
      <MetricCard
        label="Ativos"
        value={data?.active}
        icon={PackageCheckIcon}
      />
      <MetricCard
        label="Inativos"
        value={data?.inactive}
        icon={PackageMinusIcon}
      />
      <MetricCard
        label="Categorias"
        value={data?.categories}
        icon={Grid2X2Icon}
      />
    </MetricCards>
  );
}
