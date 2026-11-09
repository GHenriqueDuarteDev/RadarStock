import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/warehouses",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("../_actions", () => ({
  createWarehouseAction: vi.fn(),
  updateWarehouseAction: vi.fn(),
  deactivateWarehouseAction: vi.fn(),
}));

import { WarehousesTable } from "./warehouses-table";

describe("WarehousesTable", () => {
  it("renders warehouses received from the server", () => {
    render(
      <WarehousesTable
        data={[
          {
            id: "wh_1",
            name: "Galpão Central",
            code: "GC-01",
            address: "Rua A",
            capacity: 1000,
            status: "active",
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            updatedAt: new Date("2026-01-01T00:00:00.000Z"),
          },
        ]}
        total={1}
        page={1}
        pageSize={10}
      />,
    );

    expect(screen.getByText("Galpão Central")).toBeInTheDocument();
    expect(screen.getByText("GC-01")).toBeInTheDocument();
    expect(screen.getByText("1 registros encontrados")).toBeInTheDocument();
  });
});
