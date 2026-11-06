import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WarehousesView } from "./warehouses-view";

const toastAddMock = vi.fn();

vi.mock("@/components/ui/toast", () => ({
  toast: {
    add: (...args: unknown[]) => toastAddMock(...args),
  },
}));

const sampleWarehouses = [
  {
    id: "wh_1",
    name: "Galpão Central",
    code: "GAL-001",
    address: "Rua A, 100",
    capacity: 1000,
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  },
];

const sampleSummary = {
  total: 12,
  active: 10,
  inactive: 2,
  totalCapacity: 15000,
};

function paginatedResponse(
  items: typeof sampleWarehouses,
  total = items.length,
  page = 1,
) {
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

function isWarehousesListGet(url: string, init?: RequestInit) {
  return url.startsWith("/api/warehouses?") && !init?.method;
}

describe("WarehousesView", () => {
  beforeEach(() => {
    toastAddMock.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("renders warehouses returned by GET /api/warehouses", async () => {
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/warehouses/summary") {
        return jsonResponse(sampleSummary);
      }
      if (isWarehousesListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleWarehouses, 12));
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<WarehousesView />);

    expect(await screen.findByText("Galpão Central")).toBeInTheDocument();
    expect(screen.getByText("GAL-001")).toBeInTheDocument();
    expect(screen.getByText("12 registros encontrados")).toBeInTheDocument();
    expect(fetch).toHaveBeenCalledWith("/api/warehouses?page=1");
    expect(fetch).toHaveBeenCalledWith("/api/warehouses/summary");
  });

  it("searches warehouses by name and resets to page 1", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/warehouses/summary") {
        return jsonResponse(sampleSummary);
      }
      if (isWarehousesListGet(url, init)) {
        if (url.includes("name=Central")) {
          return jsonResponse(paginatedResponse(sampleWarehouses, 1));
        }
        return jsonResponse(paginatedResponse(sampleWarehouses, 12));
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<WarehousesView />);
    expect(await screen.findByText("Galpão Central")).toBeInTheDocument();

    const search = screen.getByTestId("list-panel-search");
    await user.clear(search);
    await user.type(search, "Central");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/warehouses?page=1&name=Central");
    });

    expect(
      await screen.findByText("1 registros encontrados"),
    ).toBeInTheDocument();
  });

  it("loads the next page when clicking Próximo", async () => {
    const user = userEvent.setup();
    const page2Warehouse = {
      ...sampleWarehouses[0],
      id: "wh_11",
      name: "Galpão Sul",
      code: "GAL-011",
    };

    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/warehouses/summary") {
        return jsonResponse(sampleSummary);
      }
      if (isWarehousesListGet(url, init)) {
        if (url.includes("page=2")) {
          return jsonResponse(paginatedResponse([page2Warehouse], 12, 2));
        }
        return jsonResponse(paginatedResponse(sampleWarehouses, 12, 1));
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<WarehousesView />);
    expect(await screen.findByText("Galpão Central")).toBeInTheDocument();

    await user.click(screen.getByTestId("list-panel-next"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/warehouses?page=2");
    });

    expect(await screen.findByText("Galpão Sul")).toBeInTheDocument();
  });

  it("creates a warehouse through the new warehouse sheet", async () => {
    const user = userEvent.setup();
    const created = {
      ...sampleWarehouses[0],
      id: "wh_2",
      name: "Galpão Novo",
      code: "GAL-002",
    };
    let listPayload = paginatedResponse(sampleWarehouses, 12);

    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/warehouses/summary") {
        return jsonResponse({ ...sampleSummary, total: 13 });
      }
      if (url === "/api/warehouses" && init?.method === "POST") {
        listPayload = paginatedResponse([created, ...sampleWarehouses], 13);
        return jsonResponse(created, true, 201);
      }
      if (isWarehousesListGet(url, init)) {
        return jsonResponse(listPayload);
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<WarehousesView />);
    expect(await screen.findByText("Galpão Central")).toBeInTheDocument();

    await user.click(screen.getByTestId("new-warehouse"));
    await user.type(screen.getByTestId("create-warehouse-name"), "Galpão Novo");
    await user.type(screen.getByTestId("create-warehouse-code"), "GAL-002");
    await user.click(screen.getByTestId("create-warehouse-save"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/warehouses",
        expect.objectContaining({ method: "POST" }),
      );
    });

    expect(await screen.findByText("Galpão Novo")).toBeInTheDocument();
  });

  it("updates a warehouse through the edit sheet", async () => {
    const user = userEvent.setup();
    const updated = {
      ...sampleWarehouses[0],
      name: "Galpão Atualizado",
    };
    let listPayload = paginatedResponse(sampleWarehouses, 12);

    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/warehouses/summary") {
        return jsonResponse(sampleSummary);
      }
      if (url === "/api/warehouses/wh_1" && init?.method === "PATCH") {
        listPayload = paginatedResponse([updated], 12);
        return jsonResponse(updated);
      }
      if (isWarehousesListGet(url, init)) {
        return jsonResponse(listPayload);
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<WarehousesView />);
    expect(await screen.findByText("Galpão Central")).toBeInTheDocument();

    await user.click(screen.getByTestId("warehouse-actions-wh_1"));
    await user.click(
      await screen.findByRole("menuitem", { name: /alterar dados/i }),
    );

    const nameInput = await screen.findByTestId("edit-warehouse-name");
    await user.clear(nameInput);
    await user.type(nameInput, "Galpão Atualizado");
    await user.click(screen.getByTestId("edit-warehouse-save"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/warehouses/wh_1",
        expect.objectContaining({ method: "PATCH" }),
      );
    });

    expect(await screen.findByText("Galpão Atualizado")).toBeInTheDocument();
  });

  it("soft deletes a warehouse through the row actions menu", async () => {
    const user = userEvent.setup();
    let listPayload = paginatedResponse(sampleWarehouses, 12);

    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/warehouses/summary") {
        return jsonResponse(sampleSummary);
      }
      if (url === "/api/warehouses/wh_1" && init?.method === "DELETE") {
        listPayload = paginatedResponse(
          [{ ...sampleWarehouses[0], status: "inactive" }],
          12,
        );
        return jsonResponse({ message: "Galpão desativado com sucesso." });
      }
      if (isWarehousesListGet(url, init)) {
        return jsonResponse(listPayload);
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<WarehousesView />);
    expect(await screen.findByText("Galpão Central")).toBeInTheDocument();

    await user.click(screen.getByTestId("warehouse-actions-wh_1"));
    await user.click(
      await screen.findByRole("menuitem", { name: /desativar galpão/i }),
    );
    await user.click(await screen.findByTestId("delete-warehouse-confirm"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/warehouses/wh_1", {
        method: "DELETE",
      });
    });

    const row = screen.getByText("Galpão Central").closest("tr");
    expect(row).not.toBeNull();
    expect(within(row!).getByText("Inativo")).toBeInTheDocument();
  });
});
