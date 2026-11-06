import { cache } from "react";
import { redirect } from "next/navigation";
import { publicUserSchema, type PublicUser } from "@radarstock/contracts";
import type { ZodType } from "zod";

import { apiHeaders } from "@/app/_lib/api";
import { getSession } from "@/app/_lib/session";

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly path: string,
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export async function requirePageSession() {
  const session = await getSession();
  if (!session.userId) {
    redirect("/login");
  }
  return { userId: session.userId };
}

async function readApiErrorMessage(response: Response, fallback: string) {
  try {
    const data = (await response.json()) as { message?: string };
    return data.message ?? fallback;
  } catch {
    return fallback;
  }
}

// Deduplicado por request (React cache): vários Server Components podem pedir o mesmo
// path na mesma renderização e só uma chamada chega à API.
export const fetchFromApi = cache(async function fetchFromApi<T>(
  path: string,
  schema: ZodType<T>,
): Promise<T> {
  const { userId } = await requirePageSession();

  const response = await fetch(`${process.env.API_URL}${path}`, {
    headers: apiHeaders(userId),
    cache: "no-store",
  });

  if (response.status === 401) {
    redirect("/login");
  }

  if (!response.ok) {
    const message = await readApiErrorMessage(
      response,
      `Falha ao carregar ${path}.`,
    );
    throw new ApiRequestError(message, response.status, path);
  }

  return schema.parse(await response.json());
});

export async function getCurrentUser(): Promise<PublicUser | null> {
  try {
    return await fetchFromApi("/auth/me", publicUserSchema);
  } catch {
    return null;
  }
}

export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; message: string };

type MutateApiOptions<T> = {
  method: "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  schema?: ZodType<T>;
};

// Usado por Server Actions: nunca lança por erro de negócio, devolve ActionResult.
export async function mutateApi<T = void>(
  path: string,
  options: MutateApiOptions<T>,
): Promise<ActionResult<T>> {
  const { userId } = await requirePageSession();

  const response = await fetch(`${process.env.API_URL}${path}`, {
    method: options.method,
    headers: apiHeaders(userId, { "content-type": "application/json" }),
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      ok: false,
      message: await readApiErrorMessage(
        response,
        "Não foi possível concluir a operação.",
      ),
    };
  }

  if (!options.schema) {
    return { ok: true, data: undefined as T };
  }

  return { ok: true, data: options.schema.parse(await response.json()) };
}
