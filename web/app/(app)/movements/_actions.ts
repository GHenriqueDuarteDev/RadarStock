"use server";

import { revalidatePath } from "next/cache";
import {
  publicStockMovementSchema,
  stockMovementInputSchema,
  type PublicStockMovement,
} from "@radarstock/contracts";

import { mutateApi, type ActionResult } from "@/app/_lib/server-api";

export async function createMovementAction(
  input: unknown,
): Promise<ActionResult<PublicStockMovement>> {
  const parsed = stockMovementInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Dados de movimentação inválidos." };
  }

  const result = await mutateApi("/movements", {
    method: "POST",
    body: parsed.data,
    schema: publicStockMovementSchema,
  });

  if (result.ok) {
    revalidatePath("/movements");
  }
  return result;
}
