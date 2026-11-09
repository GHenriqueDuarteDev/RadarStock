import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: vi.fn() }),
  usePathname: () => "/products",
  useSearchParams: () => new URLSearchParams(),
}));

const updateProductAction = vi.fn();
const deactivateProductAction = vi.fn();

vi.mock("../_actions", () => ({
  createProductAction: vi.fn(),
  updateProductAction: (...args: unknown[]) => updateProductAction(...args),
  deactivateProductAction: (...args: unknown[]) =>
    deactivateProductAction(...args),
}));

const toastAddMock = vi.fn();

vi.mock("@/components/ui/toast", () => ({
  toast: {
    add: (...args: unknown[]) => toastAddMock(...args),
  },
}));

import { ProductsTable } from "./products-table";

const sampleCategories = [
  {
    id: "cat_1",
    name: "Geral",
    description: "Categoria padrão",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
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
    status: "active" as const,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-02T00:00:00.000Z"),
  },
];

describe("ProductsTable", () => {
  beforeEach(() => {
    toastAddMock.mockReset();
    updateProductAction.mockReset();
    deactivateProductAction.mockReset();
  });

  it("renders the products received from the server", () => {
    render(
      <ProductsTable
        data={sampleProducts}
        total={12}
        page={1}
        pageSize={10}
        categories={sampleCategories}
      />,
    );

    expect(screen.getByText("Produto demonstração")).toBeInTheDocument();
    expect(screen.getByText("SKU-DEMO-001")).toBeInTheDocument();
    expect(screen.getByText("Geral")).toBeInTheDocument();
    expect(screen.getByText("42 un")).toBeInTheDocument();
    expect(screen.getByText("12 registros encontrados")).toBeInTheDocument();
  });

  it("updates a product through the edit sheet action", async () => {
    const user = userEvent.setup();
    updateProductAction.mockResolvedValue({
      ok: true,
      data: { ...sampleProducts[0], name: "Produto atualizado" },
    });

    render(
      <ProductsTable
        data={sampleProducts}
        total={12}
        page={1}
        pageSize={10}
        categories={sampleCategories}
      />,
    );

    await user.click(screen.getByTestId("product-actions-prod_1"));
    await user.click(
      await screen.findByRole("menuitem", { name: /alterar dados/i }),
    );

    const nameInput = await screen.findByTestId("edit-product-name");
    await user.clear(nameInput);
    await user.type(nameInput, "Produto atualizado");
    await user.click(screen.getByTestId("edit-product-save"));

    expect(updateProductAction).toHaveBeenCalledWith(
      "prod_1",
      expect.objectContaining({ name: "Produto atualizado" }),
    );
  });

  it("deactivates a product through the row actions menu", async () => {
    const user = userEvent.setup();
    deactivateProductAction.mockResolvedValue({ ok: true, data: undefined });

    render(
      <ProductsTable
        data={sampleProducts}
        total={12}
        page={1}
        pageSize={10}
        categories={sampleCategories}
      />,
    );

    await user.click(screen.getByTestId("product-actions-prod_1"));
    await user.click(
      await screen.findByRole("menuitem", { name: /desativar produto/i }),
    );
    await user.click(await screen.findByTestId("delete-product-confirm"));

    expect(deactivateProductAction).toHaveBeenCalledWith("prod_1");
    expect(toastAddMock).toHaveBeenCalledWith(
      expect.objectContaining({ type: "success" }),
    );
  });

  it("keeps the row visible until the server revalidates", () => {
    render(
      <ProductsTable
        data={[{ ...sampleProducts[0], status: "inactive" }]}
        total={12}
        page={1}
        pageSize={10}
        categories={sampleCategories}
      />,
    );

    const row = screen.getByText("Produto demonstração").closest("tr");
    expect(row).not.toBeNull();
    expect(within(row!).getByText("Inativo")).toBeInTheDocument();
  });
});
