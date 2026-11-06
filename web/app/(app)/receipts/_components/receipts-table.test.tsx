import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/receipts",
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock("../_actions", () => ({
  cancelReceiptAction: vi.fn(),
}));

import { ReceiptsTable } from "./receipts-table";

describe("ReceiptsTable", () => {
  it("renders receipts received from the server", () => {
    render(
      <ReceiptsTable
        data={[
          {
            id: "rec_1",
            code: "RC-001",
            status: "confirmed",
            warehouseId: "wh_1",
            warehouseName: "Central",
            supplierName: "Fornecedor A",
            totalCost: 50,
            receivedAt: new Date("2026-01-02T10:00:00.000Z"),
            createdById: "user_1",
            createdByName: "Ana",
            notes: null,
            createdAt: new Date("2026-01-02T10:00:00.000Z"),
            updatedAt: new Date("2026-01-02T10:00:00.000Z"),
            items: [
              {
                id: "item_1",
                receiptId: "rec_1",
                productId: "prod_1",
                quantity: 10,
                unitCost: 5,
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

    expect(screen.getByText("RC-001")).toBeInTheDocument();
    expect(screen.getByText("Fornecedor A")).toBeInTheDocument();
    expect(screen.getByText("1 registros encontrados")).toBeInTheDocument();
  });
});
