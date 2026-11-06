import { getCurrentUser } from "@/app/_lib/server-api";

import { DashboardWelcome } from "./_components/dashboard-welcome";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return <DashboardWelcome email={user?.email} />;
}
