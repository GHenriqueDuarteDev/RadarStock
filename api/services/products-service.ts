import {
  PAGE_SIZE,
  type ProductInput,
  type UpdateProductInput,
} from "@radarstock/contracts";
import { prisma } from "../src/db";

const publicProductInclude = {
  category: {
    select: {
      id: true,
      name: true,
    },
  },
  stockBalances: {
    select: {
      quantity: true,
    },
  },
} as const;

type ProductWithCategory = {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  description: string | null;
  categoryId: string;
  cost: { toString(): string } | number;
  salePrice: { toString(): string } | number;
  minStock: number;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; name: string };
  stockBalances: { quantity: number }[];
};

function toPublicProduct(product: ProductWithCategory) {
  return {
    id: product.id,
    name: product.name,
    sku: product.sku,
    barcode: product.barcode,
    description: product.description,
    categoryId: product.categoryId,
    category: product.category,
    cost: Number(product.cost),
    salePrice: Number(product.salePrice),
    minStock: product.minStock,
    stockQuantity: product.stockBalances.reduce(
      (sum, balance) => sum + balance.quantity,
      0,
    ),
    status: product.status,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
  };
}

async function listProducts(page: number, name?: string) {
  const skip = (page - 1) * PAGE_SIZE;
  const where = name
    ? { name: { contains: name, mode: "insensitive" as const } }
    : {};

  const [rows, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      include: publicProductInclude,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    status: 200,
    data: {
      items: rows.map(toPublicProduct),
      total,
      page,
      pageSize: PAGE_SIZE,
    },
  };
}

async function getSummary() {
  const [total, active, inactive, categories] = await prisma.$transaction([
    prisma.product.count(),
    prisma.product.count({ where: { status: "active" } }),
    prisma.product.count({ where: { status: "inactive" } }),
    prisma.category.count(),
  ]);

  return {
    status: 200,
    data: { total, active, inactive, categories },
  };
}

async function getProductById(id: string) {
  const product = await prisma.product.findUnique({
    where: { id },
    include: publicProductInclude,
  });

  if (!product) {
    return {
      status: 404,
      data: { message: "Produto não encontrado." },
    };
  }

  return { status: 200, data: toPublicProduct(product) };
}

async function createProduct(input: ProductInput) {
  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
    select: { id: true },
  });

  if (!category) {
    return {
      status: 404,
      data: { message: "Categoria não encontrada." },
    };
  }

  try {
    const product = await prisma.product.create({
      data: {
        name: input.name,
        sku: input.sku,
        barcode: input.barcode ?? null,
        description: input.description,
        categoryId: input.categoryId,
        cost: input.cost,
        salePrice: input.salePrice,
        minStock: input.minStock,
        status: input.status,
      },
      include: publicProductInclude,
    });

    return { status: 201, data: toPublicProduct(product) };
  } catch {
    return {
      status: 409,
      data: { message: "SKU ou código de barras já cadastrado." },
    };
  }
}

async function updateProductById(id: string, input: UpdateProductInput) {
  const existing = await prisma.product.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return {
      status: 404,
      data: { message: "Produto não encontrado." },
    };
  }

  if (input.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: input.categoryId },
      select: { id: true },
    });

    if (!category) {
      return {
        status: 404,
        data: { message: "Categoria não encontrada." },
      };
    }
  }

  try {
    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(input.name !== undefined ? { name: input.name } : {}),
        ...(input.sku !== undefined ? { sku: input.sku } : {}),
        ...(input.barcode !== undefined ? { barcode: input.barcode } : {}),
        ...(input.description !== undefined
          ? { description: input.description }
          : {}),
        ...(input.categoryId !== undefined
          ? { categoryId: input.categoryId }
          : {}),
        ...(input.cost !== undefined ? { cost: input.cost } : {}),
        ...(input.salePrice !== undefined ? { salePrice: input.salePrice } : {}),
        ...(input.minStock !== undefined ? { minStock: input.minStock } : {}),
        ...(input.status !== undefined ? { status: input.status } : {}),
      },
      include: publicProductInclude,
    });

    return { status: 200, data: toPublicProduct(product) };
  } catch {
    return {
      status: 409,
      data: { message: "SKU ou código de barras já cadastrado." },
    };
  }
}

async function deleteProductById(id: string) {
  const existing = await prisma.product.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return {
      status: 404,
      data: { message: "Produto não encontrado." },
    };
  }

  try {
    await prisma.product.update({
      where: { id },
      data: { status: "inactive" },
    });

    return {
      status: 200,
      data: { message: "Produto desativado com sucesso." },
    };
  } catch {
    return {
      status: 409,
      data: { message: "Falha ao desativar produto." },
    };
  }
}

export const productService = {
  listProducts,
  getSummary,
  getProductById,
  createProduct,
  updateProductById,
  deleteProductById,
};
