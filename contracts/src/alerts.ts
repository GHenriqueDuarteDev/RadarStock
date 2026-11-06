import { z } from "zod";

export const alertKindSchema = z.enum([
  "low_stock",
  "out_of_stock",
  "warehouse_near_capacity",
  "warehouse_full",
  "inventory_pending",
  "inventory_discrepancy",
  "inactive_with_stock",
]);

export const alertStatusSchema = z.enum(["open", "resolved"]);

export const alertEntityTypeSchema = z.enum([
  "product",
  "warehouse",
  "inventory_count",
]);

export const publicAlertSchema = z.object({
  id: z.string().min(1),
  kind: alertKindSchema,
  status: alertStatusSchema,
  title: z.string().min(1),
  detail: z.string().min(1),
  entityType: alertEntityTypeSchema,
  entityId: z.string().min(1),
  payload: z.record(z.string(), z.unknown()).nullable(),
  readAt: z.coerce.date().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  resolvedAt: z.coerce.date().nullable(),
});

export const listAlertsQuerySchema = z.object({
  status: alertStatusSchema.optional().default("open"),
  limit: z.coerce.number().int().positive().max(50).optional().default(20),
});

export const alertsListSchema = z.object({
  items: z.array(publicAlertSchema),
  totalOpen: z.number().int().nonnegative(),
  unreadCount: z.number().int().nonnegative(),
});

export const alertBadgeSchema = z.object({
  totalOpen: z.number().int().nonnegative(),
  unreadCount: z.number().int().nonnegative(),
});

export const alertRuleSchema = z.object({
  kind: alertKindSchema,
  enabled: z.boolean(),
  updatedAt: z.coerce.date(),
});

export const alertRulesListSchema = z.object({
  items: z.array(alertRuleSchema),
});

export const updateAlertRuleSchema = z.object({
  enabled: z.boolean(),
});

export const markAlertsReadSchema = z.object({
  ids: z.array(z.string().min(1)).optional(),
});

export type AlertKind = z.infer<typeof alertKindSchema>;
export type AlertStatus = z.infer<typeof alertStatusSchema>;
export type AlertEntityType = z.infer<typeof alertEntityTypeSchema>;
export type PublicAlert = z.infer<typeof publicAlertSchema>;
export type ListAlertsQuery = z.infer<typeof listAlertsQuerySchema>;
export type AlertsList = z.infer<typeof alertsListSchema>;
export type AlertBadge = z.infer<typeof alertBadgeSchema>;
export type AlertRule = z.infer<typeof alertRuleSchema>;
export type AlertRulesList = z.infer<typeof alertRulesListSchema>;
export type UpdateAlertRule = z.infer<typeof updateAlertRuleSchema>;
export type MarkAlertsRead = z.infer<typeof markAlertsReadSchema>;
