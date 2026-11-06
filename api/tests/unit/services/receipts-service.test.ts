import { describe, beforeEach, it, vi, expect } from "vitest";

const {
  receiptFindManyMock,
  receiptFindUniqueMock,
  receiptCountMock,
  receiptCreateMock,
  receiptUpdateMock,
  warehouseFindUniqueMock,
  userFindUniqueMock,
  productFindManyMock,
  stockBalanceFindUniqueMock,
  stockBalanceUpsertMock,
  stockBalanceUpdateMock,
  stockMovementCreateMock,
  transactionMock,
} = vi.hoisted(() => ({
  receiptFindManyMock: vi.fn(),
  receiptFindUniqueMock: vi.fn(),
  receiptCountMock: vi.fn(),
  receiptCreateMock: vi.fn(),
  receiptUpdateMock: vi.fn(),
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
    receipt: {
      findMany: receiptFindManyMock,
      findUnique: receiptFindUniqueMock,
      count: receiptCountMock,
      create: receiptCreateMock,
      update: receiptUpdateMock,
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

import { receiptService } from "../../../services/receipts-service";

const receiptRow = {
  id: "rcp_1",
  code: "REC-001",
  status: "confirmed" as const,
  warehouseId: "wh_1",
  supplierName: "Fornecedor Alpha",
  receivedAt: new Date("2026-01-01"),
  createdById: "user_1",
  notes: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  warehouse: { name: "Galpão Central" },
  createdBy: { firstName: "Ana", lastName: "Silva" },
  items: [
    {
      id: "item_1",
      receiptId: "rcp_1",
      productId: "prod_1",
      quantity: 5,
      unitCost: { toString: () => "10" },
      product: { name: "Parafuso M6", sku: "SKU-001" },
    },
  ],
};

const publicReceipt = {
  id: "rcp_1",
  code: "REC-001",
  status: "confirmed" as const,
  warehouseId: "wh_1",
  warehouseName: "Galpão Central",
  supplierName: "Fornecedor Alpha",
  totalCost: 50,
  receivedAt: new Date("2026-01-01"),
  createdById: "user_1",
  createdByName: "Ana Silva",
  notes: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  items: [
    {
      id: "item_1",
      receiptId: "rcp_1",
      productId: "prod_1",
      quantity: 5,
      unitCost: 10,
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
    receipt: {
      create: receiptCreateMock,
      update: receiptUpdateMock,
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

describe("receiptService.listReceipts", () => {
  beforeEach(() => {
    receiptFindManyMock.mockReset();
    receiptCountMock.mockReset();
    transactionMock.mockReset();
    mockArrayTransaction();
  });

  it("returns 200 with paginated receipts", async () => {
    receiptFindManyMock.mockResolvedValue([receiptRow]);
    receiptCountMock.mockResolvedValue(1);

    const result = await receiptService.listReceipts(1);

    expect(receiptFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {},
        skip: 0,
        take: 10,
        orderBy: { receivedAt: "desc" },
      }),
    );
    expect(result).toEqual({
      status: 200,
      data: {
        items: [publicReceipt],
        total: 1,
        page: 1,
        pageSize: 10,
      },
    });
  });

  it("returns 200 with empty list when there are no receipts", async () => {
    receiptFindManyMock.mockResolvedValue([]);
    receiptCountMock.mockResolvedValue(0);

    const result = await receiptService.listReceipts(1);

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
    receiptFindManyMock.mockResolvedValue([]);
    receiptCountMock.mockResolvedValue(15);

    await receiptService.listReceipts(2);

    expect(receiptFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 10,
        take: 10,
      }),
    );
  });

  it("filters by receipt code when code is provided", async () => {
    receiptFindManyMock.mockResolvedValue([receiptRow]);
    receiptCountMock.mockResolvedValue(1);

    await receiptService.listReceipts(1, "REC-001");

    expect(receiptFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          code: { contains: "REC-001", mode: "insensitive" },
        },
      }),
    );
  });
});

describe("receiptService.getSummary", () => {
  beforeEach(() => {
    receiptCountMock.mockReset();
    receiptFindManyMock.mockReset();
    transactionMock.mockReset();
    mockArrayTransaction();
  });

  it("returns 200 with global receipt metrics", async () => {
    receiptCountMock
      .mockResolvedValueOnce(20)
      .mockResolvedValueOnce(15)
      .mockResolvedValueOnce(5);
    receiptFindManyMock.mockResolvedValue([
      {
        items: [
          { quantity: 5, unitCost: { toString: () => "10" } },
          { quantity: 2, unitCost: { toString: () => "20" } },
        ],
      },
    ]);

    const result = await receiptService.getSummary();

    expect(result).toEqual({
      status: 200,
      data: {
        total: 20,
        confirmed: 15,
        cancelled: 5,
        totalCost: 90,
      },
    });
  });

  it("returns zeros when there are no receipts", async () => {
    receiptCountMock.mockResolvedValue(0);
    receiptFindManyMock.mockResolvedValue([]);

    const result = await receiptService.getSummary();

    expect(result).toEqual({
      status: 200,
      data: {
        total: 0,
        confirmed: 0,
        cancelled: 0,
        totalCost: 0,
      },
    });
  });
});

describe("receiptService.createReceipt", () => {
  beforeEach(() => {
    warehouseFindUniqueMock.mockReset();
    userFindUniqueMock.mockReset();
    productFindManyMock.mockReset();
    stockBalanceUpsertMock.mockReset();
    stockMovementCreateMock.mockReset();
    receiptCreateMock.mockReset();
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

  it("creates a confirmed receipt and increments stock", async () => {
    receiptCreateMock.mockResolvedValue(receiptRow);

    const result = await receiptService.createReceipt(
      {
        code: "REC-001",
        warehouseId: "wh_1",
        supplierName: "Fornecedor Alpha",
        receivedAt: new Date("2026-01-01"),
        items: [{ productId: "prod_1", quantity: 5, unitCost: 10 }],
      },
      "user_1",
    );

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
          referenceType: "receipt",
          referenceId: "rcp_1",
        }),
      }),
    );
    expect(result).toEqual({ status: 201, data: publicReceipt });
  });

  it("returns 404 when warehouse is missing", async () => {
    warehouseFindUniqueMock.mockResolvedValue(null);

    const result = await receiptService.createReceipt(
      {
        code: "REC-001",
        warehouseId: "missing",
        receivedAt: new Date("2026-01-01"),
        items: [{ productId: "prod_1", quantity: 1, unitCost: 10 }],
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

    const result = await receiptService.createReceipt(
      {
        code: "REC-001",
        warehouseId: "wh_1",
        receivedAt: new Date("2026-01-01"),
        items: [{ productId: "missing", quantity: 1, unitCost: 10 }],
      },
      "user_1",
    );

    expect(result).toEqual({
      status: 404,
      data: { message: "Produto não encontrado." },
    });
  });

  it("returns 409 when code is duplicated", async () => {
    receiptCreateMock.mockRejectedValue(new Error("Unique constraint failed"));

    const result = await receiptService.createReceipt(
      {
        code: "REC-001",
        warehouseId: "wh_1",
        receivedAt: new Date("2026-01-01"),
        items: [{ productId: "prod_1", quantity: 1, unitCost: 10 }],
      },
      "user_1",
    );

    expect(result).toEqual({
      status: 409,
      data: { message: "Código de recebimento já cadastrado." },
    });
  });
});

