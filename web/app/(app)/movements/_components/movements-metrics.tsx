import {
  ArrowDownToLineIcon,
  ArrowLeftRightIcon,
  ArrowUpFromLineIcon,
  BoxesIcon,
} from "lucide-react";

import { MetricCard, MetricCards } from "@/components/metric-cards";

export type MovementsMetricsData = {
  total: number | null;
  in: number | null;
  out: number | null;
  transfer: number | null;
};

type MovementsMetricsProps = {
  data?: MovementsMetricsData | null;
};

export function MovementsMetrics({ data = null }: MovementsMetricsProps) {
  return (
    <MetricCards>
      <MetricCard
        label="Total de movimentações"
        value={data?.total}
        icon={BoxesIcon}
      />
      <MetricCard
        label="Entradas"
        value={data?.in}
        icon={ArrowDownToLineIcon}
      />
      <MetricCard
        label="Saídas"
        value={data?.out}
        icon={ArrowUpFromLineIcon}
      />
      <MetricCard
        label="Transferências"
        value={data?.transfer}
        icon={ArrowLeftRightIcon}
      />
    </MetricCards>
  );
}
