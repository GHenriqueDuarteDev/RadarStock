import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/_lib/proxies/require-auth";
import { requireRole } from "@/app/_lib/proxies/require-role";

export async function proxy(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth instanceof NextResponse) {
    return auth;
  }

  const roleGate = await requireRole(request, auth.userId);
  if (roleGate) {
    return roleGate;
  }

  return auth.response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/products/:path*",
    "/team/:path*",
    "/settings/:path*",
  ],
};
