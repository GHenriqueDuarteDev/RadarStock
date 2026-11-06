import { requireApiSession, proxyToApi } from "@/app/_lib/api";
import { reportIdSchema, reportPreviewSchema } from "@radarstock/contracts";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ reportId: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) {
    return session;
  }

  const { reportId } = await context.params;
  const parsedId = reportIdSchema.safeParse(reportId);
  if (!parsedId.success) {
    return NextResponse.json(
      { message: "Relatório não encontrado." },
      { status: 404 },
    );
  }

  const url = new URL(request.url);
  const apiResponse = await proxyToApi(
    `/reports/${parsedId.data}?${url.searchParams.toString()}`,
    session.userId,
  );
  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    return NextResponse.json(data, { status: apiResponse.status });
  }

  const preview = reportPreviewSchema.parse(data);
  return NextResponse.json(preview);
}
