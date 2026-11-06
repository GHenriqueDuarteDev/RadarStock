import { getSession } from "@/app/_lib/session";

import { DashboardView } from "./_components/dashboard-view";
import { DashboardWelcome } from "./_components/dashboard-welcome";

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
      <DashboardView />
    </div>
  );
}
