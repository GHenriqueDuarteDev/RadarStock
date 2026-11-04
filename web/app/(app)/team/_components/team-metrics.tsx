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
        hint="-- período"
      />
      <MetricCard
        label="Ativos"
        value={data?.active}
        icon={UserCheckIcon}
        hint="-- período"
      />
      <MetricCard
        label="Inativos"
        value={data?.inactive}
        icon={UserXIcon}
        hint="-- período"
      />
      <MetricCard
        label="Admins"
        value={data?.admins}
        icon={ShieldIcon}
        hint="-- período"
      />
    </MetricCards>
  );
}
