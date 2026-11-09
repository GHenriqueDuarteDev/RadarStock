import { requireApiSession, proxyToApi } from "@/app/_lib/api";
import { alertBadgeSchema } from "@radarstock/contracts";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await requireApiSession();
  if (session instanceof NextResponse) {
    return session;
  }

  const apiResponse = await proxyToApi("/alerts/badge", session.userId);
  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    return NextResponse.json(data, { status: apiResponse.status });
  }

  const badge = alertBadgeSchema.parse(data);
  return NextResponse.json(badge);
}
