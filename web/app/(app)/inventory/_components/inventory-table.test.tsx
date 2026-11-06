import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/inventory",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("../_actions", () => ({
  getWarehouseBalancesAction: vi.fn(),
  confirmInventoryAction: vi.fn(),
  cancelInventoryAction: vi.fn(),
  updateInventoryAction: vi.fn(),
}));

import { InventoryTable } from "./inventory-table";

describe("InventoryTable", () => {
  it("renders inventory counts received from the server", () => {
    render(
      <InventoryTable
        data={[
          {
            id: "inv_1",
            code: "INV-001",
            warehouseId: "wh_1",
            warehouseName: "Central",
            status: "draft",
            countedAt: null,
            createdById: "user_1",
            createdByName: "Ana",
            notes: null,
            createdAt: new Date("2026-01-02T10:00:00.000Z"),
            updatedAt: new Date("2026-01-02T10:00:00.000Z"),
            items: [
              {
                id: "item_1",
                inventoryCountId: "inv_1",
                productId: "prod_1",
                expectedQty: 10,
                countedQty: 8,
                variance: -2,
                productName: "Parafuso",
                productSku: "PAR-1",
              },
            ],
          },
        ]}
        total={1}
        page={1}
        pageSize={10}
      />,
    );

    expect(screen.getByText("INV-001")).toBeInTheDocument();
    expect(screen.getByText("Central")).toBeInTheDocument();
    expect(screen.getByText("Rascunho")).toBeInTheDocument();
    expect(screen.getByText("1 registros encontrados")).toBeInTheDocument();
  });
});
