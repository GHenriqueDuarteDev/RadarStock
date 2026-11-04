import { requireApiSession, proxyToApi } from "@/app/_lib/api";
import {
  adminCreateUserSchema,
  publicUserRecordSchema,
} from "@radarstock/contracts";
import { NextResponse } from "next/server";
import { z } from "zod";

const usersListSchema = z.array(publicUserRecordSchema);

export async function GET() {
  const session = await requireApiSession();
  if (session instanceof NextResponse) {
    return session;
  }

  const apiResponse = await proxyToApi("/users", session.userId);

  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    return NextResponse.json(data, { status: apiResponse.status });
  }

  const users = usersListSchema.parse(data);
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
