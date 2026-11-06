import { requireApiSession, proxyToApi } from "@/app/_lib/api";
import { warehouseBalancesSchema } from "@radarstock/contracts";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) {
    return session;
  }

  const { id } = await context.params;
  const apiResponse = await proxyToApi(
    `/warehouses/${id}/balances`,
    session.userId,
  );
  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    return NextResponse.json(data, { status: apiResponse.status });
  }

  const balances = warehouseBalancesSchema.parse(data);
  return NextResponse.json(balances);
}
