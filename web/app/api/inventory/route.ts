import { requireApiSession, proxyToApi } from "@/app/_lib/api";
import {
  inventoryCountInputSchema,
  listInventoryCountsQuerySchema,
  paginatedInventoryCountsSchema,
  publicInventoryCountSchema,
} from "@radarstock/contracts";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) {
    return session;
  }

  const url = new URL(request.url);
  const parsed = listInventoryCountsQuerySchema.safeParse({
    page: url.searchParams.get("page") ?? undefined,
    code: url.searchParams.get("code") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Parâmetros de listagem inválidos." },
      { status: 400 },
    );
  }

  const query = new URLSearchParams({
    page: String(parsed.data.page),
  });

  if (parsed.data.code) {
    query.set("code", parsed.data.code);
  }

  const apiResponse = await proxyToApi(
    `/inventory?${query.toString()}`,
    session.userId,
  );
  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    return NextResponse.json(data, { status: apiResponse.status });
  }

  const inventoryCounts = paginatedInventoryCountsSchema.parse(data);
  return NextResponse.json(inventoryCounts);
}

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) {
    return session;
  }

  const body = await request.json();
  const parsed = inventoryCountInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Dados de inventário inválidos." },
      { status: 400 },
    );
  }

  const apiResponse = await proxyToApi("/inventory", session.userId, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    return NextResponse.json(data, { status: apiResponse.status });
  }

  const inventoryCount = publicInventoryCountSchema.parse(data);
  return NextResponse.json(inventoryCount, { status: 201 });
}
