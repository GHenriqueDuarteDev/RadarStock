"use client";

import { SectionErrorCard } from "@/components/section-error";

export default function DistributionError({ retry }: { retry: () => void }) {
  return (
    <SectionErrorCard
      title="Distribuição por galpão"
      description="Não foi possível carregar a distribuição do estoque."
      retry={retry}
      className="h-full"
    />
  );
}
