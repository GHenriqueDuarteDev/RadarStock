import { z } from "zod";

import {
  documentStatusSchema,
  stockMovementTypeSchema,
  warehouseStatusSchema,
} from "./enums";

export const REPORT_PREVIEW_LIMIT = 100;
export const REPORT_EXPORT_MAX_ROWS = 10_000;

export const reportIdSchema = z.enum([
  "stock-position",
  "low-stock",
  "warehouse-occupancy",
  "movements",
  "sales",
  "receipts",
]);

export type ReportId = z.infer<typeof reportIdSchema>;

export const reportExportFormatSchema = z.enum(["csv", "xlsx", "pdf"]);

export type ReportExportFormat = z.infer<typeof reportExportFormatSchema>;

export const reportCatalogItemSchema = z.object({
  id: reportIdSchema,
  title: z.string().min(1),
  description: z.string().min(1),
  supportsPeriod: z.boolean(),
});

export const reportCatalogSchema = z.object({
  items: z.array(reportCatalogItemSchema),
});

export type ReportCatalogItem = z.infer<typeof reportCatalogItemSchema>;
export type ReportCatalog = z.infer<typeof reportCatalogSchema>;

const optionalDateString = z
  .string()
  .min(1)
  .optional()
  .transform((value, ctx) => {
    if (value === undefined) {
      return undefined;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      ctx.addIssue({
        code: "custom",
        message: "Data inválida.",
      });
      return z.NEVER;
    }
    return date;
  });

const optionalBooleanQuery = z
  .union([z.boolean(), z.enum(["true", "false", "1", "0"])])
  .optional()
  .transform((value) => {
    if (value === undefined) {
      return undefined;
    }
    if (typeof value === "boolean") {
      return value;
    }
    return value === "true" || value === "1";
  });

export const reportPeriodQuerySchema = z.object({
  from: optionalDateString,
  to: optionalDateString,
});

export type ReportPeriodQuery = z.infer<typeof reportPeriodQuerySchema>;

export const stockPositionQuerySchema = z.object({
  warehouseId: z.string().min(1).optional(),
  categoryId: z.string().min(1).optional(),
  onlyPositive: optionalBooleanQuery,
});

export type StockPositionQuery = z.infer<typeof stockPositionQuerySchema>;

export const lowStockQuerySchema = z.object({
  includeZero: optionalBooleanQuery,
});

export type LowStockQuery = z.infer<typeof lowStockQuerySchema>;

export const warehouseOccupancyQuerySchema = z.object({
  status: warehouseStatusSchema.optional(),
});

export type WarehouseOccupancyQuery = z.infer<
  typeof warehouseOccupancyQuerySchema
>;

export const movementsReportQuerySchema = reportPeriodQuerySchema.extend({
  type: stockMovementTypeSchema.optional(),
});

export type MovementsReportQuery = z.infer<typeof movementsReportQuerySchema>;

export const salesReportQuerySchema = reportPeriodQuerySchema.extend({
  status: documentStatusSchema.optional(),
});

export type SalesReportQuery = z.infer<typeof salesReportQuerySchema>;

export const receiptsReportQuerySchema = reportPeriodQuerySchema.extend({
  status: documentStatusSchema.optional(),
});

export type ReceiptsReportQuery = z.infer<typeof receiptsReportQuerySchema>;

export const reportExportQuerySchema = z.object({
  format: reportExportFormatSchema,
});

export type ReportExportQuery = z.infer<typeof reportExportQuerySchema>;

const reportPreviewBaseSchema = z.object({
  generatedAt: z.coerce.date(),
  totalRows: z.number().int().nonnegative(),
  previewLimit: z.number().int().positive(),
  truncated: z.boolean(),
});

export const stockPositionRowSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  productSku: z.string().min(1),
  categoryName: z.string().nullable(),
  warehouseId: z.string().min(1),
  warehouseName: z.string().min(1),
  quantity: z.number().int().nonnegative(),
  unitCost: z.number().nonnegative(),
  stockValue: z.number().nonnegative(),
});

export const stockPositionPreviewSchema = reportPreviewBaseSchema.extend({
  reportId: z.literal("stock-position"),
  summary: z.object({
    lineCount: z.number().int().nonnegative(),
    totalQuantity: z.number().int().nonnegative(),
    totalValue: z.number().nonnegative(),
  }),
  rows: z.array(stockPositionRowSchema),
});

export const lowStockRowSchema = z.object({
  productId: z.string().min(1),
  productName: z.string().min(1),
  productSku: z.string().min(1),
  categoryName: z.string().nullable(),
  minStock: z.number().int().nonnegative(),
  totalQuantity: z.number().int().nonnegative(),
  deficit: z.number().int().nonnegative(),
});

