import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SalesView } from "./sales-view";

const toastAddMock = vi.fn();

vi.mock("@/components/ui/toast", () => ({
  toast: {
    add: (...args: unknown[]) => toastAddMock(...args),
  },
}));

const sampleSales = [
  {
    id: "sale_1",
    code: "VEN-001",
    status: "confirmed",
    warehouseId: "wh_1",
    warehouseName: "Galpão Central",
    totalAmount: 100,
    soldAt: "2026-01-01T10:00:00.000Z",
    createdById: "user_1",
    createdByName: "Ana Silva",
    notes: null,
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
    items: [
      {
        id: "item_1",
        saleId: "sale_1",
        productId: "prod_1",
        quantity: 5,
        unitPrice: 20,
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
  totalAmount: 1500,
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

function isSalesListGet(url: string, init?: RequestInit) {
  return url.startsWith("/api/sales?") && !init?.method;
}

function isProductsListGet(url: string, init?: RequestInit) {
  return url.startsWith("/api/products?") && !init?.method;
}

function isWarehousesListGet(url: string, init?: RequestInit) {
  return url.startsWith("/api/warehouses?") && !init?.method;
}

describe("SalesView", () => {
  beforeEach(() => {
    toastAddMock.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("renders sales returned by GET /api/sales", async () => {
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/sales/summary") {
        return jsonResponse(sampleSummary);
      }
      if (isSalesListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleSales, 12));
      }
      if (isProductsListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleProducts));
      }
      if (isWarehousesListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleWarehouses));
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<SalesView />);

    expect(await screen.findByText("VEN-001")).toBeInTheDocument();
    expect(screen.getByText("Galpão Central")).toBeInTheDocument();
    expect(screen.getByText("12 registros encontrados")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/api/sales?page=1");
    expect(fetch).toHaveBeenCalledWith("/api/sales/summary");
  });

  it("searches sales by code and resets to page 1", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/sales/summary") {
        return jsonResponse(sampleSummary);
      }
      if (isSalesListGet(url, init)) {
        if (url.includes("code=VEN-001")) {
          return jsonResponse(paginatedResponse(sampleSales, 1));
        }
        return jsonResponse(paginatedResponse(sampleSales, 12));
      }
      if (isProductsListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleProducts));
      }
      if (isWarehousesListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleWarehouses));
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<SalesView />);
    expect(await screen.findByText("VEN-001")).toBeInTheDocument();

    const search = screen.getByTestId("list-panel-search");
    await user.clear(search);
    await user.type(search, "VEN-001");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/sales?page=1&code=VEN-001");
    });

    expect(
      await screen.findByText("1 registros encontrados"),
    ).toBeInTheDocument();
  });

  it("loads the next page when clicking Próximo", async () => {
    const user = userEvent.setup();
    const page2Sale = {
      ...sampleSales[0],
      id: "sale_11",
      code: "VEN-011",
    };

    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/sales/summary") {
        return jsonResponse(sampleSummary);
      }
      if (isSalesListGet(url, init)) {
        if (url.includes("page=2")) {
          return jsonResponse(paginatedResponse([page2Sale], 12, 2));
        }
        return jsonResponse(paginatedResponse(sampleSales, 12, 1));
      }
      if (isProductsListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleProducts));
      }
      if (isWarehousesListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleWarehouses));
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<SalesView />);
    expect(await screen.findByText("VEN-001")).toBeInTheDocument();

    await user.click(screen.getByTestId("list-panel-next"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/sales?page=2");
    });

    expect(await screen.findByText("VEN-011")).toBeInTheDocument();
  });

  it("creates a sale through the new sale sheet", async () => {
    const user = userEvent.setup();
    const created = {
      ...sampleSales[0],
      id: "sale_2",
      code: "VEN-002",
    };
    let listPayload = paginatedResponse(sampleSales, 12);

    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/sales/summary") {
        return jsonResponse({ ...sampleSummary, total: 13, confirmed: 11 });
      }
      if (url === "/api/sales" && init?.method === "POST") {
        listPayload = paginatedResponse([created, ...sampleSales], 13);
        return jsonResponse(created, true, 201);
      }
      if (isSalesListGet(url, init)) {
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

    render(<SalesView />);
    expect(await screen.findByText("VEN-001")).toBeInTheDocument();

    await user.click(screen.getByTestId("new-sale"));
    await user.type(screen.getByTestId("create-sale-code"), "VEN-002");
    await user.click(screen.getByTestId("create-sale-save"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/sales",
        expect.objectContaining({ method: "POST" }),
      );
    });

    expect(await screen.findByText("VEN-002")).toBeInTheDocument();
  });

  it("cancels a sale through the row actions menu", async () => {
    const user = userEvent.setup();
    let listPayload = paginatedResponse(sampleSales, 12);

    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/sales/summary") {
        return jsonResponse({
          ...sampleSummary,
          confirmed: 9,
          cancelled: 3,
        });
      }
      if (url === "/api/sales/sale_1/cancel" && init?.method === "POST") {
        listPayload = paginatedResponse(
          [{ ...sampleSales[0], status: "cancelled" }],
          12,
        );
        return jsonResponse({ ...sampleSales[0], status: "cancelled" });
      }
      if (isSalesListGet(url, init)) {
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

    render(<SalesView />);
    expect(await screen.findByText("VEN-001")).toBeInTheDocument();

    await user.click(screen.getByTestId("sale-actions-sale_1"));
    await user.click(
      await screen.findByRole("menuitem", { name: /cancelar venda/i }),
    );
    await user.click(await screen.findByTestId("cancel-sale-confirm"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/sales/sale_1/cancel", {
        method: "POST",
      });
    });

    const row = screen.getByText("VEN-001").closest("tr");
    expect(row).not.toBeNull();
    expect(within(row!).getByText("Cancelada")).toBeInTheDocument();
  });
});
