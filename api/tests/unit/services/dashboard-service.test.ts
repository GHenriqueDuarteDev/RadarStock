import { describe, beforeEach, it, vi, expect } from "vitest";

const {
  productCountMock,
  productFindManyMock,
  warehouseCountMock,
  warehouseFindManyMock,
  stockBalanceFindManyMock,
  stockMovementFindManyMock,
  inventoryCountCountMock,
  inventoryCountFindManyMock,
} = vi.hoisted(() => ({
  productCountMock: vi.fn(),
  productFindManyMock: vi.fn(),
  warehouseCountMock: vi.fn(),
  warehouseFindManyMock: vi.fn(),
  stockBalanceFindManyMock: vi.fn(),
  stockMovementFindManyMock: vi.fn(),
  inventoryCountCountMock: vi.fn(),
  inventoryCountFindManyMock: vi.fn(),
}));

vi.mock("../../../src/db", () => ({
  prisma: {
    product: {
      count: productCountMock,
      findMany: productFindManyMock,
    },
    warehouse: {
      count: warehouseCountMock,
      findMany: warehouseFindManyMock,
    },
    stockBalance: {
      findMany: stockBalanceFindManyMock,
    },
    stockMovement: {
      findMany: stockMovementFindManyMock,
    },
    inventoryCount: {
      count: inventoryCountCountMock,
      findMany: inventoryCountFindManyMock,
    },
  },
}));

import { dashboardService } from "../../../services/dashboard-service";

describe("dashboardService.getMetrics", () => {
  beforeEach(() => {
    productCountMock.mockReset();
    warehouseCountMock.mockReset();
    stockBalanceFindManyMock.mockReset();
    productFindManyMock.mockReset();
  });

  it("returns active products, stock value, low stock and inactive warehouses", async () => {
    productCountMock.mockResolvedValue(12);
    warehouseCountMock.mockResolvedValue(2);
    stockBalanceFindManyMock.mockResolvedValue([
      {
        quantity: 10,
        productId: "p1",
        product: { cost: { toString: () => "5" } },
      },
      {
        quantity: 2,
        productId: "p2",
        product: { cost: { toString: () => "10" } },
      },
    ]);
    productFindManyMock.mockResolvedValue([
      {
        id: "p1",
        minStock: 5,
        stockBalances: [{ quantity: 10 }],
      },
      {
        id: "p2",
        minStock: 5,
        stockBalances: [{ quantity: 2 }],
      },
      {
        id: "p3",
        minStock: 1,
        stockBalances: [],
      },
    ]);

    const result = await dashboardService.getMetrics();

    expect(result).toEqual({
      status: 200,
      data: {
        activeProducts: 12,
        stockValue: 70,
        lowStock: 2,
        inactiveWarehouses: 2,
      },
    });
  });
});

describe("dashboardService.getMovementsSeries", () => {
  beforeEach(() => {
    stockMovementFindManyMock.mockReset();
  });

  it("fills empty days and aggregates only in/out", async () => {
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    stockMovementFindManyMock.mockResolvedValue([
      { type: "in", quantity: 5, createdAt: today },
      { type: "out", quantity: 2, createdAt: today },
      { type: "transfer", quantity: 9, createdAt: today },
    ]);

    const result = await dashboardService.getMovementsSeries(7);

    expect(result.status).toBe(200);
    expect(result.data.days).toBe(7);
    expect(result.data.points).toHaveLength(7);
    const last = result.data.points[result.data.points.length - 1]!;
    expect(last.in).toBe(5);
    expect(last.out).toBe(2);
    expect(result.data.points.slice(0, 6).every((point) => point.in === 0 && point.out === 0)).toBe(
      true,
    );
  });
});

describe("dashboardService.getWarehouseDistribution", () => {
  beforeEach(() => {
    stockBalanceFindManyMock.mockReset();
  });

  it("returns empty slices when there is no stock value", async () => {
    stockBalanceFindManyMock.mockResolvedValue([]);

    const result = await dashboardService.getWarehouseDistribution();

    expect(result).toEqual({
      status: 200,
      data: { warehouseCount: 0, slices: [] },
    });
  });

  it("returns percents that sum to 100", async () => {
    stockBalanceFindManyMock.mockResolvedValue([
      {
        quantity: 10,
        warehouseId: "w1",
        warehouse: { id: "w1", name: "Central" },
        product: { cost: { toString: () => "10" } },
      },
      {
        quantity: 5,
        warehouseId: "w2",
        warehouse: { id: "w2", name: "Sul" },
        product: { cost: { toString: () => "10" } },
      },
    ]);

    const result = await dashboardService.getWarehouseDistribution();

    expect(result.status).toBe(200);
    expect(result.data.warehouseCount).toBe(2);
    const sum = result.data.slices.reduce(
      (acc, slice) => acc + slice.valuePercent,
      0,
    );
    expect(sum).toBe(100);
  });
});

describe("dashboardService.getRecentMovements", () => {
  beforeEach(() => {
    stockMovementFindManyMock.mockReset();
  });

  it("returns at most 5 movements", async () => {
    stockMovementFindManyMock.mockResolvedValue([
      {
        id: "m1",
        type: "in",
        referenceType: null,
        quantity: 1,
        createdAt: new Date("2026-01-01"),
        product: { name: "A", sku: "A1" },
        fromWarehouse: null,
        toWarehouse: { name: "Central" },
        user: { firstName: "Ana", lastName: "Silva" },
      },
    ]);

    const result = await dashboardService.getRecentMovements();

    expect(stockMovementFindManyMock).toHaveBeenCalledWith(
      expect.objectContaining({ take: 5 }),
    );
    expect(result.data.items).toHaveLength(1);
    expect(result.data.items[0]?.userName).toBe("Ana Silva");
  });
});
