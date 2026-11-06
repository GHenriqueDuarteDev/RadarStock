import { describe, beforeEach, it, vi, expect } from "vitest";

const {
  stockMovementFindManyMock,
  stockMovementFindUniqueMock,
  stockMovementCountMock,
  stockMovementCreateMock,
  productFindUniqueMock,
  warehouseFindUniqueMock,
  userFindUniqueMock,
  stockBalanceFindUniqueMock,
  stockBalanceUpsertMock,
  stockBalanceUpdateMock,
  transactionMock,
} = vi.hoisted(() => ({
  stockMovementFindManyMock: vi.fn(),
  stockMovementFindUniqueMock: vi.fn(),
  stockMovementCountMock: vi.fn(),
  stockMovementCreateMock: vi.fn(),
  productFindUniqueMock: vi.fn(),
  warehouseFindUniqueMock: vi.fn(),
  userFindUniqueMock: vi.fn(),
  stockBalanceFindUniqueMock: vi.fn(),
  stockBalanceUpsertMock: vi.fn(),
  stockBalanceUpdateMock: vi.fn(),
  transactionMock: vi.fn(),
}));

vi.mock("../../../src/db", () => ({
  prisma: {
    $transaction: transactionMock,
    stockMovement: {
      findMany: stockMovementFindManyMock,
      findUnique: stockMovementFindUniqueMock,
      count: stockMovementCountMock,
      create: stockMovementCreateMock,
    },
    product: {
      findUnique: productFindUniqueMock,
    },
    warehouse: {
      findUnique: warehouseFindUniqueMock,
    },
    user: {
      findUnique: userFindUniqueMock,
    },
    stockBalance: {
      findUnique: stockBalanceFindUniqueMock,
      upsert: stockBalanceUpsertMock,
      update: stockBalanceUpdateMock,
    },
  },
}));

import { stockMovementService } from "../../../services/stock-movements-service";

const movementRow = {
  id: "mov_1",
  type: "in" as const,
  productId: "prod_1",
  quantity: 10,
  fromWarehouseId: null,
  toWarehouseId: "wh_1",
  userId: "user_1",
  note: "Entrada inicial",
  referenceType: "manual" as const,
  referenceId: null,
  createdAt: new Date("2026-01-01"),
  product: { name: "Parafuso M6", sku: "SKU-001" },
  fromWarehouse: null,
  toWarehouse: { name: "Galpão Central" },
  user: { firstName: "Ana", lastName: "Silva" },
};

const publicMovement = {
  id: "mov_1",
  type: "in" as const,
  productId: "prod_1",
  quantity: 10,
  fromWarehouseId: null,
  toWarehouseId: "wh_1",
  userId: "user_1",
  note: "Entrada inicial",
  referenceType: "manual" as const,
  referenceId: null,
  createdAt: new Date("2026-01-01"),
  productName: "Parafuso M6",
  productSku: "SKU-001",
  fromWarehouseName: null,
  toWarehouseName: "Galpão Central",
  userName: "Ana Silva",
};

function mockArrayTransaction() {
  transactionMock.mockImplementation(async (ops: Promise<unknown>[]) =>
    Promise.all(ops),
  );
}

