import { z } from "zod";

export const publicStockBalanceSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  warehouseId: z.string().min(1),
  quantity: z.number().int().nonnegative(),
  updatedAt: z.coerce.date(),
});

export type PublicStockBalance = z.infer<typeof publicStockBalanceSchema>;
