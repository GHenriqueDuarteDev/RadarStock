"use client";

import { RouteError } from "../_components/route-error";

export default function SalesError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return <RouteError title="Vendas indisponíveis" error={error} retry={retry} />;
}
