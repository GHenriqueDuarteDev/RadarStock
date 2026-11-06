import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoginForm } from "./login-form";

const pushMock = vi.fn();
const toastAddMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

vi.mock("@/components/ui/toast", () => ({
  toast: {
    add: (...args: unknown[]) => toastAddMock(...args),
  },
}));

describe("Test login-form.tsx", () => {
  beforeEach(() => {
    pushMock.mockReset();
    toastAddMock.mockReset();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("redirect user to dashboard when login success", async () => {
    const user = userEvent.setup();
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ id: "user_1", email: "teste@teste.com" }),
    } as Response);

    render(<LoginForm />);

    const email = screen.getByLabelText(/e-mail/i);
    const password = screen.getByLabelText(/senha/i);
    await user.clear(email);
    await user.type(email, "teste@teste.com");
    await user.clear(password);
    await user.type(password, "teste12345");
    await user.click(screen.getByTestId("button-login"));

    await waitFor(() => {
      expect(toastAddMock).toHaveBeenCalledWith({
        title: "Bem-vindo ao RadarStock",
        type: "success",
      });
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

    const email = screen.getByLabelText(/e-mail/i);
    const password = screen.getByLabelText(/senha/i);
    await user.clear(email);
    await user.type(email, "voce@exemplo.com");
    await user.clear(password);
    await user.type(password, "senha12345");
    await user.click(screen.getByTestId("button-login"));

    await waitFor(() => {
      expect(toastAddMock).toHaveBeenCalledWith({
        title: "E-mail ou senha inválidos.",
        type: "error",
      });
    });
    expect(pushMock).not.toHaveBeenCalled();
  });
});
