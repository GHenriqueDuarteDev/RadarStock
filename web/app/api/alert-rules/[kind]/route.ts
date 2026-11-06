import { requireApiSession, proxyToApi } from "@/app/_lib/api";
import {
  alertKindSchema,
  alertRuleSchema,
  updateAlertRuleSchema,
} from "@radarstock/contracts";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ kind: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) {
    return session;
  }

  const { kind: rawKind } = await context.params;
  const kindParsed = alertKindSchema.safeParse(rawKind);
  if (!kindParsed.success) {
    return NextResponse.json(
      { message: "Tipo de gatilho inválido." },
      { status: 400 },
    );
  }

  const body = await request.json();
  const parsed = updateAlertRuleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "Dados de gatilho inválidos." },
      { status: 400 },
    );
  }

  const apiResponse = await proxyToApi(
    `/alert-rules/${kindParsed.data}`,
    session.userId,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
    },
  );

  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    return NextResponse.json(data, { status: apiResponse.status });
  }

  const rule = alertRuleSchema.parse(data);
  return NextResponse.json(rule);
}
