"use client";

import { useEffect } from "react";

import { SectionErrorCard } from "@/components/section-error";

export default function AppError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <SectionErrorCard
      title="Algo deu errado"
      description="Não foi possível carregar esta página. Tente novamente."
      retry={retry}
    />
  );
}
