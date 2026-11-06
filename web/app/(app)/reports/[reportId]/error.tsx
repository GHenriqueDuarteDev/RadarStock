"use client";

import { RouteError } from "../../_components/route-error";

export default function ReportError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <RouteError title="Relatório indisponível" error={error} retry={retry} />
  );
}
