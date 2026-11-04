import { describe, beforeEach, it, vi, expect } from "vitest";

const {
  findManyMock,
  findUniqueMock,
  createMock,
  updateMock,
  categoryFindUniqueMock,
} = vi.hoisted(() => ({
  findManyMock: vi.fn(),
  findUniqueMock: vi.fn(),
  createMock: vi.fn(),
  updateMock: vi.fn(),
  categoryFindUniqueMock: vi.fn(),
}));

vi.mock("../../../src/db", () => ({
  prisma: {
    product: {
      findMany: findManyMock,
      findUnique: findUniqueMock,
      create: createMock,
      update: updateMock,
    },
    category: {
      findUnique: categoryFindUniqueMock,
    },
  },
}));

import { productService } from "../../../services/products-service";

const dbProduct = {
  id: "prod_1",
  name: "Produto demonstração",
  sku: "SKU-DEMO-001",
  barcode: "7891000100101",
  description: "Demo",
  categoryId: "cat_1",
  cost: { toString: () => "10" },
  salePrice: { toString: () => "19.9" },
  minStock: 5,
  status: "active" as const,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-02"),
  category: { id: "cat_1", name: "Geral" },
};

const publicProduct = {
  id: "prod_1",
  name: "Produto demonstração",
  sku: "SKU-DEMO-001",
  barcode: "7891000100101",
  description: "Demo",
  categoryId: "cat_1",
  category: { id: "cat_1", name: "Geral" },
  cost: 10,
  salePrice: 19.9,
  minStock: 5,
  status: "active" as const,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-02"),
};

describe("productService.getAllProducts", () => {
  beforeEach(() => {
    findManyMock.mockReset();
  });

  it("returns 200 with mapped products including category", async () => {
    findManyMock.mockResolvedValue([dbProduct]);

    const result = await productService.getAllProducts();

    expect(result).toEqual({ status: 200, data: [publicProduct] });
  });
});

describe("productService.createProduct", () => {
  beforeEach(() => {
    categoryFindUniqueMock.mockReset();
    createMock.mockReset();
  });

  it("returns 201 when creation succeeds", async () => {
    categoryFindUniqueMock.mockResolvedValue({ id: "cat_1" });
    createMock.mockResolvedValue(dbProduct);

    const result = await productService.createProduct({
      name: "Produto demonstração",
      sku: "SKU-DEMO-001",
      barcode: "7891000100101",
      description: "Demo",
      categoryId: "cat_1",
      cost: 10,
      salePrice: 19.9,
      minStock: 5,
      status: "active",
    });

    expect(result).toEqual({ status: 201, data: publicProduct });
  });

  it("returns 404 when category does not exist", async () => {
    categoryFindUniqueMock.mockResolvedValue(null);

    const result = await productService.createProduct({
      name: "Produto",
      sku: "SKU-1",
      categoryId: "missing",
      cost: 1,
      salePrice: 2,
      minStock: 0,
      status: "active",
    });

    expect(result).toEqual({
      status: 404,
      data: { message: "Categoria não encontrada." },
    });
    expect(createMock).not.toHaveBeenCalled();
  });

  it("returns 409 when sku is duplicated", async () => {
    categoryFindUniqueMock.mockResolvedValue({ id: "cat_1" });
    createMock.mockRejectedValue(new Error("Unique constraint failed"));

    const result = await productService.createProduct({
      name: "Produto",
      sku: "SKU-DEMO-001",
      categoryId: "cat_1",
      cost: 1,
      salePrice: 2,
      minStock: 0,
      status: "active",
    });

    expect(result).toEqual({
      status: 409,
      data: { message: "SKU ou código de barras já cadastrado." },
    });
  });
});

describe("productService.updateProductById", () => {
  beforeEach(() => {
    findUniqueMock.mockReset();
    categoryFindUniqueMock.mockReset();
    updateMock.mockReset();
  });

  it("returns 200 when update succeeds", async () => {
    findUniqueMock.mockResolvedValue({ id: "prod_1" });
    updateMock.mockResolvedValue({
      ...dbProduct,
      name: "Produto atualizado",
    });

    const result = await productService.updateProductById("prod_1", {
      name: "Produto atualizado",
    });

    expect(result).toEqual({
      status: 200,
      data: { ...publicProduct, name: "Produto atualizado" },
    });
  });

  it("returns 404 when product is missing", async () => {
    findUniqueMock.mockResolvedValue(null);

    const result = await productService.updateProductById("missing", {
      name: "X",
    });

    expect(result).toEqual({
      status: 404,
      data: { message: "Produto não encontrado." },
    });
  });
});

describe("productService.deleteProductById", () => {
  beforeEach(() => {
    findUniqueMock.mockReset();
    updateMock.mockReset();
  });

  it("soft deletes by setting status inactive", async () => {
    findUniqueMock.mockResolvedValue({ id: "prod_1" });
    updateMock.mockResolvedValue({ ...dbProduct, status: "inactive" });

    const result = await productService.deleteProductById("prod_1");

    expect(result).toEqual({
      status: 200,
      data: { message: "Produto desativado com sucesso." },
    });
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "prod_1" },
      data: { status: "inactive" },
    });
  });
});
