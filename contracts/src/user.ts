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

export const updateUserRoleSchema = z.object({
  role: userRoleSchema,
});

export type UserInput = z.infer<typeof userInputSchema>;
export type UserRole = z.infer<typeof userRoleSchema>;
export type UpdateUserRole = z.infer<typeof updateUserRoleSchema>;
