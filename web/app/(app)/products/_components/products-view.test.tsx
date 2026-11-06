import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductsView } from "./products-view";

const toastAddMock = vi.fn();

vi.mock("@/components/ui/toast", () => ({
  toast: {
    add: (...args: unknown[]) => toastAddMock(...args),
  },
}));

const sampleCategories = [
  {
    id: "cat_1",
    name: "Geral",
    description: "Categoria padrão",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  },
];

const sampleProducts = [
  {
    id: "prod_1",
    name: "Produto demonstração",
    sku: "SKU-DEMO-001",
    barcode: "7891000100101",
    description: "Demo",
    categoryId: "cat_1",
    category: { id: "cat_1", name: "Geral" },
    cost: 10,
    salePrice: 19.9,
    minStock: 5,
    stockQuantity: 42,
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  },
];

const sampleSummary = {
  total: 12,
  active: 10,
  inactive: 2,
  categories: 3,
};

function paginatedResponse(
  items: typeof sampleProducts,
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

function isProductsListGet(url: string, init?: RequestInit) {
  return url.startsWith("/api/products?") && !init?.method;
}

describe("ProductsView", () => {
  beforeEach(() => {
    toastAddMock.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("renders products returned by GET /api/products", async () => {
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/products/summary") {
        return jsonResponse(sampleSummary);
      }
      if (url === "/api/categories") {
        return jsonResponse(sampleCategories);
      }
      if (isProductsListGet(url, init)) {
        return jsonResponse(paginatedResponse(sampleProducts, 12));
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<ProductsView />);

    expect(await screen.findByText("Produto demonstração")).toBeInTheDocument();
    expect(screen.getByText("SKU-DEMO-001")).toBeInTheDocument();
    expect(screen.getByText("Geral")).toBeInTheDocument();
    expect(screen.getByText("42 un")).toBeInTheDocument();
    expect(screen.getByText("12 registros encontrados")).toBeInTheDocument();

    expect(fetch).toHaveBeenCalledWith("/api/products?page=1");
    expect(fetch).toHaveBeenCalledWith("/api/products/summary");
  });

  it("searches products by name and resets to page 1", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/products/summary") {
        return jsonResponse(sampleSummary);
      }
      if (url === "/api/categories") {
        return jsonResponse(sampleCategories);
      }
      if (isProductsListGet(url, init)) {
        if (url.includes("name=Produto")) {
          return jsonResponse(paginatedResponse(sampleProducts, 1));
        }
        return jsonResponse(paginatedResponse(sampleProducts, 12));
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<ProductsView />);
    expect(await screen.findByText("Produto demonstração")).toBeInTheDocument();

    const search = screen.getByTestId("list-panel-search");
    await user.clear(search);
    await user.type(search, "Produto");
    await user.keyboard("{Enter}");

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/products?page=1&name=Produto");
    });

    expect(
      await screen.findByText("1 registros encontrados"),
    ).toBeInTheDocument();
  });

  it("loads the next page when clicking Próximo", async () => {
    const user = userEvent.setup();
    const page2Product = {
      ...sampleProducts[0],
      id: "prod_11",
      name: "Produto página 2",
      sku: "SKU-PAGE-2",
    };

    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/products/summary") {
        return jsonResponse(sampleSummary);
      }
      if (url === "/api/categories") {
        return jsonResponse(sampleCategories);
      }
      if (isProductsListGet(url, init)) {
        if (url.includes("page=2")) {
          return jsonResponse(paginatedResponse([page2Product], 12, 2));
        }
        return jsonResponse(paginatedResponse(sampleProducts, 12, 1));
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<ProductsView />);
    expect(await screen.findByText("Produto demonstração")).toBeInTheDocument();

    await user.click(screen.getByTestId("list-panel-next"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/products?page=2");
    });

    expect(await screen.findByText("Produto página 2")).toBeInTheDocument();
  });

  it("creates a product through the new product sheet", async () => {
    const user = userEvent.setup();
    const created = {
      ...sampleProducts[0],
      id: "prod_2",
      name: "Novo item",
      sku: "SKU-NEW-001",
    };
    let listPayload = paginatedResponse(sampleProducts, 12);

    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/products/summary") {
        return jsonResponse({ ...sampleSummary, total: 13 });
      }
      if (url === "/api/categories") {
        return jsonResponse(sampleCategories);
      }
      if (url === "/api/products" && init?.method === "POST") {
        listPayload = paginatedResponse([created, ...sampleProducts], 13);
        return jsonResponse(created, true, 201);
      }
      if (isProductsListGet(url, init)) {
        return jsonResponse(listPayload);
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<ProductsView />);

    expect(await screen.findByText("Produto demonstração")).toBeInTheDocument();

    await user.click(screen.getByTestId("new-product"));
    await user.clear(screen.getByTestId("create-product-name"));
    await user.type(screen.getByTestId("create-product-name"), "Novo item");
    await user.clear(screen.getByTestId("create-product-sku"));
    await user.type(screen.getByTestId("create-product-sku"), "SKU-NEW-001");
    await user.click(screen.getByTestId("create-product-save"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/products",
        expect.objectContaining({ method: "POST" }),
      );
    });

    expect(await screen.findByText("Novo item")).toBeInTheDocument();
  });

  it("updates a product through the edit sheet", async () => {
    const user = userEvent.setup();
    const updated = {
      ...sampleProducts[0],
      name: "Produto atualizado",
    };
    let listPayload = paginatedResponse(sampleProducts, 12);

    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/products/summary") {
        return jsonResponse(sampleSummary);
      }
      if (url === "/api/categories") {
        return jsonResponse(sampleCategories);
      }
      if (url === "/api/products/prod_1" && init?.method === "PATCH") {
        listPayload = paginatedResponse([updated], 12);
        return jsonResponse(updated);
      }
      if (isProductsListGet(url, init)) {
        return jsonResponse(listPayload);
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<ProductsView />);

    expect(await screen.findByText("Produto demonstração")).toBeInTheDocument();

    await user.click(screen.getByTestId("product-actions-prod_1"));
    await user.click(
      await screen.findByRole("menuitem", { name: /alterar dados/i }),
    );

    const nameInput = await screen.findByTestId("edit-product-name");
    await user.clear(nameInput);
    await user.type(nameInput, "Produto atualizado");
    await user.click(screen.getByTestId("edit-product-save"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/products/prod_1",
        expect.objectContaining({ method: "PATCH" }),
      );
    });

    expect(await screen.findByText("Produto atualizado")).toBeInTheDocument();
  });

  it("soft deletes a product through the row actions menu", async () => {
    const user = userEvent.setup();
    let listPayload = paginatedResponse(sampleProducts, 12);

    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/products/summary") {
        return jsonResponse(sampleSummary);
      }
      if (url === "/api/categories") {
        return jsonResponse(sampleCategories);
      }
      if (url === "/api/products/prod_1" && init?.method === "DELETE") {
        listPayload = paginatedResponse(
          [{ ...sampleProducts[0], status: "inactive" }],
          12,
        );
        return jsonResponse({ message: "Produto desativado com sucesso." });
      }
      if (isProductsListGet(url, init)) {
        return jsonResponse(listPayload);
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<ProductsView />);

    expect(await screen.findByText("Produto demonstração")).toBeInTheDocument();

    await user.click(screen.getByTestId("product-actions-prod_1"));
    await user.click(
      await screen.findByRole("menuitem", { name: /desativar produto/i }),
    );
    await user.click(await screen.findByTestId("delete-product-confirm"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/products/prod_1", {
        method: "DELETE",
      });
    });

    const row = screen.getByText("Produto demonstração").closest("tr");
    expect(row).not.toBeNull();
    expect(within(row!).getByText("Inativo")).toBeInTheDocument();
  });
});
