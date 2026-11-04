import { getIronSession } from "iron-session";
import { NextRequest, NextResponse } from "next/server";
import { sessionOptions, type SessionData } from "@/app/_lib/session";

export type AuthenticatedProxy = {
  userId: string;
  response: NextResponse;
};

export async function requireAuth(
  request: NextRequest,
): Promise<AuthenticatedProxy | NextResponse> {
  const response = NextResponse.next();
  const session = await getIronSession<SessionData>(
    request,
    response,
    sessionOptions,
  );

  if (!session.userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return { userId: session.userId, response };
}
