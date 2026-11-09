"use server";

import { revalidatePath } from "next/cache";
import {
  publicReceiptSchema,
  receiptInputSchema,
  type PublicReceipt,
} from "@radarstock/contracts";

import { mutateApi, type ActionResult } from "@/app/_lib/server-api";

export async function createReceiptAction(
  input: unknown,
): Promise<ActionResult<PublicReceipt>> {
  const parsed = receiptInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Dados de recebimento inválidos." };
  }

  const result = await mutateApi("/receipts", {
    method: "POST",
    body: parsed.data,
    schema: publicReceiptSchema,
  });

  if (result.ok) {
    revalidatePath("/receipts");
  }
  return result;
}

export async function cancelReceiptAction(
  id: string,
): Promise<ActionResult<PublicReceipt>> {
  const result = await mutateApi(`/receipts/${id}/cancel`, {
    method: "POST",
    schema: publicReceiptSchema,
  });

  if (result.ok) {
    revalidatePath("/receipts");
  }
  return result;
}
