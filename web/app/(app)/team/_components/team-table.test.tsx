import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/team",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("../_actions", () => ({
  updateUserAction: vi.fn(),
  updateUserRoleAction: vi.fn(),
  deleteUserAction: vi.fn(),
}));

import { TeamTable } from "./team-table";

describe("TeamTable", () => {
  it("renders members received from the server", () => {
    render(
      <TeamTable
        data={[
          {
            id: "user_2",
            email: "ana@radarstock.dev",
            firstName: "Ana",
            lastName: "Silva",
            role: "operator",
            status: "active",
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            updatedAt: new Date("2026-01-01T00:00:00.000Z"),
          },
        ]}
        total={1}
        page={1}
        pageSize={10}
        currentUserId="user_1"
      />,
    );

    expect(screen.getByText("Ana Silva")).toBeInTheDocument();
    expect(screen.getByText("ana@radarstock.dev")).toBeInTheDocument();
    expect(screen.getByText("Operador")).toBeInTheDocument();
    expect(screen.getByText("1 registros encontrados")).toBeInTheDocument();
  });
});
