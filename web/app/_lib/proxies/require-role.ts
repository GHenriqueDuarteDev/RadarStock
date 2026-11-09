import { hasPermission } from "@radarstock/contracts";
import { NextRequest, NextResponse } from "next/server";
import { getRequiredPermission } from "@/app/_lib/route-access";

export async function requireRole(
  request: NextRequest,
  userId: string,
): Promise<NextResponse | null> {
  const requiredPermission = getRequiredPermission(request.nextUrl.pathname);

  if (!requiredPermission) {
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

    if (!hasPermission(me.role, requiredPermission)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return null;
  } catch {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
}
