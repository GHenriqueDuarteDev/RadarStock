import { requireApiSession, proxyToApi } from "@/app/_lib/api";
import { publicSaleSchema } from "@radarstock/contracts";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) {
    return session;
  }

  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { message: "Id da venda inválido." },
      { status: 400 },
    );
  }

  const apiResponse = await proxyToApi(`/sales/${id}/cancel`, session.userId, {
    method: "POST",
  });

  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    return NextResponse.json(data, { status: apiResponse.status });
  }

  const sale = publicSaleSchema.parse(data);
  return NextResponse.json(sale);
}
