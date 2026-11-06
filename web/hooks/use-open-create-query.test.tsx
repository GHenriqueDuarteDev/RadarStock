import { describe, expect, it, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";

const replace = vi.fn();
let search = new URLSearchParams("new=1&page=2");

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  usePathname: () => "/products",
  useSearchParams: () => search,
}));

import { useOpenCreateQuery } from "./use-open-create-query";

describe("useOpenCreateQuery", () => {
  beforeEach(() => {
    replace.mockReset();
    search = new URLSearchParams("new=1&page=2");
  });

  it("opens from the new=1 query param and clears it on close", () => {
    const { result } = renderHook(() => useOpenCreateQuery());

    expect(result.current.open).toBe(true);

    act(() => {
      result.current.close();
    });

    expect(result.current.open).toBe(false);
    expect(replace).toHaveBeenCalledWith("/products?page=2", { scroll: false });
  });
});
