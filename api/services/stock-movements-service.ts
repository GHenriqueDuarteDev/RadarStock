import {
  PAGE_SIZE,
  type StockMovementInput,
} from "@radarstock/contracts";
import { prisma } from "../src/db";

const movementInclude = {
  product: { select: { name: true, sku: true } },
  fromWarehouse: { select: { name: true } },
  toWarehouse: { select: { name: true } },
  user: { select: { firstName: true, lastName: true } },
} as const;

type MovementWithRelations = {
  id: string;
  type: StockMovementInput["type"];
  productId: string;
  quantity: number;
  fromWarehouseId: string | null;
  toWarehouseId: string | null;
  userId: string;
  note: string | null;
  referenceType:
    | NonNullable<StockMovementInput["referenceType"]>
    | null;
  referenceId: string | null;
  createdAt: Date;
  product: { name: string; sku: string };
  fromWarehouse: { name: string } | null;
  toWarehouse: { name: string } | null;
  user: { firstName: string; lastName: string };
};

class InsufficientStockError extends Error {
  constructor() {
    super("Saldo insuficiente.");
    this.name = "InsufficientStockError";
  }
}

type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

function toPublicMovement(movement: MovementWithRelations) {
  return {
    id: movement.id,
    type: movement.type,
    productId: movement.productId,
    quantity: movement.quantity,
    fromWarehouseId: movement.fromWarehouseId,
    toWarehouseId: movement.toWarehouseId,
    userId: movement.userId,
    note: movement.note,
    referenceType: movement.referenceType ?? null,
    referenceId: movement.referenceId,
    createdAt: movement.createdAt,
    productName: movement.product.name,
    productSku: movement.product.sku,
    fromWarehouseName: movement.fromWarehouse?.name ?? null,
    toWarehouseName: movement.toWarehouse?.name ?? null,
    userName: `${movement.user.firstName} ${movement.user.lastName}`.trim(),
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
) {
  const balance = await tx.stockBalance.findUnique({
    where: {
      productId_warehouseId: { productId, warehouseId },
    },
  });

  if (!balance || balance.quantity < quantity) {
    throw new InsufficientStockError();
  }

  await tx.stockBalance.update({
    where: { id: balance.id },
    data: { quantity: { decrement: quantity } },
  });
}

async function listMovements(page: number, name?: string) {
  const skip = (page - 1) * PAGE_SIZE;
  const where = name
    ? {
        product: {
          name: { contains: name, mode: "insensitive" as const },
        },
      }
    : {};

  const [items, total] = await prisma.$transaction([
    prisma.stockMovement.findMany({
      where,
      include: movementInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.stockMovement.count({ where }),
  ]);

  return {
    status: 200,
    data: {
      items: (items as MovementWithRelations[]).map(toPublicMovement),
      total,
      page,
      pageSize: PAGE_SIZE,
    },
  };
}

async function getSummary() {
  const [total, inCount, outCount, transferCount] = await prisma.$transaction([
    prisma.stockMovement.count(),
    prisma.stockMovement.count({ where: { type: "in" } }),
    prisma.stockMovement.count({ where: { type: "out" } }),
    prisma.stockMovement.count({ where: { type: "transfer" } }),
  ]);

  return {
    status: 200,
    data: {
      total,
      in: inCount,
      out: outCount,
      transfer: transferCount,
    },
  };
}

async function getMovementById(id: string) {
  const movement = await prisma.stockMovement.findUnique({
    where: { id },
    include: movementInclude,
  });

  if (!movement) {
    return {
      status: 404,
      data: { message: "Movimentação não encontrada." },
    };
  }

  return {
    status: 200,
    data: toPublicMovement(movement as MovementWithRelations),
  };
}

async function assertActiveWarehouse(warehouseId: string, label: string) {
  const warehouse = await prisma.warehouse.findUnique({
    where: { id: warehouseId },
    select: { id: true, status: true },
  });

  if (!warehouse || warehouse.status !== "active") {
    return {
      status: 404 as const,
      data: { message: `${label} não encontrado.` },
    };
  }

  return null;
}

async function createMovement(input: StockMovementInput, userId: string) {
  const product = await prisma.product.findUnique({
    where: { id: input.productId },
    select: { id: true, status: true },
  });

  if (!product || product.status !== "active") {
    return {
      status: 404,
      data: { message: "Produto não encontrado." },
    };
  }

  const fromWarehouseId = input.fromWarehouseId ?? null;
  const toWarehouseId = input.toWarehouseId ?? null;

  if (fromWarehouseId) {
    const error = await assertActiveWarehouse(
      fromWarehouseId,
      "Galpão de origem",
    );
    if (error) {
      return error;
    }
  }

  if (toWarehouseId) {
    const error = await assertActiveWarehouse(
      toWarehouseId,
      "Galpão de destino",
    );
    if (error) {
      return error;
    }
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
    const movement = await prisma.$transaction(async (tx) => {
      if (input.type === "in" && toWarehouseId) {
        await incrementBalance(
          tx,
          input.productId,
          toWarehouseId,
          input.quantity,
        );
      } else if (input.type === "out" && fromWarehouseId) {
        await decrementBalance(
          tx,
          input.productId,
          fromWarehouseId,
          input.quantity,
        );
      } else if (
        input.type === "transfer" &&
        fromWarehouseId &&
        toWarehouseId
      ) {
        await decrementBalance(
          tx,
          input.productId,
          fromWarehouseId,
          input.quantity,
        );
        await incrementBalance(
          tx,
          input.productId,
          toWarehouseId,
          input.quantity,
        );
      } else if (input.type === "adjustment") {
        if (toWarehouseId) {
          await incrementBalance(
            tx,
            input.productId,
            toWarehouseId,
            input.quantity,
          );
        } else if (fromWarehouseId) {
          await decrementBalance(
            tx,
            input.productId,
            fromWarehouseId,
            input.quantity,
          );
        }
      }

      return tx.stockMovement.create({
        data: {
          type: input.type,
          productId: input.productId,
          quantity: input.quantity,
          fromWarehouseId,
          toWarehouseId,
          userId,
          note: input.note ?? null,
          referenceType: input.referenceType ?? null,
          referenceId: input.referenceId ?? null,
        },
        include: movementInclude,
      });
    });

    return {
      status: 201,
      data: toPublicMovement(movement as MovementWithRelations),
    };
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      return {
        status: 400,
        data: { message: "Saldo insuficiente." },
      };
    }

    throw error;
  }
}

export const stockMovementService = {
  listMovements,
  getSummary,
  getMovementById,
  createMovement,
};
