import { describe, beforeEach, it, vi, expect } from "vitest";

const {
  saleFindManyMock,
  saleFindUniqueMock,
  saleCountMock,
  saleAggregateMock,
  saleCreateMock,
  saleUpdateMock,
  warehouseFindUniqueMock,
  userFindUniqueMock,
  productFindManyMock,
  stockBalanceFindUniqueMock,
  stockBalanceUpsertMock,
  stockBalanceUpdateMock,
  stockMovementCreateMock,
  transactionMock,
} = vi.hoisted(() => ({
  saleFindManyMock: vi.fn(),
  saleFindUniqueMock: vi.fn(),
  saleCountMock: vi.fn(),
  saleAggregateMock: vi.fn(),
  saleCreateMock: vi.fn(),
  saleUpdateMock: vi.fn(),
  warehouseFindUniqueMock: vi.fn(),
  userFindUniqueMock: vi.fn(),
  productFindManyMock: vi.fn(),
  stockBalanceFindUniqueMock: vi.fn(),
  stockBalanceUpsertMock: vi.fn(),
  stockBalanceUpdateMock: vi.fn(),
  stockMovementCreateMock: vi.fn(),
  transactionMock: vi.fn(),
}));

vi.mock("../../../services/alerts-service", () => ({
  alertsService: {
    evaluateProduct: vi.fn().mockResolvedValue(undefined),
    evaluateWarehouse: vi.fn().mockResolvedValue(undefined),
    evaluateInventory: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock("../../../src/db", () => ({
  prisma: {
    $transaction: transactionMock,
    sale: {
      findMany: saleFindManyMock,
      findUnique: saleFindUniqueMock,
      count: saleCountMock,
      aggregate: saleAggregateMock,
      create: saleCreateMock,
      update: saleUpdateMock,
    },
    warehouse: {
      findUnique: warehouseFindUniqueMock,
    },
    user: {
      findUnique: userFindUniqueMock,
    },
    product: {
      findMany: productFindManyMock,
    },
    stockBalance: {
      findUnique: stockBalanceFindUniqueMock,
      upsert: stockBalanceUpsertMock,
      update: stockBalanceUpdateMock,
    },
    stockMovement: {
      create: stockMovementCreateMock,
    },
  },
}));

import { saleService } from "../../../services/sales-service";

const saleRow = {
  id: "sale_1",
  code: "VEN-001",
  status: "confirmed" as const,
  warehouseId: "wh_1",
  totalAmount: { toString: () => "100" },
  soldAt: new Date("2026-01-01"),
  createdById: "user_1",
  notes: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  warehouse: { name: "Galpão Central" },
  createdBy: { firstName: "Ana", lastName: "Silva" },
  items: [
    {
      id: "item_1",
      saleId: "sale_1",
      productId: "prod_1",
      quantity: 5,
      unitPrice: { toString: () => "20" },
      product: { name: "Parafuso M6", sku: "SKU-001" },
    },
  ],
};

const publicSale = {
  id: "sale_1",
  code: "VEN-001",
  status: "confirmed" as const,
  warehouseId: "wh_1",
  warehouseName: "Galpão Central",
  totalAmount: 100,
  soldAt: new Date("2026-01-01"),
  createdById: "user_1",
  createdByName: "Ana Silva",
  notes: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  items: [
    {
      id: "item_1",
      saleId: "sale_1",
      productId: "prod_1",
      quantity: 5,
      unitPrice: 20,
      productName: "Parafuso M6",
      productSku: "SKU-001",
    },
  ],
};

function mockArrayTransaction() {
  transactionMock.mockImplementation(async (ops: Promise<unknown>[]) =>
    Promise.all(ops),
  );
}

function mockInteractiveTransaction() {
  const tx = {
    sale: {
      create: saleCreateMock,
      update: saleUpdateMock,
    },
    stockBalance: {
      findUnique: stockBalanceFindUniqueMock,
      upsert: stockBalanceUpsertMock,
      update: stockBalanceUpdateMock,
    },
    stockMovement: {
      create: stockMovementCreateMock,
    },
  };

  transactionMock.mockImplementation(
    async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx),
  );
}

describe("saleService.listSales", () => {
  beforeEach(() => {
    saleFindManyMock.mockReset();
    saleCountMock.mockReset();
    transactionMock.mockReset();
    mockArrayTransaction();
  });

  it("returns 200 with paginated sales", async () => {
    saleFindManyMock.mockResolvedValue([saleRow]);
    saleCountMock.mockResolvedValue(1);

    const result = await saleService.listSales(1);

    expect(saleFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { soldAt: "desc" },
      }),
    );
    expect(result).toEqual({
      status: 200,
      data: {
        items: [publicSale],
        total: 1,
        page: 1,
        pageSize: 10,
      },
    });
  });

  it("returns 200 with empty list when there are no sales", async () => {
    saleFindManyMock.mockResolvedValue([]);
    saleCountMock.mockResolvedValue(0);

    const result = await saleService.listSales(1);

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
    saleFindManyMock.mockResolvedValue([]);
    saleCountMock.mockResolvedValue(15);

    await saleService.listSales(2);

    expect(saleFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      }),
    );
  });

  it("filters by sale code when code is provided", async () => {
    saleFindManyMock.mockResolvedValue([saleRow]);
    saleCountMock.mockResolvedValue(1);

    await saleService.listSales(1, "VEN-001");

    expect(saleFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          code: { contains: "VEN-001", mode: "insensitive" },
        },
      }),
    );
  });
});

