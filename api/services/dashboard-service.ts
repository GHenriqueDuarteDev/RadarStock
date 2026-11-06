import type { DashboardDays } from "@radarstock/contracts";
import { prisma } from "../src/db";

function toDateKey(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function startOfDayDaysAgo(days: number) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - (days - 1));
  return date;
}

function buildDayKeys(days: number) {
  const keys: string[] = [];
  const cursor = startOfDayDaysAgo(days);
  for (let i = 0; i < days; i += 1) {
    keys.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return keys;
}

function decimalToNumber(value: { toString(): string } | number) {
  return typeof value === "number" ? value : Number(value.toString());
}

async function getMetrics() {
  const [activeProducts, inactiveWarehouses, balances, products] =
    await Promise.all([
      prisma.product.count({ where: { status: "active" } }),
      prisma.warehouse.count({ where: { status: "inactive" } }),
      prisma.stockBalance.findMany({
        select: {
          quantity: true,
          productId: true,
          product: { select: { cost: true } },
        },
      }),
      prisma.product.findMany({
        select: {
          id: true,
          minStock: true,
          stockBalances: { select: { quantity: true } },
        },
      }),
    ]);

  let stockValue = 0;
  for (const balance of balances) {
    stockValue += balance.quantity * decimalToNumber(balance.product.cost);
  }

  let lowStock = 0;
  for (const product of products) {
    const totalQty = product.stockBalances.reduce(
      (sum, balance) => sum + balance.quantity,
      0,
    );
    if (totalQty < product.minStock) {
      lowStock += 1;
    }
  }

  return {
    status: 200 as const,
    data: {
      activeProducts,
      stockValue,
      lowStock,
      inactiveWarehouses,
    },
  };
}

async function getMovementsSeries(days: DashboardDays) {
  const from = startOfDayDaysAgo(days);
  const movements = await prisma.stockMovement.findMany({
    where: {
      createdAt: { gte: from },
      type: { in: ["in", "out"] },
    },
    select: {
      type: true,
      quantity: true,
      createdAt: true,
    },
  });

  const buckets = new Map<string, { in: number; out: number }>();
  for (const key of buildDayKeys(days)) {
    buckets.set(key, { in: 0, out: 0 });
  }

  for (const movement of movements) {
    const key = toDateKey(movement.createdAt);
    const bucket = buckets.get(key);
    if (!bucket) {
      continue;
    }
    if (movement.type === "in") {
      bucket.in += movement.quantity;
    } else if (movement.type === "out") {
      bucket.out += movement.quantity;
    }
  }

  return {
    status: 200 as const,
    data: {
      days,
      points: [...buckets.entries()].map(([date, values]) => ({
        date,
        in: values.in,
        out: values.out,
      })),
    },
  };
}

async function getWarehouseDistribution() {
  const balances = await prisma.stockBalance.findMany({
    select: {
      quantity: true,
      warehouseId: true,
      warehouse: { select: { id: true, name: true } },
      product: { select: { cost: true } },
    },
  });

  const byWarehouse = new Map<
    string,
    { warehouseId: string; name: string; stockValue: number }
  >();

  for (const balance of balances) {
    const value = balance.quantity * decimalToNumber(balance.product.cost);
    if (value <= 0) {
      continue;
    }
    const existing = byWarehouse.get(balance.warehouseId);
    if (existing) {
      existing.stockValue += value;
    } else {
      byWarehouse.set(balance.warehouseId, {
        warehouseId: balance.warehouse.id,
        name: balance.warehouse.name,
        stockValue: value,
      });
    }
  }

  const rows = [...byWarehouse.values()]
    .filter((row) => row.stockValue > 0)
    .sort((a, b) => b.stockValue - a.stockValue);

  const totalValue = rows.reduce((sum, row) => sum + row.stockValue, 0);

  if (totalValue === 0 || rows.length === 0) {
    return {
      status: 200 as const,
      data: { warehouseCount: 0, slices: [] },
    };
  }

  const slices = rows.map((row, index) => {
    const rawPercent = Math.round((100 * row.stockValue) / totalValue);
    return {
      warehouseId: row.warehouseId,
      name: row.name,
      stockValue: row.stockValue,
      valuePercent: rawPercent,
      index,
    };
  });

  const percentSum = slices.reduce((sum, slice) => sum + slice.valuePercent, 0);
  const diff = 100 - percentSum;
  if (slices.length > 0 && diff !== 0) {
    slices[slices.length - 1]!.valuePercent += diff;
  }

  return {
    status: 200 as const,
    data: {
      warehouseCount: slices.length,
      slices: slices.map(({ warehouseId, name, stockValue, valuePercent }) => ({
        warehouseId,
        name,
        stockValue,
        valuePercent,
      })),
    },
  };
}

async function getRecentMovements() {
  const movements = await prisma.stockMovement.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      product: { select: { name: true, sku: true } },
      fromWarehouse: { select: { name: true } },
      toWarehouse: { select: { name: true } },
      user: { select: { firstName: true, lastName: true } },
    },
  });

  return {
    status: 200 as const,
    data: {
      items: movements.map((movement) => ({
        id: movement.id,
        productName: movement.product.name,
        productSku: movement.product.sku,
        type: movement.type,
        referenceType: movement.referenceType ?? null,
        quantity: movement.quantity,
        fromWarehouseName: movement.fromWarehouse?.name ?? null,
        toWarehouseName: movement.toWarehouse?.name ?? null,
        userName:
          `${movement.user.firstName} ${movement.user.lastName}`.trim(),
        createdAt: movement.createdAt,
      })),
    },
  };
}

export const dashboardService = {
  getMetrics,
  getMovementsSeries,
  getWarehouseDistribution,
  getRecentMovements,
};
