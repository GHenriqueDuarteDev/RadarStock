import { z } from "zod";

import { productStatusSchema } from "./enums";
import {
  createPaginatedSchema,
  paginationQuerySchema,
} from "./pagination";

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
  category: z.object({
    id: z.string().min(1),
    name: z.string().min(1),
  }),
  cost: z.number().nonnegative(),
  salePrice: z.number().nonnegative(),
  minStock: z.number().int().nonnegative(),
  stockQuantity: z.number().int().nonnegative(),
  status: productStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const listProductsQuerySchema = paginationQuerySchema.extend({
  name: z.string().trim().min(1).optional(),
});

export const paginatedProductsSchema =
  createPaginatedSchema(publicProductSchema);

export const productsSummarySchema = z.object({
  total: z.number().int().nonnegative(),
  active: z.number().int().nonnegative(),
  inactive: z.number().int().nonnegative(),
  categories: z.number().int().nonnegative(),
});

export type ProductInput = z.infer<typeof productInputSchema>;
export type UpdateProductInput = z.infer<typeof updateProductInputSchema>;
export type PublicProduct = z.infer<typeof publicProductSchema>;
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;
export type PaginatedProducts = z.infer<typeof paginatedProductsSchema>;
export type ProductsSummary = z.infer<typeof productsSummarySchema>;
