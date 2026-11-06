import { dashboardWarehouseDistributionSchema } from "@radarstock/contracts";

import { fetchFromApi } from "@/app/_lib/server-api";

import { WarehouseOccupancyChart } from "../_components/warehouse-occupancy-chart";

export default async function DistributionSlot() {
  const distribution = await fetchFromApi(
    "/dashboard/warehouse-distribution",
    dashboardWarehouseDistributionSchema,
  );

  return (
    <WarehouseOccupancyChart
      slices={distribution.slices}
      warehouseCount={distribution.warehouseCount}
    />
  );
}
