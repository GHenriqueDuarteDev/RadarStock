import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { ReportsCatalog } from "./reports-catalog";

describe("ReportsCatalog", () => {
  it("renders catalog items received from the server", () => {
    render(
      <ReportsCatalog
        items={[
          {
            id: "low-stock",
            title: "Estoque baixo",
            description: "Produtos abaixo do mínimo.",
            supportsPeriod: false,
          },
          {
            id: "sales",
            title: "Vendas",
            description: "Vendas no período.",
            supportsPeriod: true,
          },
        ]}
      />,
    );

    expect(screen.getByText("Estoque baixo")).toBeInTheDocument();
    expect(screen.getByText("Snapshot atual")).toBeInTheDocument();
    expect(screen.getByText("Vendas")).toBeInTheDocument();
    expect(screen.getByText("Com período")).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /abrir/i })[0],
    ).toHaveAttribute("href", "/reports/low-stock");
  });
});
