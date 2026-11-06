import { describe, beforeEach, it, vi, expect } from "vitest";

const {
  inventoryCountFindManyMock,
  inventoryCountFindFirstMock,
  inventoryCountFindUniqueMock,
  inventoryCountCountMock,
  inventoryCountCreateMock,
  inventoryCountUpdateMock,
  inventoryCountItemUpdateManyMock,
  warehouseFindUniqueMock,
  userFindUniqueMock,
  stockBalanceFindManyMock,
  stockBalanceUpsertMock,
  stockMovementCreateMock,
  transactionMock,
} = vi.hoisted(() => ({
  inventoryCountFindManyMock: vi.fn(),
  inventoryCountFindFirstMock: vi.fn(),
  inventoryCountFindUniqueMock: vi.fn(),
  inventoryCountCountMock: vi.fn(),
  inventoryCountCreateMock: vi.fn(),
  inventoryCountUpdateMock: vi.fn(),
  inventoryCountItemUpdateManyMock: vi.fn(),
  warehouseFindUniqueMock: vi.fn(),
  userFindUniqueMock: vi.fn(),
  stockBalanceFindManyMock: vi.fn(),
  stockBalanceUpsertMock: vi.fn(),
  stockMovementCreateMock: vi.fn(),
  transactionMock: vi.fn(),
}));

vi.mock("../../../src/db", () => ({
  prisma: {
    $transaction: transactionMock,
    inventoryCount: {
      findMany: inventoryCountFindManyMock,
      findFirst: inventoryCountFindFirstMock,
      findUnique: inventoryCountFindUniqueMock,
      count: inventoryCountCountMock,
      create: inventoryCountCreateMock,
      update: inventoryCountUpdateMock,
    },
    inventoryCountItem: {
      updateMany: inventoryCountItemUpdateManyMock,
    },
    warehouse: {
      findUnique: warehouseFindUniqueMock,
    },
    user: {
      findUnique: userFindUniqueMock,
    },
    stockBalance: {
      findMany: stockBalanceFindManyMock,
      upsert: stockBalanceUpsertMock,
    },
    stockMovement: {
      create: stockMovementCreateMock,
    },
  },
}));

import { inventoryCountService } from "../../../services/inventory-counts-service";

const inventoryRow = {
  id: "inv_1",
  code: "INV-001",
  status: "draft" as const,
  warehouseId: "wh_1",
  countedAt: null as Date | null,
  createdById: "user_1",
  notes: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  warehouse: { name: "Galpão Central" },
  createdBy: { firstName: "Ana", lastName: "Silva" },
  items: [
    {
      id: "item_1",
      inventoryCountId: "inv_1",
      productId: "prod_1",
      expectedQty: 10,
      countedQty: 0,
      product: { name: "Parafuso M6", sku: "SKU-001" },
    },
    {
      id: "item_2",
      inventoryCountId: "inv_1",
      productId: "prod_2",
      expectedQty: 5,
      countedQty: 4,
      product: { name: "Fone", sku: "SKU-002" },
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
    inventoryCount: {
      create: inventoryCountCreateMock,
      update: inventoryCountUpdateMock,
    },
    inventoryCountItem: {
      updateMany: inventoryCountItemUpdateManyMock,
    },
    stockBalance: {
      upsert: stockBalanceUpsertMock,
    },
    stockMovement: {
      create: stockMovementCreateMock,
    },
  };

  transactionMock.mockImplementation(
    async (fn: (client: typeof tx) => Promise<unknown>) => fn(tx),
  );
}

describe("inventoryCountService.getSummary", () => {
  beforeEach(() => {
    inventoryCountCountMock.mockReset();
    inventoryCountFindManyMock.mockReset();
    transactionMock.mockReset();
    mockArrayTransaction();
  });

  it("returns operational metrics with accuracy", async () => {
    inventoryCountCountMock
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2);
    inventoryCountFindManyMock.mockResolvedValue([
      {
        items: [
          { expectedQty: 10, countedQty: 0 },
          { expectedQty: 5, countedQty: 4 },
          { expectedQty: 8, countedQty: 8 },
        ],
      },
    ]);

    const result = await inventoryCountService.getSummary();

    expect(result).toEqual({
      status: 200,
      data: {
        inProgress: 3,
        discrepancies: 1,
        averageAccuracy: 50,
        completed: 2,
      },
    });
  });
});

