import {
  BoxesIcon,
  WarehouseIcon,
  PackageCheckIcon,
  PackageMinusIcon,
} from "lucide-react";

import { MetricCard, MetricCards } from "@/components/metric-cards";

export type WarehousesMetricsData = {
  total: number | null;
  active: number | null;
  inactive: number | null;
  totalCapacity: number | null;
};

type WarehousesMetricsProps = {
  data?: WarehousesMetricsData | null;
};

export function WarehousesMetrics({ data = null }: WarehousesMetricsProps) {
  return (
    <MetricCards>
      <MetricCard
        label="Total de galpões"
        value={data?.total}
        icon={WarehouseIcon}
        hint="-- período"
      />
      <MetricCard
        label="Ativos"
        value={data?.active}
        icon={PackageCheckIcon}
        hint="-- período"
      />
      <MetricCard
        label="Inativos"
        value={data?.inactive}
        icon={PackageMinusIcon}
        hint="-- período"
      />
      <MetricCard
        label="Capacidade total"
        value={data?.totalCapacity}
        icon={BoxesIcon}
        hint="-- período"
      />
    </MetricCards>
  );
}
