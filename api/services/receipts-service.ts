import {
  PAGE_SIZE,
  type ReceiptInput,
} from "@radarstock/contracts";
import { prisma } from "../src/db";
import { alertsService } from "./alerts-service";

const receiptInclude = {
  warehouse: { select: { name: true } },
  createdBy: { select: { firstName: true, lastName: true } },
  items: {
    include: {
      product: { select: { name: true, sku: true } },
    },
  },
} as const;

type ReceiptWithRelations = {
  id: string;
  code: string;
  status: "draft" | "confirmed" | "cancelled";
  warehouseId: string;
  supplierName: string | null;
  receivedAt: Date;
  createdById: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  warehouse: { name: string };
  createdBy: { firstName: string; lastName: string };
  items: Array<{
    id: string;
    receiptId: string;
    productId: string;
    quantity: number;
    unitCost: { toString(): string } | number;
    product: { name: string; sku: string };
  }>;
};

class InsufficientStockError extends Error {
  constructor(productLabel: string) {
    super(`Saldo insuficiente para estornar o produto ${productLabel}.`);
    this.name = "InsufficientStockError";
  }
}

type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

function computeTotalCost(
  items: Array<{ quantity: number; unitCost: { toString(): string } | number }>,
) {
  return items.reduce(
    (sum, item) => sum + item.quantity * Number(item.unitCost),
    0,
  );
}

function toPublicReceipt(receipt: ReceiptWithRelations) {
  return {
    id: receipt.id,
    code: receipt.code,
    status: receipt.status,
    warehouseId: receipt.warehouseId,
    warehouseName: receipt.warehouse.name,
    supplierName: receipt.supplierName,
    totalCost: computeTotalCost(receipt.items),
    receivedAt: receipt.receivedAt,
    createdById: receipt.createdById,
    createdByName:
      `${receipt.createdBy.firstName} ${receipt.createdBy.lastName}`.trim(),
    notes: receipt.notes,
    createdAt: receipt.createdAt,
    updatedAt: receipt.updatedAt,
    items: receipt.items.map((item) => ({
      id: item.id,
      receiptId: item.receiptId,
      productId: item.productId,
      quantity: item.quantity,
      unitCost: Number(item.unitCost),
      productName: item.product.name,
      productSku: item.product.sku,
    })),
  };
}

async function incrementBalance(
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
    update: { quantity: { increment: quantity } },
  });
}

async function decrementBalance(
  tx: TxClient,
  productId: string,
  warehouseId: string,
  quantity: number,
  productLabel: string,
) {
  const balance = await tx.stockBalance.findUnique({
    where: {
      productId_warehouseId: { productId, warehouseId },
    },
  });

  if (!balance || balance.quantity < quantity) {
    throw new InsufficientStockError(productLabel);
  }

  await tx.stockBalance.update({
    where: { id: balance.id },
    data: { quantity: { decrement: quantity } },
  });
}