describe("receiptService.cancelReceipt", () => {
  beforeEach(() => {
    receiptFindUniqueMock.mockReset();
    userFindUniqueMock.mockReset();
    receiptUpdateMock.mockReset();
    stockBalanceFindUniqueMock.mockReset();
    stockBalanceUpdateMock.mockReset();
    stockMovementCreateMock.mockReset();
    transactionMock.mockReset();
    mockInteractiveTransaction();
    userFindUniqueMock.mockResolvedValue({ id: "user_1" });
  });

  it("cancels a confirmed receipt and decrements stock", async () => {
    receiptFindUniqueMock.mockResolvedValue(receiptRow);
    stockBalanceFindUniqueMock.mockResolvedValue({
      id: "bal_1",
      quantity: 20,
    });
    receiptUpdateMock.mockResolvedValue({
      ...receiptRow,
      status: "cancelled",
    });

    const result = await receiptService.cancelReceipt("rcp_1", "user_1");

    expect(stockBalanceUpdateMock).toHaveBeenCalledWith({
      where: { id: "bal_1" },
      data: { quantity: { decrement: 5 } },
    });
    expect(stockMovementCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: "out",
          referenceType: "receipt",
          referenceId: "rcp_1",
        }),
      }),
    );
    expect(result.status).toBe(200);
    expect(result.data).toEqual({
      ...publicReceipt,
      status: "cancelled",
    });
  });

  it("returns 400 when stock is insufficient to reverse", async () => {
    receiptFindUniqueMock.mockResolvedValue(receiptRow);
    stockBalanceFindUniqueMock.mockResolvedValue({
      id: "bal_1",
      quantity: 2,
    });
    receiptUpdateMock.mockResolvedValue({
      ...receiptRow,
      status: "cancelled",
    });

    const result = await receiptService.cancelReceipt("rcp_1", "user_1");

    expect(result).toEqual({
      status: 400,
      data: {
        message: "Saldo insuficiente para estornar o produto Parafuso M6.",
      },
    });
  });

  it("returns 404 when receipt is missing", async () => {
    receiptFindUniqueMock.mockResolvedValue(null);

    const result = await receiptService.cancelReceipt("missing", "user_1");

    expect(result).toEqual({
      status: 404,
      data: { message: "Recebimento não encontrado." },
    });
  });

  it("returns 409 when receipt is already cancelled", async () => {
    receiptFindUniqueMock.mockResolvedValue({
      ...receiptRow,
      status: "cancelled",
    });

    const result = await receiptService.cancelReceipt("rcp_1", "user_1");

    expect(result).toEqual({
      status: 409,
      data: {
        message: "Somente recebimentos confirmados podem ser cancelados.",
      },
    });
  });
});
