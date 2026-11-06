import {
  PAGE_SIZE,
  type InventoryCountInput,
  type UpdateInventoryCountInput,
} from "@radarstock/contracts";
import { prisma } from "../src/db";

const inventoryInclude = {
  warehouse: { select: { name: true } },
  createdBy: { select: { firstName: true, lastName: true } },
  items: {
    include: {
      product: { select: { name: true, sku: true } },
    },
  },
} as const;

type InventoryCountWithRelations = {
  id: string;
  code: string;
  status: "draft" | "confirmed" | "cancelled";
  warehouseId: string;
  countedAt: Date | null;
  createdById: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  warehouse: { name: string };
  createdBy: { firstName: string; lastName: string };
  items: Array<{
    id: string;
    inventoryCountId: string;
    productId: string;
    expectedQty: number;
    countedQty: number;
    product: { name: string; sku: string };
  }>;
};

type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

function itemVariance(expectedQty: number, countedQty: number) {
  if (countedQty === 0) {
    return 0;
  }
  return countedQty - expectedQty;
}

function inventoryCodeDayPrefix(date = new Date()) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `INV-${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-`;
}

async function generateInventoryCode() {
  const prefix = inventoryCodeDayPrefix();
  const latest = await prisma.inventoryCount.findFirst({
    where: { code: { startsWith: prefix } },
    orderBy: { code: "desc" },
    select: { code: true },
  });

  const lastSeq = latest
    ? Number.parseInt(latest.code.slice(prefix.length), 10)
    : 0;
  const nextSeq = Number.isFinite(lastSeq) ? lastSeq + 1 : 1;

  return `${prefix}${String(nextSeq).padStart(3, "0")}`;
}

function isUniqueConstraintError(error: unknown) {
  return (
    error instanceof Error && error.message.toLowerCase().includes("unique")
  );
}

function toPublicInventoryCount(count: InventoryCountWithRelations) {
  return {
    id: count.id,
    code: count.code,
    warehouseId: count.warehouseId,
    warehouseName: count.warehouse.name,
    status: count.status,
    countedAt: count.countedAt,
    createdById: count.createdById,
    createdByName:
      `${count.createdBy.firstName} ${count.createdBy.lastName}`.trim(),
    notes: count.notes,
    createdAt: count.createdAt,
    updatedAt: count.updatedAt,
    items: count.items.map((item) => ({
      id: item.id,
      inventoryCountId: item.inventoryCountId,
      productId: item.productId,
      expectedQty: item.expectedQty,
      countedQty: item.countedQty,
      variance: itemVariance(item.expectedQty, item.countedQty),
      productName: item.product.name,
      productSku: item.product.sku,
    })),
  };
}

async function setBalance(
  tx: TxClient,
  productId: string,
  warehouseId: string,
  quantity: number,
) {
  await tx.stockBalance.upsert({
    where: {
      productId_warehouseId: { productId, warehouseId },
    },
    create: { productId, warehouseId, quantity },
    update: { quantity },
  });
}

async function createAdjustmentMovement(
  tx: TxClient,
  params: {
    productId: string;
    warehouseId: string;
    delta: number;
    userId: string;
    note: string;
    referenceId: string;
  },
) {
  if (params.delta === 0) {
    return;
  }

  const quantity = Math.abs(params.delta);

  await tx.stockMovement.create({
    data: {
      type: "adjustment",
      productId: params.productId,
      quantity,
      fromWarehouseId: params.delta < 0 ? params.warehouseId : null,
      toWarehouseId: params.delta > 0 ? params.warehouseId : null,
      userId: params.userId,
      note: params.note,
      referenceType: "inventory",
      referenceId: params.referenceId,
    },
  });
}

