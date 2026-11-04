import { requireApiSession, proxyToApi } from "@/app/_lib/api";
import {
  categoryInputSchema,
  publicCategorySchema,
} from "@radarstock/contracts";
import { NextResponse } from "next/server";
import { z } from "zod";

const categoriesListSchema = z.array(publicCategorySchema);

export async function GET() {
  const session = await requireApiSession();
  if (session instanceof NextResponse) {
    return session;
  }

  const apiResponse = await proxyToApi("/categories", session.userId);
  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    return NextResponse.json(data, { status: apiResponse.status });
  }

  const categories = categoriesListSchema.parse(data);
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) {
    return session;
  }

  const body = await request.json();
  const parsed = categoryInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Dados de categoria inválidos." },
      { status: 400 },
    );
  }

  const apiResponse = await proxyToApi("/categories", session.userId, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    return NextResponse.json(data, { status: apiResponse.status });
  }

  const category = publicCategorySchema.parse(data);
  return NextResponse.json(category, { status: 201 });
}
