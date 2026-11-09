import { cache } from "react";
import {
  paginatedProductsSchema,
  paginatedWarehousesSchema,
  type PublicProduct,
  type PublicWarehouse,
} from "@radarstock/contracts";
import type { ZodType } from "zod";

import { fetchFromApi } from "@/app/_lib/server-api";

type Paginated<T> = {
  items: T[];
  total: number;
};

async function fetchAllPages<T>(
  pathForPage: (page: number) => string,
  schema: ZodType<Paginated<T>>,
): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  let total = Number.POSITIVE_INFINITY;

  while (items.length < total) {
    const data = await fetchFromApi(pathForPage(page), schema);
    total = data.total;
    items.push(...data.items);
    if (data.items.length === 0) {
      break;
    }
    page += 1;
  }

  return items;
}

export const getActiveProducts = cache(async (): Promise<PublicProduct[]> => {
  const items = await fetchAllPages(
    (page) => `/products?page=${page}`,
    paginatedProductsSchema,
  );
  return items.filter((product) => product.status === "active");
});

export const getActiveWarehouses = cache(
  async (): Promise<PublicWarehouse[]> => {
    const items = await fetchAllPages(
      (page) => `/warehouses?page=${page}`,
      paginatedWarehousesSchema,
    );
    return items.filter((warehouse) => warehouse.status === "active");
  },
);
