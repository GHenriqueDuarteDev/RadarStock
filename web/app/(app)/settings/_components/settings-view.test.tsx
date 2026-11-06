import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsView } from "./settings-view";

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

const sampleRules = {
  items: [
    {
      kind: "low_stock" as const,
      enabled: true,
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      kind: "out_of_stock" as const,
      enabled: true,
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      kind: "warehouse_near_capacity" as const,
      enabled: true,
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      kind: "warehouse_full" as const,
      enabled: true,
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      kind: "inventory_pending" as const,
      enabled: true,
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      kind: "inventory_discrepancy" as const,
      enabled: true,
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      kind: "inactive_with_stock" as const,
      enabled: true,
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ],
};

const sampleMe = {
  id: "user_admin",
  email: "admin@radarstock.local",
  role: "admin" as const,
};

function jsonResponse(data: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => data,
  } as Response;
}

function mockSettingsApis(
  overrides?: (url: string, init?: RequestInit) => Response | undefined,
) {
  vi.mocked(fetch).mockImplementation(async (input, init) => {
    const url = String(input);
    const overridden = overrides?.(url, init as RequestInit | undefined);
    if (overridden) return overridden;
    if (url === "/api/me") return jsonResponse(sampleMe);
    if (url === "/api/categories" && !init?.method) {
      return jsonResponse(sampleCategories);
    }
    if (url === "/api/alert-rules") return jsonResponse(sampleRules);
    return jsonResponse({ message: "Not found" }, false, 404);
  });
}

describe("SettingsView", () => {
  beforeEach(() => {
    toastAddMock.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("renders categories returned by GET /api/categories", async () => {
    mockSettingsApis();

    render(<SettingsView />);

    expect(await screen.findByText("Geral")).toBeInTheDocument();
    expect(screen.getByText("Categoria padrão")).toBeInTheDocument();
    expect(screen.getByText("Categorias")).toBeInTheDocument();
    expect(screen.getByText("Gatilhos de alerta")).toBeInTheDocument();
    expect(screen.getByTestId("new-category")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /filtrar/i })).toBeNull();
  });

  it("filters categories by client-side search", async () => {
    const user = userEvent.setup();
    mockSettingsApis((url, init) => {
      if (url === "/api/categories" && !init?.method) {
        return jsonResponse([
          ...sampleCategories,
          {
            id: "cat_2",
            name: "Eletrônicos",
            description: "Itens eletrônicos",
            createdAt: "2026-02-01T00:00:00.000Z",
            updatedAt: "2026-02-01T00:00:00.000Z",
          },
        ]);
      }
      return undefined;
    });

    render(<SettingsView />);

    expect(await screen.findByText("Geral")).toBeInTheDocument();
    expect(screen.getByText("Eletrônicos")).toBeInTheDocument();

    await user.type(screen.getByTestId("categories-search"), "eletr");

    expect(screen.queryByText("Geral")).not.toBeInTheDocument();
    expect(screen.getByText("Eletrônicos")).toBeInTheDocument();
  });

  it("creates a category through the new category sheet", async () => {
    const user = userEvent.setup();
    const created = {
      id: "cat_2",
      name: "Eletrônicos",
      description: "Itens eletrônicos",
      createdAt: "2026-02-01T00:00:00.000Z",
      updatedAt: "2026-02-01T00:00:00.000Z",
    };

    mockSettingsApis((url, init) => {
      if (url === "/api/categories" && init?.method === "POST") {
        return jsonResponse(created, true, 201);
      }
      return undefined;
    });

    render(<SettingsView />);

    expect(await screen.findByText("Geral")).toBeInTheDocument();

    await user.click(screen.getByTestId("new-category"));
    await user.clear(screen.getByTestId("create-category-name"));
    await user.type(screen.getByTestId("create-category-name"), "Eletrônicos");
    await user.clear(screen.getByTestId("create-category-description"));
    await user.type(
      screen.getByTestId("create-category-description"),
      "Itens eletrônicos",
    );
    await user.click(screen.getByTestId("create-category-save"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/categories",
        expect.objectContaining({ method: "POST" }),
      );
    });

    expect(await screen.findByText("Eletrônicos")).toBeInTheDocument();
  });

  it("updates a category through the edit sheet", async () => {
    const user = userEvent.setup();
    const updated = {
      ...sampleCategories[0],
      name: "Geral atualizada",
      description: "Nova descrição",
    };

    mockSettingsApis((url, init) => {
      if (url === "/api/categories/cat_1" && init?.method === "PATCH") {
        return jsonResponse(updated);
      }
      return undefined;
    });

    render(<SettingsView />);

    expect(await screen.findByText("Geral")).toBeInTheDocument();

    await user.click(screen.getByTestId("category-actions-cat_1"));
    await user.click(
      await screen.findByRole("menuitem", { name: /alterar dados/i }),
    );

    const nameInput = await screen.findByTestId("edit-category-name");
    await user.clear(nameInput);
    await user.type(nameInput, "Geral atualizada");
    await user.click(screen.getByTestId("edit-category-save"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/categories/cat_1",
        expect.objectContaining({ method: "PATCH" }),
      );
    });

    expect(await screen.findByText("Geral atualizada")).toBeInTheDocument();
  });

  it("hard deletes a category through the row actions menu", async () => {
    const user = userEvent.setup();

    mockSettingsApis((url, init) => {
      if (url === "/api/categories/cat_1" && init?.method === "DELETE") {
        return jsonResponse({ message: "Categoria excluída com sucesso." });
      }
      return undefined;
    });

    render(<SettingsView />);

    expect(await screen.findByText("Geral")).toBeInTheDocument();

    await user.click(screen.getByTestId("category-actions-cat_1"));
    await user.click(
      await screen.findByRole("menuitem", { name: /excluir categoria/i }),
    );
    await user.click(await screen.findByTestId("delete-category-confirm"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/categories/cat_1", {
        method: "DELETE",
      });
    });

    await waitFor(() => {
      expect(screen.queryByText("Geral")).not.toBeInTheDocument();
    });
  });
});