async function listReceipts(page: number, code?: string) {
  const skip = (page - 1) * PAGE_SIZE;
  const where = code
    ? { code: { contains: code, mode: "insensitive" as const } }
    : {};

  const [items, total] = await prisma.$transaction([
    prisma.receipt.findMany({
      where,
      include: receiptInclude,
      orderBy: { receivedAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.receipt.count({ where }),
  ]);

  return {
    status: 200,
    data: {
      items: (items as ReceiptWithRelations[]).map(toPublicReceipt),
      total,
      page,
      pageSize: PAGE_SIZE,
    },
  };
}

async function getSummary() {
  const [total, confirmed, cancelled, confirmedReceipts] =
    await prisma.$transaction([
      prisma.receipt.count(),
      prisma.receipt.count({ where: { status: "confirmed" } }),
      prisma.receipt.count({ where: { status: "cancelled" } }),
      prisma.receipt.findMany({
        where: { status: "confirmed" },
        select: {
          items: {
            select: {
              quantity: true,
              unitCost: true,
            },
          },
        },
      }),
    ]);

  const totalCost = confirmedReceipts.reduce(
    (sum, receipt) => sum + computeTotalCost(receipt.items),
    0,
  );

  return {
    status: 200,
    data: {
      total,
      confirmed,
      cancelled,
      totalCost,
    },
  };
}

async function getReceiptById(id: string) {
  const receipt = await prisma.receipt.findUnique({
    where: { id },
    include: receiptInclude,
  });

  if (!receipt) {
    return {
      status: 404,
      data: { message: "Recebimento não encontrado." },
    };
  }

  return {
    status: 200,
    data: toPublicReceipt(receipt as ReceiptWithRelations),
  };
}

async function createReceipt(input: ReceiptInput, userId: string) {
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

  const productIds = [...new Set(input.items.map((item) => item.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, status: true },
  });

  if (products.length !== productIds.length) {
    return {
      status: 404,
      data: { message: "Produto não encontrado." },
    };
  }

  const inactiveProduct = products.find(
    (product) => product.status !== "active",
  );
  if (inactiveProduct) {
    return {
      status: 404,
      data: { message: "Produto não encontrado." },
    };
  }

  try {
    const receipt = await prisma.$transaction(async (tx) => {
      const created = await tx.receipt.create({
        data: {
          code: input.code,
          status: "confirmed",
          warehouseId: input.warehouseId,
          supplierName: input.supplierName ?? null,
          receivedAt: input.receivedAt,
          createdById: userId,
          notes: input.notes ?? null,
          items: {
            create: input.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitCost: item.unitCost,
            })),
          },
        },
        include: receiptInclude,
      });

      for (const item of created.items) {
        await incrementBalance(
          tx,
          item.productId,
          input.warehouseId,
          item.quantity,
        );

        await tx.stockMovement.create({
          data: {
            type: "in",
            productId: item.productId,
            quantity: item.quantity,
            fromWarehouseId: null,
            toWarehouseId: input.warehouseId,
            userId,
            note: `Recebimento ${created.code}`,
            referenceType: "receipt",
            referenceId: created.id,
          },
        });
      }

      return created;
    });

    for (const item of receipt.items) {
      await alertsService.evaluateProduct(item.productId);
    }
    await alertsService.evaluateWarehouse(receipt.warehouseId);

    return {
      status: 201,
      data: toPublicReceipt(receipt as ReceiptWithRelations),
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("unique")
    ) {
      return {
        status: 409,
        data: { message: "Código de recebimento já cadastrado." },
      };
    }

    throw error;
  }
}

async function cancelReceipt(id: string, userId: string) {
  const existing = await prisma.receipt.findUnique({
    where: { id },
    include: receiptInclude,
  });

  if (!existing) {
    return {
      status: 404,
      data: { message: "Recebimento não encontrado." },
    };
  }

  if (existing.status !== "confirmed") {
    return {
      status: 409,
      data: {
        message: "Somente recebimentos confirmados podem ser cancelados.",
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

  try {
    const receipt = await prisma.$transaction(async (tx) => {
      const updated = await tx.receipt.update({
        where: { id },
        data: { status: "cancelled" },
        include: receiptInclude,
      });

      for (const item of updated.items) {
        await decrementBalance(
          tx,
          item.productId,
          updated.warehouseId,
          item.quantity,
          item.product.name,
        );

        await tx.stockMovement.create({
          data: {
            type: "out",
            productId: item.productId,
            quantity: item.quantity,
            fromWarehouseId: updated.warehouseId,
            toWarehouseId: null,
            userId,
            note: `Estorno recebimento ${updated.code}`,
            referenceType: "receipt",
            referenceId: updated.id,
          },
        });
      }

      return updated;
    });

    for (const item of receipt.items) {
      await alertsService.evaluateProduct(item.productId);
    }
    await alertsService.evaluateWarehouse(receipt.warehouseId);

    return {
      status: 200,
      data: toPublicReceipt(receipt as ReceiptWithRelations),
    };
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      return {
        status: 400,
        data: { message: error.message },
      };
    }

    throw error;
  }
}

export const receiptService = {
  listReceipts,
  getSummary,
  getReceiptById,
  createReceipt,
  cancelReceipt,
};
