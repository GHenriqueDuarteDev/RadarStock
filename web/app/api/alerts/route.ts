import { requireApiSession, proxyToApi } from "@/app/_lib/api";
import { alertsListSchema } from "@radarstock/contracts";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) {
    return session;
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();
  const path = query ? `/alerts?${query}` : "/alerts";

  const apiResponse = await proxyToApi(path, session.userId);
  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    return NextResponse.json(data, { status: apiResponse.status });
  }

  const alerts = alertsListSchema.parse(data);
  return NextResponse.json(alerts);
}
