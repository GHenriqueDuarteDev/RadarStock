import type { UserRole } from "./user";

export const PERMISSIONS = [
  "products.write",
  "warehouses.write",
  "categories.write",
  "movements.write",
  "sales.write",
  "receipts.write",
  "inventory.write",
  "reports.export",
  "settings.read",
  "alertRules.write",
  "team.manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ALL_WRITE_OPS = [
  "movements.write",
  "sales.write",
  "receipts.write",
  "inventory.write",
] as const satisfies readonly Permission[];

const MASTER_DATA_WRITE = [
  "products.write",
  "warehouses.write",
  "categories.write",
] as const satisfies readonly Permission[];

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  admin: [...PERMISSIONS],
  manager: [
    ...MASTER_DATA_WRITE,
    ...ALL_WRITE_OPS,
    "reports.export",
    "settings.read",
  ],
  operator: [...ALL_WRITE_OPS],
  viewer: [],
};

export function hasPermission(
  role: UserRole | string | null | undefined,
  permission: Permission,
): boolean {
  if (!role || !(role in ROLE_PERMISSIONS)) {
    return false;
  }
  return ROLE_PERMISSIONS[role as UserRole].includes(permission);
}

export function hasAnyPermission(
  role: UserRole | string | null | undefined,
  permissions: readonly Permission[],
): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

export function rolesWithPermission(permission: Permission): UserRole[] {
  return (Object.keys(ROLE_PERMISSIONS) as UserRole[]).filter((role) =>
    hasPermission(role, permission),
  );
}

/** Página autenticada → permission mínima para entrar (null = qualquer autenticado). */
export const PAGE_PERMISSIONS: ReadonlyArray<{
  prefix: string;
  permission: Permission;
}> = [
  { prefix: "/team", permission: "team.manage" },
  { prefix: "/settings", permission: "settings.read" },
];

export function getPagePermission(
  pathname: string,
): Permission | null {
  const rule = PAGE_PERMISSIONS.find(
    (entry) =>
      pathname === entry.prefix || pathname.startsWith(`${entry.prefix}/`),
  );
  return rule?.permission ?? null;
}
