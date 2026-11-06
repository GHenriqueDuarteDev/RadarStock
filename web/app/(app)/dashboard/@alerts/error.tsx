"use client";

import { SectionErrorCard } from "@/components/section-error";

export default function AlertsError({ retry }: { retry: () => void }) {
  return (
    <SectionErrorCard
      title="Alertas operacionais"
      description="Não foi possível carregar os alertas."
      retry={retry}
      className="h-full"
    />
  );
}
