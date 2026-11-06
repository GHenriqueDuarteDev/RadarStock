"use server";

import { revalidatePath } from "next/cache";
import {
  alertKindSchema,
  alertRuleSchema,
  categoryInputSchema,
  publicCategorySchema,
  updateAlertRuleSchema,
  updateCategoryInputSchema,
  type AlertRule,
  type PublicCategory,
} from "@radarstock/contracts";

import { mutateApi, type ActionResult } from "@/app/_lib/server-api";

export async function createCategoryAction(
  input: unknown,
): Promise<ActionResult<PublicCategory>> {
  const parsed = categoryInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Dados de categoria inválidos." };
  }

  const result = await mutateApi("/categories", {
    method: "POST",
    body: parsed.data,
    schema: publicCategorySchema,
  });

  if (result.ok) {
    revalidatePath("/settings");
  }
  return result;
}

export async function updateCategoryAction(
  id: string,
  input: unknown,
): Promise<ActionResult<PublicCategory>> {
  const parsed = updateCategoryInputSchema.safeParse(input);
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return { ok: false, message: "Dados de atualização inválidos." };
  }

  const result = await mutateApi(`/categories/${id}`, {
    method: "PATCH",
    body: parsed.data,
    schema: publicCategorySchema,
  });

  if (result.ok) {
    revalidatePath("/settings");
  }
  return result;
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  const result = await mutateApi(`/categories/${id}`, { method: "DELETE" });

  if (result.ok) {
    revalidatePath("/settings");
  }
  return result;
}

export async function updateAlertRuleAction(
  kind: string,
  input: unknown,
): Promise<ActionResult<AlertRule>> {
  const kindParsed = alertKindSchema.safeParse(kind);
  const bodyParsed = updateAlertRuleSchema.safeParse(input);
  if (!kindParsed.success || !bodyParsed.success) {
    return { ok: false, message: "Dados do gatilho inválidos." };
  }

  const result = await mutateApi(`/alert-rules/${kindParsed.data}`, {
    method: "PATCH",
    body: bodyParsed.data,
    schema: alertRuleSchema,
  });

  if (result.ok) {
    revalidatePath("/settings");
  }
  return result;
}
