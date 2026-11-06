import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../_actions", () => ({
  createCategoryAction: vi.fn(),
  updateCategoryAction: vi.fn(),
  deleteCategoryAction: vi.fn(),
  updateAlertRuleAction: vi.fn(),
}));

import { CategoriesTable } from "./categories-table";

describe("CategoriesTable", () => {
  it("renders categories received from the server", () => {
    render(
      <CategoriesTable
        data={[
          {
            id: "cat_1",
            name: "Insumos",
            description: "Materiais de consumo",
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
            updatedAt: new Date("2026-01-01T00:00:00.000Z"),
          },
        ]}
      />,
    );

    expect(screen.getByText("Insumos")).toBeInTheDocument();
    expect(screen.getByText("Materiais de consumo")).toBeInTheDocument();
    expect(screen.getByTestId("new-category")).toBeInTheDocument();
  });
});
