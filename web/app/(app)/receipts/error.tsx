"use client";

import { RouteError } from "../_components/route-error";

export default function ReceiptsError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <RouteError title="Recebimentos indisponíveis" error={error} retry={retry} />
  );
}
