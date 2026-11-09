import { alertsListSchema } from "@radarstock/contracts";

import { fetchFromApi } from "@/app/_lib/server-api";

import { OperationalAlerts } from "../_components/operational-alerts";

export default async function AlertsSlot() {
  const alerts = await fetchFromApi(
    "/alerts?status=open&limit=20",
    alertsListSchema,
  );

  return <OperationalAlerts data={alerts.items} totalOpen={alerts.totalOpen} />;
}
