import {
  BadgeCheckIcon,
  BadgeXIcon,
  CircleDollarSignIcon,
  TruckIcon,
} from "lucide-react";

import { MetricCard, MetricCards } from "@/components/metric-cards";

export type ReceiptsMetricsData = {
  total: number | null;
  confirmed: number | null;
  cancelled: number | null;
  totalCost: number | null;
};

type ReceiptsMetricsProps = {
  data?: ReceiptsMetricsData | null;
};

function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function ReceiptsMetrics({ data = null }: ReceiptsMetricsProps) {
  return (
    <MetricCards>
      <MetricCard
        label="Total de recebimentos"
        value={data?.total}
        icon={TruckIcon}
      />
      <MetricCard
        label="Confirmados"
        value={data?.confirmed}
        icon={BadgeCheckIcon}
      />
      <MetricCard
        label="Cancelados"
        value={data?.cancelled}
        icon={BadgeXIcon}
      />
      <MetricCard
        label="Valor recebido"
        value={formatCurrency(data?.totalCost)}
        icon={CircleDollarSignIcon}
      />
    </MetricCards>
  );
}