function mockInteractiveTransaction() {
  const tx = {
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

describe("stockMovementService.listMovements", () => {
  beforeEach(() => {
    stockMovementFindManyMock.mockReset();
    stockMovementCountMock.mockReset();
    transactionMock.mockReset();
    mockArrayTransaction();
  });

  it("returns 200 with paginated movements", async () => {
    stockMovementFindManyMock.mockResolvedValue([movementRow]);
    stockMovementCountMock.mockResolvedValue(1);

    const result = await stockMovementService.listMovements(1);

    expect(stockMovementFindManyMock).toHaveBeenCalledWith(
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
        items: [publicMovement],
        total: 1,
        page: 1,
        pageSize: 10,
      },
    });
  });

  it("returns 200 with empty list when there are no movements", async () => {
    stockMovementFindManyMock.mockResolvedValue([]);
    stockMovementCountMock.mockResolvedValue(0);

    const result = await stockMovementService.listMovements(1);

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
    stockMovementFindManyMock.mockResolvedValue([]);
    stockMovementCountMock.mockResolvedValue(15);

    await stockMovementService.listMovements(2);

    expect(stockMovementFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      }),
    );
  });

  it("filters by product name when name is provided", async () => {
    stockMovementFindManyMock.mockResolvedValue([movementRow]);
    stockMovementCountMock.mockResolvedValue(1);

    await stockMovementService.listMovements(1, "Parafuso");

    expect(stockMovementFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          product: {
            name: { contains: "Parafuso", mode: "insensitive" },
          },
        },
      }),
    );
    expect(stockMovementCountMock).toHaveBeenCalledWith({
      where: {
        product: {
          name: { contains: "Parafuso", mode: "insensitive" },
        },
      },
    });
  });
});

describe("stockMovementService.getSummary", () => {
  beforeEach(() => {
    stockMovementCountMock.mockReset();
    transactionMock.mockReset();
    mockArrayTransaction();
  });

  it("returns 200 with global movement metrics", async () => {
    stockMovementCountMock
      .mockResolvedValueOnce(20)
      .mockResolvedValueOnce(8)
      .mockResolvedValueOnce(6)
      .mockResolvedValueOnce(4);

    const result = await stockMovementService.getSummary();

    expect(result).toEqual({
      status: 200,
      data: {
        total: 20,
        in: 8,
        out: 6,
        transfer: 4,
      },
    });
  });

  it("returns zeros when there are no movements", async () => {
    stockMovementCountMock.mockResolvedValue(0);

    const result = await stockMovementService.getSummary();

    expect(result).toEqual({
      status: 200,
      data: {
        total: 0,
        in: 0,
        out: 0,
        transfer: 0,
      },
    });
  });
});

