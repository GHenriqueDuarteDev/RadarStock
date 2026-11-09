import {
  getPagePermission,
  hasPermission,
  type Permission,
} from "@radarstock/contracts";

export function getRequiredPermission(
  pathname: string,
): Permission | null {
  return getPagePermission(pathname);
}

export function hasRequiredRole(
  pathname: string,
  role: string | undefined,
): boolean {
  const permission = getRequiredPermission(pathname);

  if (!permission) {
    return true;
  }

  return hasPermission(role, permission);
}
