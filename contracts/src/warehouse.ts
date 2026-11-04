import { z } from "zod";

import { warehouseStatusSchema } from "./enums";

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

export type WarehouseInput = z.infer<typeof warehouseInputSchema>;
export type UpdateWarehouseInput = z.infer<typeof updateWarehouseInputSchema>;
export type PublicWarehouse = z.infer<typeof publicWarehouseSchema>;
