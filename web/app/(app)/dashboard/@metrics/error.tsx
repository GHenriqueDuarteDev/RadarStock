"use client";

import { SectionErrorCard } from "@/components/section-error";

export default function MetricsError({ retry }: { retry: () => void }) {
  return <SectionErrorCard title="Indicadores indisponíveis" retry={retry} />;
}
