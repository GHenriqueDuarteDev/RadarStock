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
        hint="-- período"
      />
      <MetricCard
        label="Entradas"
        value={data?.in}
        icon={ArrowDownToLineIcon}
        hint="-- período"
      />
      <MetricCard
        label="Saídas"
        value={data?.out}
        icon={ArrowUpFromLineIcon}
        hint="-- período"
      />
      <MetricCard
        label="Transferências"
        value={data?.transfer}
        icon={ArrowLeftRightIcon}
        hint="-- período"
      />
    </MetricCards>
  );
}
