"use client";

import { RouteError } from "../_components/route-error";

export default function ProductsError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return <RouteError title="Produtos indisponíveis" error={error} retry={retry} />;
}
