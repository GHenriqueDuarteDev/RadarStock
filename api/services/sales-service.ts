import {
  PAGE_SIZE,
  type SaleInput,
} from "@radarstock/contracts";
import { prisma } from "../src/db";

const saleInclude = {
  warehouse: { select: { name: true } },
  createdBy: { select: { firstName: true, lastName: true } },
  items: {
    include: {
      product: { select: { name: true, sku: true } },
    },
  },
} as const;

type SaleWithRelations = {
  id: string;
  code: string;
  status: "draft" | "confirmed" | "cancelled";
  warehouseId: string;
  totalAmount: { toString(): string } | number;
  soldAt: Date;
  createdById: string;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  warehouse: { name: string };
  createdBy: { firstName: string; lastName: string };
  items: Array<{
    id: string;
    saleId: string;
    productId: string;
    quantity: number;
    unitPrice: { toString(): string } | number;
    product: { name: string; sku: string };
  }>;
};

class InsufficientStockError extends Error {
  constructor(productLabel: string) {
    super(`Saldo insuficiente para o produto ${productLabel}.`);
    this.name = "InsufficientStockError";
  }
}

type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

function toPublicSale(sale: SaleWithRelations) {
  return {
    id: sale.id,
    code: sale.code,
    status: sale.status,
    warehouseId: sale.warehouseId,
    warehouseName: sale.warehouse.name,
    totalAmount: Number(sale.totalAmount),
    soldAt: sale.soldAt,
    createdById: sale.createdById,
    createdByName:
      `${sale.createdBy.firstName} ${sale.createdBy.lastName}`.trim(),
    notes: sale.notes,
    createdAt: sale.createdAt,
    updatedAt: sale.updatedAt,
    items: sale.items.map((item) => ({
      id: item.id,
      saleId: item.saleId,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
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

async function listSales(page: number, code?: string) {
  const skip = (page - 1) * PAGE_SIZE;
  const where = code
    ? { code: { contains: code, mode: "insensitive" as const } }
    : {};

  const [items, total] = await prisma.$transaction([
    prisma.sale.findMany({
      where,
      include: saleInclude,
      orderBy: { soldAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.sale.count({ where }),
  ]);

  return {
    status: 200,
    data: {
      items: (items as SaleWithRelations[]).map(toPublicSale),
      total,
      page,
      pageSize: PAGE_SIZE,
    },
  };
}

async function getSummary() {
  const [total, confirmed, cancelled, amountAgg] = await prisma.$transaction([
    prisma.sale.count(),
    prisma.sale.count({ where: { status: "confirmed" } }),
    prisma.sale.count({ where: { status: "cancelled" } }),
    prisma.sale.aggregate({
      where: { status: "confirmed" },
      _sum: { totalAmount: true },
    }),
  ]);

  return {
    status: 200,
    data: {
      total,
      confirmed,
      cancelled,
      totalAmount: Number(amountAgg._sum.totalAmount ?? 0),
    },
  };
}

async function getSaleById(id: string) {
  const sale = await prisma.sale.findUnique({
    where: { id },
    include: saleInclude,
  });

  if (!sale) {
    return {
      status: 404,
      data: { message: "Venda não encontrada." },
    };
  }

  return {
    status: 200,
    data: toPublicSale(sale as SaleWithRelations),
  };
}

async function createSale(input: SaleInput, userId: string) {
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

  const inactiveProduct = products.find((product) => product.status !== "active");
  if (inactiveProduct) {
    return {
      status: 404,
      data: { message: "Produto não encontrado." },
    };
  }

  const productNameById = new Map(
    products.map((product) => [product.id, product.name]),
  );

  const totalAmount = input.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  try {
    const sale = await prisma.$transaction(async (tx) => {
      const created = await tx.sale.create({
        data: {
          code: input.code,
          status: "confirmed",
          warehouseId: input.warehouseId,
          totalAmount,
          soldAt: input.soldAt,
          createdById: userId,
          notes: input.notes ?? null,
          items: {
            create: input.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
        },
        include: saleInclude,
      });

      for (const item of created.items) {
        const productLabel =
          productNameById.get(item.productId) ?? item.productId;

        await decrementBalance(
          tx,
          item.productId,
          input.warehouseId,
          item.quantity,
          productLabel,
        );

        await tx.stockMovement.create({
          data: {
            type: "out",
            productId: item.productId,
            quantity: item.quantity,
            fromWarehouseId: input.warehouseId,
            toWarehouseId: null,
            userId,
            note: `Venda ${created.code}`,
            referenceType: "sale",
            referenceId: created.id,
          },
        });
      }

      return created;
    });

    return {
      status: 201,
      data: toPublicSale(sale as SaleWithRelations),
    };
  } catch (error) {
    if (error instanceof InsufficientStockError) {
      return {
        status: 400,
        data: { message: error.message },
      };
    }

    if (
      error instanceof Error &&
      error.message.toLowerCase().includes("unique")
    ) {
      return {
        status: 409,
        data: { message: "Código de venda já cadastrado." },
      };
    }

    throw error;
  }
}

async function cancelSale(id: string, userId: string) {
  const existing = await prisma.sale.findUnique({
    where: { id },
    include: saleInclude,
  });

  if (!existing) {
    return {
      status: 404,
      data: { message: "Venda não encontrada." },
    };
  }

  if (existing.status !== "confirmed") {
    return {
      status: 409,
      data: { message: "Somente vendas confirmadas podem ser canceladas." },
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

  const sale = await prisma.$transaction(async (tx) => {
    const updated = await tx.sale.update({
      where: { id },
      data: { status: "cancelled" },
      include: saleInclude,
    });

    for (const item of updated.items) {
      await incrementBalance(
        tx,
        item.productId,
        updated.warehouseId,
        item.quantity,
      );

      await tx.stockMovement.create({
        data: {
          type: "in",
          productId: item.productId,
          quantity: item.quantity,
          fromWarehouseId: null,
          toWarehouseId: updated.warehouseId,
          userId,
          note: `Estorno venda ${updated.code}`,
          referenceType: "sale",
          referenceId: updated.id,
        },
      });
    }

    return updated;
  });

  return {
    status: 200,
    data: toPublicSale(sale as SaleWithRelations),
  };
}

export const saleService = {
  listSales,
  getSummary,
  getSaleById,
  createSale,
  cancelSale,
};
