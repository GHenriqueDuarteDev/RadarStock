"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BellIcon, PlusIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";

const pageTitles: Record<string, string> = {
  "/dashboard": "Visão geral",
  "/products": "Produtos",
  "/warehouses": "Galpões",
  "/movements": "Movimentações",
  "/sales": "Vendas",
  "/team": "Equipe",
  "/settings": "Configurações",
};

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDateTime(date: Date) {
  const formatted = dateTimeFormatter.format(date);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export function AppHeader() {
  const pathname = usePathname();
  const pageTitle = pageTitles[pathname] ?? "RadarStock";

  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="flex items-center justify-between gap-4 border-b-2 border-border bg-card px-4 py-3">
      <div className="flex min-w-0 items-center gap-2">
        <SidebarTrigger />
        <div className="flex min-w-0 flex-col leading-tight">
          <span
            className="font-mono text-xs text-muted-foreground"
            suppressHydrationWarning
          >
            {formatDateTime(now)}
          </span>
          <span className="truncate text-sm font-semibold tracking-tight">
            {pageTitle}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="relative hidden w-56 sm:block md:w-64">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar produto, SKU..."
            className="h-8 pl-8"
            aria-label="Buscar produto ou SKU"
          />
        </div>

        <Button
          type="button"
          variant="secondary"
          size="icon"
          aria-label="Notificações"
          className="relative"
        >
          <BellIcon />
          <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-destructive" />
        </Button>

        <Button type="button" size="default">
          <PlusIcon data-icon="inline-start" />
          Ação rápida
        </Button>
      </div>
    </header>
  );
}
