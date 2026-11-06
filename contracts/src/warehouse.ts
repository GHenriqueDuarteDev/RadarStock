import { z } from "zod";

import { warehouseStatusSchema } from "./enums";
import {
  createPaginatedSchema,
  paginationQuerySchema,
} from "./pagination";

export const warehouseInputSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1),
  address: z.string().optional(),
  capacity: z.number().int().positive().nullable().optional(),
  status: warehouseStatusSchema.default("active"),
});

export const updateWarehouseInputSchema = warehouseInputSchema.partial();

export const publicWarehouseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  code: z.string().min(1),
  address: z.string().nullable(),
  capacity: z.number().int().positive().nullable(),
  status: warehouseStatusSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export const listWarehousesQuerySchema = paginationQuerySchema.extend({
  name: z.string().trim().min(1).optional(),
});

export const paginatedWarehousesSchema =
  createPaginatedSchema(publicWarehouseSchema);

export const warehousesSummarySchema = z.object({
  total: z.number().int().nonnegative(),
  active: z.number().int().nonnegative(),
  inactive: z.number().int().nonnegative(),
  totalCapacity: z.number().int().nonnegative(),
});

export const warehouseBalanceItemSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  productSku: z.string().min(1),
  quantity: z.number().int().nonnegative(),
});

export const warehouseBalancesSchema = z.object({
  items: z.array(warehouseBalanceItemSchema),
});

export type WarehouseInput = z.infer<typeof warehouseInputSchema>;
export type UpdateWarehouseInput = z.infer<typeof updateWarehouseInputSchema>;
export type PublicWarehouse = z.infer<typeof publicWarehouseSchema>;
export type ListWarehousesQuery = z.infer<typeof listWarehousesQuerySchema>;
export type PaginatedWarehouses = z.infer<typeof paginatedWarehousesSchema>;
export type WarehousesSummary = z.infer<typeof warehousesSummarySchema>;
export type WarehouseBalanceItem = z.infer<typeof warehouseBalanceItemSchema>;
export type WarehouseBalances = z.infer<typeof warehouseBalancesSchema>;
