import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/movements",
  useSearchParams: () => new URLSearchParams(),
}));

import { MovementsTable } from "./movements-table";

describe("MovementsTable", () => {
  it("renders movements received from the server", () => {
    render(
      <MovementsTable
        data={[
          {
            id: "mov_1",
            type: "in",
            productId: "prod_1",
            quantity: 12,
            fromWarehouseId: null,
            toWarehouseId: "wh_1",
            userId: "user_1",
            note: null,
            referenceType: "manual",
            referenceId: null,
            createdAt: new Date("2026-01-02T10:00:00.000Z"),
            productName: "Parafuso",
            productSku: "PAR-1",
            fromWarehouseName: null,
            toWarehouseName: "Central",
            userName: "Ana",
          },
        ]}
        total={1}
        page={1}
        pageSize={10}
      />,
    );

    expect(screen.getByText("Parafuso")).toBeInTheDocument();
    expect(screen.getByText("PAR-1")).toBeInTheDocument();
    expect(screen.getByText("Entrada")).toBeInTheDocument();
    expect(screen.getByText("1 registros encontrados")).toBeInTheDocument();
  });
});
