import { z } from "zod";

import { documentStatusSchema } from "./enums";
import {
  createPaginatedSchema,
  paginationQuerySchema,
} from "./pagination";

export const inventoryCountItemInputSchema = z.object({
  productId: z.string().min(1),
  expectedQty: z.number().int().nonnegative(),
  countedQty: z.number().int().nonnegative(),
});

export const inventoryCountInputSchema = z.object({
  warehouseId: z.string().min(1),
  countedAt: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export const updateInventoryCountItemInputSchema = z.object({
  productId: z.string().min(1),
  countedQty: z.number().int().nonnegative(),
});

export const updateInventoryCountInputSchema = z.object({
  countedAt: z.coerce.date().nullable().optional(),
  notes: z.string().nullable().optional(),
  items: z.array(updateInventoryCountItemInputSchema).min(1).optional(),
});

export const publicInventoryCountItemSchema = z.object({
  id: z.string().min(1),
  inventoryCountId: z.string().min(1),
  productId: z.string().min(1),
  expectedQty: z.number().int().nonnegative(),
  countedQty: z.number().int().nonnegative(),
  variance: z.number().int(),
  productName: z.string().min(1),
  productSku: z.string().min(1),
});

export const publicInventoryCountSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  warehouseId: z.string().min(1),
  warehouseName: z.string().min(1),
  status: documentStatusSchema,
  countedAt: z.coerce.date().nullable(),
  createdById: z.string().min(1),
  createdByName: z.string().min(1),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  items: z.array(publicInventoryCountItemSchema),
});

export const listInventoryCountsQuerySchema = paginationQuerySchema.extend({
  code: z.string().trim().min(1).optional(),
});

export const paginatedInventoryCountsSchema = createPaginatedSchema(
  publicInventoryCountSchema,
);

export const inventoryCountsSummarySchema = z.object({
  inProgress: z.number().int().nonnegative(),
  discrepancies: z.number().int().nonnegative(),
  averageAccuracy: z.number().nonnegative(),
  completed: z.number().int().nonnegative(),
});

export type InventoryCountItemInput = z.infer<
  typeof inventoryCountItemInputSchema
>;
export type InventoryCountInput = z.infer<typeof inventoryCountInputSchema>;
export type UpdateInventoryCountItemInput = z.infer<
  typeof updateInventoryCountItemInputSchema
>;
export type UpdateInventoryCountInput = z.infer<
  typeof updateInventoryCountInputSchema
>;
export type PublicInventoryCountItem = z.infer<
  typeof publicInventoryCountItemSchema
>;
export type PublicInventoryCount = z.infer<typeof publicInventoryCountSchema>;
export type ListInventoryCountsQuery = z.infer<
  typeof listInventoryCountsQuerySchema
>;
export type PaginatedInventoryCounts = z.infer<
  typeof paginatedInventoryCountsSchema
>;
export type InventoryCountsSummary = z.infer<
  typeof inventoryCountsSummarySchema
>;
