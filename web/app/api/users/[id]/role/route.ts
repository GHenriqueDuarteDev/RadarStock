import { requireApiSession, proxyToApi } from "@/app/_lib/api";
import {
  publicUserRecordSchema,
  updateUserRoleSchema,
} from "@radarstock/contracts";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) {
    return session;
  }

  const { id } = await context.params;
  const body = await request.json();
  const parsed = updateUserRoleSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Role inválida." }, { status: 400 });
  }

  const apiResponse = await proxyToApi(`/users/${id}/role`, session.userId, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    return NextResponse.json(data, { status: apiResponse.status });
  }

  const user = publicUserRecordSchema.parse(data);
  return NextResponse.json(user);
}
