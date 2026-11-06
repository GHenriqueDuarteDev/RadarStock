import {
  ShieldIcon,
  UserCheckIcon,
  UserXIcon,
  UsersIcon,
} from "lucide-react";

import { MetricCard, MetricCards } from "@/components/metric-cards";

export type TeamMetricsData = {
  total: number | null;
  active: number | null;
  inactive: number | null;
  admins: number | null;
};

type TeamMetricsProps = {
  data?: TeamMetricsData | null;
};

export function TeamMetrics({ data = null }: TeamMetricsProps) {
  return (
    <MetricCards>
      <MetricCard
        label="Total de membros"
        value={data?.total}
        icon={UsersIcon}
      />
      <MetricCard
        label="Ativos"
        value={data?.active}
        icon={UserCheckIcon}
      />
      <MetricCard
        label="Inativos"
        value={data?.inactive}
        icon={UserXIcon}
      />
      <MetricCard
        label="Admins"
        value={data?.admins}
        icon={ShieldIcon}
      />
    </MetricCards>
  );
}
