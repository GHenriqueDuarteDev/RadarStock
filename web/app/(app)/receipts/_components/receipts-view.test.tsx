import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReceiptsView } from "./receipts-view";

const toastAddMock = vi.fn();

vi.mock("@/components/ui/toast", () => ({
  toast: {
    add: (...args: unknown[]) => toastAddMock(...args),
  },
}));

const sampleReceipts = [
  {
    id: "rcp_1",
    code: "REC-001",
    status: "confirmed",
    warehouseId: "wh_1",
    warehouseName: "Galpão Central",
    supplierName: "Fornecedor Alpha",
    totalCost: 75,
    receivedAt: "2026-01-01T10:00:00.000Z",
    createdById: "user_1",
    createdByName: "Ana Silva",
    notes: null,
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
    items: [
      {
        id: "item_1",
        receiptId: "rcp_1",
        productId: "prod_1",
        quantity: 50,
        unitCost: 1.5,
        productName: "Parafuso M6",
        productSku: "SKU-001",
      },
    ],
  },
];

const sampleSummary = {
  total: 12,
  confirmed: 10,
  cancelled: 2,
  totalCost: 1500,
};

const sampleProducts = [
  {
    id: "prod_1",
    name: "Parafuso M6",
    sku: "SKU-001",
    barcode: null,
    description: null,
    categoryId: "cat_1",
    category: { id: "cat_1", name: "Geral" },
    cost: 1.5,
    salePrice: 20,
    minStock: 10,
    stockQuantity: 50,
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

const sampleWarehouses = [
  {
    id: "wh_1",
    name: "Galpão Central",
    code: "GAL-001",
    address: "Rua A, 100",
    capacity: 1000,
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

function paginatedResponse<T>(items: T[], total = items.length, page = 1) {
  return {
    items,
    total,
    page,
    pageSize: 10 as const,
  };
}

function jsonResponse(data: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => data,
  } as Response;
}

function isReceiptsListGet(url: string, init?: RequestInit) {
  return url.startsWith("/api/receipts?") && !init?.method;
}

function isProductsListGet(url: string, init?: RequestInit) {
  return url.startsWith("/api/products?") && !init?.method;
}

function isWarehousesListGet(url: string, init?: RequestInit) {
  return url.startsWith("/api/warehouses?") && !init?.method;
}

describe("ReceiptsView", () => {
  beforeEach(() => {
    toastAddMock.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("renders receipts returned by GET /api/receipts", async () => {
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/receipts/summary") {
        return jsonResponse(sampleSummary);
      }
      if (isReceiptsListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleReceipts, 12));
      }
      if (isProductsListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleProducts));
      }
      if (isWarehousesListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleWarehouses));
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<ReceiptsView />);

    expect(await screen.findByText("REC-001")).toBeInTheDocument();
    expect(screen.getByText("Galpão Central")).toBeInTheDocument();
    expect(screen.getByText("12 registros encontrados")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/api/receipts?page=1");
    expect(fetch).toHaveBeenCalledWith("/api/receipts/summary");
  });

  it("searches receipts by code and resets to page 1", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/receipts/summary") {
        return jsonResponse(sampleSummary);
      }
      if (isReceiptsListGet(url, init)) {
        if (url.includes("code=REC-001")) {
          return jsonResponse(paginatedResponse(sampleReceipts, 1));
        }
        return jsonResponse(paginatedResponse(sampleReceipts, 12));
      }
      if (isProductsListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleProducts));
      }
      if (isWarehousesListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleWarehouses));
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<ReceiptsView />);
    expect(await screen.findByText("REC-001")).toBeInTheDocument();

    const search = screen.getByTestId("list-panel-search");
    await user.clear(search);
    await user.type(search, "REC-001");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/receipts?page=1&code=REC-001");
    });

    expect(
      await screen.findByText("1 registros encontrados"),
    ).toBeInTheDocument();
  });

  it("loads the next page when clicking Próximo", async () => {
    const user = userEvent.setup();
    const page2Receipt = {
      ...sampleReceipts[0],
      id: "rcp_11",
      code: "REC-011",
    };

    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/receipts/summary") {
        return jsonResponse(sampleSummary);
      }
      if (isReceiptsListGet(url, init)) {
        if (url.includes("page=2")) {
          return jsonResponse(paginatedResponse([page2Receipt], 12, 2));
        }
        return jsonResponse(paginatedResponse(sampleReceipts, 12, 1));
      }
      if (isProductsListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleProducts));
      }
      if (isWarehousesListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleWarehouses));
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<ReceiptsView />);
    expect(await screen.findByText("REC-001")).toBeInTheDocument();

    await user.click(screen.getByTestId("list-panel-next"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/receipts?page=2");
    });

    expect(await screen.findByText("REC-011")).toBeInTheDocument();
  });

  it("creates a receipt through the new receipt sheet", async () => {
    const user = userEvent.setup();
    const created = {
      ...sampleReceipts[0],
      id: "rcp_2",
      code: "REC-002",
    };
    let listPayload = paginatedResponse(sampleReceipts, 12);

    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/receipts/summary") {
        return jsonResponse({ ...sampleSummary, total: 13, confirmed: 11 });
      }
      if (url === "/api/receipts" && init?.method === "POST") {
        listPayload = paginatedResponse([created, ...sampleReceipts], 13);
        return jsonResponse(created, true, 201);
      }
      if (isReceiptsListGet(url, init)) {
        return jsonResponse(listPayload);
      }
      if (isProductsListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleProducts));
      }
      if (isWarehousesListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleWarehouses));
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<ReceiptsView />);
    expect(await screen.findByText("REC-001")).toBeInTheDocument();

    await user.click(screen.getByTestId("new-receipt"));
    await user.type(screen.getByTestId("create-receipt-code"), "REC-002");
    await user.click(screen.getByTestId("create-receipt-save"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/receipts",
        expect.objectContaining({ method: "POST" }),
      );
    });

    expect(await screen.findByText("REC-002")).toBeInTheDocument();
  });

  it("cancels a receipt through the row actions menu", async () => {
    const user = userEvent.setup();
    let listPayload = paginatedResponse(sampleReceipts, 12);

    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/receipts/summary") {
        return jsonResponse({
          ...sampleSummary,
          confirmed: 9,
          cancelled: 3,
        });
      }
      if (url === "/api/receipts/rcp_1/cancel" && init?.method === "POST") {
        listPayload = paginatedResponse(
          [{ ...sampleReceipts[0], status: "cancelled" }],
          12,
        );
        return jsonResponse({ ...sampleReceipts[0], status: "cancelled" });
      }
      if (isReceiptsListGet(url, init)) {
        return jsonResponse(listPayload);
      }
      if (isProductsListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleProducts));
      }
      if (isWarehousesListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleWarehouses));
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<ReceiptsView />);
    expect(await screen.findByText("REC-001")).toBeInTheDocument();

    await user.click(screen.getByTestId("receipt-actions-rcp_1"));
    await user.click(
      await screen.findByRole("menuitem", { name: /cancelar recebimento/i }),
    );
    await user.click(await screen.findByTestId("cancel-receipt-confirm"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/receipts/rcp_1/cancel", {
        method: "POST",
      });
    });

    const row = screen.getByText("REC-001").closest("tr");
    expect(row).not.toBeNull();
    expect(within(row!).getByText("Cancelado")).toBeInTheDocument();
  });
});
