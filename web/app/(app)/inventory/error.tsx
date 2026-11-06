"use client";

import { RouteError } from "../_components/route-error";

export default function InventoryError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <RouteError title="Inventário indisponível" error={error} retry={retry} />
  );
}
