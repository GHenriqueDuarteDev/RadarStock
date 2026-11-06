import {
  dashboardMovementsQuerySchema,
  dashboardMovementsSeriesSchema,
  type DashboardDays,
} from "@radarstock/contracts";

import { fetchFromApi } from "@/app/_lib/server-api";

import { StockMovementChart } from "../_components/stock-movement-chart";

type MovementsSlotProps = {
  searchParams: Promise<{ days?: string | string[] }>;
};

function resolveDays(raw: string | string[] | undefined): DashboardDays {
  const parsed = dashboardMovementsQuerySchema.safeParse({ days: raw ?? 7 });
  return parsed.success ? parsed.data.days : 7;
}

export default async function MovementsSlot({
  searchParams,
}: MovementsSlotProps) {
  const days = resolveDays((await searchParams).days);
  const series = await fetchFromApi(
    `/dashboard/movements-series?days=${days}`,
    dashboardMovementsSeriesSchema,
  );

  return <StockMovementChart data={series.points} days={days} />;
}
