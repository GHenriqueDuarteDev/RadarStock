import { requireApiSession, proxyToApi } from "@/app/_lib/api";
import { dashboardWarehouseDistributionSchema } from "@radarstock/contracts";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await requireApiSession();
  if (session instanceof NextResponse) {
    return session;
  }

  const apiResponse = await proxyToApi(
    "/dashboard/warehouse-distribution",
    session.userId,
  );
  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    return NextResponse.json(data, { status: apiResponse.status });
  }

  const distribution = dashboardWarehouseDistributionSchema.parse(data);
  return NextResponse.json(distribution);
}
