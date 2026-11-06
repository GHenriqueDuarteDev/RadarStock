import { requireApiSession, proxyToApi } from "@/app/_lib/api";
import { reportIdSchema } from "@radarstock/contracts";
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
    `/reports/${parsedId.data}/export?${url.searchParams.toString()}`,
    session.userId,
  );

  const contentType = apiResponse.headers.get("content-type") ?? "";
  if (!apiResponse.ok || contentType.includes("application/json")) {
    const data = await apiResponse.json();
    return NextResponse.json(data, { status: apiResponse.status });
  }

  const buffer = await apiResponse.arrayBuffer();
  const headers = new Headers();
  const passthrough = ["content-type", "content-disposition"];
  for (const name of passthrough) {
    const value = apiResponse.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }

  return new NextResponse(buffer, {
    status: 200,
    headers,
  });
}
