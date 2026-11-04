import { getSession } from "@/app/_lib/session";
import { NextResponse } from "next/server";

type AuthenticatedSession = {
  userId: string;
};

export async function requireApiSession(): Promise<
  AuthenticatedSession | NextResponse
> {
  const session = await getSession();

  if (!session.userId) {
    return NextResponse.json({ message: "Não autenticado" }, { status: 401 });
  }

  return { userId: session.userId };
}

export function apiHeaders(userId: string, init?: HeadersInit): Headers {
  const headers = new Headers(init);
  headers.set("x-internal-secret", process.env.INTERNAL_SECRET ?? "");
  headers.set("x-user-id", userId);
  return headers;
}

export async function proxyToApi(
  path: string,
  userId: string,
  init?: RequestInit,
) {
  return fetch(`${process.env.API_URL}${path}`, {
    ...init,
    headers: apiHeaders(userId, init?.headers),
  });
}
