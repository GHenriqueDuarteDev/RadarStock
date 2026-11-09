import { z } from "zod";

import {
  createPaginatedSchema,
  paginationQuerySchema,
} from "./pagination";

export const userInputSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

export const userRoleSchema = z.enum([
  "admin",
  "manager",
  "operator",
  "viewer",
]);

export const userStatusSchema = z.enum(["active", "inactive"]);

export const updateUserRoleSchema = z.object({
  role: userRoleSchema,
});

export const adminCreateUserSchema = userInputSchema.extend({
  role: userRoleSchema,
});

export const publicUserRecordSchema = z.object({
  id: z.string().min(1),
  email: z.email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: userRoleSchema,
  status: userStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const listUsersQuerySchema = paginationQuerySchema.extend({
  name: z.string().trim().min(1).optional(),
});

export const paginatedUsersSchema =
  createPaginatedSchema(publicUserRecordSchema);

export const usersSummarySchema = z.object({
  total: z.number().int().nonnegative(),
  active: z.number().int().nonnegative(),
  inactive: z.number().int().nonnegative(),
  admins: z.number().int().nonnegative(),
});

export type UserInput = z.infer<typeof userInputSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type UserStatus = z.infer<typeof userStatusSchema>;
export type UpdateUserRole = z.infer<typeof updateUserRoleSchema>;
export type AdminCreateUser = z.infer<typeof adminCreateUserSchema>;
export type PublicUserRecord = z.infer<typeof publicUserRecordSchema>;
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type PaginatedUsers = z.infer<typeof paginatedUsersSchema>;
export type UsersSummary = z.infer<typeof usersSummarySchema>;
