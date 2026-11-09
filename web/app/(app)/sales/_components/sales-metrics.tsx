import {
  BadgeCheckIcon,
  BadgeXIcon,
  CircleDollarSignIcon,
  ShoppingCartIcon,
} from "lucide-react";

import { MetricCard, MetricCards } from "@/components/metric-cards";

export type SalesMetricsData = {
  total: number | null;
  confirmed: number | null;
  cancelled: number | null;
  totalAmount: number | null;
};

type SalesMetricsProps = {
  data?: SalesMetricsData | null;
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

export function SalesMetrics({ data = null }: SalesMetricsProps) {
  return (
    <MetricCards>
      <MetricCard
        label="Total de vendas"
        value={data?.total}
        icon={ShoppingCartIcon}
      />
      <MetricCard
        label="Confirmadas"
        value={data?.confirmed}
        icon={BadgeCheckIcon}
      />
      <MetricCard
        label="Canceladas"
        value={data?.cancelled}
        icon={BadgeXIcon}
      />
      <MetricCard
        label="Valor confirmado"
        value={formatCurrency(data?.totalAmount)}
        icon={CircleDollarSignIcon}
      />
    </MetricCards>
  );
}
