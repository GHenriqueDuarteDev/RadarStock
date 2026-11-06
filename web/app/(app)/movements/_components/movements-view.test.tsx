import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MovementsView } from "./movements-view";

const toastAddMock = vi.fn();

vi.mock("@/components/ui/toast", () => ({
  toast: {
    add: (...args: unknown[]) => toastAddMock(...args),
  },
}));

const sampleMovements = [
  {
    id: "mov_1",
    type: "in",
    productId: "prod_1",
    quantity: 10,
    fromWarehouseId: null,
    toWarehouseId: "wh_1",
    userId: "user_1",
    note: "Entrada inicial",
    referenceType: "manual",
    referenceId: null,
    createdAt: "2026-01-01T10:00:00.000Z",
    productName: "Parafuso M6",
    productSku: "SKU-001",
    fromWarehouseName: null,
    toWarehouseName: "Galpão Central",
    userName: "Ana Silva",
  },
];

const sampleSummary = {
  total: 12,
  in: 5,
  out: 4,
  transfer: 2,
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
    salePrice: 3,
    minStock: 10,
    stockQuantity: 0,
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
  {
    id: "wh_2",
    name: "Galpão Norte",
    code: "GAL-002",
    address: null,
    capacity: 500,
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

function isMovementsListGet(url: string, init?: RequestInit) {
  return url.startsWith("/api/movements?") && !init?.method;
}

function isProductsListGet(url: string, init?: RequestInit) {
  return url.startsWith("/api/products?") && !init?.method;
}

function isWarehousesListGet(url: string, init?: RequestInit) {
  return url.startsWith("/api/warehouses?") && !init?.method;
}

describe("MovementsView", () => {
  beforeEach(() => {
    toastAddMock.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("renders movements returned by GET /api/movements", async () => {
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/movements/summary") {
        return jsonResponse(sampleSummary);
      }
      if (isMovementsListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleMovements, 12));
      }
      if (isProductsListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleProducts));
      }
      if (isWarehousesListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleWarehouses));
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<MovementsView />);

    expect(await screen.findByText("Parafuso M6")).toBeInTheDocument();
    expect(screen.getByText("SKU-001")).toBeInTheDocument();
    expect(screen.getByText("12 registros encontrados")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/api/movements?page=1");
    expect(fetch).toHaveBeenCalledWith("/api/movements/summary");
  });

  it("searches movements by product name and resets to page 1", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/movements/summary") {
        return jsonResponse(sampleSummary);
      }
      if (isMovementsListGet(url, init)) {
        if (url.includes("name=Parafuso")) {
          return jsonResponse(paginatedResponse(sampleMovements, 1));
        }
        return jsonResponse(paginatedResponse(sampleMovements, 12));
      }
      if (isProductsListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleProducts));
      }
      if (isWarehousesListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleWarehouses));
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<MovementsView />);
    expect(await screen.findByText("Parafuso M6")).toBeInTheDocument();

    const search = screen.getByTestId("list-panel-search");
    await user.clear(search);
    await user.type(search, "Parafuso");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/movements?page=1&name=Parafuso",
      );
    });

    expect(
      await screen.findByText("1 registros encontrados"),
    ).toBeInTheDocument();
  });

  it("loads the next page when clicking Próximo", async () => {
    const user = userEvent.setup();
    const page2Movement = {
      ...sampleMovements[0],
      id: "mov_11",
      productName: "Porca M6",
      productSku: "SKU-011",
    };

    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/movements/summary") {
        return jsonResponse(sampleSummary);
      }
      if (isMovementsListGet(url, init)) {
        if (url.includes("page=2")) {
          return jsonResponse(paginatedResponse([page2Movement], 12, 2));
        }
        return jsonResponse(paginatedResponse(sampleMovements, 12, 1));
      }
      if (isProductsListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleProducts));
      }
      if (isWarehousesListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleWarehouses));
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<MovementsView />);
    expect(await screen.findByText("Parafuso M6")).toBeInTheDocument();

    await user.click(screen.getByTestId("list-panel-next"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/movements?page=2");
    });

    expect(await screen.findByText("Porca M6")).toBeInTheDocument();
  });

  it("creates a movement through the new movement sheet", async () => {
    const user = userEvent.setup();
    const created = {
      ...sampleMovements[0],
      id: "mov_2",
      quantity: 5,
      note: "Nova entrada",
    };
    let listPayload = paginatedResponse(sampleMovements, 12);

    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/movements/summary") {
        return jsonResponse({ ...sampleSummary, total: 13, in: 6 });
      }
      if (url === "/api/movements" && init?.method === "POST") {
        listPayload = paginatedResponse([created, ...sampleMovements], 13);
        return jsonResponse(created, true, 201);
      }
      if (isMovementsListGet(url, init)) {
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

    render(<MovementsView />);
    expect(await screen.findByText("Parafuso M6")).toBeInTheDocument();

    await user.click(screen.getByTestId("new-movement"));
    const quantity = screen.getByTestId("create-movement-quantity");
    await user.clear(quantity);
    await user.type(quantity, "5");
    await user.type(screen.getByTestId("create-movement-note"), "Nova entrada");
    await user.click(screen.getByTestId("create-movement-save"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/movements",
        expect.objectContaining({ method: "POST" }),
      );
    });

    expect(await screen.findByText("Nova entrada")).toBeInTheDocument();
  });
});
