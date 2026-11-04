import { z } from "zod";

import { documentStatusSchema } from "./enums";

export const inventoryCountItemInputSchema = z.object({
  productId: z.string().min(1),
  expectedQty: z.number().int().nonnegative(),
  countedQty: z.number().int().nonnegative(),
});

export const inventoryCountInputSchema = z.object({
  code: z.string().min(1),
  warehouseId: z.string().min(1),
  countedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
  items: z.array(inventoryCountItemInputSchema).min(1),
});

export const updateInventoryCountInputSchema = z.object({
  code: z.string().min(1).optional(),
  warehouseId: z.string().min(1).optional(),
  countedAt: z.coerce.date().nullable().optional(),
  notes: z.string().nullable().optional(),
  items: z.array(inventoryCountItemInputSchema).min(1).optional(),
});

export const publicInventoryCountItemSchema = z.object({
  id: z.string().min(1),
  inventoryCountId: z.string().min(1),
  productId: z.string().min(1),
  expectedQty: z.number().int().nonnegative(),
  countedQty: z.number().int().nonnegative(),
});

export const publicInventoryCountSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  warehouseId: z.string().min(1),
  status: documentStatusSchema,
  countedAt: z.coerce.date().nullable(),
  createdById: z.string().min(1),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  items: z.array(publicInventoryCountItemSchema).optional(),
});

export type InventoryCountItemInput = z.infer<
  typeof inventoryCountItemInputSchema
>;
export type InventoryCountInput = z.infer<typeof inventoryCountInputSchema>;
export type UpdateInventoryCountInput = z.infer<
  typeof updateInventoryCountInputSchema
>;
export type PublicInventoryCountItem = z.infer<
  typeof publicInventoryCountItemSchema
>;
export type PublicInventoryCount = z.infer<typeof publicInventoryCountSchema>;
