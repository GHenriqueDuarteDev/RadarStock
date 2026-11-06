"use server";

import { revalidatePath } from "next/cache";
import {
  inventoryCountInputSchema,
  publicInventoryCountSchema,
  updateInventoryCountInputSchema,
  warehouseBalancesSchema,
  type PublicInventoryCount,
  type WarehouseBalances,
} from "@radarstock/contracts";

import { ApiRequestError, fetchFromApi, mutateApi, type ActionResult } from "@/app/_lib/server-api";

export async function getWarehouseBalancesAction(
  warehouseId: string,
): Promise<ActionResult<WarehouseBalances>> {
  try {
    const data = await fetchFromApi(
      `/warehouses/${warehouseId}/balances`,
      warehouseBalancesSchema,
    );
    return { ok: true, data };
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { ok: false, message: error.message };
    }
    throw error;
  }
}

export async function createInventoryAction(
  input: unknown,
): Promise<ActionResult<PublicInventoryCount>> {
  const parsed = inventoryCountInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Dados de inventário inválidos." };
  }

  const result = await mutateApi("/inventory", {
    method: "POST",
    body: parsed.data,
    schema: publicInventoryCountSchema,
  });

  if (result.ok) {
    revalidatePath("/inventory");
  }
  return result;
}

export async function updateInventoryAction(
  id: string,
  input: unknown,
): Promise<ActionResult<PublicInventoryCount>> {
  const parsed = updateInventoryCountInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Dados de inventário inválidos." };
  }

  const result = await mutateApi(`/inventory/${id}`, {
    method: "PATCH",
    body: parsed.data,
    schema: publicInventoryCountSchema,
  });

  if (result.ok) {
    revalidatePath("/inventory");
  }
  return result;
}

export async function confirmInventoryAction(
  id: string,
): Promise<ActionResult<PublicInventoryCount>> {
  const result = await mutateApi(`/inventory/${id}/confirm`, {
    method: "POST",
    schema: publicInventoryCountSchema,
  });

  if (result.ok) {
    revalidatePath("/inventory");
  }
  return result;
}

export async function cancelInventoryAction(
  id: string,
): Promise<ActionResult<PublicInventoryCount>> {
  const result = await mutateApi(`/inventory/${id}/cancel`, {
    method: "POST",
    schema: publicInventoryCountSchema,
  });

  if (result.ok) {
    revalidatePath("/inventory");
  }
  return result;
}
