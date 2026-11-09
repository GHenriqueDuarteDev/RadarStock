"use client";

import { useEffect } from "react";

import { SectionErrorCard } from "@/components/section-error";

export function RouteError({
  title,
  error,
  retry,
}: {
  title: string;
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <SectionErrorCard title={title} retry={retry} />;
}
