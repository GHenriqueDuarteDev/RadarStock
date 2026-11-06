import { z } from "zod";

export const PAGE_SIZE = 10;

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
});

export function createPaginatedSchema<T extends z.ZodType>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().min(1),
    pageSize: z.literal(PAGE_SIZE),
  });
}

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
