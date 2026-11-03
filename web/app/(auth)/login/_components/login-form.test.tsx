import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./login-form";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

describe("Test login-form.tsx", () => {
  beforeEach(() => {
    pushMock.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("redirect user to dashboard when login success", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ id: "user_1", email: "teste@teste.com" }),
    } as Response);

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/e-mail/i), "teste@teste.com");
    await user.type(screen.getByLabelText(/senha/i), "teste12345");
    await user.click(screen.getByTestId("button-login"));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("show server error when login fails", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ message: "E-mail ou senha inválidos." }),
    } as Response);

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/e-mail/i), "voce@exemplo.com");
    await user.type(screen.getByLabelText(/senha/i), "senha12345");
    await user.click(screen.getByTestId("button-login"));

    expect(await screen.findByText(/e-mail ou senha inválidos/i));
    expect(pushMock).not.toHaveBeenCalled();
  });
});
