import {
  PAGE_SIZE,
  type UpdateWarehouseInput,
  type WarehouseInput,
} from "@radarstock/contracts";
import { prisma } from "../src/db";

async function listWarehouses(page: number, name?: string) {
  const skip = (page - 1) * PAGE_SIZE;
  const where = name
    ? { name: { contains: name, mode: "insensitive" as const } }
    : {};

  const [items, total] = await prisma.$transaction([
    prisma.warehouse.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.warehouse.count({ where }),
  ]);

  return {
    status: 200,
    data: {
      items,
      total,
      page,
      pageSize: PAGE_SIZE,
    },
  };
}

async function getSummary() {
  const [total, active, inactive, capacityAgg] = await prisma.$transaction([
    prisma.warehouse.count(),
    prisma.warehouse.count({ where: { status: "active" } }),
    prisma.warehouse.count({ where: { status: "inactive" } }),
    prisma.warehouse.aggregate({ _sum: { capacity: true } }),
  ]);

  return {
    status: 200,
    data: {
      total,
      active,
      inactive,
      totalCapacity: capacityAgg._sum.capacity ?? 0,
    },
  };
}

async function getWarehouseById(id: string) {
  const warehouse = await prisma.warehouse.findUnique({
    where: { id },
  });

  if (!warehouse) {
    return {
      status: 404,
      data: { message: "Galpão não encontrado." },
    };
  }

  return { status: 200, data: warehouse };
}

async function createWarehouse(input: WarehouseInput) {
  try {
    const warehouse = await prisma.warehouse.create({
      data: {
        name: input.name,
        code: input.code,
        address: input.address,
        capacity: input.capacity ?? null,
        status: input.status,
      },
    });

    return { status: 201, data: warehouse };
  } catch {
    return {
      status: 409,
      data: { message: "Código de galpão já cadastrado." },
    };
  }
}

async function updateWarehouseById(id: string, input: UpdateWarehouseInput) {
  const existing = await prisma.warehouse.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return {
      status: 404,
      data: { message: "Galpão não encontrado." },
    };
  }

  try {
    const warehouse = await prisma.warehouse.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.code !== undefined ? { code: input.code } : {}),
        ...(input.address !== undefined ? { address: input.address } : {}),
        ...(input.capacity !== undefined ? { capacity: input.capacity } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
    });

    return { status: 200, data: warehouse };
  } catch {
    return {
      status: 409,
      data: { message: "Código de galpão já cadastrado." },
    };
  }
}

async function listBalances(warehouseId: string) {
  const warehouse = await prisma.warehouse.findUnique({
    where: { id: warehouseId },
    select: { id: true },
  });

  if (!warehouse) {
    return {
      status: 404,
      data: { message: "Galpão não encontrado." },
    };
  }

  const balances = await prisma.stockBalance.findMany({
    where: {
      warehouseId,
      quantity: { gte: 0 },
    },
    include: {
      product: { select: { id: true, name: true, sku: true, status: true } },
    },
    orderBy: { product: { name: "asc" } },
  });

  return {
    status: 200,
    data: {
      items: balances
        .filter((balance) => balance.product.status === "active")
        .map((balance) => ({
          productId: balance.productId,
          productName: balance.product.name,
          productSku: balance.product.sku,
          quantity: balance.quantity,
        })),
    },
  };
}

async function deleteWarehouseById(id: string) {
  const existing = await prisma.warehouse.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return {
      status: 404,
      data: { message: "Galpão não encontrado." },
    };
  }

  try {
    await prisma.warehouse.update({
      where: { id },
      data: { status: "inactive" },
    });

    return {
      status: 200,
      data: { message: "Galpão desativado com sucesso." },
    };
  } catch {
    return {
      status: 409,
      data: { message: "Falha ao desativar galpão." },
    };
  }
}

export const warehouseService = {
  listWarehouses,
  getSummary,
  getWarehouseById,
  listBalances,
  createWarehouse,
  updateWarehouseById,
  deleteWarehouseById,
};
