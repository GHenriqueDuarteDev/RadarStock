import { z } from "zod";

import { productStatusSchema } from "./enums";

export const productInputSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  barcode: z.string().min(1).nullable().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1),
  cost: z.number().nonnegative(),
  salePrice: z.number().nonnegative(),
  minStock: z.number().int().nonnegative().default(0),
  status: productStatusSchema.default("active"),
});

export const updateProductInputSchema = productInputSchema.partial();

export const publicProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  sku: z.string().min(1),
  barcode: z.string().nullable(),
  description: z.string().nullable(),
  categoryId: z.string().min(1),
  cost: z.number().nonnegative(),
  salePrice: z.number().nonnegative(),
  minStock: z.number().int().nonnegative(),
  status: productStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type ProductInput = z.infer<typeof productInputSchema>;
export type UpdateProductInput = z.infer<typeof updateProductInputSchema>;
export type PublicProduct = z.infer<typeof publicProductSchema>;
