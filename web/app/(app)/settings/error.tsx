"use client";

import { RouteError } from "../_components/route-error";

export default function SettingsError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  return (
    <RouteError title="Configurações indisponíveis" error={error} retry={retry} />
  );
}