describe("stockMovementService.createMovement", () => {
  beforeEach(() => {
    productFindUniqueMock.mockReset();
    warehouseFindUniqueMock.mockReset();
    userFindUniqueMock.mockReset();
    stockBalanceFindUniqueMock.mockReset();
    stockBalanceUpsertMock.mockReset();
    stockBalanceUpdateMock.mockReset();
    stockMovementCreateMock.mockReset();
    transactionMock.mockReset();
    mockInteractiveTransaction();

    productFindUniqueMock.mockResolvedValue({
      id: "prod_1",
      status: "active",
    });
    warehouseFindUniqueMock.mockResolvedValue({
      id: "wh_1",
      status: "active",
    });
    userFindUniqueMock.mockResolvedValue({ id: "user_1" });
  });

  it("creates an in movement and increments stock balance", async () => {
    stockMovementCreateMock.mockResolvedValue(movementRow);

    const result = await stockMovementService.createMovement(
      {
        type: "in",
        productId: "prod_1",
        quantity: 10,
        toWarehouseId: "wh_1",
        note: "Entrada inicial",
        referenceType: "manual",
      },
      "user_1",
    );

    expect(stockBalanceUpsertMock).toHaveBeenCalledWith({
      where: {
        productId_warehouseId: { productId: "prod_1", warehouseId: "wh_1" },
      },
      create: { productId: "prod_1", warehouseId: "wh_1", quantity: 10 },
      update: { quantity: { increment: 10 } },
    });
    expect(result).toEqual({ status: 201, data: publicMovement });
  });

  it("creates an out movement when balance is sufficient", async () => {
    stockBalanceFindUniqueMock.mockResolvedValue({
      id: "bal_1",
      quantity: 20,
    });
    stockMovementCreateMock.mockResolvedValue({
      ...movementRow,
      type: "out",
      fromWarehouseId: "wh_1",
      toWarehouseId: null,
      fromWarehouse: { name: "Galpão Central" },
      toWarehouse: null,
      note: null,
    });

    const result = await stockMovementService.createMovement(
      {
        type: "out",
        productId: "prod_1",
        quantity: 5,
        fromWarehouseId: "wh_1",
      },
      "user_1",
    );

    expect(stockBalanceUpdateMock).toHaveBeenCalledWith({
      where: { id: "bal_1" },
      data: { quantity: { decrement: 5 } },
    });
    expect(result.status).toBe(201);
  });

  it("returns 400 when out movement has insufficient stock", async () => {
    stockBalanceFindUniqueMock.mockResolvedValue({
      id: "bal_1",
      quantity: 2,
    });

    const result = await stockMovementService.createMovement(
      {
        type: "out",
        productId: "prod_1",
        quantity: 5,
        fromWarehouseId: "wh_1",
      },
      "user_1",
    );

    expect(result).toEqual({
      status: 400,
      data: { message: "Saldo insuficiente." },
    });
    expect(stockMovementCreateMock).not.toHaveBeenCalled();
  });

  it("creates a transfer movement between warehouses", async () => {
    warehouseFindUniqueMock.mockResolvedValue({
      id: "wh_x",
      status: "active",
    });
    stockBalanceFindUniqueMock.mockResolvedValue({
      id: "bal_1",
      quantity: 15,
    });
    stockMovementCreateMock.mockResolvedValue({
      ...movementRow,
      type: "transfer",
      fromWarehouseId: "wh_1",
      toWarehouseId: "wh_2",
      fromWarehouse: { name: "Galpão Central" },
      toWarehouse: { name: "Galpão Norte" },
      note: null,
    });

    const result = await stockMovementService.createMovement(
      {
        type: "transfer",
        productId: "prod_1",
        quantity: 5,
        fromWarehouseId: "wh_1",
        toWarehouseId: "wh_2",
      },
      "user_1",
    );

    expect(stockBalanceUpdateMock).toHaveBeenCalled();
    expect(stockBalanceUpsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          productId_warehouseId: {
            productId: "prod_1",
            warehouseId: "wh_2",
          },
        },
      }),
    );
    expect(result.status).toBe(201);
  });

  it("creates an adjustment that increases stock via toWarehouseId", async () => {
    stockMovementCreateMock.mockResolvedValue({
      ...movementRow,
      type: "adjustment",
      note: null,
      referenceType: null,
    });

    const result = await stockMovementService.createMovement(
      {
        type: "adjustment",
        productId: "prod_1",
        quantity: 3,
        toWarehouseId: "wh_1",
      },
      "user_1",
    );

    expect(stockBalanceUpsertMock).toHaveBeenCalled();
    expect(result.status).toBe(201);
  });

  it("creates an adjustment that decreases stock via fromWarehouseId", async () => {
    stockBalanceFindUniqueMock.mockResolvedValue({
      id: "bal_1",
      quantity: 10,
    });
    stockMovementCreateMock.mockResolvedValue({
      ...movementRow,
      type: "adjustment",
      fromWarehouseId: "wh_1",
      toWarehouseId: null,
      fromWarehouse: { name: "Galpão Central" },
      toWarehouse: null,
      note: null,
      referenceType: null,
    });

    const result = await stockMovementService.createMovement(
      {
        type: "adjustment",
        productId: "prod_1",
        quantity: 2,
        fromWarehouseId: "wh_1",
      },
      "user_1",
    );

    expect(stockBalanceUpdateMock).toHaveBeenCalledWith({
      where: { id: "bal_1" },
      data: { quantity: { decrement: 2 } },
    });
    expect(result.status).toBe(201);
  });

  it("returns 404 when product is missing", async () => {
    productFindUniqueMock.mockResolvedValue(null);

    const result = await stockMovementService.createMovement(
      {
        type: "in",
        productId: "missing",
        quantity: 1,
        toWarehouseId: "wh_1",
      },
      "user_1",
    );

    expect(result).toEqual({
      status: 404,
      data: { message: "Produto não encontrado." },
    });
  });
});
