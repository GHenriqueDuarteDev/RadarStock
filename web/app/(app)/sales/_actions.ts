"use server";

import { revalidatePath } from "next/cache";
import {
  publicSaleSchema,
  saleInputSchema,
  type PublicSale,
} from "@radarstock/contracts";

import { mutateApi, type ActionResult } from "@/app/_lib/server-api";

export async function createSaleAction(
  input: unknown,
): Promise<ActionResult<PublicSale>> {
  const parsed = saleInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Dados de venda inválidos." };
  }

  const result = await mutateApi("/sales", {
    method: "POST",
    body: parsed.data,
    schema: publicSaleSchema,
  });

  if (result.ok) {
    revalidatePath("/sales");
  }
  return result;
}

export async function cancelSaleAction(
  id: string,
): Promise<ActionResult<PublicSale>> {
  const result = await mutateApi(`/sales/${id}/cancel`, {
    method: "POST",
    schema: publicSaleSchema,
  });

  if (result.ok) {
    revalidatePath("/sales");
  }
  return result;
}
