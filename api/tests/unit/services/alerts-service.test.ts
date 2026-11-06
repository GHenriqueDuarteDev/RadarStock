import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  alertFindUniqueMock,
  alertCreateMock,
  alertUpdateMock,
  alertUpdateManyMock,
  alertFindManyMock,
  alertCountMock,
  alertRuleFindUniqueMock,
  alertRuleFindManyMock,
  alertRuleUpsertMock,
  productFindUniqueMock,
  productFindManyMock,
  warehouseFindUniqueMock,
  warehouseFindManyMock,
  inventoryCountFindUniqueMock,
  inventoryCountFindManyMock,
} = vi.hoisted(() => ({
  alertFindUniqueMock: vi.fn(),
  alertCreateMock: vi.fn(),
  alertUpdateMock: vi.fn(),
  alertUpdateManyMock: vi.fn(),
  alertFindManyMock: vi.fn(),
  alertCountMock: vi.fn(),
  alertRuleFindUniqueMock: vi.fn(),
  alertRuleFindManyMock: vi.fn(),
  alertRuleUpsertMock: vi.fn(),
  productFindUniqueMock: vi.fn(),
  productFindManyMock: vi.fn(),
  warehouseFindUniqueMock: vi.fn(),
  warehouseFindManyMock: vi.fn(),
  inventoryCountFindUniqueMock: vi.fn(),
  inventoryCountFindManyMock: vi.fn(),
}));

vi.mock("../../../src/db", () => ({
  prisma: {
    alert: {
      findUnique: alertFindUniqueMock,
      create: alertCreateMock,
      update: alertUpdateMock,
      updateMany: alertUpdateManyMock,
      findMany: alertFindManyMock,
      count: alertCountMock,
    },
    alertRule: {
      findUnique: alertRuleFindUniqueMock,
      findMany: alertRuleFindManyMock,
      upsert: alertRuleUpsertMock,
    },
    product: {
      findUnique: productFindUniqueMock,
      findMany: productFindManyMock,
    },
    warehouse: {
      findUnique: warehouseFindUniqueMock,
      findMany: warehouseFindManyMock,
    },
    inventoryCount: {
      findUnique: inventoryCountFindUniqueMock,
      findMany: inventoryCountFindManyMock,
    },
  },
}));

import { alertsService } from "../../../services/alerts-service";

function enableAllRules() {
  alertRuleFindUniqueMock.mockResolvedValue({ enabled: true });
}

describe("alertsService.evaluateProduct", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enableAllRules();
    alertFindUniqueMock.mockResolvedValue(null);
    alertCreateMock.mockResolvedValue({});
    alertUpdateMock.mockResolvedValue({});
  });

  it("opens out_of_stock and resolves low_stock when qty is 0", async () => {
    productFindUniqueMock.mockResolvedValue({
      id: "p1",
      name: "Parafuso",
      sku: "SKU-1",
      minStock: 5,
      status: "active",
      stockBalances: [],
    });

    await alertsService.evaluateProduct("p1");

    expect(alertCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          kind: "out_of_stock",
          dedupeKey: "out_of_stock:product:p1",
          status: "open",
        }),
      }),
    );
  });

  it("opens low_stock when 0 < qty < minStock", async () => {
    productFindUniqueMock.mockResolvedValue({
      id: "p1",
      name: "Parafuso",
      sku: "SKU-1",
      minStock: 5,
      status: "active",
      stockBalances: [{ quantity: 2 }],
    });

    await alertsService.evaluateProduct("p1");

    expect(alertCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          kind: "low_stock",
          dedupeKey: "low_stock:product:p1",
        }),
      }),
    );
  });

  it("does not open when rule is disabled and resolves existing", async () => {
    alertRuleFindUniqueMock.mockImplementation(async ({ where }) => {
      if (where.kind === "low_stock") {
        return { enabled: false };
      }
      return { enabled: true };
    });
    productFindUniqueMock.mockResolvedValue({
      id: "p1",
      name: "Parafuso",
      sku: "SKU-1",
      minStock: 5,
      status: "active",
      stockBalances: [{ quantity: 2 }],
    });
    alertFindUniqueMock.mockImplementation(async ({ where }) => {
      if (where.dedupeKey === "low_stock:product:p1") {
        return { id: "a1", status: "open" };
      }
      return null;
    });

    await alertsService.evaluateProduct("p1");

    expect(alertCreateMock).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ kind: "low_stock" }),
      }),
    );
    expect(alertUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "a1" },
        data: expect.objectContaining({ status: "resolved" }),
      }),
    );
  });

  it("refreshes existing open alert instead of creating duplicate", async () => {
    productFindUniqueMock.mockResolvedValue({
      id: "p1",
      name: "Parafuso",
      sku: "SKU-1",
      minStock: 5,
      status: "active",
      stockBalances: [{ quantity: 1 }],
    });
    alertFindUniqueMock.mockImplementation(async ({ where }) => {
      if (where.dedupeKey === "low_stock:product:p1") {
        return {
          id: "a1",
          status: "open",
          dedupeKey: "low_stock:product:p1",
        };
      }
      return null;
    });

    await alertsService.evaluateProduct("p1");

    expect(alertCreateMock).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ kind: "low_stock" }),
      }),
    );
    expect(alertUpdateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "a1" },
        data: expect.objectContaining({
          status: "open",
          title: "Estoque baixo",
        }),
      }),
    );
  });
});

