import { z } from "zod";

import { documentStatusSchema } from "./enums";

export const receiptItemInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  unitCost: z.number().nonnegative(),
});

export const receiptInputSchema = z.object({
  code: z.string().min(1),
  warehouseId: z.string().min(1),
  supplierName: z.string().min(1).optional(),
  receivedAt: z.coerce.date(),
  notes: z.string().optional(),
  items: z.array(receiptItemInputSchema).min(1),
});

export const updateReceiptInputSchema = z.object({
  code: z.string().min(1).optional(),
  warehouseId: z.string().min(1).optional(),
  supplierName: z.string().min(1).nullable().optional(),
  receivedAt: z.coerce.date().optional(),
  notes: z.string().nullable().optional(),
  items: z.array(receiptItemInputSchema).min(1).optional(),
});

export const publicReceiptItemSchema = z.object({
  id: z.string().min(1),
  receiptId: z.string().min(1),
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
  unitCost: z.number().nonnegative(),
});

export const publicReceiptSchema = z.object({
  id: z.string().min(1),
  code: z.string().min(1),
  status: documentStatusSchema,
  warehouseId: z.string().min(1),
  supplierName: z.string().nullable(),
  receivedAt: z.coerce.date(),
  createdById: z.string().min(1),
  notes: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  items: z.array(publicReceiptItemSchema).optional(),
});

export type ReceiptItemInput = z.infer<typeof receiptItemInputSchema>;
export type ReceiptInput = z.infer<typeof receiptInputSchema>;
export type UpdateReceiptInput = z.infer<typeof updateReceiptInputSchema>;
export type PublicReceiptItem = z.infer<typeof publicReceiptItemSchema>;
export type PublicReceipt = z.infer<typeof publicReceiptSchema>;
