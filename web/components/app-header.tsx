"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  alertBadgeSchema,
  alertsListSchema,
  type AlertBadge,
  type PublicAlert,
} from "@radarstock/contracts";
import { BellIcon, PlusIcon, SearchIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";

const pageTitles: Record<string, string> = {
  "/dashboard": "Visão geral",
  "/products": "Produtos",
  "/warehouses": "Galpões",
  "/movements": "Movimentações",
  "/sales": "Vendas",
  "/receipts": "Recebimentos",
  "/inventory": "Inventário",
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
  const [badge, setBadge] = useState<AlertBadge>({
    totalOpen: 0,
    unreadCount: 0,
  });
  const [items, setItems] = useState<PublicAlert[]>([]);
  const [loadingPanel, setLoadingPanel] = useState(false);

  const loadBadge = useCallback(async () => {
    const response = await fetch("/api/alerts/badge");
    if (!response.ok) {
      return;
    }
    const data = alertBadgeSchema.parse(await response.json());
    setBadge(data);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    void loadBadge();
    const timer = setInterval(() => {
      void loadBadge();
    }, 60_000);
    return () => clearInterval(timer);
  }, [loadBadge]);

  async function handleOpenChange(open: boolean) {
    if (!open) {
      return;
    }

    setLoadingPanel(true);
    try {
      const listResponse = await fetch("/api/alerts?status=open&limit=10");
      if (listResponse.ok) {
        const list = alertsListSchema.parse(await listResponse.json());
        setItems(list.items);
      }

      const markResponse = await fetch("/api/alerts/mark-read", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({}),
      });
      if (markResponse.ok) {
        const nextBadge = alertBadgeSchema.parse(await markResponse.json());
        setBadge(nextBadge);
      }
    } finally {
      setLoadingPanel(false);
    }
  }

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

        <DropdownMenu onOpenChange={(open) => void handleOpenChange(open)}>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="secondary"
                size="icon"
                aria-label="Notificações"
                className="relative"
                data-testid="notifications-bell"
              />
            }
          >
            <BellIcon />
            {badge.unreadCount > 0 ? (
              <span
                className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-destructive"
                data-testid="notifications-unread-dot"
              />
            ) : null}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-0">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="border-b-2 border-border px-3 py-2">
                Notificações
              </DropdownMenuLabel>
              <div className="max-h-80 overflow-y-auto p-2">
                {loadingPanel ? (
                  <p className="px-2 py-3 text-sm text-muted-foreground">
                    Carregando...
                  </p>
                ) : items.length === 0 ? (
                  <p className="px-2 py-3 text-sm text-muted-foreground">
                    Sem notificações
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {items.map((alert) => (
                      <li
                        key={alert.id}
                        className="rounded-none border-2 border-border px-2 py-2"
                      >
                        <p className="text-sm font-semibold tracking-tight">
                          {alert.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {alert.detail}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button type="button" size="default">
          <PlusIcon data-icon="inline-start" />
          Ação rápida
        </Button>
      </div>
    </header>
  );
}
