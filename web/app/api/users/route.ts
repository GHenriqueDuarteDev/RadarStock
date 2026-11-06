import { requireApiSession, proxyToApi } from "@/app/_lib/api";
import {
  adminCreateUserSchema,
  listUsersQuerySchema,
  paginatedUsersSchema,
  publicUserRecordSchema,
} from "@radarstock/contracts";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) {
    return session;
  }

  const url = new URL(request.url);
  const parsed = listUsersQuerySchema.safeParse({
    page: url.searchParams.get("page") ?? undefined,
    name: url.searchParams.get("name") ?? undefined,
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

  if (parsed.data.name) {
    query.set("name", parsed.data.name);
  }

  const apiResponse = await proxyToApi(
    `/users?${query.toString()}`,
    session.userId,
  );

  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    return NextResponse.json(data, { status: apiResponse.status });
  }

  const users = paginatedUsersSchema.parse(data);
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) {
    return session;
  }

  const body = await request.json();
  const parsed = adminCreateUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Dados de registro inválidos." },
      { status: 400 },
    );
  }

  const apiResponse = await proxyToApi("/auth/register", session.userId, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    return NextResponse.json(data, { status: apiResponse.status });
  }

  const user = publicUserRecordSchema.parse(data);
  return NextResponse.json(user, { status: 201 });
}