describe("alertsService.evaluateWarehouse", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enableAllRules();
    alertFindUniqueMock.mockResolvedValue(null);
    alertCreateMock.mockResolvedValue({});
  });

  it("opens near capacity at 80% and full at capacity", async () => {
    warehouseFindUniqueMock.mockResolvedValue({
      id: "w1",
      name: "Central",
      code: "GAL-01",
      capacity: 100,
      stockBalances: [{ quantity: 80 }],
    });

    await alertsService.evaluateWarehouse("w1");

    expect(alertCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          kind: "warehouse_near_capacity",
        }),
      }),
    );

    vi.clearAllMocks();
    enableAllRules();
    alertFindUniqueMock.mockResolvedValue(null);
    warehouseFindUniqueMock.mockResolvedValue({
      id: "w1",
      name: "Central",
      code: "GAL-01",
      capacity: 100,
      stockBalances: [{ quantity: 100 }],
    });

    await alertsService.evaluateWarehouse("w1");

    expect(alertCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ kind: "warehouse_full" }),
      }),
    );
  });
});

describe("alertsService.evaluateInventory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enableAllRules();
    alertFindUniqueMock.mockResolvedValue(null);
    alertCreateMock.mockResolvedValue({});
  });

  it("ignores countedQty 0 for discrepancy", async () => {
    inventoryCountFindUniqueMock.mockResolvedValue({
      id: "i1",
      code: "INV-1",
      status: "draft",
      items: [
        { expectedQty: 10, countedQty: 0 },
        { expectedQty: 5, countedQty: 5 },
      ],
    });

    await alertsService.evaluateInventory("i1");

    expect(alertCreateMock).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ kind: "inventory_pending" }),
      }),
    );
    expect(alertCreateMock).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ kind: "inventory_discrepancy" }),
      }),
    );
  });
});

describe("alertsService.markAllRead and badge", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks unread open alerts as read and returns badge", async () => {
    alertUpdateManyMock.mockResolvedValue({ count: 2 });
    alertCountMock.mockResolvedValueOnce(3).mockResolvedValueOnce(0);

    const result = await alertsService.markAllRead();

    expect(alertUpdateManyMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: "open", readAt: null },
        data: expect.objectContaining({ readAt: expect.any(Date) }),
      }),
    );
    expect(result).toEqual({
      status: 200,
      data: { totalOpen: 3, unreadCount: 0 },
    });
  });
});

describe("alertsService.updateRule", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    enableAllRules();
    productFindManyMock.mockResolvedValue([]);
    warehouseFindManyMock.mockResolvedValue([]);
    inventoryCountFindManyMock.mockResolvedValue([]);
    alertRuleUpsertMock.mockResolvedValue({
      kind: "low_stock",
      enabled: false,
      updatedAt: new Date("2026-01-01"),
    });
  });

  it("updates rule and reevaluates all", async () => {
    const result = await alertsService.updateRule("low_stock", {
      enabled: false,
    });

    expect(alertRuleUpsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { kind: "low_stock" },
        update: { enabled: false },
      }),
    );
    expect(productFindManyMock).toHaveBeenCalled();
    expect(result.status).toBe(200);
    expect(result.data).toEqual(
      expect.objectContaining({ kind: "low_stock", enabled: false }),
    );
  });
});
