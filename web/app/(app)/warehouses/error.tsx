"use client";

import { RouteError } from "../_components/route-error";

export default function WarehousesError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <RouteError title="Galpões indisponíveis" error={error} retry={retry} />
  );
}
