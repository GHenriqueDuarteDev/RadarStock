import type { AnchorHTMLAttributes, ReactNode } from "react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
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
  SidebarTrigger: () => <button type="button">Sidebar</button>,
}));

import { AppHeader } from "./app-header";

describe("AppHeader quick actions", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ totalOpen: 0, unreadCount: 0, items: [] }),
      }),
    );
  });

  it("shows ops actions for operator and hides master-data/team", async () => {
    const user = userEvent.setup();

    render(
      <AppHeader
        user={{
          id: "u1",
          email: "op@radarstock.local",
          role: "operator",
        }}
      />,
    );

    await user.click(screen.getByTestId("quick-actions-trigger"));
    const menu = await screen.findByTestId("quick-actions-menu");

    expect(
      await screen.findByRole("menuitem", { name: /nova movimentação/i }),
    ).toHaveAttribute("href", "/movements?new=1");
    expect(
      screen.getByRole("menuitem", { name: /nova venda/i }),
    ).toHaveAttribute("href", "/sales?new=1");
    expect(
      screen.queryByRole("menuitem", { name: /novo produto/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: /novo galpão/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("menuitem", { name: /novo membro/i }),
    ).not.toBeInTheDocument();
    expect(menu).toBeInTheDocument();
  });

  it("hides quick actions entirely for viewer", () => {
    render(
      <AppHeader
        user={{
          id: "v1",
          email: "viewer@radarstock.local",
          role: "viewer",
        }}
      />,
    );

    expect(screen.queryByTestId("quick-actions-trigger")).not.toBeInTheDocument();
  });

  it("shows team action for admin users", async () => {
    const user = userEvent.setup();

    render(
      <AppHeader
        user={{
          id: "u1",
          email: "admin@radarstock.local",
          role: "admin",
        }}
      />,
    );

    await user.click(screen.getByTestId("quick-actions-trigger"));

    expect(
      await screen.findByRole("menuitem", { name: /novo membro/i }),
    ).toHaveAttribute("href", "/team?new=1");
  });
});
