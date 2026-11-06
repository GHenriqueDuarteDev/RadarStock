import { z } from "zod";

import {
  stockMovementReferenceTypeSchema,
  stockMovementTypeSchema,
} from "./enums";

export const dashboardDaysSchema = z.union([
  z.literal(7),
  z.literal(30),
  z.literal(90),
]);

export const dashboardMovementsQuerySchema = z.object({
  days: z.coerce
    .number()
    .int()
    .refine((value): value is 7 | 30 | 90 => [7, 30, 90].includes(value)),
});

export const dashboardMetricsSchema = z.object({
  activeProducts: z.number().int().nonnegative(),
  stockValue: z.number().nonnegative(),
  lowStock: z.number().int().nonnegative(),
  inactiveWarehouses: z.number().int().nonnegative(),
});

export const dashboardMovementPointSchema = z.object({
  date: z.string().min(1),
  in: z.number().int().nonnegative(),
  out: z.number().int().nonnegative(),
});

export const dashboardMovementsSeriesSchema = z.object({
  days: dashboardDaysSchema,
  points: z.array(dashboardMovementPointSchema),
});

export const dashboardWarehouseSliceSchema = z.object({
  warehouseId: z.string().min(1),
  name: z.string().min(1),
  valuePercent: z.number().int().nonnegative(),
  stockValue: z.number().nonnegative(),
});

export const dashboardWarehouseDistributionSchema = z.object({
  warehouseCount: z.number().int().nonnegative(),
  slices: z.array(dashboardWarehouseSliceSchema),
});

export const dashboardRecentMovementSchema = z.object({
  id: z.string().min(1),
  productName: z.string().min(1),
  productSku: z.string().min(1),
  type: stockMovementTypeSchema,
  referenceType: stockMovementReferenceTypeSchema.nullable(),
  quantity: z.number().int().positive(),
  fromWarehouseName: z.string().nullable(),
  toWarehouseName: z.string().nullable(),
  userName: z.string().min(1),
  createdAt: z.coerce.date(),
});

export const dashboardRecentMovementsSchema = z.object({
  items: z.array(dashboardRecentMovementSchema).max(5),
});

export type DashboardDays = z.infer<typeof dashboardDaysSchema>;
export type DashboardMovementsQuery = z.infer<
  typeof dashboardMovementsQuerySchema
>;
export type DashboardMetrics = z.infer<typeof dashboardMetricsSchema>;
export type DashboardMovementPoint = z.infer<
  typeof dashboardMovementPointSchema
>;
export type DashboardMovementsSeries = z.infer<
  typeof dashboardMovementsSeriesSchema
>;
export type DashboardWarehouseSlice = z.infer<
  typeof dashboardWarehouseSliceSchema
>;
export type DashboardWarehouseDistribution = z.infer<
  typeof dashboardWarehouseDistributionSchema
>;
export type DashboardRecentMovement = z.infer<
  typeof dashboardRecentMovementSchema
>;
export type DashboardRecentMovements = z.infer<
  typeof dashboardRecentMovementsSchema
>;
