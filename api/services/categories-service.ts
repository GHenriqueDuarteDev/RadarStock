import type { CategoryInput, UpdateCategoryInput } from "@radarstock/contracts";
import { prisma } from "../src/db";

const publicCategorySelect = {
  id: true,
  name: true,
  description: true,
  createdAt: true,
  updatedAt: true,
} as const;

async function getAllCategories() {
  const categories = await prisma.category.findMany({
    select: publicCategorySelect,
    orderBy: { name: "asc" },
  });

  return { status: 200, data: categories };
}

async function getCategoryById(id: string) {
  const category = await prisma.category.findUnique({
    where: { id },
    select: publicCategorySelect,
  });

  if (!category) {
    return {
      status: 404,
      data: { message: "Categoria não encontrada." },
    };
  }

  return { status: 200, data: category };
}

async function createCategory(input: CategoryInput) {
  try {
    const category = await prisma.category.create({
      data: {
        name: input.name,
        description: input.description,
      },
      select: publicCategorySelect,
    });

    return { status: 201, data: category };
  } catch {
    return {
      status: 409,
      data: { message: "Já existe uma categoria com este nome." },
    };
  }
}

async function updateCategoryById(id: string, input: UpdateCategoryInput) {
  const existing = await prisma.category.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return {
      status: 404,
      data: { message: "Categoria não encontrada." },
    };
  }

  try {
    const category = await prisma.category.update({
      where: { id },
      data: input,
      select: publicCategorySelect,
    });

    return { status: 200, data: category };
  } catch {
    return {
      status: 409,
      data: { message: "Já existe uma categoria com este nome." },
    };
  }
}

async function deleteCategoryById(id: string) {
  const existing = await prisma.category.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    return {
      status: 404,
      data: { message: "Categoria não encontrada." },
    };
  }

  const productsCount = await prisma.product.count({
    where: { categoryId: id },
  });

  if (productsCount > 0) {
    return {
      status: 409,
      data: {
        message: "Não é possível remover uma categoria com produtos vinculados.",
      },
    };
  }

  try {
    await prisma.category.delete({ where: { id } });
    return {
      status: 200,
      data: { message: "Categoria removida com sucesso." },
    };
  } catch {
    return {
      status: 409,
      data: { message: "Falha ao remover categoria." },
    };
  }
}

export const categoryService = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategoryById,
  deleteCategoryById,
};
