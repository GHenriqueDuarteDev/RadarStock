import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const createProductAction = vi.fn();

vi.mock("../_actions", () => ({
  createProductAction: (...args: unknown[]) => createProductAction(...args),
}));

const toastAddMock = vi.fn();

vi.mock("@/components/ui/toast", () => ({
  toast: {
    add: (...args: unknown[]) => toastAddMock(...args),
  },
}));

import { CreateProductSheet } from "./create-product-sheet";

const sampleCategories = [
  {
    id: "cat_1",
    name: "Geral",
    description: "Categoria padrão",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  },
];

describe("CreateProductSheet", () => {
  beforeEach(() => {
    toastAddMock.mockReset();
    createProductAction.mockReset();
  });

  it("creates a product through the server action", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    createProductAction.mockResolvedValue({
      ok: true,
      data: { id: "prod_2" },
    });

    render(
      <CreateProductSheet categories={sampleCategories} onClose={onClose} />,
    );

    await user.clear(screen.getByTestId("create-product-name"));
    await user.type(screen.getByTestId("create-product-name"), "Novo item");
    await user.clear(screen.getByTestId("create-product-sku"));
    await user.type(screen.getByTestId("create-product-sku"), "SKU-NEW-001");
    await user.click(screen.getByTestId("create-product-save"));

    await waitFor(() => {
      expect(createProductAction).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Novo item",
          sku: "SKU-NEW-001",
          categoryId: "cat_1",
        }),
      );
    });
    expect(onClose).toHaveBeenCalled();
  });
});