describe("inventoryCountService.createInventoryCount", () => {
  beforeEach(() => {
    warehouseFindUniqueMock.mockReset();
    userFindUniqueMock.mockReset();
    stockBalanceFindManyMock.mockReset();
    inventoryCountFindFirstMock.mockReset();
    inventoryCountCreateMock.mockReset();
  });

  it("creates draft items from warehouse balances with countedQty 0", async () => {
    warehouseFindUniqueMock.mockResolvedValue({
      id: "wh_1",
      status: "active",
    });
    userFindUniqueMock.mockResolvedValue({ id: "user_1" });
    stockBalanceFindManyMock.mockResolvedValue([
      {
        productId: "prod_1",
        quantity: 10,
        product: { id: "prod_1", status: "active" },
      },
    ]);
    inventoryCountFindFirstMock.mockResolvedValue(null);

    const pad = (value: number) => String(value).padStart(2, "0");
    const now = new Date();
    const expectedCode = `INV-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-001`;

    inventoryCountCreateMock.mockResolvedValue({
      ...inventoryRow,
      code: expectedCode,
      items: [inventoryRow.items[0]],
    });

    const result = await inventoryCountService.createInventoryCount(
      {
        warehouseId: "wh_1",
      },
      "user_1",
    );

    expect(inventoryCountCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          code: expectedCode,
          status: "draft",
          items: {
            create: [
              {
                productId: "prod_1",
                expectedQty: 10,
                countedQty: 0,
              },
            ],
          },
        }),
      }),
    );
    expect(result.status).toBe(201);
  });

  it("increments the daily sequence when a code already exists", async () => {
    warehouseFindUniqueMock.mockResolvedValue({
      id: "wh_1",
      status: "active",
    });
    userFindUniqueMock.mockResolvedValue({ id: "user_1" });
    stockBalanceFindManyMock.mockResolvedValue([
      {
        productId: "prod_1",
        quantity: 10,
        product: { id: "prod_1", status: "active" },
      },
    ]);

    const pad = (value: number) => String(value).padStart(2, "0");
    const now = new Date();
    const prefix = `INV-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-`;
    inventoryCountFindFirstMock.mockResolvedValue({
      code: `${prefix}003`,
    });

    const expectedCode = `${prefix}004`;
    inventoryCountCreateMock.mockResolvedValue({
      ...inventoryRow,
      code: expectedCode,
      items: [inventoryRow.items[0]],
    });

    const result = await inventoryCountService.createInventoryCount(
      { warehouseId: "wh_1" },
      "user_1",
    );

    expect(inventoryCountCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ code: expectedCode }),
      }),
    );
    expect(result.status).toBe(201);
  });

  it("returns 400 when warehouse has no stock balances", async () => {
    warehouseFindUniqueMock.mockResolvedValue({
      id: "wh_1",
      status: "active",
    });
    userFindUniqueMock.mockResolvedValue({ id: "user_1" });
    stockBalanceFindManyMock.mockResolvedValue([]);

    const result = await inventoryCountService.createInventoryCount(
      { warehouseId: "wh_1" },
      "user_1",
    );

    expect(result).toEqual({
      status: 400,
      data: { message: "Galpão sem produtos em estoque para contagem." },
    });
  });
});

