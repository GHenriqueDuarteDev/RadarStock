import { describe, beforeEach, it, vi, expect } from "vitest";

const { createMock, findUniqueMock, hashMock, verifyMock } = vi.hoisted(() => ({
  createMock: vi.fn(),
  findUniqueMock: vi.fn(),
  hashMock: vi.fn(),
  verifyMock: vi.fn(),
}));

vi.mock("../../../src/db", () => ({
  prisma: {
    user: {
      findUnique: findUniqueMock,
      create: createMock,
    },
  },
}));

vi.mock("@node-rs/argon2", () => ({
  hash: vi.fn(),
  verify: verifyMock,
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

  it("returns 200 with id and email when user exists", async () => {
    findUniqueMock.mockResolvedValue({
      id: "user_1",
      email: "teste@teste.com",
    });
    verifyMock.mockResolvedValue(true);

    const result = await authService.me("user_1");

    expect(result).toEqual({
      status: 200,
      data: { id: "user_1", email: "teste@teste.com" },
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

describe("authService.register", () => {
  beforeEach(() => {
    hashMock.mockReset();
    verifyMock.mockReset();
  });

  it("returns 201 with id and email when registration succeeds", async () => {
    hashMock.mockResolvedValue("hashed");
    createMock.mockResolvedValue({
      id: "user_1",
      email: "teste2@teste.com",
    });

    const result = await authService.register({
      email: "teste2@teste.com",
      firstName: "Ana",
      lastName: "Mariana",
      password: "teste12345",
    });

    expect(result).toEqual({
      status: 201,
      data: { id: "user_1", email: "teste2@teste.com" },
    });
  });

  it("returns 409 when email is already registered", async () => {
    hashMock.mockResolvedValue("hashed");
    createMock.mockRejectedValue(new Error("Unique constraint failed"));

    const result = await authService.register({
      email: "teste@teste.com",
      firstName: "Ana",
      lastName: "Regina",
      password: "teste12345",
    });

    expect(result).toEqual({
      status: 409,
      data: { message: "Este E-mail ja esta cadastrado." },
    });
  });
});
