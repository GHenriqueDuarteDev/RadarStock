"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftRightIcon,
  BarChart3Icon,
  ClipboardListIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MoreHorizontalIcon,
  PackageIcon,
  SettingsIcon,
  ShoppingCartIcon,
  TruckIcon,
  UsersIcon,
  WarehouseIcon,
  type LucideIcon,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  icon: LucideIcon;
  href?: string;
};

const items: NavItem[] = [
  { title: "Visão geral", href: "/dashboard", icon: LayoutDashboardIcon },
  { title: "Produtos", href: "/products", icon: PackageIcon },
  { title: "Galpões", icon: WarehouseIcon },
  { title: "Movimentações", icon: ArrowLeftRightIcon },
  { title: "Vendas", icon: ShoppingCartIcon },
  { title: "Recebimentos", icon: TruckIcon },
  { title: "Inventário", icon: ClipboardListIcon },
  { title: "Relatórios", icon: BarChart3Icon },
  { title: "Equipe", icon: UsersIcon },
];

type SidebarUser = {
  id: string;
  email: string;
};

function displayNameFromEmail(email: string) {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function initialsFromEmail(email: string) {
  const name = displayNameFromEmail(email);
  const parts = name.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0]}${parts[1]![0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function logout() {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "/api/logout";
  document.body.appendChild(form);
  form.submit();
}

export function AppSidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<SidebarUser | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const response = await fetch("/api/me");
        if (!response.ok) return;
        const data = (await response.json()) as SidebarUser;
        if (!cancelled) setUser(data);
      } catch {
        if (!cancelled) setUser(null);
      }
    }

    void loadUser();

    return () => {
      cancelled = true;
    };
  }, []);

  const displayName = user ? displayNameFromEmail(user.email) : "Usuário";
  const initials = user ? initialsFromEmail(user.email) : "US";
  const email = user?.email ?? "";

  return (
    <Sidebar>
      <SidebarHeader className="border-b-2 border-sidebar-border px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <PackageIcon className="size-4" />
          </div>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="font-mono text-sm font-semibold tracking-tight">
              RadarStock
            </span>
            <span className="font-mono text-xs text-muted-foreground tracking-tight">
              Gestão Inteligente
            </span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.href ? (
                    <SidebarMenuButton
                      size="lg"
                      render={<Link href={item.href} />}
                      isActive={pathname === item.href}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  ) : (
                    <SidebarMenuButton size="lg">
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t-2 border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1.5">
          <Avatar size="lg" className="size-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-1 flex-col leading-tight">
            <span className="truncate text-sm font-semibold tracking-tight">
              {displayName}
            </span>
            <span className="truncate font-mono text-xs text-muted-foreground">
              Cárgo
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Menu do usuário"
                />
              }
            >
              <MoreHorizontalIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="min-w-56 rounded-lg"
              side="right"
              align="end"
              sideOffset={8}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar size="sm" className="size-8">
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {displayName}
                      </span>
                      <span className="truncate font-mono text-xs text-muted-foreground">
                        {email}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <SettingsIcon />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onClick={logout}>
                <LogOutIcon />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