describe("inventoryCountService.updateInventoryCount", () => {
  beforeEach(() => {
    inventoryCountFindUniqueMock.mockReset();
    inventoryCountUpdateMock.mockReset();
    inventoryCountItemUpdateManyMock.mockReset();
    transactionMock.mockReset();
    mockInteractiveTransaction();
  });

  it("updates countedQty without changing expectedQty", async () => {
    inventoryCountFindUniqueMock.mockResolvedValue({
      id: "inv_1",
      status: "draft",
      items: [{ id: "item_1", productId: "prod_1" }],
    });
    inventoryCountUpdateMock.mockResolvedValue({
      ...inventoryRow,
      items: [
        {
          ...inventoryRow.items[0],
          countedQty: 9,
        },
      ],
    });

    const result = await inventoryCountService.updateInventoryCount("inv_1", {
      items: [{ productId: "prod_1", countedQty: 9 }],
    });

    expect(inventoryCountItemUpdateManyMock).toHaveBeenCalledWith({
      where: { inventoryCountId: "inv_1", productId: "prod_1" },
      data: { countedQty: 9 },
    });
    expect(result.status).toBe(200);
    expect(result.data.items[0]?.expectedQty).toBe(10);
    expect(result.data.items[0]?.countedQty).toBe(9);
  });
});

describe("inventoryCountService.confirmInventoryCount", () => {
  beforeEach(() => {
    inventoryCountFindUniqueMock.mockReset();
    userFindUniqueMock.mockReset();
    inventoryCountUpdateMock.mockReset();
    stockBalanceUpsertMock.mockReset();
    stockMovementCreateMock.mockReset();
    transactionMock.mockReset();
    mockInteractiveTransaction();
  });

  it("skips countedQty 0 and applies countedQty > 0", async () => {
    inventoryCountFindUniqueMock.mockResolvedValue(inventoryRow);
    userFindUniqueMock.mockResolvedValue({ id: "user_1" });
    inventoryCountUpdateMock.mockResolvedValue({
      ...inventoryRow,
      status: "confirmed",
    });

    const result = await inventoryCountService.confirmInventoryCount(
      "inv_1",
      "user_1",
    );

    expect(stockBalanceUpsertMock).toHaveBeenCalledTimes(1);
    expect(stockBalanceUpsertMock).toHaveBeenCalledWith({
      where: {
        productId_warehouseId: { productId: "prod_2", warehouseId: "wh_1" },
      },
      create: { productId: "prod_2", warehouseId: "wh_1", quantity: 4 },
      update: { quantity: 4 },
    });
    expect(stockMovementCreateMock).toHaveBeenCalledTimes(1);
    expect(result.status).toBe(200);
  });
});

describe("inventoryCountService.cancelInventoryCount", () => {
  beforeEach(() => {
    inventoryCountFindUniqueMock.mockReset();
    userFindUniqueMock.mockReset();
    inventoryCountUpdateMock.mockReset();
    stockBalanceUpsertMock.mockReset();
    stockMovementCreateMock.mockReset();
    transactionMock.mockReset();
    mockInteractiveTransaction();
  });

  it("reverts only applied items with countedQty > 0", async () => {
    inventoryCountFindUniqueMock.mockResolvedValue({
      ...inventoryRow,
      status: "confirmed",
    });
    userFindUniqueMock.mockResolvedValue({ id: "user_1" });
    inventoryCountUpdateMock.mockResolvedValue({
      ...inventoryRow,
      status: "cancelled",
    });

    const result = await inventoryCountService.cancelInventoryCount(
      "inv_1",
      "user_1",
    );

    expect(stockBalanceUpsertMock).toHaveBeenCalledTimes(1);
    expect(stockBalanceUpsertMock).toHaveBeenCalledWith({
      where: {
        productId_warehouseId: { productId: "prod_2", warehouseId: "wh_1" },
      },
      create: { productId: "prod_2", warehouseId: "wh_1", quantity: 5 },
      update: { quantity: 5 },
    });
    expect(result.status).toBe(200);
  });
});
