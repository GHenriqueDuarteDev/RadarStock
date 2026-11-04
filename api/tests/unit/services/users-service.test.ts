import { describe, beforeEach, it, vi, expect } from "vitest";

const { findManyMock, findUniqueMock, updateMock, createMock, hashMock } =
  vi.hoisted(() => ({
    findManyMock: vi.fn(),
    findUniqueMock: vi.fn(),
    updateMock: vi.fn(),
    createMock: vi.fn(),
    hashMock: vi.fn(),
  }));

vi.mock("../../../src/db", () => ({
  prisma: {
    user: {
      findMany: findManyMock,
      findUnique: findUniqueMock,
      update: updateMock,
      create: createMock,
    },
  },
}));

vi.mock("@node-rs/argon2", () => ({
  hash: hashMock,
  verify: vi.fn(),
}));

import { userService } from "../../../services/users-service";

const publicUser = {
  id: "user_1",
  email: "teste@teste.com",
  firstName: "Ana",
  lastName: "Silva",
  role: "viewer" as const,
  status: "active" as const,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-02"),
};

describe("userService.register", () => {
  beforeEach(() => {
    hashMock.mockReset();
    createMock.mockReset();
  });

  it("returns 201 with id and email when registration succeeds", async () => {
    hashMock.mockResolvedValue("hashed");
    createMock.mockResolvedValue({
      id: "user_1",
      email: "teste2@teste.com",
    });

    const result = await userService.registerUser({
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

    const result = await userService.registerUser({
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

describe("userService.createByAdmin", () => {
  beforeEach(() => {
    hashMock.mockReset();
    createMock.mockReset();
  });

  it("returns 201 with public user when creation succeeds", async () => {
    hashMock.mockResolvedValue("hashed");
    createMock.mockResolvedValue({
      ...publicUser,
      role: "operator",
    });

    const result = await userService.createByAdmin({
      email: "teste@teste.com",
      firstName: "Ana",
      lastName: "Silva",
      password: "teste12345",
      role: "operator",
    });

    expect(result).toEqual({
      status: 201,
      data: { ...publicUser, role: "operator" },
    });
  });

  it("returns 409 when email is already registered", async () => {
    hashMock.mockResolvedValue("hashed");
    createMock.mockRejectedValue(new Error("Unique constraint failed"));

    const result = await userService.createByAdmin({
      email: "teste@teste.com",
      firstName: "Ana",
      lastName: "Silva",
      password: "teste12345",
      role: "manager",
    });

    expect(result).toEqual({
      status: 409,
      data: { message: "Este E-mail ja esta cadastrado." },
    });
  });
});

describe("userService.getAllUsers", () => {
  beforeEach(() => {
    findManyMock.mockReset();
  });

  it("returns 200 with users list", async () => {
    findManyMock.mockResolvedValue([publicUser]);

    const result = await userService.getAllUsers();

    expect(result).toEqual({
      status: 200,
      data: [publicUser],
    });
  });

  it("returns 200 with empty list when there are no users", async () => {
    findManyMock.mockResolvedValue([]);

    const result = await userService.getAllUsers();

    expect(result).toEqual({
      status: 200,
      data: [],
    });
  });
});

describe("userService.getUserById", () => {
  beforeEach(() => {
    findUniqueMock.mockReset();
  });

  it("returns 200 with user when user exists", async () => {
    findUniqueMock.mockResolvedValue(publicUser);

    const result = await userService.getUserById("user_1");

    expect(result).toEqual({
      status: 200,
      data: publicUser,
    });
  });

  it("returns 404 when user is not found", async () => {
    findUniqueMock.mockResolvedValue(null);

    const result = await userService.getUserById("missing");

    expect(result).toEqual({
      status: 404,
      data: { message: "Usuário não encontrado." },
    });
  });
});

describe("userService.updateUserById", () => {
  beforeEach(() => {
    findUniqueMock.mockReset();
    updateMock.mockReset();
    hashMock.mockReset();
  });

  it("returns 200 with updated user when owner updates own profile", async () => {
    findUniqueMock.mockResolvedValue({ id: "user_1" });
    hashMock.mockResolvedValue("hashed");
    updateMock.mockResolvedValue({
      ...publicUser,
      firstName: "Maria",
    });

    const result = await userService.updateUserById(
      "user_1",
      {
        firstName: "Maria",
        password: "novaSenha123",
      },
      "user_1",
    );

    expect(result).toEqual({
      status: 200,
      data: { ...publicUser, firstName: "Maria" },
    });
    expect(hashMock).toHaveBeenCalledWith("novaSenha123");
  });

  it("returns 200 when admin updates another user", async () => {
    findUniqueMock
      .mockResolvedValueOnce({ role: "admin", status: "active" })
      .mockResolvedValueOnce({ id: "user_1" });
    updateMock.mockResolvedValue({
      ...publicUser,
      firstName: "Maria",
    });

    const result = await userService.updateUserById(
      "user_1",
      { firstName: "Maria" },
      "admin_1",
    );

    expect(result).toEqual({
      status: 200,
      data: { ...publicUser, firstName: "Maria" },
    });
  });

  it("returns 403 when actor is not owner nor admin", async () => {
    findUniqueMock.mockResolvedValue({ role: "viewer", status: "active" });

    const result = await userService.updateUserById(
      "user_1",
      { firstName: "Maria" },
      "other_user",
    );

    expect(result).toEqual({
      status: 403,
      data: { message: "Sem permissão." },
    });
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("returns 404 when user is not found", async () => {
    findUniqueMock.mockResolvedValue(null);

    const result = await userService.updateUserById(
      "missing",
      { firstName: "Maria" },
      "missing",
    );

    expect(result).toEqual({
      status: 404,
      data: { message: "Usuário não encontrado." },
    });
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("returns 409 when email is already registered", async () => {
    findUniqueMock.mockResolvedValue({ id: "user_1" });
    updateMock.mockRejectedValue(new Error("Unique constraint failed"));

    const result = await userService.updateUserById(
      "user_1",
      { email: "ja@existe.com" },
      "user_1",
    );

    expect(result).toEqual({
      status: 409,
      data: { message: "Este E-mail ja esta cadastrado." },
    });
  });
});

describe("userService.updateUserRole", () => {
  beforeEach(() => {
    findUniqueMock.mockReset();
    updateMock.mockReset();
  });

  it("returns 200 with updated user when role update succeeds", async () => {
    findUniqueMock.mockResolvedValue({ id: "user_1" });
    updateMock.mockResolvedValue({
      ...publicUser,
      role: "operator",
    });

    const result = await userService.updateUserRole(
      "user_1",
      "operator",
      "admin_1",
    );

    expect(result).toEqual({
      status: 200,
      data: { ...publicUser, role: "operator" },
    });
  });

  it("returns 403 when actor tries to change own role", async () => {
    const result = await userService.updateUserRole(
      "user_1",
      "operator",
      "user_1",
    );

    expect(result).toEqual({
      status: 403,
      data: { message: "Você não pode alterar a própria permissão." },
    });
    expect(findUniqueMock).not.toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("returns 404 when user is not found", async () => {
    findUniqueMock.mockResolvedValue(null);

    const result = await userService.updateUserRole(
      "missing",
      "admin",
      "admin_1",
    );

    expect(result).toEqual({
      status: 404,
      data: { message: "Usuário não encontrado." },
    });
    expect(updateMock).not.toHaveBeenCalled();
  });
});

describe("userService.deleteUserById", () => {
  beforeEach(() => {
    findUniqueMock.mockReset();
    updateMock.mockReset();
  });

  it("returns 200 when soft delete succeeds", async () => {
    findUniqueMock.mockResolvedValue({ id: "user_1" });
    updateMock.mockResolvedValue({
      ...publicUser,
      status: "inactive",
    });

    const result = await userService.deleteUserById("user_1", "admin_1");

    expect(result).toEqual({
      status: 200,
      data: { message: "Usuário apagado com sucesso" },
    });
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "user_1" },
      data: { status: "inactive" },
    });
  });

  it("returns 403 when actor tries to delete own account", async () => {
    const result = await userService.deleteUserById("user_1", "user_1");

    expect(result).toEqual({
      status: 403,
      data: { message: "Você não pode deletar a própria conta." },
    });
    expect(findUniqueMock).not.toHaveBeenCalled();
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("returns 404 when user is not found", async () => {
    findUniqueMock.mockResolvedValue(null);

    const result = await userService.deleteUserById("missing", "admin_1");

    expect(result).toEqual({
      status: 404,
      data: { message: "Usuário não encontrado." },
    });
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("returns 409 when soft delete fails", async () => {
    findUniqueMock.mockResolvedValue({ id: "user_1" });
    updateMock.mockRejectedValue(new Error("db error"));

    const result = await userService.deleteUserById("user_1", "admin_1");

    expect(result).toEqual({
      status: 409,
      data: { message: "Falha ao deletar usuário." },
    });
  });
});
