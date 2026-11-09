import { z } from "zod";

export const productStatusSchema = z.enum(["active", "inactive"]);

export const warehouseStatusSchema = z.enum(["active", "inactive"]);

export const stockMovementTypeSchema = z.enum([
  "in",
  "out",
  "transfer",
  "adjustment",
]);

export const stockMovementReferenceTypeSchema = z.enum([
  "sale",
  "receipt",
  "inventory",
  "manual",
]);

export const documentStatusSchema = z.enum([
  "draft",
  "confirmed",
  "cancelled",
]);

export type ProductStatus = z.infer<typeof productStatusSchema>;
export type WarehouseStatus = z.infer<typeof warehouseStatusSchema>;
export type StockMovementType = z.infer<typeof stockMovementTypeSchema>;
export type StockMovementReferenceType = z.infer<
  typeof stockMovementReferenceTypeSchema
>;
export type DocumentStatus = z.infer<typeof documentStatusSchema>;
