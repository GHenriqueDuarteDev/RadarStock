import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TeamView } from "./team-view";

const toastAddMock = vi.fn();

vi.mock("@/components/ui/toast", () => ({
  toast: {
    add: (...args: unknown[]) => toastAddMock(...args),
  },
}));

const currentUser = {
  id: "admin_actor",
  email: "admin@teste.com",
  role: "admin",
};

const sampleUsers = [
  {
    id: "user_1",
    email: "ana@teste.com",
    firstName: "Ana",
    lastName: "Silva",
    role: "viewer",
    status: "active",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  },
  {
    id: "user_2",
    email: "bruno@teste.com",
    firstName: "Bruno",
    lastName: "Costa",
    role: "admin",
    status: "active",
    createdAt: "2026-02-01T00:00:00.000Z",
    updatedAt: "2026-02-02T00:00:00.000Z",
  },
];

function jsonResponse(data: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    json: async () => data,
  } as Response;
}

describe("TeamView", () => {
  beforeEach(() => {
    toastAddMock.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("renders users returned by GET /api/users", async () => {
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/me") {
        return jsonResponse(currentUser);
      }
      if (url === "/api/users" && !init?.method) {
        return jsonResponse(sampleUsers);
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<TeamView />);

    expect(await screen.findByText("Ana Silva")).toBeInTheDocument();
    expect(screen.getByText("ana@teste.com")).toBeInTheDocument();
    expect(screen.getByText("Bruno Costa")).toBeInTheDocument();
    expect(screen.getByText("bruno@teste.com")).toBeInTheDocument();

    expect(fetch).toHaveBeenCalledWith("/api/users");
  });

  it("deletes a user through the row actions menu", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/me") {
        return jsonResponse(currentUser);
      }
      if (url === "/api/users" && !init?.method) {
        return jsonResponse(sampleUsers);
      }
      if (url === "/api/users/user_1" && init?.method === "DELETE") {
        return jsonResponse({ message: "Usuário apagado com sucesso" });
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<TeamView />);

    expect(await screen.findByText("Ana Silva")).toBeInTheDocument();

    await user.click(screen.getByTestId("user-actions-user_1"));
    await user.click(
      await screen.findByRole("menuitem", { name: /deletar usuário/i }),
    );
    await user.click(await screen.findByTestId("delete-confirm"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("/api/users/user_1", {
        method: "DELETE",
      });
    });

    const anaRow = screen.getByText("Ana Silva").closest("tr");
    expect(anaRow).not.toBeNull();
    expect(within(anaRow!).getByText("Inativo")).toBeInTheDocument();
  });

  it("updates user data through the edit sheet", async () => {
    const user = userEvent.setup();
    const updatedUser = {
      ...sampleUsers[0],
      firstName: "Ana Maria",
      lastName: "Silva",
    };

    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/me") {
        return jsonResponse(currentUser);
      }
      if (url === "/api/users" && !init?.method) {
        return jsonResponse(sampleUsers);
      }
      if (url === "/api/users/user_1" && init?.method === "PATCH") {
        return jsonResponse(updatedUser);
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<TeamView />);

    expect(await screen.findByText("Ana Silva")).toBeInTheDocument();

    await user.click(screen.getByTestId("user-actions-user_1"));
    await user.click(
      await screen.findByRole("menuitem", { name: /alterar dados/i }),
    );

    const firstNameInput = await screen.findByTestId("edit-first-name");
    await user.clear(firstNameInput);
    await user.type(firstNameInput, "Ana Maria");
    await user.click(screen.getByTestId("edit-save"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/users/user_1",
        expect.objectContaining({
          method: "PATCH",
        }),
      );
    });

    expect(await screen.findByText("Ana Maria Silva")).toBeInTheDocument();
  });

  it("creates a member through the new member sheet", async () => {
    const user = userEvent.setup();
    const createdUser = {
      id: "user_3",
      email: "carla@teste.com",
      firstName: "Carla",
      lastName: "Dias",
      role: "operator",
      status: "active",
      createdAt: "2026-03-01T00:00:00.000Z",
      updatedAt: "2026-03-01T00:00:00.000Z",
    };

    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/me") {
        return jsonResponse(currentUser);
      }
      if (url === "/api/users" && !init?.method) {
        return jsonResponse(sampleUsers);
      }
      if (url === "/api/users" && init?.method === "POST") {
        return jsonResponse(createdUser, true, 201);
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<TeamView />);

    expect(await screen.findByText("Ana Silva")).toBeInTheDocument();

    await user.click(screen.getByTestId("new-member"));
    await user.type(screen.getByTestId("create-first-name"), "Carla");
    await user.type(screen.getByTestId("create-last-name"), "Dias");
    await user.type(screen.getByTestId("create-email"), "carla@teste.com");
    await user.type(screen.getByTestId("create-password"), "teste12345");
    await user.selectOptions(screen.getByTestId("create-role"), "operator");
    await user.click(screen.getByTestId("create-save"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/users",
        expect.objectContaining({
          method: "POST",
        }),
      );
    });

    expect(await screen.findByText("Carla Dias")).toBeInTheDocument();
    expect(toastAddMock).toHaveBeenCalledWith({
      title: "Membro criado com sucesso.",
      type: "success",
    });
  });

  it("updates user permission through the role sheet", async () => {
    const user = userEvent.setup();
    const updatedUser = {
      ...sampleUsers[0],
      role: "manager",
    };

    vi.mocked(fetch).mockImplementation(async (input, init) => {
      const url = String(input);
      if (url === "/api/me") {
        return jsonResponse(currentUser);
      }
      if (url === "/api/users" && !init?.method) {
        return jsonResponse(sampleUsers);
      }
      if (url === "/api/users/user_1/role" && init?.method === "PATCH") {
        return jsonResponse(updatedUser);
      }
      return jsonResponse({ message: "Not found" }, false, 404);
    });

    render(<TeamView />);

    expect(await screen.findByText("Ana Silva")).toBeInTheDocument();

    await user.click(screen.getByTestId("user-actions-user_1"));
    await user.click(
      await screen.findByRole("menuitem", { name: /alterar permissão/i }),
    );

    await user.selectOptions(await screen.findByTestId("edit-role"), "manager");
    await user.click(screen.getByTestId("role-save"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "/api/users/user_1/role",
        expect.objectContaining({
          method: "PATCH",
        }),
      );
    });

    const anaRow = screen.getByText("Ana Silva").closest("tr");
    expect(anaRow).not.toBeNull();
    expect(within(anaRow!).getByText("Gerente")).toBeInTheDocument();
  });
});
