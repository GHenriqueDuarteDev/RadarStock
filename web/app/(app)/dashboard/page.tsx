import { getSession } from "@/app/_lib/session";

import { DashboardMetrics } from "./_components/dashboard-metrics";
import { DashboardWelcome } from "./_components/dashboard-welcome";
import { OperationalAlerts } from "./_components/operational-alerts";
import { RecentMovements } from "./_components/recent-movements";
import { StockMovementChart } from "./_components/stock-movement-chart";
import { WarehouseOccupancyChart } from "./_components/warehouse-occupancy-chart";

async function getUserEmail(): Promise<string | null> {
  const session = await getSession();

  if (!session.userId) {
    return null;
  }

  try {
    const response = await fetch(`${process.env.API_URL}/auth/me`, {
      headers: {
        "x-internal-secret": process.env.INTERNAL_SECRET ?? "",
        "x-user-id": session.userId,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const user = (await response.json()) as { email?: string };
    return user.email ?? null;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const email = await getUserEmail();

  return (
    <div className="space-y-4">
      <DashboardWelcome email={email} />
      <DashboardMetrics />
      <div className="grid gap-3 lg:grid-cols-2">
        <StockMovementChart />
        <WarehouseOccupancyChart />
        <RecentMovements />
        <OperationalAlerts />
      </div>
    </div>
  );
}
