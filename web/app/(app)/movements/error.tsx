"use client";

import { RouteError } from "../_components/route-error";

export default function MovementsError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <RouteError
      title="Movimentações indisponíveis"
      error={error}
      retry={retry}
    />
  );
}
