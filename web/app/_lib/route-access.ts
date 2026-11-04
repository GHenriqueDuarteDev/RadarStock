import type { UserRole } from "@radarstock/contracts";

export const routeRoleRules: ReadonlyArray<{
  prefix: string;
  roles: readonly UserRole[];
}> = [
  { prefix: "/team", roles: ["admin"] },
  { prefix: "/settings", roles: ["admin"] },
];

export function getRequiredRoles(
  pathname: string,
): readonly UserRole[] | null {
  const rule = routeRoleRules.find(
    (entry) =>
      pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`),
  );

  return rule?.roles ?? null;
}

export function hasRequiredRole(
  pathname: string,
  role: string | undefined,
): boolean {
  const required = getRequiredRoles(pathname);

  if (!required) {
    return true;
  }

  return !!role && required.includes(role as UserRole);
}
