import { requireApiSession, proxyToApi } from "@/app/_lib/api";
import {
  alertBadgeSchema,
  markAlertsReadSchema,
} from "@radarstock/contracts";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) {
    return session;
  }

  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = markAlertsReadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Dados de leitura inválidos." },
      { status: 400 },
    );
  }

  const apiResponse = await proxyToApi("/alerts/mark-read", session.userId, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    return NextResponse.json(data, { status: apiResponse.status });
  }

  const badge = alertBadgeSchema.parse(data);
  return NextResponse.json(badge);
}
