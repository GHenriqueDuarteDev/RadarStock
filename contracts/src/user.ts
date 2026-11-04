import { z } from "zod";

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

export type UserInput = z.infer<typeof userInputSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type UserStatus = z.infer<typeof userStatusSchema>;
export type UpdateUserRole = z.infer<typeof updateUserRoleSchema>;
export type AdminCreateUser = z.infer<typeof adminCreateUserSchema>;
export type PublicUserRecord = z.infer<typeof publicUserRecordSchema>;
