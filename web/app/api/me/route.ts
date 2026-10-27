import { getSession } from "@/app/_lib/session";
import { publicUserSchema } from "@radarstock/contracts";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getSession();

  if (!session.userId) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  const apiResponse = await fetch(`${process.env.API_URL}/user/me`, {
    headers: {
      "x-internal-secret": process.env.INTERNAL_SECRET ?? "",
      "x-user-id": session.userId,
    },
  });

  if (!apiResponse.ok) {
    return NextResponse.json({ message: "Não autenticado." }, { status: 401 });
  }

  const user = publicUserSchema.parse(await apiResponse.json());
  return NextResponse.json(user);
}
