import { describe, beforeEach, it, vi, expect } from "vitest";

const {
  findManyMock,
  findUniqueMock,
  createMock,
  updateMock,
  countMock,
  categoryFindUniqueMock,
  categoryCountMock,
  transactionMock,
} = vi.hoisted(() => ({
  findManyMock: vi.fn(),
  findUniqueMock: vi.fn(),
  createMock: vi.fn(),
  updateMock: vi.fn(),
  countMock: vi.fn(),
  categoryFindUniqueMock: vi.fn(),
  categoryCountMock: vi.fn(),
  transactionMock: vi.fn(async (ops: Promise<unknown>[]) => Promise.all(ops)),
}));

vi.mock("../../../src/db", () => ({
  prisma: {
    $transaction: transactionMock,
    product: {
      findMany: findManyMock,
      findUnique: findUniqueMock,
      create: createMock,
      update: updateMock,
      count: countMock,
    },
    category: {
      findUnique: categoryFindUniqueMock,
      count: categoryCountMock,
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
  stockBalances: [] as { quantity: number }[],
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
  stockQuantity: 0,
  status: "active" as const,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-02"),
};

describe("productService.listProducts", () => {
  beforeEach(() => {
    findManyMock.mockReset();
    countMock.mockReset();
    transactionMock.mockClear();
  });

  it("returns 200 with paginated products including category", async () => {
    findManyMock.mockResolvedValue([dbProduct]);
    countMock.mockResolvedValue(1);

    const result = await productService.listProducts(1);

    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { createdAt: "desc" },
      }),
    );
    expect(result).toEqual({
      status: 200,
      data: {
        items: [publicProduct],
        total: 1,
        page: 1,
        pageSize: 10,
      },
    });
  });

  it("returns 200 with empty list when there are no products", async () => {
    findManyMock.mockResolvedValue([]);
    countMock.mockResolvedValue(0);

    const result = await productService.listProducts(1);

    expect(result).toEqual({
      status: 200,
      data: {
        items: [],
        total: 0,
        page: 1,
        pageSize: 10,
      },
    });
  });

  it("applies skip for page 2", async () => {
    findManyMock.mockResolvedValue([]);
    countMock.mockResolvedValue(15);

    await productService.listProducts(2);

    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      }),
    );
  });

  it("filters by product name when name is provided", async () => {
    findManyMock.mockResolvedValue([dbProduct]);
    countMock.mockResolvedValue(1);

    await productService.listProducts(1, "demonstração");

    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          name: { contains: "demonstração", mode: "insensitive" },
        },
      }),
    );
    expect(countMock).toHaveBeenCalledWith({
      where: {
        name: { contains: "demonstração", mode: "insensitive" },
      },
    });
  });

  it("sums stockBalances into stockQuantity", async () => {
    findManyMock.mockResolvedValue([
      {
        ...dbProduct,
        stockBalances: [{ quantity: 10 }, { quantity: 5 }],
      },
    ]);
    countMock.mockResolvedValue(1);

    const result = await productService.listProducts(1);

    expect(result).toEqual({
      status: 200,
      data: {
        items: [{ ...publicProduct, stockQuantity: 15 }],
        total: 1,
        page: 1,
        pageSize: 10,
      },
    });
  });
});

describe("productService.getSummary", () => {
  beforeEach(() => {
    countMock.mockReset();
    categoryCountMock.mockReset();
    transactionMock.mockClear();
  });

  it("returns 200 with global product metrics", async () => {
    countMock
      .mockResolvedValueOnce(20)
      .mockResolvedValueOnce(15)
      .mockResolvedValueOnce(5);
    categoryCountMock.mockResolvedValue(4);

    const result = await productService.getSummary();

    expect(result).toEqual({
      status: 200,
      data: {
        total: 20,
        active: 15,
        inactive: 5,
        categories: 4,
      },
    });
  });

  it("returns zeros when there are no products or categories", async () => {
    countMock.mockResolvedValue(0);
    categoryCountMock.mockResolvedValue(0);

    const result = await productService.getSummary();

    expect(result).toEqual({
      status: 200,
      data: {
        total: 0,
        active: 0,
        inactive: 0,
        categories: 0,
      },
    });
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
