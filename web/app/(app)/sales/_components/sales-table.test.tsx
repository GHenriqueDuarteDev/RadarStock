import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/sales",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("../_actions", () => ({
  cancelSaleAction: vi.fn(),
}));

import { SalesTable } from "./sales-table";

describe("SalesTable", () => {
  it("renders sales received from the server", () => {
    render(
      <SalesTable
        data={[
          {
            id: "sale_1",
            code: "VD-001",
            status: "confirmed",
            warehouseId: "wh_1",
            warehouseName: "Central",
            totalAmount: 199.9,
            soldAt: new Date("2026-01-02T10:00:00.000Z"),
            createdById: "user_1",
            createdByName: "Ana",
            notes: null,
            createdAt: new Date("2026-01-02T10:00:00.000Z"),
            updatedAt: new Date("2026-01-02T10:00:00.000Z"),
            items: [
              {
                id: "item_1",
                saleId: "sale_1",
                productId: "prod_1",
                quantity: 2,
                unitPrice: 99.95,
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

    expect(screen.getByText("VD-001")).toBeInTheDocument();
    expect(screen.getByText("Central")).toBeInTheDocument();
    expect(screen.getByText("Confirmada")).toBeInTheDocument();
    expect(screen.getByText("1 registros encontrados")).toBeInTheDocument();
  });
});
