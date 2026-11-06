import { requireApiSession, proxyToApi } from "@/app/_lib/api";
import { alertRulesListSchema } from "@radarstock/contracts";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await requireApiSession();
  if (session instanceof NextResponse) {
    return session;
  }

  const apiResponse = await proxyToApi("/alert-rules", session.userId);
  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    return NextResponse.json(data, { status: apiResponse.status });
  }

  const rules = alertRulesListSchema.parse(data);
  return NextResponse.json(rules);
}
