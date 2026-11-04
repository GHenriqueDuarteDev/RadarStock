import { z } from "zod";

import {
  stockMovementReferenceTypeSchema,
  stockMovementTypeSchema,
} from "./enums";

export const stockMovementInputSchema = z.object({
  type: stockMovementTypeSchema,
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  fromWarehouseId: z.string().min(1).nullable().optional(),
  toWarehouseId: z.string().min(1).nullable().optional(),
  note: z.string().optional(),
  referenceType: stockMovementReferenceTypeSchema.nullable().optional(),
  referenceId: z.string().min(1).nullable().optional(),
});

export const publicStockMovementSchema = z.object({
  id: z.string().min(1),
  type: stockMovementTypeSchema,
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  fromWarehouseId: z.string().nullable(),
  toWarehouseId: z.string().nullable(),
  userId: z.string().min(1),
  note: z.string().nullable(),
  referenceType: stockMovementReferenceTypeSchema.nullable(),
  referenceId: z.string().nullable(),
  createdAt: z.coerce.date(),
});

export type StockMovementInput = z.infer<typeof stockMovementInputSchema>;
export type PublicStockMovement = z.infer<typeof publicStockMovementSchema>;
