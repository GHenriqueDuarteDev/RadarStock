"use client";

import { RouteError } from "../_components/route-error";

export default function ReportsError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <RouteError title="Relatórios indisponíveis" error={error} retry={retry} />
  );
}
