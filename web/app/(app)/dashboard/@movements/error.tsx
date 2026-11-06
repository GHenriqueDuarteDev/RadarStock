"use client";

import { SectionErrorCard } from "@/components/section-error";

export default function MovementsError({ retry }: { retry: () => void }) {
  return (
    <SectionErrorCard
      title="Movimentação do estoque"
      description="Não foi possível carregar a série de movimentações."
      retry={retry}
      className="h-full"
    />
  );
}
