import { requireApiSession, proxyToApi } from "@/app/_lib/api";
import {
  publicInventoryCountSchema,
  updateInventoryCountInputSchema,
} from "@radarstock/contracts";
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
  const apiResponse = await proxyToApi(`/inventory/${id}`, session.userId);
  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    return NextResponse.json(data, { status: apiResponse.status });
  }

  const inventoryCount = publicInventoryCountSchema.parse(data);
  return NextResponse.json(inventoryCount);
}

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) {
    return session;
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = updateInventoryCountInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Dados de inventário inválidos." },
      { status: 400 },
    );
  }

  if (Object.keys(parsed.data).length === 0) {
    return NextResponse.json(
      { message: "Nenhum campo para atualizar." },
      { status: 400 },
    );
  }

  const apiResponse = await proxyToApi(`/inventory/${id}`, session.userId, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    return NextResponse.json(data, { status: apiResponse.status });
  }

  const inventoryCount = publicInventoryCountSchema.parse(data);
  return NextResponse.json(inventoryCount);
}
