import { requireApiSession, proxyToApi } from "@/app/_lib/api";
import {
  productInputSchema,
  publicProductSchema,
} from "@radarstock/contracts";
import { NextResponse } from "next/server";
import { z } from "zod";

const productsListSchema = z.array(publicProductSchema);

export async function GET() {
  const session = await requireApiSession();
  if (session instanceof NextResponse) {
    return session;
  }

  const apiResponse = await proxyToApi("/products", session.userId);
  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    return NextResponse.json(data, { status: apiResponse.status });
  }

  const products = productsListSchema.parse(data);
  return NextResponse.json(products);
}

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) {
    return session;
  }

  const body = await request.json();
  const parsed = productInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Dados de produto inválidos." },
      { status: 400 },
    );
  }

  const apiResponse = await proxyToApi("/products", session.userId, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    return NextResponse.json(data, { status: apiResponse.status });
  }

  const product = publicProductSchema.parse(data);
  return NextResponse.json(product, { status: 201 });
}
