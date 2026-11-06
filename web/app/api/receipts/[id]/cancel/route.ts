import { requireApiSession, proxyToApi } from "@/app/_lib/api";
import { publicReceiptSchema } from "@radarstock/contracts";
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
      { message: "Id do recebimento inválido." },
      { status: 400 },
    );
  }

  const apiResponse = await proxyToApi(
    `/receipts/${id}/cancel`,
    session.userId,
    { method: "POST" },
  );

  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    return NextResponse.json(data, { status: apiResponse.status });
  }

  const receipt = publicReceiptSchema.parse(data);
  return NextResponse.json(receipt);
}
