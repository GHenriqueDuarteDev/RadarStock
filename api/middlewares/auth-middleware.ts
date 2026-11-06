import {
  hasPermission,
  rolesWithPermission,
  type Permission,
} from "@radarstock/contracts";
import { UserRole } from "../generated/prisma/enums";
import { prisma } from "./../src/db";
import type { NextFunction, Request, Response } from "express";

export function requireInternalUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const secret = req.header("x-internal-secret");
  const userId = req.header("x-user-id");

  if (secret !== process.env.INTERNAL_SECRET || !userId) {
    res.status(401).json({
      message: "Usuario Não Autenticado.",
    });
    return;
  }

  res.locals.userId = userId;
  next();
}

export function requireRoles(...allowedRoles: UserRole[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = res.locals.userId;

    if (!userId) {
      res.status(401).json({
        message: "Usuario Não Autenticado.",
      });
      return;
    }

    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, status: true },
    });

    if (!userData || userData.status !== "active") {
      res.status(401).json({
        message: "Não Autenticado.",
      });
      return;
    }

    if (!allowedRoles.includes(userData.role)) {
      res.status(403).json({
        message: "Sem permissão.",
      });
      return;
    }

    res.locals.user = userData;
    next();
  };
}

export function requirePermission(permission: Permission) {
  const roles = rolesWithPermission(permission) as UserRole[];
  return requireRoles(...roles);
}

export { hasPermission };
