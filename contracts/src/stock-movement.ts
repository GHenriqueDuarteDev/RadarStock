import { z } from "zod";

import {
  stockMovementReferenceTypeSchema,
  stockMovementTypeSchema,
} from "./enums";
import {
  createPaginatedSchema,
  paginationQuerySchema,
} from "./pagination";

function isPresentWarehouseId(value: string | null | undefined): value is string {
  return typeof value === "string" && value.length > 0;
}

export const stockMovementInputSchema = z
  .object({
    type: stockMovementTypeSchema,
    productId: z.string().min(1),
    quantity: z.number().int().positive(),
    fromWarehouseId: z.string().min(1).nullable().optional(),
    toWarehouseId: z.string().min(1).nullable().optional(),
    note: z.string().optional(),
    referenceType: stockMovementReferenceTypeSchema.nullable().optional(),
    referenceId: z.string().min(1).nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const from = isPresentWarehouseId(data.fromWarehouseId)
      ? data.fromWarehouseId
      : null;
    const to = isPresentWarehouseId(data.toWarehouseId)
      ? data.toWarehouseId
      : null;

    if (data.type === "in") {
      if (from !== null) {
        ctx.addIssue({
          code: "custom",
          path: ["fromWarehouseId"],
          message: "Entrada não deve informar galpão de origem.",
        });
      }
      if (to === null) {
        ctx.addIssue({
          code: "custom",
          path: ["toWarehouseId"],
          message: "Entrada exige galpão de destino.",
        });
      }
      return;
    }

    if (data.type === "out") {
      if (from === null) {
        ctx.addIssue({
          code: "custom",
          path: ["fromWarehouseId"],
          message: "Saída exige galpão de origem.",
        });
      }
      if (to !== null) {
        ctx.addIssue({
          code: "custom",
          path: ["toWarehouseId"],
          message: "Saída não deve informar galpão de destino.",
        });
      }
      return;
    }

    if (data.type === "transfer") {
      if (from === null) {
        ctx.addIssue({
          code: "custom",
          path: ["fromWarehouseId"],
          message: "Transferência exige galpão de origem.",
        });
      }
      if (to === null) {
        ctx.addIssue({
          code: "custom",
          path: ["toWarehouseId"],
          message: "Transferência exige galpão de destino.",
        });
      }
      if (from !== null && to !== null && from === to) {
        ctx.addIssue({
          code: "custom",
          path: ["toWarehouseId"],
          message: "Galpões de origem e destino devem ser diferentes.",
        });
      }
      return;
    }

    const hasFrom = from !== null;
    const hasTo = to !== null;
    if (hasFrom === hasTo) {
      ctx.addIssue({
        code: "custom",
        path: hasFrom ? ["toWarehouseId"] : ["fromWarehouseId"],
        message:
          "Ajuste exige exatamente um galpão (origem para baixa ou destino para entrada).",
      });
    }
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
  productName: z.string().min(1),
  productSku: z.string().min(1),
  fromWarehouseName: z.string().nullable(),
  toWarehouseName: z.string().nullable(),
  userName: z.string().min(1),
});

export const listStockMovementsQuerySchema = paginationQuerySchema.extend({
  name: z.string().trim().min(1).optional(),
});

export const paginatedStockMovementsSchema = createPaginatedSchema(
  publicStockMovementSchema,
);

export const stockMovementsSummarySchema = z.object({
  total: z.number().int().nonnegative(),
  in: z.number().int().nonnegative(),
  out: z.number().int().nonnegative(),
  transfer: z.number().int().nonnegative(),
});

export type StockMovementInput = z.infer<typeof stockMovementInputSchema>;
export type PublicStockMovement = z.infer<typeof publicStockMovementSchema>;
export type ListStockMovementsQuery = z.infer<
  typeof listStockMovementsQuerySchema
>;
export type PaginatedStockMovements = z.infer<
  typeof paginatedStockMovementsSchema
>;
export type StockMovementsSummary = z.infer<typeof stockMovementsSummarySchema>;
