import { z } from "zod";

export const categoryInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const updateCategoryInputSchema = categoryInputSchema.partial();

export const publicCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategoryInputSchema>;
export type PublicCategory = z.infer<typeof publicCategorySchema>;
