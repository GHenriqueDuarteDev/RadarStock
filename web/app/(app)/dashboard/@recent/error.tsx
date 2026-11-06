"use client";

import { SectionErrorCard } from "@/components/section-error";

export default function RecentError({ retry }: { retry: () => void }) {
  return (
    <SectionErrorCard
      title="Movimentações recentes"
      description="Não foi possível carregar as movimentações recentes."
      retry={retry}
      className="h-full"
    />
  );
}
