import {
  BadgeCheckIcon,
  ClipboardListIcon,
  PercentIcon,
  TriangleAlertIcon,
} from "lucide-react";

import { MetricCard, MetricCards } from "@/components/metric-cards";

export type InventoryMetricsData = {
  inProgress: number | null;
  discrepancies: number | null;
  averageAccuracy: number | null;
  completed: number | null;
};

type InventoryMetricsProps = {
  data?: InventoryMetricsData | null;
};

function formatAccuracy(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: Number.isInteger(value) ? 0 : 1,
    maximumFractionDigits: 1,
  })}%`;
}

export function InventoryMetrics({ data = null }: InventoryMetricsProps) {
  return (
    <MetricCards>
      <MetricCard
        label="Contagem em andamento"
        value={data?.inProgress}
        icon={ClipboardListIcon}
      />
      <MetricCard
        label="Contagens concluídas"
        value={data?.completed}
        icon={BadgeCheckIcon}
      />
      <MetricCard
        label="Divergências"
        value={data?.discrepancies}
        icon={TriangleAlertIcon}
      />
      <MetricCard
        label="Acurácia média"
        value={formatAccuracy(data?.averageAccuracy)}
        icon={PercentIcon}
      />
    </MetricCards>
  );
}
