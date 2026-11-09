import { dashboardRecentMovementsSchema } from "@radarstock/contracts";

import { fetchFromApi } from "@/app/_lib/server-api";

import { RecentMovements } from "../_components/recent-movements";

export default async function RecentSlot() {
  const recent = await fetchFromApi(
    "/dashboard/recent-movements",
    dashboardRecentMovementsSchema,
  );

  return <RecentMovements data={recent.items} />;
}