describe("saleService.getSummary", () => {
  beforeEach(() => {
    saleCountMock.mockReset();
    saleAggregateMock.mockReset();
    transactionMock.mockReset();
    mockArrayTransaction();
  });

  it("returns 200 with global sale metrics", async () => {
    saleCountMock
      .mockResolvedValueOnce(20)
      .mockResolvedValueOnce(15)
      .mockResolvedValueOnce(5);
    saleAggregateMock.mockResolvedValue({
      _sum: { totalAmount: { toString: () => "1500.5" } },
    });

    const result = await saleService.getSummary();

    expect(result).toEqual({
      status: 200,
      data: {
        total: 20,
        confirmed: 15,
        cancelled: 5,
        totalAmount: 1500.5,
      },
    });
  });

  it("returns zeros when there are no sales", async () => {
    saleCountMock.mockResolvedValue(0);
    saleAggregateMock.mockResolvedValue({ _sum: { totalAmount: null } });

    const result = await saleService.getSummary();

    expect(result).toEqual({
      status: 200,
      data: {
        total: 0,
        confirmed: 0,
        cancelled: 0,
        totalAmount: 0,
      },
    });
  });
});

describe("saleService.createSale", () => {
  beforeEach(() => {
    warehouseFindUniqueMock.mockReset();
    userFindUniqueMock.mockReset();
    productFindManyMock.mockReset();
    stockBalanceFindUniqueMock.mockReset();
    stockBalanceUpdateMock.mockReset();
    stockMovementCreateMock.mockReset();
    saleCreateMock.mockReset();
    transactionMock.mockReset();
    mockInteractiveTransaction();

    warehouseFindUniqueMock.mockResolvedValue({
      id: "wh_1",
      status: "active",
    });
    userFindUniqueMock.mockResolvedValue({ id: "user_1" });
    productFindManyMock.mockResolvedValue([
      { id: "prod_1", name: "Parafuso M6", status: "active" },
    ]);
  });

  it("creates a confirmed sale and decrements stock", async () => {
    stockBalanceFindUniqueMock.mockResolvedValue({
      id: "bal_1",
      quantity: 20,
    });
    saleCreateMock.mockResolvedValue(saleRow);

    const result = await saleService.createSale(
      {
        code: "VEN-001",
        warehouseId: "wh_1",
        soldAt: new Date("2026-01-01"),
        items: [{ productId: "prod_1", quantity: 5, unitPrice: 20 }],
      },
      "user_1",
    );

    expect(stockBalanceUpdateMock).toHaveBeenCalledWith({
      where: { id: "bal_1" },
      data: { quantity: { decrement: 5 } },
    });
    expect(stockMovementCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: "out",
          referenceType: "sale",
          referenceId: "sale_1",
        }),
      }),
    );
    expect(result).toEqual({ status: 201, data: publicSale });
  });

  it("returns 400 when stock is insufficient", async () => {
    stockBalanceFindUniqueMock.mockResolvedValue({
      id: "bal_1",
      quantity: 2,
    });
    saleCreateMock.mockResolvedValue(saleRow);

    const result = await saleService.createSale(
      {
        code: "VEN-001",
        warehouseId: "wh_1",
        soldAt: new Date("2026-01-01"),
        items: [{ productId: "prod_1", quantity: 5, unitPrice: 20 }],
      },
      "user_1",
    );

    expect(result).toEqual({
      status: 400,
      data: { message: "Saldo insuficiente para o produto Parafuso M6." },
    });
  });

  it("returns 404 when warehouse is missing", async () => {
    warehouseFindUniqueMock.mockResolvedValue(null);

    const result = await saleService.createSale(
      {
        code: "VEN-001",
        warehouseId: "missing",
        soldAt: new Date("2026-01-01"),
        items: [{ productId: "prod_1", quantity: 1, unitPrice: 10 }],
      },
      "user_1",
    );

    expect(result).toEqual({
      status: 404,
      data: { message: "Galpão não encontrado." },
    });
  });

  it("returns 404 when product is missing", async () => {
    productFindManyMock.mockResolvedValue([]);

    const result = await saleService.createSale(
      {
        code: "VEN-001",
        warehouseId: "wh_1",
        soldAt: new Date("2026-01-01"),
        items: [{ productId: "missing", quantity: 1, unitPrice: 10 }],
      },
      "user_1",
    );

    expect(result).toEqual({
      status: 404,
      data: { message: "Produto não encontrado." },
    });
  });
});