async function listInventoryCounts(page: number, code?: string) {
  const skip = (page - 1) * PAGE_SIZE;
  const where = code
    ? { code: { contains: code, mode: "insensitive" as const } }
    : {};

  const [items, total] = await prisma.$transaction([
    prisma.inventoryCount.findMany({
      where,
      include: inventoryInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.inventoryCount.count({ where }),
  ]);

  return {
    status: 200,
    data: {
      items: (items as InventoryCountWithRelations[]).map(
        toPublicInventoryCount,
      ),
      total,
      page,
      pageSize: PAGE_SIZE,
    },
  };
}

async function getSummary() {
  const [inProgress, completed, relevant] = await prisma.$transaction([
    prisma.inventoryCount.count({ where: { status: "draft" } }),
    prisma.inventoryCount.count({ where: { status: "confirmed" } }),
    prisma.inventoryCount.findMany({
      where: { status: { in: ["draft", "confirmed"] } },
      select: {
        items: {
          select: {
            expectedQty: true,
            countedQty: true,
          },
        },
      },
    }),
  ]);

  let itemsCounted = 0;
  let discrepancies = 0;

  for (const inventory of relevant) {
    for (const item of inventory.items) {
      if (item.countedQty === 0) {
        continue;
      }
      itemsCounted += 1;
      if (item.countedQty !== item.expectedQty) {
        discrepancies += 1;
      }
    }
  }

  const averageAccuracy =
    itemsCounted === 0
      ? 100
      : Math.round((1 - discrepancies / itemsCounted) * 1000) / 10;

  return {
    status: 200,
    data: {
      inProgress,
      discrepancies,
      averageAccuracy,
      completed,
    },
  };
}

async function getInventoryCountById(id: string) {
  const count = await prisma.inventoryCount.findUnique({
    where: { id },
    include: inventoryInclude,
  });

  if (!count) {
    return {
      status: 404,
      data: { message: "Inventário não encontrado." },
    };
  }

  return {
    status: 200,
    data: toPublicInventoryCount(count as InventoryCountWithRelations),
  };
}

async function createInventoryCount(
  input: InventoryCountInput,
  userId: string,
) {
  const warehouse = await prisma.warehouse.findUnique({
    where: { id: input.warehouseId },
    select: { id: true, status: true },
  });

  if (!warehouse || warehouse.status !== "active") {
    return {
      status: 404,
      data: { message: "Galpão não encontrado." },
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    return {
      status: 404,
      data: { message: "Usuário não encontrado." },
    };
  }

  const balances = await prisma.stockBalance.findMany({
    where: {
      warehouseId: input.warehouseId,
      quantity: { gte: 0 },
    },
    include: {
      product: { select: { id: true, status: true } },
    },
    orderBy: { product: { name: "asc" } },
  });

  const activeBalances = balances.filter(
    (balance) => balance.product.status === "active",
  );

  if (activeBalances.length === 0) {
    return {
      status: 400,
      data: { message: "Galpão sem produtos em estoque para contagem." },
    };
  }

  const itemsCreate = activeBalances.map((balance) => ({
    productId: balance.productId,
    expectedQty: balance.quantity,
    countedQty: 0,
  }));

  async function persist(code: string) {
    return prisma.inventoryCount.create({
      data: {
        code,
        status: "draft",
        warehouseId: input.warehouseId,
        countedAt: input.countedAt ?? null,
        createdById: userId,
        notes: input.notes ?? null,
        items: { create: itemsCreate },
      },
      include: inventoryInclude,
    });
  }

  try {
    const created = await persist(await generateInventoryCode());

    return {
      status: 201,
      data: toPublicInventoryCount(created as InventoryCountWithRelations),
    };
  } catch (error) {
    if (!isUniqueConstraintError(error)) {
      throw error;
    }

    try {
      const created = await persist(await generateInventoryCode());

      return {
        status: 201,
        data: toPublicInventoryCount(created as InventoryCountWithRelations),
      };
    } catch (retryError) {
      if (isUniqueConstraintError(retryError)) {
        return {
          status: 409,
          data: { message: "Código de inventário já cadastrado." },
        };
      }

      throw retryError;
    }
  }
}

async function updateInventoryCount(
  id: string,
  input: UpdateInventoryCountInput,
) {
  const existing = await prisma.inventoryCount.findUnique({
    where: { id },
    include: {
      items: { select: { id: true, productId: true } },
    },
  });

  if (!existing) {
    return {
      status: 404,
      data: { message: "Inventário não encontrado." },
    };
  }

  if (existing.status !== "draft") {
    return {
      status: 409,
      data: { message: "Somente inventários em rascunho podem ser editados." },
    };
  }

  if (input.items) {
    const existingByProduct = new Map(
      existing.items.map((item) => [item.productId, item.id]),
    );

    for (const item of input.items) {
      if (!existingByProduct.has(item.productId)) {
        return {
          status: 400,
          data: {
            message: "Produto não pertence a este inventário.",
          },
        };
      }
    }
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      if (input.items) {
        for (const item of input.items) {
          await tx.inventoryCountItem.updateMany({
            where: {
              inventoryCountId: id,
              productId: item.productId,
            },
            data: { countedQty: item.countedQty },
          });
        }
      }

      return tx.inventoryCount.update({
        where: { id },
        data: {
          countedAt:
            input.countedAt === undefined ? undefined : input.countedAt,
          notes: input.notes === undefined ? undefined : input.notes,
        },
        include: inventoryInclude,
      });
    });

    return {
      status: 200,
      data: toPublicInventoryCount(updated as InventoryCountWithRelations),
    };
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return {
        status: 409,
        data: { message: "Código de inventário já cadastrado." },
      };
    }

    throw error;
  }
}

