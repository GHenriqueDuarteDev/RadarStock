"use server";

import { revalidatePath } from "next/cache";
import {
  productInputSchema,
  publicProductSchema,
  updateProductInputSchema,
  type PublicProduct,
} from "@radarstock/contracts";

import { mutateApi, type ActionResult } from "@/app/_lib/server-api";

export async function createProductAction(
  input: unknown,
): Promise<ActionResult<PublicProduct>> {
  const parsed = productInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Dados de produto inválidos." };
  }

  const result = await mutateApi("/products", {
    method: "POST",
    body: parsed.data,
    schema: publicProductSchema,
  });

  if (result.ok) {
    revalidatePath("/products");
  }
  return result;
}

export async function updateProductAction(
  id: string,
  input: unknown,
): Promise<ActionResult<PublicProduct>> {
  const parsed = updateProductInputSchema.safeParse(input);
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return { ok: false, message: "Dados de atualização inválidos." };
  }

  const result = await mutateApi(`/products/${id}`, {
    method: "PATCH",
    body: parsed.data,
    schema: publicProductSchema,
  });

  if (result.ok) {
    revalidatePath("/products");
  }
  return result;
}

export async function deactivateProductAction(
  id: string,
): Promise<ActionResult> {
  const result = await mutateApi(`/products/${id}`, { method: "DELETE" });

  if (result.ok) {
    revalidatePath("/products");
  }
  return result;
}