describe("saleService.cancelSale", () => {
  beforeEach(() => {
    saleFindUniqueMock.mockReset();
    userFindUniqueMock.mockReset();
    saleUpdateMock.mockReset();
    stockBalanceUpsertMock.mockReset();
    stockMovementCreateMock.mockReset();
    transactionMock.mockReset();
    mockInteractiveTransaction();
    userFindUniqueMock.mockResolvedValue({ id: "user_1" });
  });

  it("cancels a confirmed sale and restores stock", async () => {
    saleFindUniqueMock.mockResolvedValue(saleRow);
    saleUpdateMock.mockResolvedValue({
      ...saleRow,
      status: "cancelled",
    });

    const result = await saleService.cancelSale("sale_1", "user_1");

    expect(saleUpdateMock).toHaveBeenCalledWith({
      where: { id: "sale_1" },
      data: { status: "cancelled" },
      include: expect.any(Object),
    });
    expect(stockBalanceUpsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        create: {
          productId: "prod_1",
          warehouseId: "wh_1",
          quantity: 5,
        },
        update: { quantity: { increment: 5 } },
      }),
    );
    expect(stockMovementCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: "in",
          referenceType: "sale",
          referenceId: "sale_1",
        }),
      }),
    );
    expect(result.status).toBe(200);
    expect(result.data).toEqual({
      ...publicSale,
      status: "cancelled",
    });
  });

  it("returns 404 when sale is missing", async () => {
    saleFindUniqueMock.mockResolvedValue(null);

    const result = await saleService.cancelSale("missing", "user_1");

    expect(result).toEqual({
      status: 404,
      data: { message: "Venda não encontrada." },
    });
  });

  it("returns 409 when sale is already cancelled", async () => {
    saleFindUniqueMock.mockResolvedValue({
      ...saleRow,
      status: "cancelled",
    });

    const result = await saleService.cancelSale("sale_1", "user_1");

    expect(result).toEqual({
      status: 409,
      data: { message: "Somente vendas confirmadas podem ser canceladas." },
    });
  });
});