export const lowStockPreviewSchema = reportPreviewBaseSchema.extend({
  reportId: z.literal("low-stock"),
  summary: z.object({
    productCount: z.number().int().nonnegative(),
    zeroStockCount: z.number().int().nonnegative(),
    totalDeficit: z.number().int().nonnegative(),
  }),
  rows: z.array(lowStockRowSchema),
});

export const warehouseOccupancyRowSchema = z.object({
  warehouseId: z.string().min(1),
  warehouseName: z.string().min(1),
  warehouseCode: z.string().min(1),
  status: warehouseStatusSchema,
  capacity: z.number().int().nonnegative().nullable(),
  occupiedQty: z.number().int().nonnegative(),
  occupancyPercent: z.number().nonnegative().nullable(),
});

export const warehouseOccupancyPreviewSchema = reportPreviewBaseSchema.extend({
  reportId: z.literal("warehouse-occupancy"),
  summary: z.object({
    warehouseCount: z.number().int().nonnegative(),
    totalOccupied: z.number().int().nonnegative(),
    totalCapacity: z.number().int().nonnegative().nullable(),
  }),
  rows: z.array(warehouseOccupancyRowSchema),
});

export const movementsReportRowSchema = z.object({
  id: z.string().min(1),
  createdAt: z.coerce.date(),
  type: stockMovementTypeSchema,
  productName: z.string().min(1),
  productSku: z.string().min(1),
  quantity: z.number().int().positive(),
  fromWarehouseName: z.string().nullable(),
  toWarehouseName: z.string().nullable(),
  userName: z.string().min(1),
  note: z.string().nullable(),
});

export const movementsReportPreviewSchema = reportPreviewBaseSchema.extend({
  reportId: z.literal("movements"),
  summary: z.object({
    movementCount: z.number().int().nonnegative(),
    totalQuantity: z.number().int().nonnegative(),
    from: z.coerce.date(),
    to: z.coerce.date(),
  }),
  rows: z.array(movementsReportRowSchema),
});

export const salesReportRowSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  status: documentStatusSchema,
  warehouseName: z.string().min(1),
  soldAt: z.coerce.date(),
  totalAmount: z.number().nonnegative(),
  itemCount: z.number().int().nonnegative(),
  createdByName: z.string().min(1),
});

export const salesReportPreviewSchema = reportPreviewBaseSchema.extend({
  reportId: z.literal("sales"),
  summary: z.object({
    saleCount: z.number().int().nonnegative(),
    totalAmount: z.number().nonnegative(),
    from: z.coerce.date(),
    to: z.coerce.date(),
  }),
  rows: z.array(salesReportRowSchema),
});

export const receiptsReportRowSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  status: documentStatusSchema,
  warehouseName: z.string().min(1),
  supplierName: z.string().nullable(),
  receivedAt: z.coerce.date(),
  itemCount: z.number().int().nonnegative(),
  totalCost: z.number().nonnegative(),
  createdByName: z.string().min(1),
});

export const receiptsReportPreviewSchema = reportPreviewBaseSchema.extend({
  reportId: z.literal("receipts"),
  summary: z.object({
    receiptCount: z.number().int().nonnegative(),
    totalCost: z.number().nonnegative(),
    from: z.coerce.date(),
    to: z.coerce.date(),
  }),
  rows: z.array(receiptsReportRowSchema),
});

export const reportPreviewSchema = z.discriminatedUnion("reportId", [
  stockPositionPreviewSchema,
  lowStockPreviewSchema,
  warehouseOccupancyPreviewSchema,
  movementsReportPreviewSchema,
  salesReportPreviewSchema,
  receiptsReportPreviewSchema,
]);

export type StockPositionRow = z.infer<typeof stockPositionRowSchema>;
export type StockPositionPreview = z.infer<typeof stockPositionPreviewSchema>;
export type LowStockRow = z.infer<typeof lowStockRowSchema>;
export type LowStockPreview = z.infer<typeof lowStockPreviewSchema>;
export type WarehouseOccupancyRow = z.infer<typeof warehouseOccupancyRowSchema>;
export type WarehouseOccupancyPreview = z.infer<
  typeof warehouseOccupancyPreviewSchema
>;
export type MovementsReportRow = z.infer<typeof movementsReportRowSchema>;
export type MovementsReportPreview = z.infer<
  typeof movementsReportPreviewSchema
>;
export type SalesReportRow = z.infer<typeof salesReportRowSchema>;
export type SalesReportPreview = z.infer<typeof salesReportPreviewSchema>;
export type ReceiptsReportRow = z.infer<typeof receiptsReportRowSchema>;
export type ReceiptsReportPreview = z.infer<typeof receiptsReportPreviewSchema>;
export type ReportPreview = z.infer<typeof reportPreviewSchema>;
