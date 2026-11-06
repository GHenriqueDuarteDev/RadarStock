import { describe, beforeEach, it, vi, expect } from "vitest";

const {
  findManyMock,
  findUniqueMock,
  createMock,
  updateMock,
  countMock,
  aggregateMock,
  stockBalanceFindManyMock,
  transactionMock,
} = vi.hoisted(() => ({
  findManyMock: vi.fn(),
  findUniqueMock: vi.fn(),
  createMock: vi.fn(),
  updateMock: vi.fn(),
  countMock: vi.fn(),
  aggregateMock: vi.fn(),
  stockBalanceFindManyMock: vi.fn(),
  transactionMock: vi.fn(async (ops: Promise<unknown>[]) => Promise.all(ops)),
}));

vi.mock("../../../src/db", () => ({
  prisma: {
    $transaction: transactionMock,
    warehouse: {
      findMany: findManyMock,
      findUnique: findUniqueMock,
      create: createMock,
      update: updateMock,
      count: countMock,
      aggregate: aggregateMock,
    },
    stockBalance: {
      findMany: stockBalanceFindManyMock,
    },
  },
}));

import { warehouseService } from "../../../services/warehouses-service";

const publicWarehouse = {
  id: "wh_1",
  name: "Galpão Central",
  code: "GAL-001",
  address: "Rua A, 100",
  capacity: 1000,
  status: "active" as const,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-02"),
};

describe("warehouseService.listWarehouses", () => {
  beforeEach(() => {
    findManyMock.mockReset();
    countMock.mockReset();
    transactionMock.mockClear();
  });

  it("returns 200 with paginated warehouses", async () => {
    findManyMock.mockResolvedValue([publicWarehouse]);
    countMock.mockResolvedValue(1);

    const result = await warehouseService.listWarehouses(1);

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
        items: [publicWarehouse],
        total: 1,
        page: 1,
        pageSize: 10,
      },
    });
  });

  it("returns 200 with empty list when there are no warehouses", async () => {
    findManyMock.mockResolvedValue([]);
    countMock.mockResolvedValue(0);

    const result = await warehouseService.listWarehouses(1);

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

    await warehouseService.listWarehouses(2);

    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      }),
    );
  });

  it("filters by warehouse name when name is provided", async () => {
    findManyMock.mockResolvedValue([publicWarehouse]);
    countMock.mockResolvedValue(1);

    await warehouseService.listWarehouses(1, "Central");

    expect(findManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          name: { contains: "Central", mode: "insensitive" },
        },
      }),
    );
    expect(countMock).toHaveBeenCalledWith({
      where: {
        name: { contains: "Central", mode: "insensitive" },
      },
    });
  });
});

describe("warehouseService.getSummary", () => {
  beforeEach(() => {
    countMock.mockReset();
    aggregateMock.mockReset();
    transactionMock.mockClear();
  });

  it("returns 200 with global warehouse metrics", async () => {
    countMock
      .mockResolvedValueOnce(20)
      .mockResolvedValueOnce(15)
      .mockResolvedValueOnce(5);
    aggregateMock.mockResolvedValue({ _sum: { capacity: 12500 } });

    const result = await warehouseService.getSummary();

    expect(result).toEqual({
      status: 200,
      data: {
        total: 20,
        active: 15,
        inactive: 5,
        totalCapacity: 12500,
      },
    });
  });

  it("returns zeros when there are no warehouses", async () => {
    countMock.mockResolvedValue(0);
    aggregateMock.mockResolvedValue({ _sum: { capacity: null } });

    const result = await warehouseService.getSummary();

    expect(result).toEqual({
      status: 200,
      data: {
        total: 0,
        active: 0,
        inactive: 0,
        totalCapacity: 0,
      },
    });
  });
});

describe("warehouseService.createWarehouse", () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it("returns 201 when creation succeeds", async () => {
    createMock.mockResolvedValue(publicWarehouse);

    const result = await warehouseService.createWarehouse({
      name: "Galpão Central",
      code: "GAL-001",
      address: "Rua A, 100",
      capacity: 1000,
      status: "active",
    });

    expect(result).toEqual({ status: 201, data: publicWarehouse });
  });

  it("returns 409 when code is duplicated", async () => {
    createMock.mockRejectedValue(new Error("Unique constraint failed"));

    const result = await warehouseService.createWarehouse({
      name: "Galpão",
      code: "GAL-001",
      status: "active",
    });

    expect(result).toEqual({
      status: 409,
      data: { message: "Código de galpão já cadastrado." },
    });
  });
});

describe("warehouseService.updateWarehouseById", () => {
  beforeEach(() => {
    findUniqueMock.mockReset();
    updateMock.mockReset();
  });

  it("returns 200 when update succeeds", async () => {
    findUniqueMock.mockResolvedValue({ id: "wh_1" });
    updateMock.mockResolvedValue({
      ...publicWarehouse,
      name: "Galpão Norte",
    });

    const result = await warehouseService.updateWarehouseById("wh_1", {
      name: "Galpão Norte",
    });

    expect(result).toEqual({
      status: 200,
      data: { ...publicWarehouse, name: "Galpão Norte" },
    });
  });

  it("returns 404 when warehouse is missing", async () => {
    findUniqueMock.mockResolvedValue(null);

    const result = await warehouseService.updateWarehouseById("missing", {
      name: "X",
    });

    expect(result).toEqual({
      status: 404,
      data: { message: "Galpão não encontrado." },
    });
  });
});

describe("warehouseService.deleteWarehouseById", () => {
  beforeEach(() => {
    findUniqueMock.mockReset();
    updateMock.mockReset();
  });

  it("soft deletes by setting status inactive", async () => {
    findUniqueMock.mockResolvedValue({ id: "wh_1" });
    updateMock.mockResolvedValue({ ...publicWarehouse, status: "inactive" });

    const result = await warehouseService.deleteWarehouseById("wh_1");

    expect(result).toEqual({
      status: 200,
      data: { message: "Galpão desativado com sucesso." },
    });
    expect(updateMock).toHaveBeenCalledWith({
      where: { id: "wh_1" },
      data: { status: "inactive" },
    });
  });
});

describe("warehouseService.listBalances", () => {
  beforeEach(() => {
    findUniqueMock.mockReset();
    stockBalanceFindManyMock.mockReset();
  });

  it("returns balances for an existing warehouse", async () => {
    findUniqueMock.mockResolvedValue({ id: "wh_1" });
    stockBalanceFindManyMock.mockResolvedValue([
      {
        productId: "prod_1",
        quantity: 12,
        product: {
          id: "prod_1",
          name: "Parafuso M6",
          sku: "SKU-001",
          status: "active",
        },
      },
      {
        productId: "prod_2",
        quantity: 3,
        product: {
          id: "prod_2",
          name: "Inativo",
          sku: "SKU-002",
          status: "inactive",
        },
      },
    ]);

    const result = await warehouseService.listBalances("wh_1");

    expect(result).toEqual({
      status: 200,
      data: {
        items: [
          {
            productId: "prod_1",
            productName: "Parafuso M6",
            productSku: "SKU-001",
            quantity: 12,
          },
        ],
      },
    });
  });

  it("returns 404 when warehouse is missing", async () => {
    findUniqueMock.mockResolvedValue(null);

    const result = await warehouseService.listBalances("missing");

    expect(result).toEqual({
      status: 404,
      data: { message: "Galpão não encontrado." },
    });
  });
});
