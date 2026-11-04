import { z } from "zod";

import { documentStatusSchema } from "./enums";

export const saleItemInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
});

export const saleInputSchema = z.object({
  code: z.string().min(1),
  warehouseId: z.string().min(1),
  soldAt: z.coerce.date(),
  notes: z.string().optional(),
  items: z.array(saleItemInputSchema).min(1),
});

export const updateSaleInputSchema = z.object({
  code: z.string().min(1).optional(),
  warehouseId: z.string().min(1).optional(),
  soldAt: z.coerce.date().optional(),
  notes: z.string().nullable().optional(),
  items: z.array(saleItemInputSchema).min(1).optional(),
});

export const publicSaleItemSchema = z.object({
  id: z.string().min(1),
  saleId: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().nonnegative(),
});

export const publicSaleSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  status: documentStatusSchema,
  warehouseId: z.string().min(1),
  totalAmount: z.number().nonnegative(),
  soldAt: z.coerce.date(),
  createdById: z.string().min(1),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  items: z.array(publicSaleItemSchema).optional(),
});

export type SaleItemInput = z.infer<typeof saleItemInputSchema>;
export type SaleInput = z.infer<typeof saleInputSchema>;
export type UpdateSaleInput = z.infer<typeof updateSaleInputSchema>;
export type PublicSaleItem = z.infer<typeof publicSaleItemSchema>;
export type PublicSale = z.infer<typeof publicSaleSchema>;
