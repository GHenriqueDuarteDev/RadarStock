import { dashboardMetricsSchema } from "@radarstock/contracts";

import { fetchFromApi } from "@/app/_lib/server-api";

import { DashboardMetrics } from "../_components/dashboard-metrics";

export default async function MetricsSlot() {
  const metrics = await fetchFromApi(
    "/dashboard/metrics",
    dashboardMetricsSchema,
  );

  return <DashboardMetrics data={metrics} />;
}
