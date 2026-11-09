import type { AnchorHTMLAttributes, ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children?: ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/ui/sidebar", () => ({
  Sidebar: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SidebarHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SidebarContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SidebarGroup: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SidebarGroupLabel: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarGroupContent: ({ children }: { children: ReactNode }) => (
    <div>{children}</div>
  ),
  SidebarMenu: ({ children }: { children: ReactNode }) => <ul>{children}</ul>,
  SidebarMenuItem: ({ children }: { children: ReactNode }) => <li>{children}</li>,
  SidebarMenuButton: ({
    children,
    render,
  }: {
    children: ReactNode;
    render?: ReactNode;
    size?: string;
    isActive?: boolean;
  }) => {
    if (render && typeof render === "object" && "props" in (render as object)) {
      const link = render as { props: { href: string } };
      return <a href={link.props.href}>{children}</a>;
    }
    return <button type="button">{children}</button>;
  },
}));

import { AppSidebar } from "./app-sidebar";

describe("AppSidebar RBAC", () => {
  it("hides Equipe and Configurações for viewer", () => {
    render(
      <AppSidebar
        user={{ id: "v1", email: "viewer@radarstock.local", role: "viewer" }}
      />,
    );

    expect(screen.queryByRole("link", { name: /equipe/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: /configurações/i }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /visão geral/i })).toBeInTheDocument();
    expect(screen.getByText("Visualizador")).toBeInTheDocument();
  });

  it("shows Configurações but not Equipe for manager", () => {
    render(
      <AppSidebar
        user={{
          id: "m1",
          email: "manager@radarstock.local",
          role: "manager",
        }}
      />,
    );

    expect(screen.getByRole("link", { name: /configurações/i })).toHaveAttribute(
      "href",
      "/settings",
    );
    expect(screen.queryByRole("link", { name: /equipe/i })).not.toBeInTheDocument();
    expect(screen.getByText("Gerente")).toBeInTheDocument();
  });

  it("shows Equipe and Configurações for admin", () => {
    render(
      <AppSidebar
        user={{ id: "a1", email: "admin@radarstock.local", role: "admin" }}
      />,
    );

    expect(screen.getByRole("link", { name: /equipe/i })).toHaveAttribute(
      "href",
      "/team",
    );
    expect(screen.getByRole("link", { name: /configurações/i })).toHaveAttribute(
      "href",
      "/settings",
    );
    expect(screen.getByText("Administrador")).toBeInTheDocument();
  });
});
