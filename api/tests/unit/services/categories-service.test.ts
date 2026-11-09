import { describe, beforeEach, it, vi, expect } from "vitest";

const { findManyMock, findUniqueMock, createMock, updateMock, deleteMock, countMock } =
  vi.hoisted(() => ({
    findManyMock: vi.fn(),
    findUniqueMock: vi.fn(),
    createMock: vi.fn(),
    updateMock: vi.fn(),
    deleteMock: vi.fn(),
    countMock: vi.fn(),
  }));

vi.mock("../../../src/db", () => ({
  prisma: {
    category: {
      findMany: findManyMock,
      findUnique: findUniqueMock,
      create: createMock,
      update: updateMock,
      delete: deleteMock,
    },
    product: {
      count: countMock,
    },
  },
}));

import { categoryService } from "../../../services/categories-service";

const publicCategory = {
  id: "cat_1",
  name: "Geral",
  description: "Categoria padrão",
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-02"),
};

describe("categoryService.getAllCategories", () => {
  beforeEach(() => {
    findManyMock.mockReset();
  });

  it("returns 200 with categories", async () => {
    findManyMock.mockResolvedValue([publicCategory]);

    const result = await categoryService.getAllCategories();

    expect(result).toEqual({ status: 200, data: [publicCategory] });
  });
});

describe("categoryService.createCategory", () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it("returns 201 when creation succeeds", async () => {
    createMock.mockResolvedValue(publicCategory);

    const result = await categoryService.createCategory({
      name: "Geral",
      description: "Categoria padrão",
    });

    expect(result).toEqual({ status: 201, data: publicCategory });
  });

  it("returns 409 when name is duplicated", async () => {
    createMock.mockRejectedValue(new Error("Unique constraint failed"));

    const result = await categoryService.createCategory({
      name: "Geral",
    });

    expect(result).toEqual({
      status: 409,
      data: { message: "Já existe uma categoria com este nome." },
    });
  });
});

describe("categoryService.deleteCategoryById", () => {
  beforeEach(() => {
    findUniqueMock.mockReset();
    countMock.mockReset();
    deleteMock.mockReset();
  });

  it("returns 409 when category has products", async () => {
    findUniqueMock.mockResolvedValue({ id: "cat_1" });
    countMock.mockResolvedValue(2);

    const result = await categoryService.deleteCategoryById("cat_1");

    expect(result).toEqual({
      status: 409,
      data: {
        message: "Não é possível remover uma categoria com produtos vinculados.",
      },
    });
    expect(deleteMock).not.toHaveBeenCalled();
  });

  it("returns 200 when delete succeeds", async () => {
    findUniqueMock.mockResolvedValue({ id: "cat_1" });
    countMock.mockResolvedValue(0);
    deleteMock.mockResolvedValue(publicCategory);

    const result = await categoryService.deleteCategoryById("cat_1");

    expect(result).toEqual({
      status: 200,
      data: { message: "Categoria removida com sucesso." },
    });
  });
});
