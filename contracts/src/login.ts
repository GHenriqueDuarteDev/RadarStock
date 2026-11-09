import { z } from "zod";
import { userRoleSchema } from "./user";

export const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export const publicUserSchema = z.object({
  id: z.string(),
  email: z.email(),
  role: userRoleSchema,
});

export type Credentials = z.infer<typeof credentialsSchema>;
export type PublicUser = z.infer<typeof publicUserSchema>;
