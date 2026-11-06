import { describe, expect, it } from "vitest";

import {
  buildLowStockRows,
  buildWarehouseOccupancyRows,
  resolveReportPeriod,
} from "../../../services/reports-service";

describe("buildLowStockRows", () => {
  it("includes products below minStock and sorts by deficit", () => {
    const rows = buildLowStockRows(
      [
        {
          id: "p1",
          name: "Parafuso",
          sku: "PAR-1",
          minStock: 10,
          category: { name: "Fixação" },
          stockBalances: [{ quantity: 3 }, { quantity: 2 }],
        },
        {
          id: "p2",
          name: "Porca",
          sku: "POR-1",
          minStock: 5,
          category: null,
          stockBalances: [{ quantity: 5 }],
        },
        {
          id: "p3",
          name: "Arruela",
          sku: "ARR-1",
          minStock: 8,
          category: { name: "Fixação" },
          stockBalances: [],
        },
      ],
      true,
    );

    expect(rows).toEqual([
      {
        productId: "p3",
        productName: "Arruela",
        productSku: "ARR-1",
        categoryName: "Fixação",
        minStock: 8,
        totalQuantity: 0,
        deficit: 8,
      },
      {
        productId: "p1",
        productName: "Parafuso",
        productSku: "PAR-1",
        categoryName: "Fixação",
        minStock: 10,
        totalQuantity: 5,
        deficit: 5,
      },
    ]);
  });

  it("excludes zero stock when includeZero is false", () => {
    const rows = buildLowStockRows(
      [
        {
          id: "p1",
          name: "Parafuso",
          sku: "PAR-1",
          minStock: 10,
          category: null,
          stockBalances: [{ quantity: 2 }],
        },
        {
          id: "p2",
          name: "Arruela",
          sku: "ARR-1",
          minStock: 8,
          category: null,
          stockBalances: [],
        },
      ],
      false,
    );

    expect(rows).toHaveLength(1);
    expect(rows[0]?.productId).toBe("p1");
  });
});

describe("buildWarehouseOccupancyRows", () => {
  it("computes occupancy percent and occupied qty", () => {
    const rows = buildWarehouseOccupancyRows([
      {
        id: "w2",
        name: "Beta",
        code: "B",
        status: "active",
        capacity: 100,
        stockBalances: [{ quantity: 25 }, { quantity: 25 }],
      },
      {
        id: "w1",
        name: "Alpha",
        code: "A",
        status: "inactive",
        capacity: null,
        stockBalances: [{ quantity: 10 }],
      },
    ]);

    expect(rows).toEqual([
      {
        warehouseId: "w1",
        warehouseName: "Alpha",
        warehouseCode: "A",
        status: "inactive",
        capacity: null,
        occupiedQty: 10,
        occupancyPercent: null,
      },
      {
        warehouseId: "w2",
        warehouseName: "Beta",
        warehouseCode: "B",
        status: "active",
        capacity: 100,
        occupiedQty: 50,
        occupancyPercent: 50,
      },
    ]);
  });
});

describe("resolveReportPeriod", () => {
  it("defaults to the last 30 calendar days ending today", () => {
    const { from, to } = resolveReportPeriod();
    const startOfTo = new Date(to);
    startOfTo.setHours(0, 0, 0, 0);
    const expectedFrom = new Date(startOfTo);
    expectedFrom.setDate(expectedFrom.getDate() - 29);

    expect(from.getTime()).toBe(expectedFrom.getTime());
    expect(from.getHours()).toBe(0);
    expect(to.getHours()).toBe(23);
  });
});
