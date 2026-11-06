"use server";

import { revalidatePath } from "next/cache";
import {
  adminCreateUserSchema,
  publicUserRecordSchema,
  updateUserRoleSchema,
  userInputSchema,
  type PublicUserRecord,
} from "@radarstock/contracts";

import { mutateApi, type ActionResult } from "@/app/_lib/server-api";

export async function createUserAction(
  input: unknown,
): Promise<ActionResult<PublicUserRecord>> {
  const parsed = adminCreateUserSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Dados de membro inválidos." };
  }

  const result = await mutateApi("/users", {
    method: "POST",
    body: parsed.data,
    schema: publicUserRecordSchema,
  });

  if (result.ok) {
    revalidatePath("/team");
  }
  return result;
}

export async function updateUserAction(
  id: string,
  input: unknown,
): Promise<ActionResult<PublicUserRecord>> {
  const parsed = userInputSchema.partial().safeParse(input);
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return { ok: false, message: "Dados de atualização inválidos." };
  }

  const result = await mutateApi(`/users/${id}`, {
    method: "PATCH",
    body: parsed.data,
    schema: publicUserRecordSchema,
  });

  if (result.ok) {
    revalidatePath("/team");
  }
  return result;
}

export async function updateUserRoleAction(
  id: string,
  input: unknown,
): Promise<ActionResult<PublicUserRecord>> {
  const parsed = updateUserRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Permissão inválida." };
  }

  const result = await mutateApi(`/users/${id}/role`, {
    method: "PATCH",
    body: parsed.data,
    schema: publicUserRecordSchema,
  });

  if (result.ok) {
    revalidatePath("/team");
  }
  return result;
}

export async function deleteUserAction(id: string): Promise<ActionResult> {
  const result = await mutateApi(`/users/${id}`, { method: "DELETE" });

  if (result.ok) {
    revalidatePath("/team");
  }
  return result;
}
