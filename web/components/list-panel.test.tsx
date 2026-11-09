import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/products",
  useSearchParams: () => new URLSearchParams("page=2"),
}));

import { ListPanel } from "./list-panel";

describe("ListPanel", () => {
  beforeEach(() => {
    replace.mockReset();
  });

  it("navigates to the previous page by dropping page=1 from the URL", async () => {
    const user = userEvent.setup();

    render(
      <ListPanel title="Lista" totalCount={12} page={2} pageSize={10}>
        <p>linhas</p>
      </ListPanel>,
    );

    await user.click(screen.getByTestId("list-panel-prev"));

    expect(replace).toHaveBeenCalledWith("/products", { scroll: false });
  });

  it("submits search into the URL and resets the page", async () => {
    const user = userEvent.setup();

    render(
      <ListPanel
        title="Lista"
        totalCount={12}
        page={2}
        pageSize={10}
        searchPlaceholder="Buscar produto..."
        searchParam="name"
      >
        <p>linhas</p>
      </ListPanel>,
    );

    const search = screen.getByTestId("list-panel-search");
    await user.clear(search);
    await user.type(search, "Caixa");
    await user.keyboard("{Enter}");

    expect(replace).toHaveBeenCalledWith("/products?name=Caixa", {
      scroll: false,
    });
  });
});
