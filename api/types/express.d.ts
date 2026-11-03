import { UserRole, UserStatus } from "../generated/prisma/enums";

declare global {
  namespace Express {
    interface Locals {
      userId?: string;
      user?: { id: string; role: UserRole; status: UserStatus };
    }
  }
}
