import type { UserRole } from "@radarstock/contracts";
import { NextRequest, NextResponse } from "next/server";
import { getRequiredRoles } from "@/app/_lib/route-access";

export async function requireRole(
  request: NextRequest,
  userId: string,
): Promise<NextResponse | null> {
  const requiredRoles = getRequiredRoles(request.nextUrl.pathname);

  if (!requiredRoles) {
    return null;
  }

  try {
    const meResponse = await fetch(`${process.env.API_URL}/auth/me`, {
      headers: {
        "x-internal-secret": process.env.INTERNAL_SECRET ?? "",
        "x-user-id": userId,
      },
      cache: "no-store",
    });

    if (!meResponse.ok) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    const me = (await meResponse.json()) as { role?: string };

    if (!me.role || !requiredRoles.includes(me.role as UserRole)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return null;
  } catch {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
}
