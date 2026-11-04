import { describe, beforeEach, it, vi, expect } from "vitest";

const { findUniqueMock, verifyMock, createByAdminMock } = vi.hoisted(() => ({
  findUniqueMock: vi.fn(),
  verifyMock: vi.fn(),
  createByAdminMock: vi.fn(),
}));

vi.mock("../../../src/db", () => ({
  prisma: {
    user: {
      findUnique: findUniqueMock,
    },
  },
}));

vi.mock("@node-rs/argon2", () => ({
  verify: verifyMock,
}));

vi.mock("../../../services/users-service", () => ({
  userService: {
    createByAdmin: createByAdminMock,
  },
}));

import { authService } from "../../../services/auth-service";

describe("authService.login", () => {
  beforeEach(() => {
    findUniqueMock.mockReset();
    verifyMock.mockReset();
  });

  it("returns 200 with id and email when credentials are valid", async () => {
    findUniqueMock.mockResolvedValue({
      id: "user_1",
      email: "teste@teste.com",
      passwordHash: "hash-que-vem-do-db",
      status: "active",
    });
    verifyMock.mockResolvedValue(true);

    const result = await authService.login({
      email: "teste@teste.com",
      password: "teste12345",
    });

    expect(result).toEqual({
      status: 200,
      data: { id: "user_1", email: "teste@teste.com" },
    });
  });

  it("returns 401 when user is inactive", async () => {
    findUniqueMock.mockResolvedValue({
      id: "user_1",
      email: "teste@teste.com",
      passwordHash: "hash-que-vem-do-db",
      status: "inactive",
    });
    verifyMock.mockResolvedValue(false);

    const result = await authService.login({
      email: "teste@exemplo.com",
      password: "teste12345",
    });

    expect(result).toEqual({
      status: 401,
      data: { message: "E-mail ou senha invalidos." },
    });
  });

  it("returns 401 when user is not found", async () => {
    findUniqueMock.mockResolvedValue(null);

    const result = await authService.login({
      email: "sumido@teste.com",
      password: "teste12345",
    });

    expect(result.status).toBe(401);
    expect(verifyMock).not.toHaveBeenCalled();
  });
});

describe("authService.me", () => {
  beforeEach(() => {
    findUniqueMock.mockReset();
    verifyMock.mockReset();
  });

  it("returns 200 with id, email and role when user exists", async () => {
    findUniqueMock.mockResolvedValue({
      id: "user_1",
      email: "teste@teste.com",
      role: "admin",
    });
    verifyMock.mockResolvedValue(true);

    const result = await authService.me("user_1");

    expect(result).toEqual({
      status: 200,
      data: { id: "user_1", email: "teste@teste.com", role: "admin" },
    });
  });

  it("returns 401 when user is not found", async () => {
    findUniqueMock.mockResolvedValue(null);

    const result = await authService.me("user_id");

    expect(result).toEqual({
      status: 401,
      data: { message: "Não autenticado." },
    });
  });
});

describe("authService.adminRegister", () => {
  beforeEach(() => {
    createByAdminMock.mockReset();
  });

  it("delegates to userService.createByAdmin", async () => {
    const created = {
      id: "user_2",
      email: "novo@teste.com",
      firstName: "Ana",
      lastName: "Silva",
      role: "operator" as const,
      status: "active" as const,
      createdAt: new Date("2026-01-01"),
      updatedAt: new Date("2026-01-01"),
    };
    createByAdminMock.mockResolvedValue({ status: 201, data: created });

    const input = {
      email: "novo@teste.com",
      firstName: "Ana",
      lastName: "Silva",
      password: "teste12345",
      role: "operator" as const,
    };

    const result = await authService.adminRegister(input);

    expect(createByAdminMock).toHaveBeenCalledWith(input);
    expect(result).toEqual({ status: 201, data: created });
  });
});
