import { requireApiSession, proxyToApi } from "@/app/_lib/api";
import {
  dashboardMovementsQuerySchema,
  dashboardMovementsSeriesSchema,
} from "@radarstock/contracts";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) {
    return session;
  }

  const url = new URL(request.url);
  const parsed = dashboardMovementsQuerySchema.safeParse({
    days: url.searchParams.get("days") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Parâmetros de série inválidos." },
      { status: 400 },
    );
  }

  const apiResponse = await proxyToApi(
    `/dashboard/movements-series?days=${parsed.data.days}`,
    session.userId,
  );
  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    return NextResponse.json(data, { status: apiResponse.status });
  }

  const series = dashboardMovementsSeriesSchema.parse(data);
  return NextResponse.json(series);
}
