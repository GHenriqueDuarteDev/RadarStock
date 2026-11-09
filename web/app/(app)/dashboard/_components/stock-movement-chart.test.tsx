import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { StockMovementChart } from "./stock-movement-chart";

describe("StockMovementChart", () => {
  it("links each period option to the dashboard URL and marks the active one", () => {
    render(<StockMovementChart data={[]} days={30} />);

    expect(screen.getByTestId("movements-days-7")).toHaveAttribute(
      "href",
      "/dashboard?days=7",
    );
    expect(screen.getByTestId("movements-days-30")).toHaveAttribute(
      "aria-current",
      "true",
    );
    expect(screen.getByTestId("movements-days-90")).not.toHaveAttribute(
      "aria-current",
    );
    expect(
      screen.getByText("Entradas e saídas nos últimos 30 dias"),
    ).toBeInTheDocument();
  });
});