async function confirmInventoryCount(id: string, userId: string) {
  const existing = await prisma.inventoryCount.findUnique({
    where: { id },
    include: inventoryInclude,
  });

  if (!existing) {
    return {
      status: 404,
      data: { message: "Inventário não encontrado." },
    };
  }

  if (existing.status !== "draft") {
    return {
      status: 409,
      data: {
        message: "Somente inventários em rascunho podem ser confirmados.",
      },
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    return {
      status: 404,
      data: { message: "Usuário não encontrado." },
    };
  }

  const confirmed = await prisma.$transaction(async (tx) => {
    const updated = await tx.inventoryCount.update({
      where: { id },
      data: {
        status: "confirmed",
        countedAt: existing.countedAt ?? new Date(),
      },
      include: inventoryInclude,
    });

    for (const item of updated.items) {
      if (item.countedQty === 0) {
        continue;
      }

      await setBalance(
        tx,
        item.productId,
        updated.warehouseId,
        item.countedQty,
      );

      const delta = item.countedQty - item.expectedQty;
      await createAdjustmentMovement(tx, {
        productId: item.productId,
        warehouseId: updated.warehouseId,
        delta,
        userId,
        note: `Inventário ${updated.code}`,
        referenceId: updated.id,
      });
    }

    return updated;
  });

  return {
    status: 200,
    data: toPublicInventoryCount(confirmed as InventoryCountWithRelations),
  };
}

async function cancelInventoryCount(id: string, userId: string) {
  const existing = await prisma.inventoryCount.findUnique({
    where: { id },
    include: inventoryInclude,
  });

  if (!existing) {
    return {
      status: 404,
      data: { message: "Inventário não encontrado." },
    };
  }

  if (existing.status === "cancelled") {
    return {
      status: 409,
      data: { message: "Inventário já está cancelado." },
    };
  }

  if (existing.status === "draft") {
    const cancelled = await prisma.inventoryCount.update({
      where: { id },
      data: { status: "cancelled" },
      include: inventoryInclude,
    });

    return {
      status: 200,
      data: toPublicInventoryCount(cancelled as InventoryCountWithRelations),
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    return {
      status: 404,
      data: { message: "Usuário não encontrado." },
    };
  }

  const cancelled = await prisma.$transaction(async (tx) => {
    const updated = await tx.inventoryCount.update({
      where: { id },
      data: { status: "cancelled" },
      include: inventoryInclude,
    });

    for (const item of updated.items) {
      if (item.countedQty === 0) {
        continue;
      }

      await setBalance(
        tx,
        item.productId,
        updated.warehouseId,
        item.expectedQty,
      );

      const reverseDelta = item.expectedQty - item.countedQty;
      await createAdjustmentMovement(tx, {
        productId: item.productId,
        warehouseId: updated.warehouseId,
        delta: reverseDelta,
        userId,
        note: `Estorno inventário ${updated.code}`,
        referenceId: updated.id,
      });
    }

    return updated;
  });

  return {
    status: 200,
    data: toPublicInventoryCount(cancelled as InventoryCountWithRelations),
  };
}

export const inventoryCountService = {
  listInventoryCounts,
  getSummary,
  getInventoryCountById,
  createInventoryCount,
  updateInventoryCount,
  confirmInventoryCount,
  cancelInventoryCount,
};
