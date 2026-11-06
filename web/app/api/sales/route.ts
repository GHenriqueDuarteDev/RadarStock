import { requireApiSession, proxyToApi } from "@/app/_lib/api";
import {
  listSalesQuerySchema,
  paginatedSalesSchema,
  publicSaleSchema,
  saleInputSchema,
} from "@radarstock/contracts";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) {
    return session;
  }

  const url = new URL(request.url);
  const parsed = listSalesQuerySchema.safeParse({
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
    `/sales?${query.toString()}`,
    session.userId,
  );
  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    return NextResponse.json(data, { status: apiResponse.status });
  }

  const sales = paginatedSalesSchema.parse(data);
  return NextResponse.json(sales);
}

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) {
    return session;
  }

  const body = await request.json();
  const parsed = saleInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Dados de venda inválidos." },
      { status: 400 },
    );
  }

  const apiResponse = await proxyToApi("/sales", session.userId, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    return NextResponse.json(data, { status: apiResponse.status });
  }

  const sale = publicSaleSchema.parse(data);
  return NextResponse.json(sale, { status: 201 });
}
