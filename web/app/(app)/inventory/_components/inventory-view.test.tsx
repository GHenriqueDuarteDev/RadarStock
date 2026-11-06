import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { InventoryView } from "./inventory-view";

const toastAddMock = vi.fn();

vi.mock("@/components/ui/toast", () => ({
  toast: {
    add: (...args: unknown[]) => toastAddMock(...args),
  },
}));

const sampleInventories = [
  {
    id: "inv_1",
    code: "INV-001",
    status: "draft",
    warehouseId: "wh_1",
    warehouseName: "Galpão Central",
    countedAt: "2026-01-01T10:00:00.000Z",
    createdById: "user_1",
    createdByName: "Ana Silva",
    notes: null,
    createdAt: "2026-01-01T10:00:00.000Z",
    updatedAt: "2026-01-01T10:00:00.000Z",
    items: [
      {
        id: "item_1",
        inventoryCountId: "inv_1",
        productId: "prod_1",
        expectedQty: 10,
        countedQty: 0,
        variance: 0,
        productName: "Parafuso M6",
        productSku: "SKU-001",
      },
      {
        id: "item_2",
        inventoryCountId: "inv_1",
        productId: "prod_2",
        expectedQty: 5,
        countedQty: 4,
        variance: -1,
        productName: "Fone",
        productSku: "SKU-002",
      },
    ],
  },
];

const sampleSummary = {
  inProgress: 3,
  discrepancies: 1,
  averageAccuracy: 50,
  completed: 2,
};

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

const sampleBalances = {
  items: [
    {
      productId: "prod_1",
      productName: "Parafuso M6",
      productSku: "SKU-001",
      quantity: 10,
    },
  ],
};

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

function isInventoryListGet(url: string, init?: RequestInit) {
  return url.startsWith("/api/inventory?") && !init?.method;
}

function isWarehousesListGet(url: string, init?: RequestInit) {
  return url.startsWith("/api/warehouses?") && !init?.method;
}

describe("InventoryView", () => {
  beforeEach(() => {
    toastAddMock.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("renders inventories returned by GET /api/inventory", async () => {
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/inventory/summary") {
        return jsonResponse(sampleSummary);
      }
      if (isInventoryListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleInventories, 12));
      }
      if (isWarehousesListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleWarehouses));
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<InventoryView />);

    expect(await screen.findByText("INV-001")).toBeInTheDocument();
    expect(screen.getByText("Galpão Central")).toBeInTheDocument();
    expect(screen.getByText("Contagem em andamento")).toBeInTheDocument();
    expect(screen.getByText("Acurácia média")).toBeInTheDocument();
    expect(screen.getByText("Contagens concluídas")).toBeInTheDocument();
    expect(screen.getByText("12 registros encontrados")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/api/inventory?page=1");
    expect(fetch).toHaveBeenCalledWith("/api/inventory/summary");
  });

  it("searches inventories by code and resets to page 1", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/inventory/summary") {
        return jsonResponse(sampleSummary);
      }
      if (isInventoryListGet(url, init)) {
        if (url.includes("code=INV-001")) {
          return jsonResponse(paginatedResponse(sampleInventories, 1));
        }
        return jsonResponse(paginatedResponse(sampleInventories, 12));
      }
      if (isWarehousesListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleWarehouses));
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<InventoryView />);
    expect(await screen.findByText("INV-001")).toBeInTheDocument();

    const search = screen.getByTestId("list-panel-search");
    await user.clear(search);
    await user.type(search, "INV-001");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/inventory?page=1&code=INV-001");
    });
  });

  it("creates inventory then opens edit for counted qty", async () => {
    const user = userEvent.setup();
    const created = {
      ...sampleInventories[0],
      id: "inv_2",
      code: "INV-002",
      items: [
        {
          id: "item_new",
          inventoryCountId: "inv_2",
          productId: "prod_1",
          expectedQty: 10,
          countedQty: 0,
          variance: 0,
          productName: "Parafuso M6",
          productSku: "SKU-001",
        },
      ],
    };
    let listPayload = paginatedResponse(sampleInventories, 12);

    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/inventory/summary") {
        return jsonResponse({ ...sampleSummary, inProgress: 4 });
      }
      if (url === "/api/warehouses/wh_1/balances") {
        return jsonResponse(sampleBalances);
      }
      if (url === "/api/inventory" && init?.method === "POST") {
        const body = JSON.parse(String(init.body));
        expect(body.items).toBeUndefined();
        expect(body.code).toBeUndefined();
        expect(body.warehouseId).toBe("wh_1");
        listPayload = paginatedResponse([created, ...sampleInventories], 13);
        return jsonResponse(created, true, 201);
      }
      if (url === "/api/inventory/inv_2" && init?.method === "PATCH") {
        return jsonResponse({
          ...created,
          items: [{ ...created.items[0], countedQty: 9, variance: -1 }],
        });
      }
      if (isInventoryListGet(url, init)) {
        return jsonResponse(listPayload);
      }
      if (isWarehousesListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleWarehouses));
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<InventoryView />);
    expect(await screen.findByText("INV-001")).toBeInTheDocument();

    await user.click(screen.getByTestId("new-inventory"));
    expect(await screen.findByTestId("create-inventory-preview")).toBeInTheDocument();
    await user.click(screen.getByTestId("create-inventory-save"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/inventory",
        expect.objectContaining({ method: "POST" }),
      );
    });

    expect(await screen.findByTestId("edit-inventory-item-counted-0")).toBeInTheDocument();
    await user.clear(screen.getByTestId("edit-inventory-item-counted-0"));
    await user.type(screen.getByTestId("edit-inventory-item-counted-0"), "9");
    await user.click(screen.getByTestId("edit-inventory-save"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/inventory/inv_2",
        expect.objectContaining({ method: "PATCH" }),
      );
    });
  });

  it("confirms a draft inventory through the row actions menu", async () => {
    const user = userEvent.setup();
    let listPayload = paginatedResponse(sampleInventories, 12);

    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/inventory/summary") {
        return jsonResponse({
          ...sampleSummary,
          inProgress: 2,
          completed: 3,
        });
      }
      if (url === "/api/inventory/inv_1/confirm" && init?.method === "POST") {
        listPayload = paginatedResponse(
          [{ ...sampleInventories[0], status: "confirmed" }],
          12,
        );
        return jsonResponse({ ...sampleInventories[0], status: "confirmed" });
      }
      if (isInventoryListGet(url, init)) {
        return jsonResponse(listPayload);
      }
      if (isWarehousesListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleWarehouses));
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<InventoryView />);
    expect(await screen.findByText("INV-001")).toBeInTheDocument();

    await user.click(screen.getByTestId("inventory-actions-inv_1"));
    await user.click(
      await screen.findByRole("menuitem", { name: /^confirmar$/i }),
    );
    await user.click(await screen.findByTestId("confirm-inventory-confirm"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/inventory/inv_1/confirm", {
        method: "POST",
      });
    });

    const row = screen.getByText("INV-001").closest("tr");
    expect(row).not.toBeNull();
    expect(within(row!).getByText("Confirmado")).toBeInTheDocument();
  });
});
