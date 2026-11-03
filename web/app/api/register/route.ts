import { getSession } from "@/app/_lib/session";
import { userInputSchema } from "@radarstock/contracts";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = userInputSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { message: "Dados de registro inválidos." },
      { status: 400 },
    );
  }

  const apiResponse = await fetch(`${process.env.API_URL}/auth/register`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  const data = await apiResponse.json();

  if (!apiResponse.ok) {
    return NextResponse.json(data, { status: apiResponse.status });
  }

  const session = await getSession();
  session.userId = data.id;
  await session.save();

  return NextResponse.json({ id: data.id, email: data.email }, { status: 201 });
}
