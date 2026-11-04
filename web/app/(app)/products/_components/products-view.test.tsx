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
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  },
];

function jsonResponse(data: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => data,
  } as Response;
}

describe("ProductsView", () => {
  beforeEach(() => {
    toastAddMock.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("renders products returned by GET /api/products", async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = String(input);
      if (url === "/api/products") return jsonResponse(sampleProducts);
      if (url === "/api/categories") return jsonResponse(sampleCategories);
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<ProductsView />);

    expect(await screen.findByText("Produto demonstração")).toBeInTheDocument();
    expect(screen.getByText("SKU-DEMO-001")).toBeInTheDocument();
    expect(screen.getByText("Geral")).toBeInTheDocument();
  });

  it("creates a product through the new product sheet", async () => {
    const user = userEvent.setup();
    const created = {
      ...sampleProducts[0],
      id: "prod_2",
      name: "Novo item",
      sku: "SKU-NEW-001",
    };

    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/products" && !init?.method) {
        return jsonResponse(sampleProducts);
      }
      if (url === "/api/categories") return jsonResponse(sampleCategories);
      if (url === "/api/products" && init?.method === "POST") {
        return jsonResponse(created, true, 201);
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

    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/products" && !init?.method) {
        return jsonResponse(sampleProducts);
      }
      if (url === "/api/categories") return jsonResponse(sampleCategories);
      if (url === "/api/products/prod_1" && init?.method === "PATCH") {
        return jsonResponse(updated);
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

    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/products" && !init?.method) {
        return jsonResponse(sampleProducts);
      }
      if (url === "/api/categories") return jsonResponse(sampleCategories);
      if (url === "/api/products/prod_1" && init?.method === "DELETE") {
        return jsonResponse({ message: "Produto desativado com sucesso." });
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
