import { getSession } from "@/app/_lib/session";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getSession();
  await session.destroy();
  return NextResponse.redirect(new URL("/login", request.url));
}
