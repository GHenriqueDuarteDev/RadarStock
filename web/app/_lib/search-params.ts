import type { ZodType } from "zod";

export type RawSearchParams = Record<string, string | string[] | undefined>;

export type PageProps<TParams = Record<string, never>> = {
  params: Promise<TParams>;
  searchParams: Promise<RawSearchParams>;
};

export function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

// A URL é a fonte de verdade do estado da lista; valores inválidos caem nos defaults do schema.
export function parseSearchParams<T>(
  schema: ZodType<T>,
  raw: RawSearchParams,
): T {
  const flattened = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, firstValue(value)]),
  );
  const parsed = schema.safeParse(flattened);
  return parsed.success ? parsed.data : schema.parse({});
}
