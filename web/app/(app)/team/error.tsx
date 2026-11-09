"use client";

import { RouteError } from "../_components/route-error";

export default function TeamError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return <RouteError title="Equipe indisponível" error={error} retry={retry} />;
}
