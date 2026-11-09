"use server";

import { revalidatePath } from "next/cache";
import {
  publicWarehouseSchema,
  updateWarehouseInputSchema,
  warehouseInputSchema,
  type PublicWarehouse,
} from "@radarstock/contracts";

import { mutateApi, type ActionResult } from "@/app/_lib/server-api";

export async function createWarehouseAction(
  input: unknown,
): Promise<ActionResult<PublicWarehouse>> {
  const parsed = warehouseInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Dados de galpão inválidos." };
  }

  const result = await mutateApi("/warehouses", {
    method: "POST",
    body: parsed.data,
    schema: publicWarehouseSchema,
  });

  if (result.ok) {
    revalidatePath("/warehouses");
  }
  return result;
}

export async function updateWarehouseAction(
  id: string,
  input: unknown,
): Promise<ActionResult<PublicWarehouse>> {
  const parsed = updateWarehouseInputSchema.safeParse(input);
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return { ok: false, message: "Dados de atualização inválidos." };
  }

  const result = await mutateApi(`/warehouses/${id}`, {
    method: "PATCH",
    body: parsed.data,
    schema: publicWarehouseSchema,
  });

  if (result.ok) {
    revalidatePath("/warehouses");
  }
  return result;
}

export async function deactivateWarehouseAction(
  id: string,
): Promise<ActionResult> {
  const result = await mutateApi(`/warehouses/${id}`, { method: "DELETE" });

  if (result.ok) {
    revalidatePath("/warehouses");
  }
  return result;
}
